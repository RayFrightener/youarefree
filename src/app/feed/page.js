"use client";

import { motion } from "motion/react"
import { AnimatePresence } from "motion/react"
import { useState, useEffect } from "react";
import { IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";
import MainView from "../../components/MainView";
import { useSession } from "next-auth/react";
import SignIn from "../../components/sign-in";

export default function Feed() {
    const { data: session, status } = useSession();
    const [showSignIn, setShowSignIn] = useState(false);
    const [posts, setPosts] = useState([]);
    const [sort, setSort] = useState("newest");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [votes, setVotes] = useState({}); // tracks votes for each post by ID
    
    const mockPosts = [
      {
        id: 1,
        content: "This is the first post. Welcome to the feed!",
        score: 10,
      },
      {
        id: 2,
        content: "Freedom is your nature. You are free and unbound.",
        score: 25,
      },
      {
        id: 3,
        content: "Break free from the illusion of what you are not.",
        score: 15,
      },
      {
        id: 4,
        content: "Wake up to your real nature and live fearlessly.",
        score: 30,
      },
    ];
  

    //use effect because fetch or GET is a sideeffect
    useEffect(() => {
      //declare async function
      async function fetchPosts() {

        try {
          //try doing a request using fetch to the api route with fetch(apiroute+queryParam)
          const res = await fetch(`/api/posts?sort=${sort}`);
          //convert res to json
          const data = await res.json();
          //assign data to state variable
          setPosts(data);

        } catch (error) {
          //catch error if fetch fails
          console.error("Error fetching posts", error);
        }
      }      
      //run the function
      fetchPosts();
    }, [sort]);

    useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === "ArrowDown") {
          if (currentIndex < posts.length - 1) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
          }
        } else if ( event.key === "ArrowUp") {
          if (currentIndex > 0) {
            setCurrentIndex((prevIndex) => prevIndex - 1);
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      }
    }, [currentIndex, posts.length]);

    const handleInteraction = (action) => {
      if (!session) {
        setShowSignIn(true); // Show the sign-in button if not authenticated
        return;
      }
      action(); // Perform the action if authenticated
    };

    const handleUpvote = (postId) => {
      setVotes((prevVotes) => ({
        ...prevVotes,
        [postId]: (prevVotes[postId] || 0) + 1,
      }));
    };
  
    const handleDownvote = (postId) => {
      setVotes((prevVotes) => ({
        ...prevVotes,
        [postId]: (prevVotes[postId] || 0) - 1,
      }));
    };

    //toggle sort to toggle between the state variable
    const toggleSort = () => {
      setSort((prevSort) => (prevSort === "newest" ? "highest" : "newest"));
    };

      // Prevent rendering until session status is determined
    if (status === "loading") {
    return <div>Loading...</div>; // Show a loading state while session is being determined
    }

    // username, content filtered by newest/highestScore
    //upvote and downvote
    return (
        <div className="flex items-center justify-center min-h-screen -mt-4">
<MainView>
      <AnimatePresence mode="wait">
        {showSignIn ? (
          <motion.div
            key="signin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center"
          >
            <SignIn
              onSignInSuccess={() => setShowSignIn(false)} // Callback to hide SignIn
            />
          </motion.div>
        ) : (
          <motion.div
            key={`${currentIndex}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            {/* Post Content */}
            <div className="flex-grow flex items-center justify-center">
              <h2 className="text-xl text-center">
                {posts[currentIndex]?.content || "No posts available"}
              </h2>
            </div>

            {/* Voting Buttons */}
            <div className="flex justify-between items-center w-full px-8 m-4">
              {/* Left Section: Toggle Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={toggleSort}
                  className="px-4 py-2 rounded-lg bg-[#BEBABA] cursor-pointer"
                >
                  {sort === "newest" ? "Most Uplifting" : "Newest"}
                </button>
              </div>

              {/* Center Section: Voting Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    handleInteraction(() =>
                      handleUpvote(mockPosts[currentIndex]?.id)
                    )
                  }
                  className={`px-4 py-2 rounded-lg cursor-pointer ${
                    votes[mockPosts[currentIndex]?.id] === 1
                      ? "bg-[#A5A1A1]"
                      : "bg-[#BEBABA]"
                  }`}
                >
                  <IoMdArrowRoundUp size={18} />
                </button>
                <button
                  onClick={() =>
                    handleInteraction(() =>
                      handleDownvote(mockPosts[currentIndex]?.id)
                    )
                  }
                  className={`px-4 py-2 rounded-lg cursor-pointer ${
                    votes[mockPosts[currentIndex]?.id] === -1
                      ? "bg-[#A5A1A1]"
                      : "bg-[#BEBABA]"
                  }`}
                >
                  <IoMdArrowRoundDown size={18} />
                </button>
              </div>

              {/* Right Section: Express Button */}
              <div className="flex-shrink-0">
                <button
                  className="px-4 py-2 rounded-lg bg-[#BEBABA] cursor-pointer"
                >
                  Express
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainView>
    </div>
    );
}