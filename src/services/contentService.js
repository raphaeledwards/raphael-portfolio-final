import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { PROJECT_ITEMS, EXPERTISE_AREAS, BLOG_POSTS } from '../data/portfolioData';

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
        items.forEach(item => {
            // Use item.id as doc ID if present, else auto-ID
            const docRef = item.id
                ? doc(db, collectionName, String(item.id))
                : doc(collection(db, collectionName));

            // Remove icon function from data if present (can't store functions in DB)
            // For Expertise, we store the metadata, but Icons need local mapping
            const { icon, ...dataToStore } = item;

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
