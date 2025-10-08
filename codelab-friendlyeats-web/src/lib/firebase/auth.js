// Import Firebase authentication functions and providers
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
} from "firebase/auth";

// Import the Firebase auth instance from the client app configuration
import { auth } from "@/src/lib/firebase/clientApp";

// Export wrapper function for onAuthStateChanged listener
export function onAuthStateChanged(cb) {
  // Return the Firebase onAuthStateChanged listener with the auth instance and callback
  return _onAuthStateChanged(auth, cb);
}

// Export wrapper function for onIdTokenChanged listener
export function onIdTokenChanged(cb) {
  // Return the Firebase onIdTokenChanged listener with the auth instance and callback
  return _onIdTokenChanged(auth, cb);
}

// Export async function to sign in with Google authentication
export async function signInWithGoogle() {
  // Create a new Google authentication provider instance
  const provider = new GoogleAuthProvider();

  // Try to sign in with Google using popup authentication
  try {
    // Call Firebase signInWithPopup with auth instance and Google provider
    await signInWithPopup(auth, provider);
  } catch (error) {
    // Log any errors that occur during Google sign in
    console.error("Error signing in with Google", error);
  }
}

// Export async function to sign out the current user
export async function signOut() {
  // Try to sign out the current user
  try {
    // Call Firebase signOut method on the auth instance
    return auth.signOut();
  } catch (error) {
    // Log any errors that occur during sign out
    console.error("Error signing out with Google", error);
  }
}