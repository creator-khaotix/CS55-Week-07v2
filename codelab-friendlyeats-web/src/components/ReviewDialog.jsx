// Directive to tell Next.js this component should run on the client side
"use client";

// This components handles the review dialog and uses a next.js feature known as Server Actions to handle the form submission

// Import React hooks for component lifecycle and DOM manipulation
import { useEffect, useLayoutEffect, useRef } from "react";
// Import the RatingPicker component for star rating selection
import RatingPicker from "@/src/components/RatingPicker.jsx";
// Import the server action function to handle form submission
import { handleReviewFormSubmission } from "@/src/app/actions.js";

// Define the ReviewDialog component with destructured props
const ReviewDialog = ({
  isOpen,
  handleClose,
  review,
  onChange,
  userId,
  id,
}) => {
  // Create a ref to access the dialog DOM element
  const dialog = useRef();

  // dialogs only render their backdrop when called with `showModal`
  // Use useLayoutEffect to synchronously update the dialog state
  useLayoutEffect(() => {
    // If dialog should be open, show the modal
    if (isOpen) {
      dialog.current.showModal();
    } else {
      // If dialog should be closed, close the modal
      dialog.current.close();
    }
  }, [isOpen, dialog]); // Dependencies: isOpen state and dialog ref

  // Event handler for mouse down events on the dialog
  const handleClick = (e) => {
    // close if clicked outside the modal
    // Check if the click target is the dialog backdrop (not the content)
    if (e.target === dialog.current) {
      // Close the dialog when clicking outside
      handleClose();
    }
  };

  // Return JSX for the review dialog
  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      <form
        action={handleReviewFormSubmission}
        onSubmit={() => {
          handleClose();
        }}
      >
        <header>
          <h3>Add your review</h3>
        </header>
        <article>
          <RatingPicker />

          <p>
            <input
              type="text"
              name="text"
              id="review"
              placeholder="Write your thoughts here"
              required
              value={review.text}
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          <input type="hidden" name="restaurantId" value={id} />
          <input type="hidden" name="userId" value={userId} />
        </article>
        <footer>
          <menu>
            <button
              autoFocus
              type="reset"
              onClick={handleClose}
              className="button--cancel"
            >
              Cancel
            </button>
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

export default ReviewDialog;
