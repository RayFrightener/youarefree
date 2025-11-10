"use client";

import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
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
import HowToNavigate from "../../components/HowToNavigate";
import NavigationHint from "../../components/NavigationHint";
import AnimatedPost from "../../components/AnimatedPost";

//hooks
//navigation/navigate/up/down/button
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
  useMouseWheelNavigation,
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
  const [showHowToNavigate, setShowHowToNavigate] = useState(false);
  const { posts, sort, setSort, votes, setVotes, fetchPosts } = usePosts();
  const { isExpressing, setIsExpressing, handleExpressionSubmission } =
    useExpressionSubmission(fetchPosts);
  const { userProfile, setUserProfile, handleDeletePost } =
    useDeletePost(fetchPosts);
  const { handleVote } = useVote(votes, setVotes, {
    showOwnProfile,
    setUserProfile,
    selectedUserProfile,
    setSelectedUserProfile,
  });
  const { flaggedPosts, flagNotification, handleFlagPosts } = useFlag();
  const { handleFeedbackSubmit } = useFeedback();
  const { handleInteraction } = useInteraction({
    session,
    setShowSignIn,
    userProfile,
    setUserProfile,
    setShowCodeOfHonor,
  });

  const { handleUserClick } = useUserProfileClick(setSelectedUserProfile);
  const { toggleSort } = useToggleSort(setSort);

  useOwnProfile(showOwnProfile, userProfile, setUserProfile);
  useKeyboardNavigation(currentIndex, setCurrentIndex, posts.length);

  const { isScrolling } = useMouseWheelNavigation(
    currentIndex,
    setCurrentIndex,
    posts.length
  );

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/feed" });
    setShowMore(false);
  };
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
          .then((res) => res.json())
          .then((data) => {
            setUserProfile(data);
            if (!data.username) {
              setShowCodeOfHonor(true);
            }
          });
      } else if (!userProfile.username) {
        setShowCodeOfHonor(true);
      }
    }
  }, [
    session,
    userProfile,
    showCodeOfHonor,
    showUsernameSetup,
    setUserProfile,
  ]);

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
              <svg
                className="animate-spin h-8 w-8 text-[#8C8888] mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              {/* Friendly message */}
              <div className="text-lg text-[#8C8888] font-medium">
                Preparing your uplifting feed...
              </div>
            </div>
          </motion.div>
        </MainView>
      </div>
    );
  }
  // code of honor modal
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

  // username setup modal
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
                  .then((res) => res.json())
                  .then((data) => {
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

  // own profile modal
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
                setShowOwnProfile(false);
                setShowMore(true);
              }}
              isOwnProfile={true}
              onDeletePost={handleDeletePost}
            />
          </motion.div>
        </MainView>
      </div>
    );
  }

  // feedback modal
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
                setShowFeedback(false);
                setShowMore(true);
              }}
              onSubmit={handleFeedbackSubmit}
            />
          </motion.div>
        </MainView>
      </div>
    );
  }

  // main feed
  return (
    <div className="flex justify-center min-h-screen pt-28 pb-12 px-4 sm:px-8">
      {" "}
      <MainView>
        {/* Navigation Hint - shows on first visit */}
        {!showMore && !isExpressing && !selectedUserProfile && !showSignIn && (
          <NavigationHint />
        )}
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
              <div className="flex flex-col items-center w-full">
                <SignIn onSignInSuccess={() => setShowSignIn(false)} />

                <p className="text-xs text-gray-400 text-center mt-6 max-w-xs">
                  By signing in, you’ll receive a welcome email and rare updates
                  from Unbound.
                </p>
              </div>
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
              ) : showHowToNavigate ? (
                <HowToNavigate onBack={() => setShowHowToNavigate(false)} />
              ) : (
                <div className="flex flex-col h-full w-full">
                  {/* Back arrow at the top left */}
                  <div className="flex items-start w-full">
                    <button
                      className="mb-4 mt-4 ml-2 cursor-pointer"
                      onClick={() => setShowMore(false)}
                      aria-label="Back to Feed"
                    >
                      <IoMdArrowBack size={24} />
                    </button>
                  </div>
                  {/* Other buttons centered below */}
                  <div className="flex flex-col items-center justify-center w-full flex-1 gap-3">
                    <button
                      className="px-6 py-3 rounded-full border-2 border-[#BEBABA]/50 bg-transparent text-[#8C8888] font-medium text-sm uppercase tracking-wider hover:border-[#BEBABA] hover:bg-[#BEBABA]/10 hover:text-[#4E4A4A] transition-all duration-300 cursor-pointer min-w-[200px] active:scale-[0.98]"
                      onClick={() => {
                        setShowHowToNavigate(true);
                      }}
                    >
                      How to Navigate
                    </button>
                    <button
                      className="px-6 py-3 rounded-full border-2 border-[#BEBABA]/50 bg-transparent text-[#8C8888] font-medium text-sm uppercase tracking-wider hover:border-[#BEBABA] hover:bg-[#BEBABA]/10 hover:text-[#4E4A4A] transition-all duration-300 cursor-pointer min-w-[200px] active:scale-[0.98]"
                      onClick={async () => {
                        const res = await fetch("/api/me");
                        const data = await res.json();
                        setUserProfile(data);
                        setShowOwnProfile(true);
                        setShowMore(false);
                      }}
                    >
                      Profile
                    </button>
                    <button
                      className="px-6 py-3 rounded-full border-2 border-[#BEBABA]/50 bg-transparent text-[#8C8888] font-medium text-sm uppercase tracking-wider hover:border-[#BEBABA] hover:bg-[#BEBABA]/10 hover:text-[#4E4A4A] transition-all duration-300 cursor-pointer min-w-[200px] active:scale-[0.98]"
                      onClick={() => {
                        setShowFeedback(true);
                        setShowMore(false);
                      }}
                    >
                      Give Feedback
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="px-6 py-3 rounded-full border-2 border-[#BEBABA]/50 bg-transparent text-[#8C8888] font-medium text-sm uppercase tracking-wider hover:border-[#BEBABA] hover:bg-[#BEBABA]/10 hover:text-[#4E4A4A] transition-all duration-300 cursor-pointer min-w-[200px] active:scale-[0.98]"
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
              onBack={() => {
                setSelectedUserProfile(null);
              }}
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`post-${currentIndex}-${sort}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex-1 flex flex-col"
              >
                <motion.div
                  className="flex-1 flex items-center justify-center flex-col px-2 sm:px-4"
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  onDragEnd={(event, info) => {
                    if (
                      info.offset.y < -50 &&
                      currentIndex < posts.length - 1
                    ) {
                      setCurrentIndex(currentIndex + 1);
                    } else if (info.offset.y > 50 && currentIndex > 0) {
                      setCurrentIndex(currentIndex - 1);
                    }
                  }}
                >
                  <AnimatedPost
                    content={posts[currentIndex]?.content || "Expressing..."}
                    username={posts[currentIndex]?.user?.username}
                    postId={posts[currentIndex]?.id}
                    onUsernameClick={() =>
                      handleUserClick(posts[currentIndex]?.user?.username)
                    }
                    onFlagClick={() => handleFlagPosts(posts[currentIndex]?.id)}
                    isFlagged={flaggedPosts[posts[currentIndex]?.id]}
                    showControls={true}
                    renderButtons={() => (
                      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full max-w-full overflow-hidden">
                        <button
                          onClick={() => {
                            toggleSort();
                            setCurrentIndex(0);
                          }}
                          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border-2 border-[#BEBABA]/50 bg-transparent text-xs sm:text-sm uppercase tracking-[0.2em] text-[#8C8888] hover:border-[#BEBABA] hover:bg-[#BEBABA]/10 hover:text-[#4E4A4A] transition-all duration-300 cursor-pointer active:scale-[0.98] font-medium whitespace-nowrap flex-shrink-0"
                        >
                          {sort === "newest" ? "Uplifting" : "Newest"}
                        </button>

                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          <button
                            onClick={() =>
                              handleInteraction(() =>
                                handleVote(posts[currentIndex]?.id, 1)
                              )
                            }
                            className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer active:scale-[0.95] flex-shrink-0 ${
                              votes[posts[currentIndex]?.id] === 1
                                ? "bg-[#BEBABA] text-[#4E4A4A] border-[#BEBABA] shadow-sm"
                                : "text-[#8C8888] border-[#BEBABA]/50 hover:border-[#BEBABA] hover:bg-[#BEBABA]/10"
                            }`}
                          >
                            <IoMdArrowRoundUp
                              size={20}
                              className="sm:w-[22px] sm:h-[22px]"
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleInteraction(() =>
                                handleVote(posts[currentIndex]?.id, -1)
                              )
                            }
                            className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer active:scale-[0.95] flex-shrink-0 ${
                              votes[posts[currentIndex]?.id] === -1
                                ? "bg-[#BEBABA] text-[#4E4A4A] border-[#BEBABA] shadow-sm"
                                : "text-[#8C8888] border-[#BEBABA]/50 hover:border-[#BEBABA] hover:bg-[#BEBABA]/10"
                            }`}
                          >
                            <IoMdArrowRoundDown
                              size={20}
                              className="sm:w-[22px] sm:h-[22px]"
                            />
                          </button>
                        </div>

                        <button
                          className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#BEBABA] text-[#4E4A4A] text-xs sm:text-sm uppercase tracking-[0.25em] hover:bg-[#BEBABA]/90 hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] font-medium whitespace-nowrap flex-shrink-0"
                          onClick={() =>
                            handleInteraction(() => setIsExpressing(true))
                          }
                        >
                          Express
                        </button>
                      </div>
                    )}
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </AnimatePresence>
      </MainView>
    </div>
  );
}
