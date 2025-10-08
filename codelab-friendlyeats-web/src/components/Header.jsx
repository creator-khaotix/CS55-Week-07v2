// Directive to tell Next.js this component should run on the client side
"use client";
// Import React and useEffect hook for component lifecycle management
import React, { useEffect } from "react";
// Import Link component from Next.js for client-side navigation
import Link from "next/link";
// Import authentication functions from Firebase auth module
import {
  signInWithGoogle,
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js";
// Import function to add fake restaurants and reviews for testing
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";
// Import cookie management functions for handling session cookies
import { setCookie, deleteCookie } from "cookies-next";

// Custom hook to manage user session state and authentication changes
function useUserSession(initialUser) {
  // Use useEffect to set up authentication state listener
  useEffect(() => {
    // Return the cleanup function from onIdTokenChanged listener
    return onIdTokenChanged(async (user) => {
      // If user is authenticated, set session cookie with their ID token
      if (user) {
        // Get the user's ID token for authentication
        const idToken = await user.getIdToken();
        // Set the session cookie with the ID token
        await setCookie("__session", idToken);
      } else {
        // If user is not authenticated, delete the session cookie
        await deleteCookie("__session");
      }
      // If the initial user and current user are the same, don't reload
      if (initialUser?.uid === user?.uid) {
        return;
      }
      // Reload the page to update the UI with new authentication state
      window.location.reload();
    });
  }, [initialUser]); // Dependency array includes initialUser

  // Return the initial user value
  return initialUser;
}

// Export the default Header component that receives initialUser as a prop
export default function Header({ initialUser }) {
  // Use the custom hook to get current user session
  const user = useUserSession(initialUser);

  // Event handler for sign out button click
  const handleSignOut = (event) => {
    // Prevent default link behavior
    event.preventDefault();
    // Call the signOut function from Firebase auth
    signOut();
  };

  // Event handler for sign in button click
  const handleSignIn = (event) => {
    // Prevent default link behavior
    event.preventDefault();
    // Call the signInWithGoogle function from Firebase auth
    signInWithGoogle();
  };

  // Return JSX for the header component
  return (
    <header>
      {/* Logo link that navigates to home page */}
      <Link href="/" className="logo">
        {/* FriendlyEats logo image */}
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        {/* Logo text */}
        Friendly Eats
      </Link>
      {/* Conditional rendering based on user authentication status */}
      {user ? (
        <>
          {/* User profile section when user is authenticated */}
          <div className="profile">
            {/* User profile paragraph with image and name */}
            <p>
              {/* User profile image or default profile image */}
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {/* User's display name */}
              {user.displayName}
            </p>

            {/* User menu dropdown */}
            <div className="menu">
              {/* Menu placeholder text */}
              ...
              {/* Menu items list */}
              <ul>
                {/* Display user's name in menu */}
                <li>{user.displayName}</li>

                {/* Menu item to add sample restaurants */}
                <li>
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>

                {/* Menu item to sign out */}
                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        /* Sign in section when user is not authenticated */
        <div className="profile">
          {/* Sign in link with Google authentication */}
          <a href="#" onClick={handleSignIn}>
            {/* Default profile image for unauthenticated users */}
            <img src="/profile.svg" alt="A placeholder user image" />
            {/* Sign in text */}
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
