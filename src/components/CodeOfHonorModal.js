import React, { useState } from "react";

export default function CodeOfHonorModal({ onContinue }) {
    const [checked, setChecked] = useState(false);

return (
  <div className="flex flex-col items-center justify-center w-full h-full">
  <h2 className="text-2xl font-semibold mb-4 text-center">Welcome to Unbound</h2>
  <div className="mb-6 text-center text-gray-700 space-y-4">
    <p>
      <b>— a space to share reflections rooted in truth.</b>
    </p>
    <p>
      By entering this space, I honor the intention behind it.<br />
      I commit to not posting out of impulse or noise.<br />
      I will pause before I speak. I will listen before I respond.<br />
      If nothing feels true, I will remain silent. If something does, I will offer it with sincerity.
    </p>
    <p>
      Unbound is not just a platform — it is a shared sacred space.<br />
      Treat it with the same care you would offer your own inner temple.
    </p>
    <p>
      You are not alone. We are all here together — one breath, one silence, one truth at a time.
    </p>
  </div>
  <div className="flex items-center mb-4">
    <input
      id="honor-check"
      type="checkbox"
      checked={checked}
      onChange={e => setChecked(e.target.checked)}
      className="mr-2"
    />
    <label htmlFor="honor-check" className="text-gray-800">
      Please check this box to continue
    </label>
  </div>
  <button
    className={`mt-2 px-6 py-2 rounded bg-[#8C8888] text-white font-semibold transition  ${
      checked ? "opacity-100 cursor-pointer" : "opacity-60 cursor-not-allowed"
    }`}
    disabled={!checked}
    onClick={onContinue}
  >
    Continue
  </button>
  <div className="mt-4 text-gray-600 text-sm text-center">
    We’re truly glad you’re here.
  </div>
</div>

)
}


