"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SetGoalDialogProps {
  children: React.ReactNode;
  currentGoal: number;
  onGoalSet: (newGoal: number) => void;
  notifications: boolean;
  onNotificationsChange: (enabled: boolean) => void;
}

export function SetGoalDialog({
  children,
  currentGoal,
  onGoalSet,
  notifications,
  onNotificationsChange,
}: SetGoalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [goal, setGoal] = useState(currentGoal);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Notification) {
      setIsPermissionDenied(Notification.permission === 'denied');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (goal > 0) {
      onGoalSet(goal);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Settings</DialogTitle>
          <DialogDescription>
            Update your daily goal and notification preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goal" className="text-right">
              Daily Goal
            </Label>
            <Input
              id="goal"
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="col-span-3"
              min="1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="unit" className="text-right">
              Unit
            </Label>
            <div className="col-span-3">
                <p className="text-sm text-muted-foreground font-semibold">ml (milliliters)</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base" htmlFor="notifications-switch">
                Reminders
              </Label>
              {isPermissionDenied ? (
                 <p className="text-sm text-destructive">
                   Notifications are blocked. Please{" "}
                   <a
                    href="https://support.google.com/chrome/answer/3220216"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                   >
                    enable them in your browser settings.
                   </a>
                 </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Get notified to drink water.
                </p>
              )}
            </div>
            <Switch 
              id="notifications-switch" 
              checked={notifications} 
              onCheckedChange={onNotificationsChange} 
              disabled={isPermissionDenied}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
