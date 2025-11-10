import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* Main Text */}
      <p className="text-lg sm:text-xl md:text-2xl font-medium max-w-2xl leading-relaxed">
        A space for moments of clarity, connection, and quiet understanding.
        <br />
        <strong>Freedom is your nature. You are free and unbound.</strong>
        <br />
        Share what resonates. Read what uplifts. Remember what matters.
        <br />
        Leave feeling lighter, clearer, and ready to live fully.
      </p>

      {/* Enter Button */}
      <div className="mt-8 flex flex-col sm:flex-row sm:justify-center sm:gap-4">
        <Link href="/feed">
          <button className="bg-[#9C9191] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#7F7A7A] transition cursor-pointer">
            Enter
          </button>
        </Link>
      </div>
    </div>
  );
}
