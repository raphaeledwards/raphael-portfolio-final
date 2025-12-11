import { db, auth } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc, writeBatch, query, orderBy, limit, increment, updateDoc } from 'firebase/firestore';
import { PROJECT_ITEMS, EXPERTISE_AREAS, BLOG_POSTS } from '../data/portfolioData';
import { SOURCE_CODE_MANIFEST } from '../data/sourceCodeManifest';
import { Users, Lock, Cloud, BrainCircuit } from 'lucide-react';
import { getEmbedding } from '../utils/vectorUtils';

// Collection Names
const COLLECTIONS = {
    PROJECTS: 'projects',
    EXPERTISE: 'expertise',
    BLOGS: 'blogs',
    CODE: 'source_code'
};

/**
 * Helper to serialize data for Firestore.
 * Handles removing non-serializable objects (functions) and mapping icons.
 */
const serializeFirestoreData = (item, embedding = null) => {
    // 1. Prepare data (strip non-serializable icon functions)
    const { icon, ...dataToStore } = item;

    // 2. Re-serialize Icon metadata if present
    if (icon) {
        if (icon === Users) dataToStore.iconName = "Users";
        else if (icon === Lock) dataToStore.iconName = "Lock";
        else if (icon === Cloud) dataToStore.iconName = "Cloud";
        else if (icon === BrainCircuit) dataToStore.iconName = "BrainCircuit";
    }

    // 3. Attach Embedding if provided
    if (embedding) {
        dataToStore.embedding = embedding;
    }

    return dataToStore;
};

/**
 * Fetches data from a Firestore collection.
 * Returns local fallback data if DB is empty or fails.
 */
export const fetchContent = async (collectionName, fallbackData, user = null) => {
    // 1. Initial Guard: No DB
    if (!db) {
        console.warn("Firestore not initialized. Using local fallback.");
        return fallbackData;
    }

    // 2. Auth Guard: Use the PASSED user object from React State
    // If passed user is null or offline-demo, skip firestore.
    // We strictly trust the App.jsx state now.
    if (!user || user.uid === 'offline-demo-user') {
        console.log(`[ContentService] Offline/Guest mode detected (User: ${user ? user.uid : 'null'}). Skipping Firestore fetch for ${collectionName}. Using fallback.`);
        return fallbackData;
    }

    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        if (querySnapshot.empty) {
            console.debug(`[ContentService] Collection ${collectionName} empty. Using fallback.`);
            return fallbackData;
        }

        // Map docs to array
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        // 3. Fallback Catch
        // We still catch unexpected errors (like network drop), but the Auth Guard above prevents the common permissions error.
        console.warn(`[ContentService] Error fetching ${collectionName} (falling back):`, error.message);
        return fallbackData;
    }
};

/**
 * Fetches recent chat logs from Firestore.
 */
export const fetchChatLogs = async (limitCount = 50) => {
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'chat_logs'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to Date object if needed, or keeping serializable
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
            };
        });
    } catch (error) {
        console.error("[ContentService] Error fetching logs:", error);
        return [];
    }
};

/**
 * Clears all chat logs from Firestore.
 */
export const clearChatLogs = async () => {
    if (!db) throw new Error("Firestore not initialized");

    try {
        const querySnapshot = await getDocs(collection(db, 'chat_logs'));
        const batch = writeBatch(db);

        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return `Cleared ${querySnapshot.size} chat logs.`;
    } catch (error) {
        console.error("Error clearing logs:", error);
        throw error;
    }
};

/**
 * Seeds the Firestore database with local data.
 * WARNING: Overwrites existing data with matching IDs (if we strictly used IDs), 
 * but here we use batch writes for efficiency.
 */
export const seedDatabase = async () => {
    if (!db) throw new Error("Firestore not initialized");

    const batch = writeBatch(db);
    let operationCount = 0;

    // Validation Helper
    const validateItem = (item, type) => {
        if (!item.title) {
            console.warn(`[Seed] Skipping invalid ${type} item (missing title):`, item);
            return false;
        }
        return true;
    };

    // Helper to add items to batch
    const addToBatch = (items, collectionName) => {
        items.forEach((item, idx) => {
            if (!validateItem(item, collectionName)) return;

            // Use item.id as doc ID if present, else deterministic ID based on index
            const docRef = item.id
                ? doc(db, collectionName, String(item.id))
                : doc(db, collectionName, `auto_${idx}`);

            const dataToStore = serializeFirestoreData(item);
            batch.set(docRef, dataToStore);
            operationCount++;
        });
    };

    addToBatch(PROJECT_ITEMS, COLLECTIONS.PROJECTS);
    addToBatch(EXPERTISE_AREAS, COLLECTIONS.EXPERTISE);
    addToBatch(BLOG_POSTS, COLLECTIONS.BLOGS);

    await batch.commit();
    return operationCount;
};

/**
 * Updates all items in Firestore with Vector Embeddings.
 * Iterates through Projects, Expertise, and Blogs.
 */
