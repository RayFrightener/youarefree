import { useState, useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { track } from "../lib/analytics";

const categories = [
  "Feed (Browsing & Sorting)",
  "Expressing (Post Creation)",
  "UI/Design (Layout, Fonts, Accessibility)",
  "More Menu (Profile, Feedback, etc.)",
  "Profile (View & Manage Posts)",
  "Posts (General Content & Interaction)",
  "Flagging (Reporting Inappropriate Content)",
  "Voting (Upvote/Downvote)",
  "Username/Onboarding (First-time Setup & Code of Honor)",
  "Login/Signup Flow (Auth Experience)",
  "Something Else (Catch-all)",
];

const MAX_LENGTH = 500; // Increased for more detailed feedback

export default function Feedback({ onBack, onSubmit }) {
  const [selected, setSelected] = useState("");
  const [experience, setExperience] = useState("");
  const [whatYouLiked, setWhatYouLiked] = useState("");
  const [whatYouWouldChange, setWhatYouWouldChange] = useState("");
  const [additionalThoughts, setAdditionalThoughts] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async () => {
    if (!selected) {
      setError("Please select a category.");
      return;
    }

    // Build comprehensive feedback message
    let feedbackMessage = "";

    if (experience) {
      feedbackMessage += `Overall Experience: ${experience}\n\n`;
    }

    if (whatYouLiked) {
      feedbackMessage += `What I Liked: ${whatYouLiked}\n\n`;
    }

    if (whatYouWouldChange) {
      feedbackMessage += `What I Would Change: ${whatYouWouldChange}\n\n`;
    }

    if (additionalThoughts) {
      feedbackMessage += `Additional Thoughts: ${additionalThoughts}`;
    }

    const trimmed = feedbackMessage.trim();

    if (trimmed.length === 0) {
      setError("Please share at least some feedback.");
      return;
    }

    if (trimmed.length > MAX_LENGTH) {
      setError(
        `Feedback is too long (${trimmed.length} chars). Please keep it under ${MAX_LENGTH} characters.`
      );
      return;
    }

    const backendError = await onSubmit(selected, trimmed);
    if (backendError) {
      setError(backendError);
    } else {
      // Clear all fields
      setSelected("");
      setExperience("");
      setWhatYouLiked("");
      setWhatYouWouldChange("");
      setAdditionalThoughts("");
      setSuccess(true);
      track("feedback_submitted", {
        metadata: {
          category: selected,
          hasExperience: !!experience,
          hasLiked: !!whatYouLiked,
          hasChange: !!whatYouWouldChange,
        },
      });
    }
  };

  const totalLength = (
    experience +
    whatYouLiked +
    whatYouWouldChange +
    additionalThoughts
  ).length;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="cursor-pointer text-[#8C8888] hover:text-[#4E4A4A] transition-colors"
            aria-label="Back to feed"
          >
            <IoMdArrowBack size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-[#4E4A4A]">
              Share Your Thoughts
            </h1>
            <p className="text-xs text-[#8C8888] mt-1">
              Your feedback helps make this space better
            </p>
          </div>
        </div>
      </div>

      {/* Success State */}
      {success ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="mb-6">
            <div className="text-6xl mb-4">🙏</div>
            <h2 className="text-2xl font-light text-[#4E4A4A] mb-2">
              Thank You!
            </h2>
            <p className="text-[#8C8888] leading-relaxed">
              Your feedback means a lot. We&apos;re listening and will use your
              thoughts to improve.
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full bg-[#BEBABA] text-[#4E4A4A] text-sm uppercase tracking-wider hover:bg-[#BEBABA]/90 transition"
          >
            Back to Feed
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col gap-6">
            {/* Category Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#8C8888] uppercase tracking-wider">
                What area are you giving feedback about? *
              </label>
              <select
                className="w-full px-4 py-3 rounded-full border-2 border-[#BEBABA]/50 bg-transparent text-[#4E4A4A] font-light focus:outline-none focus:border-[#BEBABA] transition-all duration-300"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Overall Experience */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#8C8888] uppercase tracking-wider">
                How was your overall experience?
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-[24px] border-2 border-[#BEBABA]/50 bg-transparent text-[#4E4A4A] font-light leading-relaxed tracking-wide focus:outline-none focus:border-[#BEBABA] transition-all duration-300 resize-none min-h-[80px]"
                placeholder="Tell us about your experience using this feature..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                disabled={!selected}
              />
            </div>

            {/* What You Liked */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#8C8888] uppercase tracking-wider">
                What did you like? (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-[24px] border-2 border-[#BEBABA]/50 bg-transparent text-[#4E4A4A] font-light leading-relaxed tracking-wide focus:outline-none focus:border-[#BEBABA] transition-all duration-300 resize-none min-h-[80px]"
                placeholder="What worked well? What felt good?"
                value={whatYouLiked}
                onChange={(e) => setWhatYouLiked(e.target.value)}
                disabled={!selected}
              />
            </div>

            {/* What You Would Change */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#8C8888] uppercase tracking-wider">
                What would you change? (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-[24px] border-2 border-[#BEBABA]/50 bg-transparent text-[#4E4A4A] font-light leading-relaxed tracking-wide focus:outline-none focus:border-[#BEBABA] transition-all duration-300 resize-none min-h-[100px]"
                placeholder="If you didn't like something, what different would you have liked to see? What felt off or could be improved?"
                value={whatYouWouldChange}
                onChange={(e) => setWhatYouWouldChange(e.target.value)}
                disabled={!selected}
              />
            </div>

            {/* Additional Thoughts */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#8C8888] uppercase tracking-wider">
                Anything else? (Optional)
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-[24px] border-2 border-[#BEBABA]/50 bg-transparent text-[#4E4A4A] font-light leading-relaxed tracking-wide focus:outline-none focus:border-[#BEBABA] transition-all duration-300 resize-none min-h-[80px]"
                placeholder="Any other thoughts, ideas, or suggestions?"
                value={additionalThoughts}
                onChange={(e) => setAdditionalThoughts(e.target.value)}
                disabled={!selected}
              />
            </div>

            {/* Character Count */}
            <div className="flex justify-end w-full px-1">
              <span
                className={`text-xs uppercase tracking-wider ${
                  totalLength > MAX_LENGTH
                    ? "text-red-400"
                    : totalLength > MAX_LENGTH * 0.8
                    ? "text-[#8C8888]"
                    : "text-[#8C8888]/60"
                }`}
              >
                {totalLength} / {MAX_LENGTH}
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex justify-center w-full">
                <span className="text-sm text-red-400 text-center font-light">
                  {error}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                className="px-6 py-3 rounded-full bg-[#BEBABA] text-[#4E4A4A] text-sm uppercase tracking-wider hover:bg-[#BEBABA]/90 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={
                  !selected || totalLength === 0 || totalLength > MAX_LENGTH
                }
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
