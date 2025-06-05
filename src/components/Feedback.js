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
  "Something Else (Catch-all)"
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
        setSelected("");      // Clear category
        setText("");          // Clear textarea
        setSuccess("Thank you for your feedback!"); // Show thank you message
        setTimeout(() => setSuccess(""), 3000);     // Hide after 3s
    }
    };

    return (
        <div className="flex flex-col justify-between h-full w-full">
            {/* Top: Back button and dropdown */}
            <div className="flex flex-col items-start">
                <button
                    className="mb-4 mt-4 ml-2"
                    onClick={onBack}
                    aria-label="Back"
                >
                    <IoMdArrowBack size={24}/>
                </button>
                <label className="mb-2 ml-2 text-sm font-semibold">Category</label>
                <select
                    className="w-full p-2 rounded border-2 border-[#9C9191] mb-4 focus:outline-none"
                    value={selected}
                    onChange={e => setSelected(e.target.value)}
                >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <textarea
                    className="w-full p-2 rounded border-2 border-[#9C9191] mb-4 focus:outline-none"
                    placeholder="Please give your suggestions."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    disabled={!selected}
                />
                <div className="flex justify-end w-full px-1 mb-2">
                    <span className={`text-xs ${text.length > MAX_LENGTH ? "text-red-500" : "text-[#9C9191]"}`}>
                        {text.length} / {MAX_LENGTH}
                    </span>
                </div>
                {error && (
                    <div className="flex justify-center w-full mb-2">
                        <span className="text-sm text-red-500 text-center">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="flex justify-center w-full mb-2">
                        <span className="text-sm text-[#8C8888] text-center">{success}</span>
                    </div>
                    )}
            </div>
            {/* Bottom: Send Feedback button aligned right */}
            <div className="flex justify-end">
                <button
                    className="px-4 py-1 rounded-lg bg-[#BEBABA] text-center mb-6 mr-8 cursor-pointer"
                    onClick={handleSubmit}
                    disabled={!selected || text.trim().length === 0}
                >
                    Send Feedback
                </button>
            </div>
        </div>
    );
}