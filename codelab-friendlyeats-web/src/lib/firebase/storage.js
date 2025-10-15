// Import Firebase Storage functions for file upload and URL generation
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Import the Firebase Storage instance from the client app configuration
import { storage } from "@/src/lib/firebase/clientApp";

// Import function to update restaurant image reference in Firestore
import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore";

// Replace the two functions below
// Export async function to update a restaurant's image
export async function updateRestaurantImage(restaurantId, image) {
    // Try to upload the image and update the restaurant record
    try {
      // Validate that restaurantId is provided
      if (!restaurantId) {
        // Throw error if restaurantId is missing
        throw new Error("No restaurant ID has been provided.");
      }
  
      // Validate that image file is provided and has a name
      if (!image || !image.name) {
        // Throw error if image is invalid
        throw new Error("A valid image has not been provided.");
      }
  
      // Upload the image to Firebase Storage and get the public URL
      const publicImageUrl = await uploadImage(restaurantId, image);
      // Update the restaurant document in Firestore with the new image URL
      await updateRestaurantImageReference(restaurantId, publicImageUrl);
  
      // Return the public URL of the uploaded image
      return publicImageUrl;
    } catch (error) {
      // Log any errors that occur during image processing
      console.error("Error processing request:", error);
    }
  }
  
  // Async function to upload an image to Firebase Storage
  async function uploadImage(restaurantId, image) {
    // Create file path for the image in Firebase Storage
    const filePath = `images/${restaurantId}/${image.name}`;
    // Create a reference to the storage location
    const newImageRef = ref(storage, filePath);
    // Upload the image file to Firebase Storage
    await uploadBytesResumable(newImageRef, image);
  
    // Return the public download URL for the uploaded image
    return await getDownloadURL(newImageRef);
  }
