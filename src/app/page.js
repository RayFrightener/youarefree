import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* Main Text */}
      <p className="text-lg sm:text-xl md:text-2xl font-medium max-w-2xl leading-relaxed">
        We live in forgetfulness and believing the untruth. This is a space with pure remembrance of who you truly are.
        <br />
        <strong>Freedom is your nature. You are free and unbound.</strong>
        <br />
        Break free from the illusion of what you are not and wake up to your real nature.
        <br />
        Have a user experience enriched with all fear removed and leave empowered to live freely.
      </p>

      {/* Enter Button */}
      <div className="mt-8 flex flex-col sm:flex-row sm:justify-center sm:gap-4">
        <Link href="/feed">
        <button
          className="bg-[#9C9191] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#7F7A7A] transition cursor-pointer"
        >
          Enter
        </button>
        </Link>
      </div>
    </div>
  );
}