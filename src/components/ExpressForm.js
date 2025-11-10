/**
 * render little back arrow, input box and keep the express button from the feed?
 * use react
 * import icon
 * create the react component function
 * we need to send two props to it, onBack set state false
 * onSubmit run POST
 */
/** implement input validation with 120 character constraint
 * and show character count:
 * input validation:
 * what does this even mean? this means when the user presses submit we want
 * a function to validate that input and if validation ok we proceed with submission
 * if not we show error
 * how to:
 * press button
 * run handleSubmit(inputvalidation in disguise)
 * trim expression state variable
 * if expression length ===0
 *      show error
 *      return
 * if expression length more than 120
 *  set error
 *  return
 * else
 * setError empty
 * onSubmit(expression)
 *
 * show character count?
 * how? and what?
 * while user is typing we want to show a span below it that shows the character count /120
 *
 *
 */

import { IoMdArrowBack } from "react-icons/io";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const MAX_LENGTH = 120; // Changed from 150

export default function ExpressForm({ onBack, onSubmit }) {
  const [expression, setExpression] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** watch time for error and for it to go away
   * useEffect and within
   * if error
   * time
   */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  function containsBannedWords(input) {
    const bannedWords = new Set([
      "shit",
      "fuck",
      "bitch",
      "hate",
      "racist",
      "slur",
      "kill",
      "nazi",
      "rape",
      "porn",
      "pussy",
      "dick",
      "cock",
      "vagina",
      "penis",
      "boobs",
      "tits",
      "nipple",
      "ass",
      "butt",
      "cum",
      "ejaculate",
      "orgasm",
      "anal",
      "sex",
      "horny",
      "bang",
      "nude",
      "nudes",
      "naked",
      "thong",
      "fetish",
      "fuck",
      "shit",
      "bitch",
      "bastard",
      "asshole",
      "dumb",
      "stupid",
      "retard",
      "idiot",
      "crap",
      "damn",
      "fucking",
      "fucked",
      "kill",
      "murder",
      "suicide",
      "hang",
      "die",
      "stab",
      "shoot",
      "gun",
      "bomb",
      "explode",
      "terrorist",
      "chink",
      "nigger",
      "faggot",
      "kike",
      "tranny",
      "whore",
      "slut",
    ]);
    const words = input.toLowerCase().split(/\s+/);
    return words.some((word) => bannedWords.has(word));
  }

  const handleSubmit = async () => {
    const trimmed = expression.trim();
    if (trimmed.length === 0) {
      setError("Expression can't be empty, please express something");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError("Expression too long, please shorten it");
      return;
    }
    if (containsBannedWords(trimmed)) {
      setError("Your expression contains inappropriate language.");
      return;
    }

    setIsSubmitting(true);
    const backendError = await onSubmit(trimmed);
    if (backendError) {
      setError(backendError);
      setIsSubmitting(false);
    } else {
      // Success - form will be closed by parent
      setExpression("");
      setIsSubmitting(false);
    }
  };

  const characterCount = expression.length;
  const isNearLimit = characterCount > MAX_LENGTH * 0.8;
  const isOverLimit = characterCount > MAX_LENGTH;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Back button */}
      <div className="flex items-start w-full mb-6">
        <button
          className="mt-4 ml-2 cursor-pointer text-[#8C8888] hover:text-[#4E4A4A] transition-colors"
          onClick={onBack}
          aria-label="Back to Feed"
          disabled={isSubmitting}
        >
          <IoMdArrowBack size={24} />
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8">
        <div className="w-full max-w-2xl">
          {/* Textarea */}
          <div className="relative mb-6">
            <textarea
              className={`w-full p-6 rounded-2xl border-2 bg-transparent text-lg sm:text-xl font-light leading-relaxed tracking-wide resize-none focus:outline-none transition-all duration-300 ${
                error
                  ? "border-red-400/50 focus:border-red-400"
                  : isOverLimit
                  ? "border-red-300/50 focus:border-red-300"
                  : "border-[#BEBABA]/50 focus:border-[#BEBABA]"
              }`}
              placeholder="Express what resonates with you..."
              value={expression}
              onChange={(e) => {
                if (e.target.value.length <= MAX_LENGTH + 10) {
                  setExpression(e.target.value);
                }
              }}
              rows={6}
              disabled={isSubmitting}
              style={{ minHeight: "180px" }}
            />

            {/* Character counter */}
            <div className="absolute bottom-3 right-4">
              <span
                className={`text-xs font-medium ${
                  isOverLimit
                    ? "text-red-400"
                    : isNearLimit
                    ? "text-[#8C8888]"
                    : "text-[#8C8888]/60"
                }`}
              >
                {characterCount} / {MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-6 text-center"
              >
                <span className="text-sm text-red-400">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <div className="flex justify-center">
            <button
              className={`px-8 py-3 rounded-full text-sm uppercase tracking-[0.25em] font-medium transition-all duration-300 cursor-pointer ${
                isSubmitting
                  ? "bg-[#BEBABA]/50 text-[#8C8888] cursor-not-allowed"
                  : "bg-[#BEBABA] text-[#4E4A4A] hover:bg-[#BEBABA]/90 hover:shadow-md active:scale-[0.98]"
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting || expression.trim().length === 0}
            >
              {isSubmitting ? "Expressing..." : "Express"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