export const updateEmbeddings = async () => {
    if (!db) throw new Error("Firestore not initialized");

    const collectionsToUpdate = [
        { name: COLLECTIONS.PROJECTS, data: PROJECT_ITEMS },
        { name: COLLECTIONS.EXPERTISE, data: EXPERTISE_AREAS },
        { name: COLLECTIONS.BLOGS, data: BLOG_POSTS }
    ];

    const batch = writeBatch(db);

    for (const group of collectionsToUpdate) {
        console.log(`Generating embeddings for ${group.name}...`);

        for (let i = 0; i < group.data.length; i++) {
            const item = group.data[i];

            // RATE LIMITING: Add a small delay to avoid hitting API quotas (429 errors)
            // 1000ms delay = max 60 requests per minute, which is safer for free tiers.
            await new Promise(resolve => setTimeout(resolve, 1000));
            // console.log(`Processing item ${i + 1}/${group.data.length}...`);

            let textToEmbed = "";
            if (group.name === COLLECTIONS.PROJECTS) {
                textToEmbed = `${item.title}. Category: ${item.category}. Tags: ${item.tags?.join(", ")}. Description: ${item.description}`;
            } else if (group.name === COLLECTIONS.BLOGS) {
                textToEmbed = `${item.title}. ${item.excerpt}`;
            } else {
                textToEmbed = `${item.title}. ${item.description}`;
            }

            const embedding = await getEmbedding(textToEmbed);
            if (embedding) {
                // Deterministic ID generation to match seedDatabase or existing items
                let docRef;
                if (item.id) {
                    docRef = doc(db, group.name, String(item.id));
                } else {
                    docRef = doc(db, group.name, `auto_${i}`);
                }

                // Use helper to serialize and attach embedding
                const dataToStore = serializeFirestoreData(item, embedding);

                // Overwrite/Merge
                batch.set(docRef, dataToStore, { merge: true });
            }
        }
    }

    await batch.commit();
    return "Embeddings generated and updated.";
};

/**
 * Indexes the source code into Firestore with Embeddings.
 * This allows the AI to "read" the code.
 */
export const indexSourceCode = async () => {
    if (!db) throw new Error("Firestore not initialized");

    const batch = writeBatch(db);
    console.log("Indexing Source Code...");

    for (const file of SOURCE_CODE_MANIFEST) {
        console.log(`Processing ${file.title}...`);

        // Chunking Strategy:
        // For now, we will treat the whole file as one chunk unless it's too big, 
        // but for RAG accuracy on large files, we might strictly want to chunk.
        // However, typical component files (under 300 lines) handle okay with current LLM context windows.
        // We will just embed the description + title + a snippet/explanation as the vector, 
        // but store the FULL content in the text field.

        // Improved Embedding Strategy for Code:
        // Embed the "Concept" of the file (Title + Description + Headers/Exports)
        // This ensures that "How does RAG work?" matches vectorUtils.js even if the code is dense.
        const textToEmbed = `Code File: ${file.title}. Description: ${file.description}. Content Preview: ${file.content.slice(0, 500)}`;

        const embedding = await getEmbedding(textToEmbed);

        if (embedding) {
            const docRef = doc(db, COLLECTIONS.CODE, file.id);
            batch.set(docRef, {
                id: file.id,
                title: file.title,
                description: file.description,
                category: 'Source Code',
                content: file.content, // Store full raw content
                embedding: embedding,
                timestamp: new Date()
            });
            console.log(`✅ Embedding generated for ${file.title}`);
        } else {
            console.error(`⚠️ Failed to generate embedding for ${file.title} (Result was null)`);
        }

        // Rate limit safeguard
        await new Promise(r => setTimeout(r, 1000));
    }

    await batch.commit();
    return `Indexed ${SOURCE_CODE_MANIFEST.length} source files.`;
};


/**
 * Increments the reaction count for a specific item.
 * @param {string} collectionName - 'projects' or 'blogs'
 * @param {string} docId - The document ID
 * @returns {Promise<boolean>} - Success status
 */
export const incrementReaction = async (collectionName, docId) => {
    if (!db) throw new Error("Firestore not initialized");

    // Ensure docId is a string
    const safeId = String(docId);
    const docRef = doc(db, collectionName, safeId);

    try {
        await updateDoc(docRef, {
            reactionCount: increment(1)
        });
        return true;
    } catch (error) {
        console.error("Error incrementing reaction:", error);
        return false;
    }
};

/**
 * Diagnostic tool to verify Firestore connectivity.
 */
/**
 * Diagnostic tool to verify Firestore connectivity.
 */
export const runDiagnostics = async () => {
    if (!db) throw new Error("Firestore is NOT initialized (db is null). Check .env and firebase.js.");

    console.log("[Diagnostics] Starting write test with 5s timeout...");
    const testRef = doc(db, 'diagnostics', 'connectivity_test');

    // Helper for timeout
    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Generic Timeout")), ms));

    try {
        // 1. Write Test (Race against 5s timeout)
        await Promise.race([
            setDoc(testRef, {
                timestamp: new Date(),
                status: 'OK',
                active: true,
                testId: Math.random().toString(36).substring(7)
            }),
            timeout(5000)
        ]);

        // 2. Read Test
        console.log("[Diagnostics] Write success. Attempting read...");
        const docSnap = await getDoc(testRef);

        if (docSnap.exists()) {
            return "✅ SUCCESS: Database is connected and writable! (Read/Write confirmed)";
        } else {
            throw new Error("⚠️ WRITE SUCCESS but READ FAILED. Document disappeared immediately.");
        }
    } catch (error) {
        console.error("[Diagnostics] Failed:", error);
        if (error.message === "Generic Timeout" || error.code === 'unavailable') {
            throw new Error("❌ CONNECTION FAILED: Timed out. \n\nMOST LIKELY CAUSE: The Firestore Database has not been created in the Firebase Console.\n\nPlease go to Firebase Console -> Firestore Database and click 'Create Database'.");
        }
        throw error;
    }
};
