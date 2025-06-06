import { useState, useEffect } from "react";
import { useCallback } from "react";

//**
// import { useState, useEffect } from "react";
// This is a custom hook skeleton
// export function useSomething() {
//   // state
//   const [value, setValue] = useState(null);

//   // side effects
//   useEffect(() => {
//     // do something
//   }, []);

//   // handler functions
//   const doSomething = () => { /* ... */ };

//   // return what you want to use in your component
//   return { value, doSomething };
// } */

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState("newest");
  const [votes, setVotes] = useState({});

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts?sort=${sort}`);
      const data = await res.json();
      setPosts(data);

      // Build votes state from fetched posts
      const votesObj = {};
      data.forEach(post => {
        votesObj[post.id] = post.currentUserVote || 0;
      });
      setVotes(votesObj);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, setPosts, sort, setSort, votes, setVotes, fetchPosts };
}


export function useOwnProfile(showOwnProfile, userProfile, setUserProfile) {
  useEffect(() => {
    if (showOwnProfile && !userProfile) {
      fetch("/api/me")
        .then(res => res.json())
        .then(data => setUserProfile(data));
    }
  }, [showOwnProfile, userProfile, setUserProfile]);
}

export function useKeyboardNavigation(currentIndex, setCurrentIndex, postsLength) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowDown") {
        if (currentIndex < postsLength - 1) {
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }
      } else if (event.key === "ArrowUp") {
        if (currentIndex > 0) {
          setCurrentIndex((prevIndex) => prevIndex - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, setCurrentIndex, postsLength]);
}

/**
 * Custom hook to manage expression submission logic.
 * Returns isExpressing state, setIsExpressing, and the handler function.
 */
export function useExpressionSubmission(fetchPosts) {
  const [isExpressing, setIsExpressing] = useState(false);

  // Handles submitting a new expression (post)
  const handleExpressionSubmission = async (expression) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: expression }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsExpressing(false);
        fetchPosts();
        return null;
      } else {
        return data.error || "Failed to submit post";
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      return "Error submitting post";
    }
  };

  return { isExpressing, setIsExpressing, handleExpressionSubmission };
}


/**
 * Custom hook to manage voting logic for posts.
 * Returns votes state, voteCooldown state, and the handleVote function.
 */
export function useVote(votes, setVotes, options = {}) {  
  const { showOwnProfile, setUserProfile, selectedUserProfile, setSelectedUserProfile } = options;

  // Handles voting on a post (upvote/downvote)
  const handleVote = async (postId, value) => {
    // Save previous vote for possible revert
    const prevVote = votes[postId];

    // Optimistically update UI
    setVotes((prev) => ({
      ...prev,
      [postId]: prev[postId] === value ? 0 : value,
    }));

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, value }),
      });
      if (!res.ok) {
        // Revert if backend fails
        setVotes((prev) => ({
          ...prev,
          [postId]: prevVote,
        }));
        alert("Failed to vote");
      }
      else {
        // Refetch own profile if open
        if (showOwnProfile && setUserProfile) {
          fetch("/api/me")
            .then((res) => res.json())
            .then((data) => setUserProfile(data));
        }
        // Refetch selected user profile if open
        if (selectedUserProfile && setSelectedUserProfile) {
          fetch(`/api/user/${selectedUserProfile.username}`)
            .then((res) => res.json())
            .then((data) => setSelectedUserProfile(data));
        }
      }
    } catch (error) {
      setVotes((prev) => ({
        ...prev,
        [postId]: prevVote,
      }));
      console.error("Error voting:", error);
      alert("Error voting");
    }
  };

  return { votes, setVotes, handleVote };
}

export function useFlag() {
    const [flaggedPosts, setFlaggedPosts] = useState({});
    const [flagNotification, setFlagNotification] = useState("");
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
  return { flaggedPosts, flagNotification, handleFlagPosts };
}
/**
 * Custom hook to manage deleting posts and updating the user profile.
 * Returns userProfile state, setUserProfile, and the handleDeletePost function.
 * Call with fetchPosts to refresh posts after deletion.
 */
export function useDeletePost(fetchPosts) {
     const [userProfile, setUserProfile] = useState(null);

      const handleDeletePost = async (postId) => {
      const res = await fetch(`/api/posts/${postId}/delete`, { method: "POST" });
      if (res.ok) {
        setUserProfile((prev) => ({
          ...prev,
          posts: prev.posts.filter(post => post.id !== postId)
        }));
        fetchPosts(); 
      } else {
        alert("Failed to delete post.");
      }
    };
    return { userProfile, setUserProfile, handleDeletePost}
}

/**
 * Custom hook to handle feedback submission.
 * Returns a function that sends feedback to the backend and returns any error message.
 */
export function useFeedback() {
    const handleFeedbackSubmit = async (category, message) => {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-type": "applications/json"},
        body: JSON.stringify({ category, message }),
      });

      if(!res.ok) {
        const data = await res.json();
        return data.error || "Failed to send feedback";
      }
      return null;
    };
    return { handleFeedbackSubmit };
}

/**
 * Custom hook to handle user interaction that requires authentication and username setup.
 * Returns a function that wraps an action and ensures the user is signed in and has a username.
 */
export function useInteraction({ session, setShowSignIn, userProfile, setUserProfile, setShowCodeOfHonor }) {
  /**
   * Wraps an action to ensure the user is authenticated and has a username.
   * If not authenticated, shows sign-in. If no username, shows Code of Honor modal.
   * Otherwise, performs the action.
   */
  const handleInteraction = async (action) => {
    if (!session) {
      setShowSignIn(true);
      return;
    }
    if (!userProfile) {
      const res = await fetch("/api/me");
      const data = await res.json();
      setUserProfile(data);
      if (!data.username) {
        setShowCodeOfHonor(true);
        return;
      }
    } else if (!userProfile.username) {
      setShowCodeOfHonor(true);
      return;
    }
    action();
  };

  return { handleInteraction };
}

/**
 * Custom hook to handle clicking on a user's username to fetch their profile.
 * Returns a function that fetches the user profile and updates state.
 */

export function useUserProfileClick(setSelectedUserProfile) {
  /**
   * Fetches the user profile by username and updates the selectedUserProfile state.
   * Alerts if the user is not found.
   */
  const handleUserClick = useCallback(async (username) => {
    const res = await fetch(`/api/user/${username}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedUserProfile(data);
    } else {
      alert("User not found");
    }
  }, [setSelectedUserProfile]);

  return { handleUserClick };
}

/**
 * Custom hook to handle toggling the sort order of posts.
 * Returns a function that toggles between "newest" and "highest".
 */

export function useToggleSort(setSort) {
  /**
   * Toggles the sort state between "newest" and "highest".
   */
  const toggleSort = useCallback(() => {
    setSort((prevSort) => (prevSort === "newest" ? "highest" : "newest"));
  }, [setSort]);

  return { toggleSort };
}