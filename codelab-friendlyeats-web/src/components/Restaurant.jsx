// Directive to tell Next.js this component should run on the client side
"use client";

// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

// Import React and hooks for component state and lifecycle management
import { React, useState, useEffect, Suspense } from "react";
// Import Next.js dynamic import for code splitting
import dynamic from "next/dynamic";
// Import function to get real-time restaurant data from Firestore
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js";
// Import custom hook to get current user information
import { useUser } from "@/src/lib/getUser";
// Import RestaurantDetails component for displaying restaurant information
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx";
// Import function to update restaurant image in Firebase Storage
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js";

// Dynamically import ReviewDialog component for code splitting
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

// Export the default Restaurant component with destructured props
export default function Restaurant({
  id,
  initialRestaurant,
  initialUserId,
  children,
}) {
  // State to store restaurant details, initialized with initialRestaurant prop
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);
  // State to control whether the review dialog is open
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  // Get current user ID from useUser hook or fall back to initialUserId prop
  const userId = useUser()?.uid || initialUserId;
  // State to store the current review being written
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  // Function to handle changes to the review form
  const onChange = (value, name) => {
    // Update the review state with the new value for the specified field
    setReview({ ...review, [name]: value });
  };

  // Async function to handle restaurant image upload
  async function handleRestaurantImage(target) {
    // Get the first file from the file input, or null if no files
    const image = target.files ? target.files[0] : null;
    // Return early if no image was selected
    if (!image) {
      return;
    }
  
    // Upload the image and get the public URL
    const imageURL = await updateRestaurantImage(id, image);
    // Update the restaurant details with the new image URL
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
  }

  // Function to handle closing the review dialog
  const handleClose = () => {
    // Close the dialog
    setIsOpen(false);
    // Reset the review form to initial state
    setReview({ rating: 0, text: "" });
  };

  // Effect to set up real-time listener for restaurant data changes
  useEffect(() => {
    // Return the cleanup function from getRestaurantSnapshotById
    return getRestaurantSnapshotById(id, (data) => {
      // Update restaurant details when data changes
      setRestaurantDetails(data);
    });
  }, [id]); // Dependency: restaurant id

  // Return JSX for the Restaurant component
  return (
    <>
      <RestaurantDetails
        restaurant={restaurantDetails}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </RestaurantDetails>
      {/* Only render ReviewDialog if user is authenticated */}
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
