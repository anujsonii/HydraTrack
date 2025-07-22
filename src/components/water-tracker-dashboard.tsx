"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { GlassWater, Settings, Plus, Minus } from "lucide-react";
import { WaterDropIcon } from "@/components/icons/water-drop-icon";
import { SetGoalDialog } from "@/components/set-goal-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getMessagingToken } from "@/lib/firebase";

interface Log {
  id: number;
  amount: number;
  time: string;
}

export function WaterTrackerDashboard() {
  const [goal, setGoal] = useState(3000);
  const [logs, setLogs] = useState<Log[]>([]);
  const [notifications, setNotifications] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    // Load data from localStorage if available
    const savedGoal = localStorage.getItem("hydrotrack-goal");
    const savedLogs = localStorage.getItem("hydrotrack-logs");
    const savedNotifications = localStorage.getItem("hydrotrack-notifications");
    
    if (savedGoal) {
      setGoal(JSON.parse(savedGoal));
    }
    if (savedLogs) {
      const today = new Date().toLocaleDateString();
      const parsedLogs = JSON.parse(savedLogs);
      // Filter logs to only show today's logs
      if (parsedLogs.date === today) {
        setLogs(parsedLogs.logs);
      } else {
        // Clear logs for a new day
        localStorage.removeItem("hydrotrack-logs");
      }
    }
     if (savedNotifications) {
      const areNotificationsEnabled = JSON.parse(savedNotifications);
      if (areNotificationsEnabled && Notification.permission !== 'granted') {
        setNotifications(false);
        localStorage.setItem("hydrotrack-notifications", JSON.stringify(false));
      } else {
        setNotifications(areNotificationsEnabled);
      }
    }
  }, []);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem("hydrotrack-goal", JSON.stringify(goal));
      localStorage.setItem("hydrotrack-notifications", JSON.stringify(notifications));
      const today = new Date().toLocaleDateString();
      localStorage.setItem("hydrotrack-logs", JSON.stringify({ date: today, logs }));
    }
  }, [goal, logs, notifications, isMounted]);

  const totalIntake = useMemo(() => {
    return logs.reduce((sum, log) => sum + log.amount, 0);
  }, [logs]);

  const progress = useMemo(() => {
    if (goal === 0) return 0;
    const calculatedProgress = (totalIntake / goal) * 100;
    return Math.min(calculatedProgress, 100);
  }, [totalIntake, goal]);
  
  const remaining = useMemo(() => Math.max(0, goal - totalIntake), [goal, totalIntake]);

  const handleLogWater = (amount: number) => {
    if (totalIntake >= goal && amount > 0) {
      toast({
        title: "Goal Achieved!",
        description: "You've already reached your daily goal. Great job!",
      });
    }
    const newLog: Log = {
      id: Date.now(),
      amount,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };
  
  const handleRemoveLog = (logId: number) => {
    setLogs(logs.filter(log => log.id !== logId));
  }

  const handleSetGoal = (newGoal: number) => {
    setGoal(newGoal);
    toast({
      title: "Goal Updated",
      description: `Your new daily goal is ${newGoal}ml.`,
    });
  };

  const handleNotificationsChange = async (enabled: boolean) => {
    if (enabled) {
      if (Notification.permission === 'denied') {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "You need to grant permission in your browser settings to enable notifications.",
        });
        setNotifications(false);
        return;
      }

      const status = await Notification.requestPermission();
      if (status === 'granted') {
        setNotifications(true);
        toast({
          title: "Notifications Enabled",
          description: "You will now receive reminders.",
        });
        const fcmToken = await getMessagingToken();
        if (fcmToken) {
          console.log("FCM Token:", fcmToken);
          // TODO: Send this token to your server to store it
        }
      } else {
        setNotifications(false);
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "You need to grant permission to enable notifications.",
        });
      }
    } else {
       setNotifications(false);
       toast({
        title: "Notifications Disabled",
        description: "You will no longer receive reminders.",
      });
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between w-full max-w-2xl mb-6">
        <div className="flex items-center gap-3">
          <WaterDropIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-foreground/90">
            HydroTrack
          </h1>
        </div>
        <SetGoalDialog 
          currentGoal={goal} 
          onGoalSet={handleSetGoal}
          notifications={notifications}
          onNotificationsChange={handleNotificationsChange}
        >
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Button>
        </SetGoalDialog>
      </header>

      <main className="w-full max-w-2xl">
        <Card className="w-full overflow-hidden shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Today's Progress
            </CardTitle>
            <CardDescription>
              {remaining > 0 ? `${remaining}ml to go!` : "You've reached your goal!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center gap-4 mb-4">
              <Progress value={progress} className="h-3 transition-all duration-500" />
            </div>
            <div className="text-center font-bold text-lg text-primary">
              {totalIntake} / {goal} ml
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
                {[200, 300, 500].map(amount => (
                    <Button key={amount} variant="outline" size="lg" className="h-16 flex-col gap-1" onClick={() => handleLogWater(amount)}>
                        <div className="flex items-center gap-2">
                            <GlassWater className="h-5 w-5"/>
                            <span className="text-lg font-bold">{amount}ml</span>
                        </div>
                    </Button>
                ))}
            </div>

            <Separator className="my-4" />

            <div>
              <h3 className="text-lg font-semibold font-headline mb-3">Today's Log</h3>
              <ScrollArea className="h-[200px] pr-4">
                {logs.length > 0 ? (
                  <ul className="space-y-2">
                    {logs.slice().reverse().map((log) => (
                      <li key={log.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3">
                          <GlassWater className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="font-semibold">{log.amount} ml</p>
                            <p className="text-xs text-muted-foreground">{log.time}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveLog(log.id)}>
                            <Minus className="h-4 w-4 text-destructive/70"/>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-muted-foreground py-10">
                    <p>No water logged yet today.</p>
                    <p className="text-sm">Tap a button above to start!</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
          <CardFooter className="bg-secondary/30 p-4 text-xs text-center text-muted-foreground">
              <p>Keep sipping! Staying hydrated is key to a healthy day.</p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
