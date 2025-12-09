import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, writeBatch, query, orderBy, limit } from 'firebase/firestore';
import { PROJECT_ITEMS, EXPERTISE_AREAS, BLOG_POSTS } from '../data/portfolioData';
import { Users, Lock, Cloud, BrainCircuit } from 'lucide-react';
import { getEmbedding } from '../utils/vectorUtils';

// Collection Names
const COLLECTIONS = {
    PROJECTS: 'projects',
    EXPERTISE: 'expertise',
    BLOGS: 'blogs'
};

/**
 * Fetches data from a Firestore collection.
 * Returns local fallback data if DB is empty or fails.
 */
export const fetchContent = async (collectionName, fallbackData) => {
    if (!db) {
        console.warn("Firestore not initialized. Using local fallback.");
        return fallbackData;
    }

    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        if (querySnapshot.empty) {
            console.log(`[ContentService] Collection ${collectionName} empty. Using fallback.`);
            return fallbackData;
        }

        // Map docs to array
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`[ContentService] Error fetching ${collectionName}:`, error);
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
 * Seeds the Firestore database with local data.
 * WARNING: Overwrites existing data with matching IDs (if we strictly used IDs), 
 * but here we use batch writes for efficiency.
 */
export const seedDatabase = async () => {
    if (!db) throw new Error("Firestore not initialized");

    const batch = writeBatch(db);
    let operationCount = 0;

    // Helper to add items to batch
    const addToBatch = (items, collectionName) => {
        items.forEach((item, idx) => {
            // Use item.id as doc ID if present, else deterministic ID based on index
            // This ensures re-seeding or embedding updates target the same docs
            const docRef = item.id
                ? doc(db, collectionName, String(item.id))
                : doc(db, collectionName, `auto_${idx}`);

            // Remove icon function from data if present (can't store functions in DB)
            // For Expertise, we store the metadata, but Icons need local mapping
            const { icon, ...dataToStore } = item;

            // Serialize Icon if present
            if (icon) {
                if (icon === Users) dataToStore.iconName = "Users";
                else if (icon === Lock) dataToStore.iconName = "Lock";
                else if (icon === Cloud) dataToStore.iconName = "Cloud";
                else if (icon === BrainCircuit) dataToStore.iconName = "BrainCircuit";
            }

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
            console.log(`Processing item ${i + 1}/${group.data.length}...`);

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

                // SECURITY/INTEGRITY FIX:
                // Instead of just setting the embedding (which creates ghost docs if DB is empty),
                // we write the FULL object. This ensures the DB is valid and synced with local data.

                // 1. Prepare data (strip non-serializable icon functions)
                const { icon, ...dataToStore } = item;

                // 2. Re-serialize Icon metadata if present (matching seed logic)
                if (icon) {
                    // Use Reference Equality to be safe against minification
                    if (icon === Users) dataToStore.iconName = "Users";
                    else if (icon === Lock) dataToStore.iconName = "Lock";
                    else if (icon === Cloud) dataToStore.iconName = "Cloud";
                    else if (icon === BrainCircuit) dataToStore.iconName = "BrainCircuit";
                }

                // 3. Attach Embedding
                dataToStore.embedding = embedding;

                // 4. Overwrite/Merge
                batch.set(docRef, dataToStore, { merge: true });
            }
        }
    }

    await batch.commit();
    return "Embeddings generated and updated.";
};
