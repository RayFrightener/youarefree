"use client";

import { motion } from "motion/react"
import { AnimatePresence } from "motion/react"
import { useState, useEffect } from "react";
import { IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";
import { IoMdArrowBack } from "react-icons/io";
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
import Feedback from "../../components/Feedback";

//hooks
import {
  useExpressionSubmission,
  useVote,
  useFlag,
  useDeletePost,
  useFeedback,
  useInteraction,
  useUserProfileClick,
  useToggleSort,  
  usePosts,
  useOwnProfile,
  useKeyboardNavigation,
} from "../../hooks/useFeedLogic";


export default function Feed() {

    const { data: session, status } = useSession();
    const [showSignIn, setShowSignIn] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { showMore, setShowMore } = useModal();
    // new user sign up modals
    const [showCodeOfHonor, setShowCodeOfHonor] = useState(false);
    const [showUsernameSetup, setShowUsernameSetup] = useState(false);
    // user profile data
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);
    const [showOwnProfile, setShowOwnProfile] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    //extracted logic
          const {
        posts,
        sort,
        setSort,
        votes,
        setVotes,
        fetchPosts
      } = usePosts();
    const { isExpressing, setIsExpressing, handleExpressionSubmission } = useExpressionSubmission(fetchPosts);
    const { userProfile, setUserProfile, handleDeletePost } = useDeletePost(fetchPosts);
    const {
            handleVote
        } = useVote(votes, setVotes);
    const { flaggedPosts, flagNotification, handleFlagPosts } = useFlag();
    const { handleFeedbackSubmit } = useFeedback();
    const { handleInteraction } = useInteraction({
            session,
            setShowSignIn,
            userProfile,
            setUserProfile,
            setShowCodeOfHonor
          });

    const { handleUserClick } = useUserProfileClick(setSelectedUserProfile);
    const { toggleSort } = useToggleSort(setSort);
    
    useOwnProfile(showOwnProfile, userProfile, setUserProfile);
    useKeyboardNavigation(currentIndex, setCurrentIndex, posts.length);

    const handleSignOut = async () => {
      await signOut({ callbackUrl: "/feed" });
      setShowMore(false);
    }
      // Add this effect:
    useEffect(() => {
      // Only run if signed in, not loading, and not already showing modals
      if (
        session &&
        !showCodeOfHonor &&
        !showUsernameSetup &&
        userProfile !== undefined // userProfile can be null, but not undefined
      ) {
        // If userProfile is null, fetch it
        if (!userProfile) {
          fetch("/api/me")
            .then(res => res.json())
            .then(data => {
              setUserProfile(data);
              if (!data.username) {
                setShowCodeOfHonor(true);
              }
            });
        } else if (!userProfile.username) {
          setShowCodeOfHonor(true);
        }
      }
    }, [session, userProfile, showCodeOfHonor, showUsernameSetup, setUserProfile]);

  // Prevent rendering until session status is determined
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-4">
        <MainView>
          <motion.div
            key="signin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center"
          >
            <div className="flex flex-col items-center justify-center py-12">
            {/* Spinner */}
            <svg className="animate-spin h-8 w-8 text-[#8C8888] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            {/* Friendly message */}
            <div className="text-lg text-[#8C8888] font-medium">Preparing your uplifting feed...</div>
          </div>
          </motion.div>
        </MainView>
      </div>
    );
  }


  if (showCodeOfHonor) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-4 px-2 sm:px-6 md:px-12">
        <MainView>
          <motion.div
            key="signin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center"
          >
            <CodeOfHonorModal
            onContinue={() => {
              setShowCodeOfHonor(false);
              setShowUsernameSetup(true);
            }}
          />
          </motion.div>
        </MainView>
      </div>
    );
  }



  if (showUsernameSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-4 px-2 sm:px-6 md:px-12">
        <MainView>
          
          <motion.div
            key="signin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center"
          >
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
          </motion.div>
        </MainView>
      </div>
    );
  }

  if (showOwnProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-4 px-2 sm:px-6 md:px-12">
        <MainView>
        <motion.div
            key="signin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center"
          >
            <UserProfile
              profile={userProfile}
              onBack={() => {
                setShowOwnProfile(false)
                setShowMore(true);
              }}
              isOwnProfile={true}
              onDeletePost={handleDeletePost}
            />
          </motion.div>
        </MainView>
      </div>
    )
  }

  if (showFeedback) {
    return (
      <div className="flex items-center justify-center min-h-screen -mt-4 px-2 sm:px-6 md:px-12">
        <MainView>
        <motion.div
            key="signin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center"
          >
            <Feedback
              onBack={() => {
                setShowFeedback(false)
                setShowMore(true);
              }}
              onSubmit={handleFeedbackSubmit}
            />
          </motion.div>
        </MainView>
      </div>
    );
  }

    return (
        <div className="flex items-center justify-center min-h-screen -mt-4 px-2 sm:px-6 md:px-12">
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
                  <div className="flex flex-col h-full w-full">
                  {/* Back arrow at the top left */}
                  <div className="flex items-start w-full">
                    <button
                      className="mb-4 mt-4 ml-2 cursor-pointer"
                      onClick={() => setShowMore(false)}
                      aria-label="Back to Feed"
                    >
                      <IoMdArrowBack size={24}/>
                    </button>
                  </div>
                  {/* Other buttons centered below */}
                  <div className="flex flex-col items-center justify-center w-full flex-1">
                    <button 
                      className="px-4 py-2 rounded-lg bg-[#BEBABA] text-[#9C9191] font-semibold mt-4 cursor-pointer"
                      onClick={() => {
                        setShowOwnProfile(true);
                        setShowMore(false);
                      }}
                    >
                      Profile
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg bg-[#BEBABA] text-[#9C9191] font-semibold mt-4 cursor-pointer"
                      onClick={() => {
                        setShowFeedback(true);
                        setShowMore(false);
                      }}
                    >
                      Give Feedback
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 rounded-lg bg-[#BEBABA] text-[#9C9191] font-semibold mt-4 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
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
            <motion.div
    className="flex-grow flex items-center justify-center flex-col px-4"
    drag="y"
    dragConstraints={{ top: 0, bottom: 0 }}
    onDragEnd={(event, info) => {
      if (info.offset.y < -50 && currentIndex < posts.length - 1) {
        setCurrentIndex(currentIndex + 1); // Swipe up: next post
      } else if (info.offset.y > 50 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1); // Swipe down: previous post
      }
    }}
  >
            {/* Post Content */}
            <div className="flex-grow flex items-center justify-center flex-col px-4">
              <h2 className="text-xl text-center">
                {posts[currentIndex]?.content || "No posts available"}
              </h2>
              {posts[currentIndex]?.user?.username && (
                <div className="mt-2 text-sm text-[#8C8888] relative w-full max-w-sm flex items-center justify-center">
                  <span className="mx-auto flex items-center">
                    —{" "}
                    <button
                      className="underline cursor-pointer"
                      onClick={() => handleUserClick(posts[currentIndex].user.username)}
                    >
                      {posts[currentIndex].user.username}
                    </button>
                  </span>
                  <button
                    className={`absolute right-0 cursor-pointer transition-opacity ${
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
            </motion.div>
            {/* Buttons */}
            <div className="fixed bottom-0 left-0 w-full px-2 sm:px-8 pb-4 pt-2 z-20">
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