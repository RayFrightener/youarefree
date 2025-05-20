/**
 * render little back arrow, input box and keep the express button from the feed? 
 * use react
 * import icon
 * create the react component function
 * we need to send two props to it, onBack set state false
 * onSubmit run POST
 */
/** implement input validation with 150 words constraint
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
 * if expression length more than 150
 *  set error
 *  return 
 * else
 * setError empty
 * onSubmit(expression)
 * 
 * show character count? 
 * how? and what? 
 * while user is typing we want to show a span below it that shows the character count /150
 * 
 * 
 */

import { IoMdArrowBack } from "react-icons/io";
import { useState, useEffect } from "react";

const MAX_LENGTH = 150;

export default function ExpressForm({ onBack, onSubmit }) {
    const [expression, setExpression] = useState("");
    const [error, setError] = useState("");
    
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
    const handleSubmit = () => {
        const trimmed = expression.trim();
        if (trimmed.length === 0) {
            setError("Expression can't be empty, please express something");
            return;
        }
        if (trimmed.length > MAX_LENGTH) {
            setError("Expression too bit, please shorten it");
            return;
        }
        setError("");
        onSubmit(trimmed);
    }
    
    return (
        <div className="flex flex-col justify-between h-full w-full">
            {/* Top: Back button and textarea */}
            <div className="flex flex-col items-start">
                <button
                    className="mb-4 mt-4 ml-2"
                    onClick={onBack}
                    aria-label="Back to Feed"
                >
                    <IoMdArrowBack size={24}/>
                </button>
                <textarea
                    className="w-full p-2 rounded border-2 border-[#9C9191] mb-4 focus:outline-none"
                    placeholder="Express a reflection of the truth..."
                    value={expression}
                    onChange={e => setExpression(e.target.value)}
                />
                <div className="flex justify-end w-full px-1 mb-2">
                    <span className={`text-xs ${expression.length > MAX_LENGTH ? "text-red-500" : "text-[#9C9191]"}`}>
                        {expression.length} / {MAX_LENGTH}
                    </span>
                </div>
                {error && (
                    <div className="flex justify-center w-full mb-2">
                        <span className="text-sm text-red-500 text-center">{error}</span>
                    </div>
                )}
            </div>
            {/* Bottom: Express button aligned right */}
            <div className="flex justify-end">
                <button
                    className="px-4 py-1 rounded-lg bg-[#BEBABA] text-center mb-6 mr-8 cursor-pointer"
                    onClick={() => handleSubmit(expression)}
                >
                    Express
                </button>
            </div>
        </div>
    );
}