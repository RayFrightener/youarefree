"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FlaggedPost {
  postId: number;
  post: {
    id: number;
    content: string;
    user: {
      id: string;
      username: string | null;
      email: string;
      status?: string; // Added for user status
    };
  };
  flagCount: number;
  flaggedBy: Array<{
    userId: string;
    username: string | null;
    email: string;
    flaggedAt: string; // Date comes as string from JSON
  }>;
  firstFlaggedAt: string;
  lastFlaggedAt: string;
}

interface MetricsData {
  analytics: {
    totalEvents: number;
    eventsByType: Array<{ eventType: string; count: number }>;
    uniqueUsers: number;
    dailyActiveUsers: number;
    postsCreated: number;
    votesCast: number;
    signups: number;
    returnRate: number;
    period: {
      startDate: string;
      endDate: string;
    };
  };
  engagement: {
    totalUsers: number;
    usersWithPosts: number;
    signupToPostConversion: number;
    avgPostsPerUser: number;
    avgVotesPerUser: number;
  };
  contentQuality: {
    totalPosts: number;
    postsWithPositiveScore: number;
    positiveScoreRate: number;
    avgScore: number;
    flagRate: number;
    avgVotesPerPost: number;
  };
  growth: {
    thisMonthSignups: number;
    lastMonthSignups: number;
    momGrowth: number;
    thisWeekSignups: number;
    lastWeekSignups: number;
    wowGrowth: number;
  };
  retention: {
    retention7Days: number;
    retention30Days: number;
    users7DaysAgo: number;
    users30DaysAgo: number;
    retained7Days: number;
    retained30Days: number;
  };
  sessions: {
    avgSessionDuration: number;
    totalSessions: number;
    avgActionsPerSession: number;
    medianSessionDuration: number;
  };
  conversion: {
    totalSignups: number;
    codeOfHonorAccepted: number;
    codeOfHonorRate: number;
    usernameSetup: number;
    usernameSetupRate: number;
    firstPost: number;
    signupToPostRate: number;
    firstVote: number;
    signupToVoteRate: number;
  };
  timeToAction: {
    avgTimeToFirstPost: number;
    avgTimeToFirstVote: number;
    medianTimeToFirstPost: number;
    medianTimeToFirstVote: number;
  };
}

interface UserWithStats {
  id: string;
  username: string | null;
  email: string;
  status: string;
  flagCount: number;
  restrictedUntil: string | null;
  createdAt: string;
  stats: {
    totalPosts: number;
    totalPostFlags: number;
    avgPostScore: number;
    trollScore: number;
    isTroll: boolean;
  };
}

interface UsersData {
  users: UserWithStats[];
  activeUsers: UserWithStats[];
  restrictedUsers: UserWithStats[];
  bannedUsers: UserWithStats[];
  trolls: UserWithStats[];
  totalUsers: number;
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([]);
  const [loadingFlags, setLoadingFlags] = useState(false);
  const [usersData, setUsersData] = useState<UsersData | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<"flagged" | "users" | "trolls">(
    "flagged"
  );

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let startDate: string | undefined;
      const endDate = new Date().toISOString();

      if (dateRange !== "all") {
        const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
        const start = new Date();
        start.setDate(start.getDate() - days);
        startDate = start.toISOString();
      }

