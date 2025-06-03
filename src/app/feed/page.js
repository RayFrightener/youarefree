"use client";

import { motion } from "motion/react"
import { AnimatePresence } from "motion/react"
import { useState, useEffect } from "react";
import { IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";
import { IoFlagOutline } from "react-icons/io5";
import MainView from "../../components/MainView";
import { useSession } from "next-auth/react";
import SignIn from "../../components/sign-in";
import { signOut } from "next-auth/react";
import { useModal } from "../../context/ModalContext";
import ExpressForm from "../../components/ExpressForm";
import CodeOfHonorModal from "../../components/CodeOfHonorModal";
import UsernameSetupModal from "../../components/UsernameSetupModal";
import UserProfile from "../../components/UserProfile";


export default function Feed() {
    const { data: session, status } = useSession();
    const [showSignIn, setShowSignIn] = useState(false);
    const [posts, setPosts] = useState([]);
    const [sort, setSort] = useState("newest");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [votes, setVotes] = useState({}); // tracks votes for each post by ID
    const { showMore, setShowMore } = useModal();
    const [voteCooldown, setVoteCooldown] = useState({});
    // express form state
    const [isExpressing, setIsExpressing] = useState(false);
    //user profile to check the username
    const [userProfile, setUserProfile] = useState(null);
    // new user sign up modals
    const [showCodeOfHonor, setShowCodeOfHonor] = useState(false);
    const [showUsernameSetup, setShowUsernameSetup] = useState(false);
    // user profile data
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);
    const [flaggedPosts, setFlaggedPosts] = useState({});
    const [flagNotification, setFlagNotification] = useState("");



      async function fetchPosts() {

        try {
          //try doing a request using fetch to the api route with fetch(apiroute+queryParam)
          const res = await fetch(`/api/posts?sort=${sort}`);
          //convert res to json
          const data = await res.json();
          //assign data to state variable
          setPosts(data);

          //build votes state from fetched posts
          const votesObj = {};
          data.forEach(post => {
            votesObj[post.id] = post.currentUserVote || 0;
          });
          setVotes(votesObj);

        } catch (error) {
          //catch error if fetch fails
          console.error("Error fetching posts", error);
        }
      }     

    //use effect because fetch or GET is a sideeffect
    useEffect(() => {
      //declare async function
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

    /** function to handle expression submission
     * create a const handleExpressSubmit async with expression as its variable
     * in that we do a try catch block
     * try 
     * const res(that we receive) from the api route -> fetch with api route
     * fetch takes in info of the HTTP method in our case: 
     * method post
     * header
     */

    const handleExpressionSubmission = async (expression) => {
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: expression }),
        });
        if (res.ok) {
          setIsExpressing(false);
          fetchPosts();
        } else {
          alert("Failed to submit post");
        }
      } catch (error) {
        console.error("Error submitting post:", error);
        alert("Error submitting post");
      }
    };

    const handleVote = async (postId, value) => {
      if (voteCooldown[postId]) return;
      setVoteCooldown((prev) => ({ ...prev, [postId]: true }));

      try {
        const res = await fetch("api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({postId, value}),
        });
        if (res.ok) {
        setVotes((prev) => ({
        ...prev,
        [postId]: prev[postId] === value ? 0 : value
      }));

        } else {
          alert("Failed to vote");
        }
      } catch (error) {
        console.error("Error voting:", error);
        alert("Error voting");
      } finally {
        setTimeout(() => {
          setVoteCooldown((prev) => ({ ...prev, [postId]: false }));
        }, 1000);
      }
    };

    const handleFlagPosts = async (postId) => {
      const res = await fetch("/api/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }), 
      });

      const data = await res.json();
      if ( res.ok) {
        setFlaggedPosts( prev => ({
          ...prev, [postId]: data.flagged
        }));
        setFlagNotification(
          data.flagged 
          ? "You have successfully flagged this post. Thank you!"
          : "You have successfully un-flagged this post. Thank you!"
        );
        setTimeout(() => setFlagNotification(""), 3000);
      } else {
        setFlagNotification(data.error || "Failed to flag post.");
        setTimeout(() => setFlagNotification(""), 3000)
      }
    };

    const handleInteraction = async (action) => {
      if (!session) {
        setShowSignIn(true); // Show the sign-in button if not authenticated
        return;
      }
      // Fetch user profile only after sign-in
      if (!userProfile) {
        const res = await fetch("/api/me");
        const data = await res.json();
        setUserProfile(data);
        console.log(data);
        if (!data.username) {
          setShowCodeOfHonor(true);
          return;
        }
      } else if (!userProfile.username) {
        setShowCodeOfHonor(true);
        return;
      }
      action(); // Perform the action if authenticated
    };

    const handleUserClick = async (username) => {
      const res = await fetch(`/api/user/${username}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUserProfile(data);
      } else {
        alert("User not found");
      }
    };

    //toggle sort to toggle between the state variable
    const toggleSort = () => {
      setSort((prevSort) => (prevSort === "newest" ? "highest" : "newest"));
    };

      // Prevent rendering until session status is determined
    if (status === "loading") {
    return <div>Loading...</div>; // Show a loading state while session is being determined
    }
    
    const handleSignOut = async () => {
      await signOut({ callbackUrl: "/feed" });
      setShowMore(false);
    }


if (showCodeOfHonor) {
  return (
    <div className="flex items-center justify-center min-h-screen -mt-4">
      <MainView>
        <CodeOfHonorModal
          onContinue={() => {
            setShowCodeOfHonor(false);
            setShowUsernameSetup(true);
          }}
        />
      </MainView>
    </div>
  );
}

if (showUsernameSetup) {
  return (
    <div className="flex items-center justify-center min-h-screen -mt-4">
      <MainView>
        <UsernameSetupModal
          onBack={() => {
            setShowUsernameSetup(false);
            setShowCodeOfHonor(true);
          }}
          onSubmit={async (username) => {
            await fetch("/api/set-username", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username }),
            });
            // Refetch user profile
            fetch("/api/me")
              .then(res => res.json())
              .then(data => {
                setUserProfile(data);
                setShowUsernameSetup(false);
              });
          }}
        />
      </MainView>
    </div>
  );
}
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
        ) : showMore ? (
              <motion.div
                key="more"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full flex items-center justify-center"
              >
                {!session ? (
                  // If not signed in, show sign in modal
                  <SignIn onSignInSuccess={() => setShowMore(false)} />
                ) : (
                  // If signed in, show sign out button
                  <div className="flex flex-col items-center justify-center w-full">
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 rounded-lg bg-[#BEBABA] text-[#9C9191] font-semibold mt-4"
                    >
                      Sign Out
                    </button>
                    <button
                      onClick={() => setShowMore(false)}
                      className="mt-2 text-sm text-[#9C9191] underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </motion.div>
            ) : isExpressing ? (
              <ExpressForm
                onBack={() => setIsExpressing(false)}
                onSubmit={handleExpressionSubmission}
                />
            ) : selectedUserProfile ? (
              <UserProfile
                profile={selectedUserProfile}
                onBack={() => {setSelectedUserProfile(null)}}
                />

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
            <div className="flex-grow flex items-center justify-center flex-col">
              <h2 className="text-xl text-center">
                {posts[currentIndex]?.content || "No posts available"}
              </h2>
              {posts[currentIndex]?.user?.username && (
                <div className="mt-2 text-sm text-[#8C8888] relative w-full max-w-sm flex items-center justify-center">
                  <span className="mx-auto flex items-center">
                    —{" "}
                    <button
                      className="hover:underline"
                      onClick={() => handleUserClick(posts[currentIndex].user.username)}
                    >
                      {posts[currentIndex].user.username}
                    </button>
                  </span>
                  <button
                    className={`absolute right-0 transition-opacity ${
                      flaggedPosts[posts[currentIndex]?.id]
                      ? "text-red-500 opacity 80"
                      : "opacity-40 hover:opacity-80"
                    }`}
                    title="Flag this post"
                    onClick={() => handleFlagPosts(posts[currentIndex].id)}
                    >
                      <IoFlagOutline size={18} />
                    </button>
                    {flagNotification && (
                            <div className="absolute right-0 mt-18 w-max bg-[#F5F5F5] text-[#8C8888] text-xs px-3 py-1 rounded shadow z-10">
                              {flagNotification}
                            </div>
                  )}
                </div>
              )}
            </div>
            {/* Buttons */}
            <div className="w-full px-2 sm:px-8 m-4">
              <div className="max-w-md mx-auto flex flex-row gap-4 w-full">
                {/* Toggle Sort Button */}
                <button
                  onClick={toggleSort}
                  className="flex-1 px-4 py-1 rounded-lg bg-[#BEBABA] text-center cursor-pointer"
                >
                  {sort === "newest" ? "Uplifting" : "Newest"}
                </button>
            
                {/* Upvote Button */}
                <button
                  onClick={() =>
                    handleInteraction(() =>
                      handleVote(posts[currentIndex]?.id, 1)
                    )
                  }
                  className={`flex-1 px-4 py-1 rounded-lg cursor-pointer text-center ${
                    votes[posts[currentIndex]?.id] === 1
                      ? "bg-[#8C8888]"
                      : "bg-[#BEBABA]"
                  }`}
                  disabled={voteCooldown[posts[currentIndex]?.id]}
                >
                  <IoMdArrowRoundUp size={18} className="mx-auto" />
                </button>
            
                {/* Downvote Button */}
                <button
                  onClick={() =>
                    handleInteraction(() =>
                      handleVote(posts[currentIndex]?.id, -1)
                    )
                  }
                  className={`flex-1 px-4 py-1 rounded-lg cursor-pointer text-center ${
                    votes[posts[currentIndex]?.id] === -1
                      ? "bg-[#8C8888]"
                      : "bg-[#BEBABA]"
                  }`}
                  disabled={voteCooldown[posts[currentIndex]?.id]}
                >
                  <IoMdArrowRoundDown size={18} className="mx-auto" />
                </button>
            
                {/* Express Button */}
                <button
                  className="flex-1 px-4 py-1 rounded-lg bg-[#BEBABA] text-center cursor-pointer"
                  onClick={() => handleInteraction(() => 
                    setIsExpressing(true))}
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