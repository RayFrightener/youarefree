import { useState, useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";

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

const MAX_LENGTH = 300;

export default function Feedback({ onBack, onSubmit }) {
  const [selected, setSelected] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!selected) {
      setError("Please select a category.");
      return;
    }
    if (trimmed.length === 0) {
      setError("Feedback can't be empty.");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError("Feedback is too long. Please shorten it.");
      return;
    }
    const backendError = await onSubmit(selected, trimmed);
    if (backendError) {
      setError(backendError);
    } else {
      setSelected(""); // Clear category
      setText(""); // Clear textarea
      setSuccess("Thank you for your feedback!"); // Show thank you message
      setTimeout(() => setSuccess(""), 3000); // Hide after 3s
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header - Fixed at top */}
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
              Give Feedback
            </h1>
          </div>
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col gap-6">
          {/* Category Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#8C8888] uppercase tracking-wider">
              Category
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

          {/* Feedback Text */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#8C8888] uppercase tracking-wider">
              Your Feedback
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-[24px] border-2 border-[#BEBABA]/50 bg-transparent text-[#4E4A4A] font-light leading-relaxed tracking-wide focus:outline-none focus:border-[#BEBABA] transition-all duration-300 resize-none min-h-[120px]"
              placeholder="Please share your thoughts and suggestions..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!selected}
            />
            <div className="flex justify-end w-full px-1">
              <span
                className={`text-xs uppercase tracking-wider ${
                  text.length > MAX_LENGTH ? "text-red-400" : "text-[#8C8888]"
                }`}
              >
                {text.length} / {MAX_LENGTH}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex justify-center w-full">
              <span className="text-sm text-red-400 text-center font-light">
                {error}
              </span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex justify-center w-full">
              <span className="text-sm text-[#4E4A4A] text-center font-light">
                {success}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              className="px-6 py-3 rounded-full bg-[#BEBABA] text-[#4E4A4A] text-sm uppercase tracking-wider hover:bg-[#BEBABA]/90 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={!selected || text.trim().length === 0}
            >
              Send Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