      const url = new URL("/api/analytics/metrics", window.location.origin);
      if (startDate) url.searchParams.set("startDate", startDate);
      url.searchParams.set("endDate", endDate);

      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch metrics (${response.status})`
        );
      }

      const metricsData = await response.json();
      setData(metricsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const fetchFlaggedPosts = useCallback(async () => {
    try {
      setLoadingFlags(true);
      const response = await fetch("/api/admin/flagged-posts");
      if (response.ok) {
        const data = await response.json();
        setFlaggedPosts(data.flaggedPosts || []);
      }
    } catch (error) {
      console.error("Error fetching flagged posts:", error);
    } finally {
      setLoadingFlags(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUsersData(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      router.push("/feed");
      return;
    }

    // Check admin status via API
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => {
        if (data.isAdmin) {
          setIsAuthorized(true);
        } else {
          router.push("/feed");
        }
      })
      .catch(() => {
        router.push("/feed");
      });
  }, [session, status, router]);

  useEffect(() => {
    if (!isAuthorized) return; // Don't fetch until authorized
    fetchMetrics();
    fetchFlaggedPosts();
    fetchUsers(); // Add this
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [dateRange, isAuthorized, fetchMetrics, fetchFlaggedPosts, fetchUsers]);

  // Show loading while checking authorization
  if (status === "loading" || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E4A4A] mx-auto mb-4"></div>
          <p className="text-[#8C8888]">Checking access...</p>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4E4A4A] mx-auto mb-4"></div>
          <p className="text-[#8C8888]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={fetchMetrics}
            className="px-6 py-2 bg-[#BEBABA] text-[#4E4A4A] rounded-full hover:bg-[#BEBABA]/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    analytics,
    engagement,
    contentQuality,
    growth,
    retention,
    sessions,
    conversion,
    timeToAction,
  } = data;

  const StatCard = ({
    title,
    value,
    subtitle,
    trend,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-sm font-medium text-[#8C8888] uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-light text-[#4E4A4A]">{value}</p>
        {trend && <span className="text-xs text-[#8C8888]">{trend}</span>}
      </div>
      {subtitle && <p className="text-xs text-[#8C8888] mt-2">{subtitle}</p>}
    </motion.div>
  );

  const ProgressBar = ({
    label,
    value,
    max,
    color = "bg-[#BEBABA]",
  }: {
    label: string;
    value: number;
    max: number;
    color?: string;
  }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[#4E4A4A]">{label}</span>
          <span className="text-[#8C8888] font-medium">
            {value.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-[#BEBABA]/20 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full ${color} rounded-full`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECE9E9] via-[#DCD9D9] to-[#C7BEBE] pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-light text-[#4E4A4A] mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-[#8C8888]">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) =>
                  setDateRange(e.target.value as "7d" | "30d" | "90d" | "all")
                }
                className="px-4 py-2 bg-white/80 border border-[#BEBABA]/50 rounded-full text-[#4E4A4A] text-sm focus:outline-none focus:border-[#BEBABA]"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <button
                onClick={fetchMetrics}
                disabled={loading}
                className="px-4 py-2 bg-[#BEBABA] text-[#4E4A4A] rounded-full hover:bg-[#BEBABA]/90 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Daily Active Users"
            value={analytics.dailyActiveUsers}
            subtitle="Last 7 days"
          />
          <StatCard
            title="Monthly Active Users"
            value={analytics.uniqueUsers}
            subtitle={`Period: ${dateRange}`}
          />
          <StatCard
            title="Total Events"
            value={analytics.totalEvents.toLocaleString()}
            subtitle="All tracked events"
          />
          <StatCard
            title="New Signups"
            value={analytics.signups}
            subtitle={`Period: ${dateRange}`}
          />
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-light text-[#4E4A4A] mb-6">
              User Engagement
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#8C8888]">Total Users</span>
                <span className="text-2xl font-light text-[#4E4A4A]">
                  {engagement.totalUsers}
                </span>
              </div>
              <ProgressBar
                label="Signup to Post Conversion"
                value={engagement.signupToPostConversion}
                max={100}
              />
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs text-[#8C8888] mb-1">Avg Posts/User</p>
                  <p className="text-xl font-light text-[#4E4A4A]">
                    {engagement.avgPostsPerUser.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8C8888] mb-1">Avg Votes/User</p>
                  <p className="text-xl font-light text-[#4E4A4A]">
                    {engagement.avgVotesPerUser.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-light text-[#4E4A4A] mb-6">
              Content Quality
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#8C8888]">Total Posts</span>
                <span className="text-2xl font-light text-[#4E4A4A]">
                  {contentQuality.totalPosts}
                </span>
              </div>
              <ProgressBar
                label="Positive Score Rate"
                value={contentQuality.positiveScoreRate}
                max={100}
                color="bg-green-500"
              />
              <ProgressBar
                label="Flag Rate"
                value={contentQuality.flagRate}
                max={100}
                color="bg-red-400"
              />
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs text-[#8C8888] mb-1">Avg Score</p>
                  <p className="text-xl font-light text-[#4E4A4A]">
                    {contentQuality.avgScore.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8C8888] mb-1">Avg Votes/Post</p>
                  <p className="text-xl font-light text-[#4E4A4A]">
                    {contentQuality.avgVotesPerPost.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 rounded-2xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-light text-[#4E4A4A] mb-6">
            Event Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.eventsByType
              .sort((a, b) => b.count - a.count)
              .map((event) => (
                <div
                  key={event.eventType}
                  className="bg-white/50 rounded-lg p-4 border border-[#BEBABA]/30"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-[#4E4A4A] capitalize">
                      {event.eventType.replace(/_/g, " ")}
                    </span>
                    <span className="text-lg font-light text-[#4E4A4A]">
                      {event.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[#BEBABA]/20 rounded-full h-1.5">
                    <div
                      className="bg-[#BEBABA] h-1.5 rounded-full"
                      style={{
                        width: `${
                          (event.count / analytics.totalEvents) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Posts Created"
            value={analytics.postsCreated}
            subtitle={`Period: ${dateRange}`}
          />
          <StatCard
            title="Votes Cast"
            value={analytics.votesCast}
            subtitle={`Period: ${dateRange}`}
          />
          <StatCard
            title="Return Rate"
            value={`${analytics.returnRate.toFixed(1)}%`}
            subtitle="Users who returned within 7 days"
          />
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-light text-[#4E4A4A] mb-6">
              Growth Metrics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#8C8888]">Month-over-Month Growth</span>
                <span
                  className={`text-2xl font-light ${
                    growth.momGrowth >= 0 ? "text-green-600" : "text-red-400"
                  }`}
                >
                  {growth.momGrowth >= 0 ? "+" : ""}
                  {growth.momGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-[#8C8888]">
                {growth.thisMonthSignups} this month vs{" "}
                {growth.lastMonthSignups} last month
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-[#8C8888]">Week-over-Week Growth</span>
                <span
                  className={`text-xl font-light ${
                    growth.wowGrowth >= 0 ? "text-green-600" : "text-red-400"
                  }`}
                >
                  {growth.wowGrowth >= 0 ? "+" : ""}
                  {growth.wowGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-[#8C8888]">
                {growth.thisWeekSignups} this week vs {growth.lastWeekSignups}{" "}
                last week
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-light text-[#4E4A4A] mb-6">
              Retention Metrics
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#8C8888]">7-Day Retention</span>
                  <span className="text-2xl font-light text-[#4E4A4A]">
                    {retention.retention7Days.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-[#8C8888]">
                  {retention.retained7Days} of {retention.users7DaysAgo} users
                  active
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#8C8888]">30-Day Retention</span>
                  <span className="text-2xl font-light text-[#4E4A4A]">
                    {retention.retention30Days.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-[#8C8888]">
                  {retention.retained30Days} of {retention.users30DaysAgo} users
                  active
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Session & Engagement Depth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-light text-[#4E4A4A] mb-6">
              Session Metrics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#8C8888]">Avg Session Duration</span>
                <span className="text-2xl font-light text-[#4E4A4A]">
                  {sessions.avgSessionDuration.toFixed(1)} min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8C8888]">Median Duration</span>
                <span className="text-xl font-light text-[#8C8888]">
                  {sessions.medianSessionDuration.toFixed(1)} min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8C8888]">Actions per Session</span>
                <span className="text-xl font-light text-[#4E4A4A]">
                  {sessions.avgActionsPerSession.toFixed(1)}
                </span>
              </div>
              <div className="text-sm text-[#8C8888] mt-4">
                Total Sessions: {sessions.totalSessions.toLocaleString()}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-light text-[#4E4A4A] mb-6">
              Time to Action
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#8C8888]">Avg Time to First Post</span>
                <span className="text-2xl font-light text-[#4E4A4A]">
                  {timeToAction.avgTimeToFirstPost < 24
                    ? `${timeToAction.avgTimeToFirstPost.toFixed(1)}h`
                    : `${(timeToAction.avgTimeToFirstPost / 24).toFixed(1)}d`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8C8888]">Avg Time to First Vote</span>
                <span className="text-xl font-light text-[#4E4A4A]">
                  {timeToAction.avgTimeToFirstVote < 24
                    ? `${timeToAction.avgTimeToFirstVote.toFixed(1)}h`
                    : `${(timeToAction.avgTimeToFirstVote / 24).toFixed(1)}d`}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 rounded-2xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-light text-[#4E4A4A] mb-6">
            Conversion Funnel
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#8C8888]">Total Signups</span>
              <span className="text-lg font-light text-[#4E4A4A]">
                {conversion.totalSignups}
              </span>
            </div>
            <ProgressBar
              label="Code of Honor Accepted"
              value={conversion.codeOfHonorRate}
              max={100}
              color="bg-blue-500"
            />
            <ProgressBar
              label="Username Setup Completed"
              value={conversion.usernameSetupRate}
              max={100}
              color="bg-purple-500"
            />
            <ProgressBar
              label="Signup → First Post"
              value={conversion.signupToPostRate}
              max={100}
              color="bg-green-500"
            />
            <ProgressBar
              label="Signup → First Vote"
              value={conversion.signupToVoteRate}
              max={100}
              color="bg-yellow-500"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#BEBABA]/30">
          <button
            onClick={() => setActiveTab("flagged")}
            className={`pb-2 px-4 text-sm font-medium transition ${
              activeTab === "flagged"
                ? "text-[#4E4A4A] border-b-2 border-[#4E4A4A]"
                : "text-[#8C8888] hover:text-[#4E4A4A]"
            }`}
          >
            Flagged Posts ({flaggedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("trolls")}
            className={`pb-2 px-4 text-sm font-medium transition ${
              activeTab === "trolls"
                ? "text-[#4E4A4A] border-b-2 border-[#4E4A4A]"
                : "text-[#8C8888] hover:text-[#4E4A4A]"
            }`}
          >
            Potential Trolls ({usersData?.trolls.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-2 px-4 text-sm font-medium transition ${
              activeTab === "users"
                ? "text-[#4E4A4A] border-b-2 border-[#4E4A4A]"
                : "text-[#8C8888] hover:text-[#4E4A4A]"
            }`}
          >
            All Users ({usersData?.totalUsers || 0})
          </button>
        </div>

        {/* Flagged Posts / User Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#ECE9E9]/90 backdrop-blur border border-[#FFFFFF]/24 rounded-2xl p-6 shadow-lg mb-8 mt-8"
        >
          {activeTab === "flagged" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-[#4E4A4A]">
                  Flagged Posts ({flaggedPosts.length})
                </h2>
                <button
                  onClick={fetchFlaggedPosts}
                  disabled={loadingFlags}
                  className="px-4 py-2 bg-[#BEBABA] text-[#4E4A4A] rounded-full hover:bg-[#BEBABA]/90 transition text-sm font-medium disabled:opacity-50"
                >
                  {loadingFlags ? "Loading..." : "Refresh"}
                </button>
              </div>

              {flaggedPosts.length === 0 ? (
                <p className="text-[#8C8888] text-center py-8">
                  No flagged posts. Great job! ��
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {flaggedPosts
                    .sort((a, b) => b.flagCount - a.flagCount)
                    .map((item) => (
                      <div
                        key={item.postId}
                        className="bg-white/50 rounded-lg p-4 border border-[#BEBABA]/30"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#4E4A4A] mb-1">
                              Post ID: {item.postId}
                            </p>
                            <p className="text-xs text-[#8C8888] mb-2 line-clamp-2">
                              {item.post.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-[#8C8888]">
                              <span>
                                By:{" "}
                                {item.post.user.username ||
                                  item.post.user.email}
                              </span>
                              <span>•</span>
                              <span className="text-red-400 font-medium">
                                Flagged {item.flagCount} time
                                {item.flagCount > 1 ? "s" : ""}
                              </span>
                              {/* Add user status indicator */}
                              {item.post.user.status &&
                                item.post.user.status !== "active" && (
                                  <>
                                    <span>•</span>
                                    <span
                                      className={`font-medium ${
                                        item.post.user.status === "banned"
                                          ? "text-red-600"
                                          : "text-orange-500"
                                      }`}
                                    >
                                      {item.post.user.status === "banned"
                                        ? "BANNED"
                                        : "RESTRICTED"}
                                    </span>
                                  </>
                                )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-[#BEBABA]/30">
                          <p className="text-xs text-[#8C8888] mb-2">
                            Flagged by:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.flaggedBy.map(
                              (
                                flagger: FlaggedPost["flaggedBy"][0],
                                idx: number
                              ) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-[#BEBABA]/20 rounded-full text-[#8C8888]"
                                >
                                  {flagger.username || flagger.email}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2 flex-wrap">
                          <button
                            onClick={async () => {
                              const confirmed = confirm(
                                "Are you sure you want to delete this post?"
                              );
                              if (confirmed) {
                                const res = await fetch(
                                  `/api/posts/${item.postId}/delete`,
                                  { method: "POST" }
                                );
                                if (res.ok) {
                                  fetchFlaggedPosts();
                                  fetchMetrics();
                                }
                              }
                            }}
                            className="px-3 py-1.5 text-xs bg-red-400/20 text-red-600 rounded-full hover:bg-red-400/30 transition"
                          >
                            Delete Post
                          </button>

                          {/* Show Restore if user is restricted/banned */}
                          {item.post.user.status === "restricted" ||
                          item.post.user.status === "banned" ? (
                            <button
                              onClick={async () => {
                                const confirmed = confirm(
                                  `Restore user ${
                                    item.post.user.username ||
                                    item.post.user.email
                                  } to active status?`
                                );
                                if (confirmed) {
                                  const res = await fetch(
                                    `/api/admin/users/${item.post.user.id}/restore`,
                                    { method: "POST" }
                                  );
                                  if (res.ok) {
                                    fetchFlaggedPosts();
                                  }
                                }
                              }}
                              className="px-3 py-1.5 text-xs bg-green-400/20 text-green-600 rounded-full hover:bg-green-400/30 transition"
                            >
                              Restore User
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={async () => {
                                  const confirmed = confirm(
                                    `Restrict user ${
                                      item.post.user.username ||
                                      item.post.user.email
                                    } for 7 days?`
                                  );
                                  if (confirmed) {
                                    const res = await fetch(
                                      `/api/admin/users/${item.post.user.id}/restrict`,
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ days: 7 }),
                                      }
                                    );
                                    if (res.ok) {
                                      fetchFlaggedPosts();
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 text-xs bg-orange-400/20 text-orange-600 rounded-full hover:bg-orange-400/30 transition"
                              >
                                Restrict User
                              </button>
                              <button
                                onClick={async () => {
                                  const confirmed = confirm(
                                    `BAN user ${
                                      item.post.user.username ||
                                      item.post.user.email
                                    } permanently? This cannot be undone easily.`
                                  );
                                  if (confirmed) {
                                    const res = await fetch(
                                      `/api/admin/users/${item.post.user.id}/ban`,
                                      { method: "POST" }
                                    );
                                    if (res.ok) {
                                      fetchFlaggedPosts();
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 text-xs bg-red-600/20 text-red-700 rounded-full hover:bg-red-600/30 transition"
                              >
                                Ban User
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}

          {activeTab === "trolls" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-[#4E4A4A]">
                  Potential Trolls ({usersData?.trolls.length || 0})
                </h2>
                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="px-4 py-2 bg-[#BEBABA] text-[#4E4A4A] rounded-full hover:bg-[#BEBABA]/90 transition text-sm font-medium disabled:opacity-50"
                >
                  {loadingUsers ? "Loading..." : "Refresh"}
                </button>
              </div>

              {!usersData ? (
                <p className="text-[#8C8888] text-center py-8">Loading...</p>
              ) : usersData.trolls.length === 0 ? (
                <p className="text-[#8C8888] text-center py-8">
                  No potential trolls detected! 🎉
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {usersData.trolls
                    .sort((a, b) => b.stats.trollScore - a.stats.trollScore)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="bg-white/50 rounded-lg p-4 border border-[#BEBABA]/30"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-[#4E4A4A]">
                                {user.username || user.email}
                              </span>
                              <span className="text-xs px-2 py-1 bg-red-400/20 text-red-600 rounded-full">
                                Troll Score: {user.stats.trollScore}
                              </span>
                              {user.status !== "active" && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    user.status === "banned"
                                      ? "bg-red-600/20 text-red-700"
                                      : "bg-orange-400/20 text-orange-600"
                                  }`}
                                >
                                  {user.status.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-[#8C8888]">
                              <div>
                                <span className="font-medium">Posts:</span>{" "}
                                {user.stats.totalPosts}
                              </div>
                              <div>
                                <span className="font-medium">Flags:</span>{" "}
                                {user.stats.totalPostFlags}
                              </div>
                              <div>
                                <span className="font-medium">Avg Score:</span>{" "}
                                {user.stats.avgPostScore}
                              </div>
                              <div>
                                <span className="font-medium">User Flags:</span>{" "}
                                {user.flagCount}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {user.status === "banned" ? (
                            <button
                              onClick={async () => {
                                const confirmed = confirm(
                                  `Restore user ${user.username || user.email}?`
                                );
                                if (confirmed) {
                                  const res = await fetch(
                                    `/api/admin/users/${user.id}/restore`,
                                    { method: "POST" }
                                  );
                                  if (res.ok) {
                                    fetchUsers();
                                  }
                                }
                              }}
                              className="px-3 py-1.5 text-xs bg-green-400/20 text-green-600 rounded-full hover:bg-green-400/30 transition"
                            >
                              Restore
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={async () => {
                                  const confirmed = confirm(
                                    `BAN ${
                                      user.username || user.email
                                    } permanently? Troll Score: ${
                                      user.stats.trollScore
                                    }`
                                  );
                                  if (confirmed) {
                                    const res = await fetch(
                                      `/api/admin/users/${user.id}/ban`,
                                      { method: "POST" }
                                    );
                                    if (res.ok) {
                                      fetchUsers();
                                      fetchFlaggedPosts();
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 text-xs bg-red-600/20 text-red-700 rounded-full hover:bg-red-600/30 transition font-medium"
                              >
                                🚫 Quick Ban
                              </button>
                              <button
                                onClick={async () => {
                                  const confirmed = confirm(
                                    `Restrict ${
                                      user.username || user.email
                                    } for 7 days?`
                                  );
                                  if (confirmed) {
                                    const res = await fetch(
                                      `/api/admin/users/${user.id}/restrict`,
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ days: 7 }),
                                      }
                                    );
                                    if (res.ok) {
                                      fetchUsers();
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 text-xs bg-orange-400/20 text-orange-600 rounded-full hover:bg-orange-400/30 transition"
                              >
                                Restrict 7d
                              </button>
                              {user.status === "restricted" && (
                                <button
                                  onClick={async () => {
                                    const confirmed = confirm(
                                      `Restore user ${
                                        user.username || user.email
                                      }?`
                                    );
                                    if (confirmed) {
                                      const res = await fetch(
                                        `/api/admin/users/${user.id}/restore`,
                                        { method: "POST" }
                                      );
                                      if (res.ok) {
                                        fetchUsers();
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 text-xs bg-green-400/20 text-green-600 rounded-full hover:bg-green-400/30 transition"
                                >
                                  Restore
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}

          {activeTab === "users" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-[#4E4A4A]">
                  User Management ({usersData?.totalUsers || 0})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const filtered = usersData?.users.filter(
                        (u) => u.status === "restricted"
                      );
                      setUsersData(
                        filtered
                          ? {
                              ...usersData!,
                              users: filtered,
                            }
                          : usersData
                      );
                    }}
                    className="px-3 py-1 text-xs bg-orange-400/20 text-orange-600 rounded-full hover:bg-orange-400/30 transition"
                  >
                    Restricted ({usersData?.restrictedUsers.length || 0})
                  </button>
                  <button
                    onClick={() => {
                      const filtered = usersData?.users.filter(
                        (u) => u.status === "banned"
                      );
                      setUsersData(
                        filtered
                          ? {
                              ...usersData!,
                              users: filtered,
                            }
                          : usersData
                      );
                    }}
                    className="px-3 py-1 text-xs bg-red-600/20 text-red-700 rounded-full hover:bg-red-600/30 transition"
                  >
                    Banned ({usersData?.bannedUsers.length || 0})
                  </button>
                  <button
                    onClick={fetchUsers}
                    disabled={loadingUsers}
                    className="px-4 py-2 bg-[#BEBABA] text-[#4E4A4A] rounded-full hover:bg-[#BEBABA]/90 transition text-sm font-medium disabled:opacity-50"
                  >
                    {loadingUsers ? "Loading..." : "Refresh"}
                  </button>
                </div>
              </div>

              {!usersData ? (
                <p className="text-[#8C8888] text-center py-8">Loading...</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {usersData.users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white/50 rounded-lg p-3 border border-[#BEBABA]/30 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#4E4A4A]">
                            {user.username || user.email}
                          </span>
                          {user.status !== "active" && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                user.status === "banned"
                                  ? "bg-red-600/20 text-red-700"
                                  : "bg-orange-400/20 text-orange-600"
                              }`}
                            >
                              {user.status.toUpperCase()}
                            </span>
                          )}
                          {user.stats.trollScore >= 50 && (
                            <span className="text-xs px-2 py-0.5 bg-red-400/20 text-red-600 rounded-full">
                              Troll: {user.stats.trollScore}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#8C8888] mt-1">
                          Posts: {user.stats.totalPosts} • Flags:{" "}
                          {user.stats.totalPostFlags} • Score:{" "}
                          {user.stats.avgPostScore}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {user.status === "banned" ? (
                          <button
                            onClick={async () => {
                              const res = await fetch(
                                `/api/admin/users/${user.id}/restore`,
                                { method: "POST" }
                              );
                              if (res.ok) fetchUsers();
                            }}
                            className="px-2 py-1 text-xs bg-green-400/20 text-green-600 rounded-full hover:bg-green-400/30 transition"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={async () => {
                                const confirmed = confirm(
                                  `Restrict ${user.username || user.email}?`
                                );
                                if (confirmed) {
                                  const res = await fetch(
                                    `/api/admin/users/${user.id}/restrict`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({ days: 7 }),
                                    }
                                  );
                                  if (res.ok) fetchUsers();
                                }
                              }}
                              className="px-2 py-1 text-xs bg-orange-400/20 text-orange-600 rounded-full hover:bg-orange-400/30 transition"
                            >
                              Restrict
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = confirm(
                                  `BAN ${user.username || user.email}?`
                                );
                                if (confirmed) {
                                  const res = await fetch(
                                    `/api/admin/users/${user.id}/ban`,
                                    { method: "POST" }
                                  );
                                  if (res.ok) fetchUsers();
                                }
                              }}
                              className="px-2 py-1 text-xs bg-red-600/20 text-red-700 rounded-full hover:bg-red-600/30 transition"
                            >
                              Ban
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
