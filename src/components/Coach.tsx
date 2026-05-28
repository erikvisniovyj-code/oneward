import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { Task } from '../types';
import { daysBetween } from '../data';

interface CoachProps {
  tasks: Task[];
  streakCount: number;
}

export default function Coach({ tasks, streakCount }: CoachProps) {
  const now = new Date();

  const getCoachingText = (): string => {
    // 1. Check if a task waiting >30 days was completed today (within last 24 hours)
    const completedTasks = tasks.filter(t => t.completedDate && !t.buried);
    const completedTodayList = completedTasks.filter(t => {
      const elapsed = daysBetween(new Date(t.completedDate!), now);
      return elapsed <= 1; // within 1 day
    });

    const completedLongAvoidedToday = completedTodayList.find(t => {
      const waitTime = daysBetween(new Date(t.createdDate), new Date(t.completedDate!));
      return waitTime >= 30;
    });

    if (completedLongAvoidedToday) {
      const waitDays = daysBetween(new Date(completedLongAvoidedToday.createdDate), new Date(completedLongAvoidedToday.completedDate!));
      return `Real block defeated. "${completedLongAvoidedToday.title}" spent ${waitDays} days avoided, but you finally executed. Action resolved the daydream loop.`;
    }

    // 2. When one or more tasks is completed today
    if (completedTodayList.length === 1) {
      return 'Good. The day is yours. The rest can wait.';
    } else if (completedTodayList.length > 1) {
      return 'Action maintains momentum. Do not overwhelm your stamina; focus on securing rest today.';
    }

    // 3. Streak of 5+ days
    if (streakCount >= 5) {
      return `Outstanding streak of ${streakCount} consecutive days. Your attention stamina is solid. Consider choosing a slightly deeper challenge.`;
    }

    // 4. Overlooked high priority task untouched 30+ days in basement
    const activeUncompletedTasks = tasks.filter(t => t.state === 'active' && !t.completedDate && !t.buried);
    const oldestUntouched = activeUncompletedTasks.find(t => {
      const waitTime = daysBetween(new Date(t.createdDate), now);
      return waitTime >= 30;
    });

    if (oldestUntouched) {
      const waitDays = daysBetween(new Date(oldestUntouched.createdDate), now);
      return `"${oldestUntouched.title}" has waited ${waitDays} days. Is this actually important to your life, or not? What is the specific anxiety blocking your start?`;
    }

    // 5. Normal base cases (time specific)
    const currentHour = now.getHours();
    
    // Evening scenario with nothing done
    if (currentHour >= 18 && completedTodayList.length === 0) {
      return 'The sun is setting. It is acceptable if nothing got completed. Secure your mind, rest, and reset with energy tomorrow.';
    }

    // Morning scenario
    if (currentHour < 12) {
      return 'Morning. Willpower is at peak limit. Select the Today tab, ignore planning loops, and lock in the Suggestion.';
    }

    return 'Compass: One single action is the only link between intention and reality.';
  };

  const adviceLine = getCoachingText();

  return (
    <div 
      id="coach-footer-strip" 
      className="max-w-xl mx-auto px-4 py-3.5 bg-neutral-950 border border-neutral-900 rounded-md text-center"
    >
      <div className="flex items-center justify-center space-x-2 text-xs">
        <span className="font-mono text-neutral-500 uppercase tracking-widest text-[10px]">
          Coach Compass:
        </span>
        <span id="coach-advice-text" className="font-sans text-neutral-300 font-medium text-[11px] leading-relaxed italic">
          &quot;{adviceLine}&quot;
        </span>
      </div>
    </div>
  );
}
