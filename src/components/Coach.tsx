import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { Task } from '../types';
import { daysBetween } from '../data';
import { Language, t, formatDays, getRussianPlural } from '../i18n';

interface CoachProps {
  tasks: Task[];
  streakCount: number;
  lang: Language;
}

export default function Coach({ tasks, streakCount, lang }: CoachProps) {
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
      if (lang === 'ru') {
        return `Серьёзное препятствие сломлено. Дело «${completedLongAvoidedToday.title}» откладывалось ${formatDays(waitDays, lang)}, но ты наконец сделал это. Реальное дело прервало суету ума.`;
      }
      return `Real block defeated. "${completedLongAvoidedToday.title}" spent ${waitDays} days avoided, but you finally executed. Action resolved the daydream loop.`;
    }

    // 2. When one or more tasks is completed today
    if (completedTodayList.length === 1) {
      return t(lang, 'coachOneCompleted');
    } else if (completedTodayList.length > 1) {
      return t(lang, 'coachMultipleCompleted');
    }

    // 3. Streak of 5+ days
    if (streakCount >= 5) {
      if (lang === 'ru') {
        return `Замечательная серия из ${streakCount} ${getRussianPlural(streakCount, 'дня', 'дней', 'дней')} подряд. Твоя концентрация непоколебима. Рассмотри возможность взяться за более глубокий вызов.`;
      }
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
      if (lang === 'ru') {
        return `Дело «${oldestUntouched.title}» висит уже ${formatDays(waitDays, lang)}. Оно важно для тебя — или нет? Что на самом деле мешает сделать первый шаг?`;
      }
      return `"${oldestUntouched.title}" has waited ${waitDays} days. Is this actually important to your life, or not? What is the specific anxiety blocking your start?`;
    }

    // 5. Normal base cases (time specific)
    const currentHour = now.getHours();
    
    // Evening scenario with nothing done
    if (currentHour >= 18 && completedTodayList.length === 0) {
      return t(lang, 'coachEvening');
    }

    // Morning scenario
    if (currentHour < 12) {
      return t(lang, 'coachMorning');
    }

    return t(lang, 'coachBase');
  };

  const adviceLine = getCoachingText();

  return (
    <div 
      id="coach-footer-strip" 
      className="max-w-xl mx-auto px-4 py-3.5 bg-neutral-950 border border-neutral-900 rounded-md text-center"
    >
      <div className="flex items-center justify-center space-x-2 text-xs">
        <span className="font-mono text-neutral-500 uppercase tracking-widest text-[10px]">
          {lang === 'ru' ? 'КОУЧ КОМПАС:' : 'Coach Compass:'}
        </span>
        <span id="coach-advice-text" className="font-sans text-neutral-300 font-medium text-[11px] leading-relaxed italic">
          &quot;{adviceLine}&quot;
        </span>
      </div>
    </div>
  );
}
