import { useState, useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";

const MIN_LENGTH = 4;
const MAX_LENGTH = 20;

const usernameSuggestions = [
  "kindmirror",
  "gentlewave",
  "truthseeker",
  "calmsky",
  "mindlight",
  "openlotus",
  "reflectdeeply",
  "claritynow",
  "stillriver",
  "silentpath",
];

export default function UsernameSetupModal({ onBack, onSubmit }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState("");

  function containsBannedWords(input) {
    const bannedWords = new Set([
      "shit", "fuck", "bitch", "hate", "racist", "slur", "kill", "nazi", "rape", "porn", "pussy", "dick", "cock", "vagina", "penis", "boobs", "tits", "nipple", "ass", "butt", "cum", "ejaculate", "orgasm", "anal", "sex", "horny", "bang", "nude", "nudes", "naked", "thong", "fetish", "bastard", "asshole", "dumb", "stupid", "retard", "idiot", "crap", "damn", "fucking", "fucked", "murder", "suicide", "hang", "die", "stab", "shoot", "gun", "bomb", "explode", "terrorist", "chink", "nigger", "faggot", "kike", "tranny", "whore", "slut",
      // Add impersonation/role words for usernames:
      "admin", "administrator", "mod", "moderator", "support", "staff", "owner", "official"
    ]);
    // For usernames, check the whole string (not just word-by-word)
    const lower = input.toLowerCase();
    return Array.from(bannedWords).some(bad => lower.includes(bad));
  }
  useEffect(() => {
    setSuggestion(
      usernameSuggestions[Math.floor(Math.random() * usernameSuggestions.length)]
    );
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async () => {
    const trimmed = username.trim()

    if (trimmed.length < MIN_LENGTH) {
      setError("Username must be at least 4 characters.");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError("Username must be under 20 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("Only letters, numbers, and underscores are allowed.");
      return;
    }
      if (containsBannedWords(trimmed)) {
    setError("This username contains inappropriate or reserved words.");
    return;
    }

    //check if username is taken
    const res = await fetch(`/api/username-available?username=${encodeURIComponent(trimmed)}`);
    const data = await res.json();
    if (!data.available) {
        setError("This username is already taken, please choose another");
        return;
    }

    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col justify-between h-full w-full">
      <div className="flex flex-col items-start">
        <button className="mb-4 mt-4 ml-2" onClick={onBack}>
          <IoMdArrowBack size={24} />
        </button>
        <h2 className="text-lg font-semibold mb-2 ml-2">Choose your username</h2>
        <p className="text-sm text-[#666] mb-2 ml-2">
          Choose a name that reflects your essence. Avoid spammy names or random letters.
        </p>
        <p className="text-sm italic text-[#888] mb-4 ml-2">
          Need help? Try something like <span className="font-mono">{suggestion}</span>
        </p>
        <input
          className="w-full p-2 rounded border-2 border-[#9C9191] mb-2 focus:outline-none"
          placeholder="e.g., silentpath"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="flex justify-end w-full px-1 mb-2">
          <span
            className={`text-xs ${
              username.length > MAX_LENGTH ? "text-red-500" : "text-[#9C9191]"
            }`}
          >
            {username.length} / {MAX_LENGTH}
          </span>
        </div>
        {error && (
          <div className="flex justify-center w-full mb-2">
            <span className="text-sm text-red-500 text-center">{error}</span>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          className={`px-4 py-1 rounded-lg bg-[#BEBABA] text-center mb-6 mr-8 cursor-pointer ${
            username.trim().length < MIN_LENGTH ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSubmit}
          disabled={username.trim().length < MIN_LENGTH}
        >
          Set Username
        </button>
      </div>
    </div>
  );
}
