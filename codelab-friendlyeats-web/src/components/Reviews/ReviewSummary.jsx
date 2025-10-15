// Import Gemini AI model and Google AI plugin for AI text generation
import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
// Import Genkit framework for AI operations
import { genkit } from "genkit";
// Import function to get reviews for a specific restaurant from Firestore
import { getReviewsByRestaurantId } from "@/src/lib/firebase/firestore.js";
// Import function to get authenticated Firebase app for server-side operations
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
// Import getFirestore function to get Firestore database instance
import { getFirestore } from "firebase/firestore";

// Export async function to generate AI summary of restaurant reviews using Gemini
export async function GeminiSummary({ restaurantId }) {
  // Get authenticated Firebase server app for database access
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Fetch all reviews for the specified restaurant
  const reviews = await getReviewsByRestaurantId(
    getFirestore(firebaseServerApp),
    restaurantId
  );

  // Define separator character to join multiple reviews
  const reviewSeparator = "@";
  // Create prompt for AI to generate summary from reviews
  const prompt = `
    Based on the following restaurant reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the restaurant. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  // Try to generate AI summary
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://firebase.google.com/docs/genkit/get-started
      // Throw error if API key is not set
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance.
    // Initialize Genkit with Google AI plugin and Gemini model
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash, // set default model
    });
    // Generate AI summary using the prompt
    const { text } = await ai.generate(prompt);

    // Return JSX with the generated summary
    return (
      <div className="restaurant__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    // Log any errors that occur during AI generation
    console.error(e);
    // Return error message if AI generation fails
    return <p>Error summarizing reviews.</p>;
  }
}

// Export function to render loading skeleton while AI summary is being generated
export function GeminiSummarySkeleton() {
  // Return JSX for loading state
  return (
    <div className="restaurant__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
