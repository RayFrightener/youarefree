"use client";

import { signIn } from "next-auth/react";

export default function SignIn({ onSignInSuccess }) {
  const handleSignIn = async () => {
    await signIn("google"); // Call the client-side signIn function
    onSignInSuccess(); // Notify parent component that sign-in is successful
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex-grow flex items-center justify-center">
        <button
          onClick={handleSignIn} // Call handleSignIn on button click
          className="px-4 py-2 rounded-lg bg-[#BEBABA] cursor-pointer"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}