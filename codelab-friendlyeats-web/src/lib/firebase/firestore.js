// Import function to generate fake restaurant and review data for testing
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

// Import Firebase Firestore functions for database operations
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";

// Import the Firestore database instance from the client app configuration
import { db } from "@/src/lib/firebase/clientApp";

// Export async function to update a restaurant's image reference in Firestore
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  // Create a document reference for the specific restaurant using its ID
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  // Check if the restaurant reference exists
  if (restaurantRef) {
    // Update the restaurant document with the new photo URL
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

// Helper function to update restaurant rating within a transaction (currently not implemented)
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  // Function body is empty - implementation needed
  return;
};

// Export async function to add a review to a restaurant (currently not implemented)
export async function addReviewToRestaurant(db, restaurantId, review) {
  // Function body is empty - implementation needed
  return;
}

// Helper function to apply query filters to a Firestore query
function applyQueryFilters(q, { category, city, price, sort }) {
  // Add category filter if specified
  if (category) {
    q = query(q, where("category", "==", category));
  }
  // Add city filter if specified
  if (city) {
    q = query(q, where("city", "==", city));
  }
  // Add price filter if specified (using price array length)
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  // Add sorting based on sort parameter
  if (sort === "Rating" || !sort) {
    // Sort by average rating in descending order (default)
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    // Sort by number of ratings in descending order
    q = query(q, orderBy("numRatings", "desc"));
  }
  // Return the modified query
  return q;
}

// Export async function to get restaurants from Firestore with optional filters
export async function getRestaurants(db = db, filters = {}) {
  // Create initial query for restaurants collection
  let q = query(collection(db, "restaurants"));

  // Apply any specified filters to the query
  q = applyQueryFilters(q, filters);
  // Execute the query and get the results
  const results = await getDocs(q);
  // Map the results to include document ID and convert timestamp to Date object
  return results.docs.map((doc) => {
    return {
      // Include the document ID
      id: doc.id,
      // Spread all document data
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      // Convert Firestore timestamp to JavaScript Date object
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Export function to get real-time snapshot of restaurants with callback
export function getRestaurantsSnapshot(cb, filters = {}) {
  // Validate that callback is a function
  if (typeof cb !== "function") {
    // Log error if callback is not a function
    console.log("Error: The callback parameter is not a function");
    // Return early if callback is invalid
    return;
  }

  // Create initial query for restaurants collection
  let q = query(collection(db, "restaurants"));
  // Apply any specified filters to the query
  q = applyQueryFilters(q, filters);

  // Return real-time snapshot listener
  return onSnapshot(q, (querySnapshot) => {
    // Map the snapshot results to include document ID and convert timestamp
    const results = querySnapshot.docs.map((doc) => {
      return {
        // Include the document ID
        id: doc.id,
        // Spread all document data
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        // Convert Firestore timestamp to JavaScript Date object
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Call the callback function with the results
    cb(results);
  });
}

// Export async function to get a single restaurant by its ID
export async function getRestaurantById(db, restaurantId) {
  // Validate that restaurantId is provided
  if (!restaurantId) {
    // Log error if restaurantId is invalid
    console.log("Error: Invalid ID received: ", restaurantId);
    // Return early if restaurantId is invalid
    return;
  }
  // Create document reference for the specific restaurant
  const docRef = doc(db, "restaurants", restaurantId);
  // Get the document snapshot
  const docSnap = await getDoc(docRef);
  // Return restaurant data with converted timestamp
  return {
    // Spread all document data
    ...docSnap.data(),
    // Convert Firestore timestamp to JavaScript Date object
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Export function to get real-time snapshot of a single restaurant (currently not implemented)
export function getRestaurantSnapshotById(restaurantId, cb) {
  // Function body is empty - implementation needed
  return;
}

// Export async function to get reviews for a specific restaurant
export async function getReviewsByRestaurantId(db, restaurantId) {
  // Validate that restaurantId is provided
  if (!restaurantId) {
    // Log error if restaurantId is invalid
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    // Return early if restaurantId is invalid
    return;
  }

  // Create query for ratings subcollection, ordered by timestamp descending
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Execute the query and get the results
  const results = await getDocs(q);
  // Map the results to include document ID and convert timestamp to Date object
  return results.docs.map((doc) => {
    return {
      // Include the document ID
      id: doc.id,
      // Spread all document data
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      // Convert Firestore timestamp to JavaScript Date object
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Export function to get real-time snapshot of reviews for a specific restaurant
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  // Validate that restaurantId is provided
  if (!restaurantId) {
    // Log error if restaurantId is invalid
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    // Return early if restaurantId is invalid
    return;
  }

  // Create query for ratings subcollection, ordered by timestamp descending
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );
  // Return real-time snapshot listener
  return onSnapshot(q, (querySnapshot) => {
    // Map the snapshot results to include document ID and convert timestamp
    const results = querySnapshot.docs.map((doc) => {
      return {
        // Include the document ID
        id: doc.id,
        // Spread all document data
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        // Convert Firestore timestamp to JavaScript Date object
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    // Call the callback function with the results
    cb(results);
  });
}

// Export async function to add fake restaurants and reviews to Firestore for testing
export async function addFakeRestaurantsAndReviews() {
  // Generate fake restaurant and review data
  const data = await generateFakeRestaurantsAndReviews();
  // Iterate through each restaurant and its ratings data
  for (const { restaurantData, ratingsData } of data) {
    // Try to add the restaurant and its reviews
    try {
      // Add the restaurant document to the restaurants collection
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // Add each rating/review to the restaurant's ratings subcollection
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      // Log error messages if document addition fails
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
