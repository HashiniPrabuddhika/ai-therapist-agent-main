"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Calendar,
  Activity,
  Sun,
  Moon,
  Heart,
  Trophy,
  Bell,
  AlertCircle,
  PhoneCall,
  Sparkles,
  MessageSquare,
  BrainCircuit,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { MoodForm } from "@/components/mood/mood-form";
import { AnxietyGames } from "@/components/games/anxiety-games";

import {
  getUserActivities,
  saveMoodData,
  logActivity,
} from "@/lib/static-dashboard-data";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addDays,
  format,
  subDays,
  startOfDay,
  isWithinInterval,
} from "date-fns";

import { ActivityLogger } from "@/components/activities/activity-logger";
import { useSession } from "@/lib/contexts/session-context";
import { getAllChatSessions } from "@/lib/api/chat";

type ActivityLevel = "none" | "low" | "medium" | "high";

interface DayActivity {
  date: Date;
  level: ActivityLevel;
  activities: {
    type: string;
    name: string;
    completed: boolean;
    time?: string;
  }[];
}

interface Activity {
  id: string;
  userId: string | null;
  type: string;
  name: string;
  description: string | null;
  timestamp: Date;
  duration: number | null;
  completed: boolean;
  moodScore: number | null;
  moodNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DailyStats {
  moodScore: number | null;
  completionRate: number;
  mindfulnessCount: number;
  totalActivities: number;
  lastUpdated: Date;
}

const calculateDailyStats = (activities: Activity[]): DailyStats => {
  const today = startOfDay(new Date());
  const todaysActivities = activities.filter((activity) =>
    isWithinInterval(new Date(activity.timestamp), {
      start: today,
      end: addDays(today, 1),
    })
  );

  const moodEntries = todaysActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  const averageMood =
    moodEntries.length > 0
      ? Math.round(
          moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
            moodEntries.length
        )
      : null;

  const therapySessions = activities.filter((a) => a.type === "therapy").length;

  return {
    moodScore: averageMood,
    completionRate: 100,
    mindfulnessCount: therapySessions,
    totalActivities: todaysActivities.length,
    lastUpdated: new Date(),
  };
};

const generateInsights = (activities: Activity[]) => {
  const insights: {
    title: string;
    description: string;
    icon: any;
    priority: "low" | "medium" | "high";
  }[] = [];

  const lastWeek = subDays(new Date(), 7);
  const recentActivities = activities.filter(
    (a) => new Date(a.timestamp) >= lastWeek
  );

  const moodEntries = recentActivities.filter(
    (a) => a.type === "mood" && a.moodScore !== null
  );
  if (moodEntries.length >= 2) {
    const averageMood =
      moodEntries.reduce((acc, curr) => acc + (curr.moodScore || 0), 0) /
      moodEntries.length;
    const latestMood = moodEntries[moodEntries.length - 1].moodScore || 0;

    if (latestMood > averageMood) {
      insights.push({
        title: "Mood Improvement",
        description:
          "Your recent mood scores are above your weekly average. Keep up the good work!",
        icon: Brain,
        priority: "high",
      });
    } else if (latestMood < averageMood - 20) {
      insights.push({
        title: "Mood Change Detected",
        description:
          "I've noticed a dip in your mood. Would you like to try some mood-lifting activities?",
        icon: Heart,
        priority: "high",
      });
    }
  }

  const mindfulnessActivities = recentActivities.filter((a) =>
    ["game", "meditation", "breathing"].includes(a.type)
  );
  if (mindfulnessActivities.length > 0) {
    const dailyAverage = mindfulnessActivities.length / 7;
    if (dailyAverage >= 1) {
      insights.push({
        title: "Consistent Practice",
        description: `You've been regularly engaging in mindfulness activities. This can help reduce stress and improve focus.`,
        icon: Trophy,
        priority: "medium",
      });
    } else {
      insights.push({
        title: "Mindfulness Opportunity",
        description:
          "Try incorporating more mindfulness activities into your daily routine.",
        icon: Sparkles,
        priority: "low",
      });
    }
  }

  const completedActivities = recentActivities.filter((a) => a.completed);
  const completionRate =
    recentActivities.length > 0
      ? (completedActivities.length / recentActivities.length) * 100
      : 0;

  if (completionRate >= 80) {
    insights.push({
      title: "High Achievement",
      description: `You've completed ${Math.round(
        completionRate
      )}% of your activities this week. Excellent commitment!`,
      icon: Trophy,
      priority: "high",
    });
  } else if (completionRate < 50) {
    insights.push({
      title: "Activity Reminder",
      description:
        "You might benefit from setting smaller, more achievable daily goals.",
      icon: Calendar,
      priority: "medium",
    });
  }

  const morningActivities = recentActivities.filter(
    (a) => new Date(a.timestamp).getHours() < 12
  );
  const eveningActivities = recentActivities.filter(
    (a) => new Date(a.timestamp).getHours() >= 18
  );

  if (morningActivities.length > eveningActivities.length) {
    insights.push({
      title: "Morning Person",
      description:
        "You're most active in the mornings. Consider scheduling important tasks during your peak hours.",
      icon: Sun,
      priority: "medium",
    });
  } else if (eveningActivities.length > morningActivities.length) {
    insights.push({
      title: "Evening Routine",
      description:
        "You tend to be more active in the evenings. Make sure to wind down before bedtime.",
      icon: Moon,
      priority: "medium",
    });
  }

  return insights
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const { user } = useSession();

  const [insights, setInsights] = useState<
    {
      title: string;
      description: string;
      icon: any;
      priority: "low" | "medium" | "high";
    }[]
  >([]);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showCheckInChat, setShowCheckInChat] = useState(false);
  const [activityHistory, setActivityHistory] = useState<DayActivity[]>([]);
  const [showActivityLogger, setShowActivityLogger] = useState(false);
  const [isSavingActivity, setIsSavingActivity] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    moodScore: null,
    completionRate: 100,
    mindfulnessCount: 0,
    totalActivities: 0,
    lastUpdated: new Date(),
  });

  const transformActivitiesToDayActivity = (
    activities: Activity[]
  ): DayActivity[] => {
    const days: DayActivity[] = [];
    const today = new Date();

    for (let i = 27; i >= 0; i--) {
      const date = startOfDay(subDays(today, i));
      const dayActivities = activities.filter((activity) =>
        isWithinInterval(new Date(activity.timestamp), {
          start: date,
          end: addDays(date, 1),
        })
      );

      let level: ActivityLevel = "none";
      if (dayActivities.length > 0) {
        if (dayActivities.length <= 2) level = "low";
        else if (dayActivities.length <= 4) level = "medium";
        else level = "high";
      }

      days.push({
        date,
        level,
        activities: dayActivities.map((activity) => ({
          type: activity.type,
          name: activity.name,
          completed: activity.completed,
          time: format(new Date(activity.timestamp), "h:mm a"),
        })),
      });
    }

    return days;
  };

  const loadActivities = useCallback(async () => {
    try {
      const userActivities = await getUserActivities("default-user");
      setActivities(userActivities);
      setActivityHistory(transformActivitiesToDayActivity(userActivities));
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
      setDailyStats(calculateDailyStats(activities));
    }
  }, [activities]);

  useEffect(() => {
    if (activities.length > 0) {
      setInsights(generateInsights(activities));
    }
  }, [activities]);

  const fetchDailyStats = useCallback(async () => {
    try {
      const sessions = await getAllChatSessions();
      const activitiesResponse = await fetch("/api/activities/today");
      if (!activitiesResponse.ok) throw new Error("Failed to fetch activities");
      const activities = await activitiesResponse.json();

      const moodEntries = activities.filter(
        (a: Activity) => a.type === "mood" && a.moodScore !== null
      );
      const averageMood =
        moodEntries.length > 0
          ? Math.round(
              moodEntries.reduce(
                (acc: number, curr: Activity) => acc + (curr.moodScore || 0),
                0
              ) / moodEntries.length
            )
          : null;

      setDailyStats({
        moodScore: averageMood,
        completionRate: 100,
        mindfulnessCount: sessions.length,
        totalActivities: activities.length,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error fetching daily stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchDailyStats();
    const interval = setInterval(fetchDailyStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDailyStats]);

  const wellnessStats = [
    {
      title: "Mood Score",
      value: dailyStats.moodScore ? `${dailyStats.moodScore}%` : "No data",
      icon: Brain,
      color: "hsl(270 91% 65%)", // Purple - theme adaptive
      bgColor: "hsl(270 91% 65% / 0.1)",
      description: "Today's average mood",
    },
    {
      title: "Completion Rate",
      value: "100%",
      icon: Trophy,
      color: "hsl(48 96% 53%)", // Yellow - theme adaptive
      bgColor: "hsl(48 96% 53% / 0.1)",
      description: "Perfect completion rate",
    },
    {
      title: "Therapy Sessions",
      value: `${dailyStats.mindfulnessCount} sessions`,
      icon: Heart,
      color: "hsl(350 89% 60%)", // Rose - theme adaptive
      bgColor: "hsl(350 89% 60% / 0.1)",
      description: "Total sessions completed",
    },
    {
      title: "Total Activities",
      value: dailyStats.totalActivities.toString(),
      icon: Activity,
      color: "hsl(217 91% 60%)", // Blue - theme adaptive
      bgColor: "hsl(217 91% 60% / 0.1)",
      description: "Planned for today",
    },
  ];

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleStartTherapy = () => {
    router.push("/therapy/new");
  };

  const handleMoodSubmit = async (data: { moodScore: number }) => {
    setIsSavingMood(true);
    try {
      await saveMoodData({
        userId: "default-user",
        mood: data.moodScore,
        note: "",
      });
      setShowMoodModal(false);
    } catch (error) {
      console.error("Error saving mood:", error);
    } finally {
      setIsSavingMood(false);
    }
  };

  const handleAICheckIn = () => {
    setShowActivityLogger(true);
  };

  const handleGamePlayed = useCallback(
    async (gameName: string, description: string) => {
      try {
        await logActivity({
          userId: "default-user",
          type: "game",
          name: gameName,
          description: description,
          duration: 0,
        });
        loadActivities();
      } catch (error) {
        console.error("Error logging game activity:", error);
      }
    },
    [loadActivities]
  );

  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          animation: "spin 1s linear infinite",
          borderRadius: "9999px",
          height: "2rem",
          width: "2rem",
          border: "2px solid transparent",
          borderBottomColor: "hsl(var(--primary))"
        }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "hsl(var(--background))" }}>
      <Container style={{ paddingTop: "5rem", paddingBottom: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Header Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
            >
              <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "hsl(var(--foreground))" }}>
                Welcome back, {user?.name || "there"}
              </h1>
              <p style={{ color: "hsl(var(--muted-foreground))" }}>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </motion.div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Button variant="outline" size="icon">
                <Bell style={{ height: "1.25rem", width: "1.25rem" }} />
              </Button>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Top Cards Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem"
            }}>
              {/* Quick Actions Card */}
              <Card style={{ border: "1px solid hsl(var(--primary) / 0.1)", position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute",
                  inset: "0",
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.1), transparent)"
                }} />
                <CardContent style={{ padding: "1.5rem", position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "hsl(var(--primary) / 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Sparkles style={{ width: "1.25rem", height: "1.25rem", color: "hsl(var(--primary))" }} />
                      </div>
                      <div>
                        <h3 style={{ fontWeight: "600", fontSize: "1.125rem" }}>Quick Actions</h3>
                        <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                          Start your wellness journey
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <Button
                        variant="default"
                        style={{
                          width: "100%",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1.5rem",
                          height: "auto",
                          background: "linear-gradient(to right, hsl(var(--primary) / 0.9), hsl(var(--primary)))",
                          transition: "all 0.2s"
                        }}
                        onClick={handleStartTherapy}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{
                            width: "2rem",
                            height: "2rem",
                            borderRadius: "9999px",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <MessageSquare style={{ width: "1rem", height: "1rem", color: "white" }} />
                          </div>
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontWeight: "600", color: "white" }}>Start Therapy</div>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.8)" }}>
                              Begin a new session
                            </div>
                          </div>
                        </div>
                        <ArrowRight style={{ width: "1.25rem", height: "1.25rem", color: "white" }} />
                      </Button>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <Button
                          variant="outline"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            height: "120px",
                            padding: "1rem 0.75rem",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            transition: "all 0.2s"
                          }}
                          onClick={() => setShowMoodModal(true)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "hsl(var(--border))";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <div style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "9999px",
                            backgroundColor: "rgba(244, 63, 94, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "0.5rem"
                          }}>
                            <Heart style={{ width: "1.25rem", height: "1.25rem", color: "#f43f5e" }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: "500", fontSize: "0.875rem" }}>Track Mood</div>
                            <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "0.125rem" }}>
                              How are you feeling?
                            </div>
                          </div>
                        </Button>

                        <Button
                          variant="outline"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            height: "120px",
                            padding: "1rem 0.75rem",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            transition: "all 0.2s"
                          }}
                          onClick={handleAICheckIn}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "hsl(var(--border))";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <div style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "9999px",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "0.5rem"
                          }}>
                            <BrainCircuit style={{ width: "1.25rem", height: "1.25rem", color: "#3b82f6" }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: "500", fontSize: "0.875rem" }}>Check-in</div>
                            <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "0.125rem" }}>
                              Quick wellness check
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Overview Card */}
              <Card style={{ border: "1px solid hsl(var(--primary) / 0.1)" }}>
                <CardHeader>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <CardTitle>Today's Overview</CardTitle>
                      <CardDescription>
                        Your wellness metrics for {format(new Date(), "MMMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchDailyStats}
                      style={{ height: "2rem", width: "2rem" }}
                    >
                      <Loader2 style={{ height: "1rem", width: "1rem", animation: "spin 1s linear infinite" }} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    {wellnessStats.map((stat) => (
                      <div
                        key={stat.title}
                        style={{
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          backgroundColor: stat.bgColor,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <stat.icon style={{ width: "1.25rem", height: "1.25rem", color: stat.color }} />
                          <p style={{ fontSize: "0.875rem", fontWeight: "500" }}>{stat.title}</p>
                        </div>
                        <p style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "0.5rem" }}>{stat.value}</p>
                        <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
                          {stat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", textAlign: "right" }}>
                    Last updated: {format(dailyStats.lastUpdated, "h:mm a")}
                  </div>
                </CardContent>
              </Card>

              {/* Insights Card */}
              <Card style={{ border: "1px solid hsl(var(--primary) / 0.1)" }}>
                <CardHeader>
                  <CardTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <BrainCircuit style={{ width: "1.25rem", height: "1.25rem", color: "hsl(var(--primary))" }} />
                    Insights
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations based on your activity patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {insights.length > 0 ? (
                      insights.map((insight, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "1rem",
                            borderRadius: "0.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            backgroundColor: insight.priority === "high"
                              ? "hsl(var(--primary) / 0.1)"
                              : insight.priority === "medium"
                              ? "hsl(var(--primary) / 0.05)"
                              : "hsl(var(--muted))",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.02)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <insight.icon style={{ width: "1.25rem", height: "1.25rem", color: "hsl(var(--primary))" }} />
                            <p style={{ fontWeight: "500" }}>{insight.title}</p>
                          </div>
                          <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                            {insight.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", color: "hsl(var(--muted-foreground))", padding: "2rem 0" }}>
                        <Activity style={{ width: "2rem", height: "2rem", margin: "0 auto 0.75rem", opacity: "0.5" }} />
                        <p>Complete more activities to receive personalized insights</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Anxiety Games */}
                <AnxietyGames onGamePlayed={handleGamePlayed} />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Mood tracking modal */}
      <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
        <DialogContent style={{ maxWidth: "425px" }}>
          <DialogHeader>
            <DialogTitle>How are you feeling?</DialogTitle>
            <DialogDescription>
              Move the slider to track your current mood
            </DialogDescription>
          </DialogHeader>
          <MoodForm onSuccess={() => setShowMoodModal(false)} />
        </DialogContent>
      </Dialog>

      {/* AI check-in chat */}
      {showCheckInChat && (
        <div style={{
          position: "fixed",
          inset: "0",
          backgroundColor: "hsl(var(--background) / 0.8)",
          backdropFilter: "blur(8px)",
          zIndex: "50"
        }}>
          <div style={{
            position: "fixed",
            top: "0",
            bottom: "0",
            right: "0",
            width: "100%",
            maxWidth: "24rem",
            backgroundColor: "hsl(var(--background))",
            borderLeft: "1px solid hsl(var(--border))",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                borderBottom: "1px solid hsl(var(--border))"
              }}>
                <h3 style={{ fontWeight: "600" }}>AI Check-in</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCheckInChat(false)}
                >
                  <X style={{ width: "1rem", height: "1rem" }} />
                </Button>
              </div>
              <div style={{ flex: "1", overflowY: "auto", padding: "1rem" }}></div>
            </div>
          </div>
        </div>
      )}

      <ActivityLogger
        open={showActivityLogger}
        onOpenChange={setShowActivityLogger}
        onActivityLogged={loadActivities}
      />
    </div>
  );
}