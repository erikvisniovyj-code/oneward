import React from 'react';
import { Compass, Sparkles, TrendingUp, Calendar, Inbox, Ban } from 'lucide-react';
import { Task, Direction } from '../types';
import { daysBetween } from '../data';

interface MirrorProps {
  tasks: Task[];
  directions: Direction[];
}

export default function Mirror({ tasks, directions }: MirrorProps) {
  const now = new Date();

  // Helper to format days waited beautifully
  const formatWaitDuration = (days: number): string => {
    if (days >= 365) {
      const years = +(days / 365).toFixed(1);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    if (days >= 30) {
      const months = +(days / 30).toFixed(1);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  // 1. Core counters
  const completedTasks = tasks.filter(t => t.completedDate && !t.buried);
  
  // Tasks completed this week (past 7 days)
  const completedThisWeek = completedTasks.filter(t => {
    const elapsed = daysBetween(new Date(t.completedDate!), now);
    return elapsed <= 7;
  });

  // Tasks completed this month (past 30 days)
  const completedThisMonth = completedTasks.filter(t => {
    const elapsed = daysBetween(new Date(t.completedDate!), now);
    return elapsed <= 30;
  });

  // Tasks completed last month (30 to 60 days ago)
  const completedLastMonth = completedTasks.filter(t => {
    const elapsed = daysBetween(new Date(t.completedDate!), now);
    return elapsed > 30 && elapsed <= 60;
  });

  // 2. High-value old completed tasks list (waited >30 days)
  const longWaitingConquered = completedTasks
    .filter(t => {
      const waitTime = daysBetween(new Date(t.createdDate), new Date(t.completedDate!));
      return waitTime >= 30;
    })
    .map(t => ({
      task: t,
      waitedDays: daysBetween(new Date(t.createdDate), new Date(t.completedDate!))
    }))
    .sort((a, b) => b.waitedDays - a.waitedDays);

  // 3. Headline Metric: Oldest important task: "was N days, now M days"
  // N (was) = historical peak age (max age of any task in our history starting from creation to either completion or now)
  // M (now) = oldest active task's current age
  const activeUncompleted = tasks.filter(t => !t.completedDate && !t.buried && t.state === 'active');
  const activeAges = activeUncompleted.map(t => daysBetween(new Date(t.createdDate), now));
  const currentMaxAge = activeAges.length > 0 ? Math.max(...activeAges) : 0;

  // Historic peak calculation: Look across all active and completed tasks to see the longest delay ever encountered
  const historicAges = tasks.map(t => {
    const end = t.completedDate ? new Date(t.completedDate) : now;
    return daysBetween(new Date(t.createdDate), end);
  });
  const historicMaxAge = historicAges.length > 0 ? Math.max(...historicAges, currentMaxAge) : currentMaxAge;

  // Let's calibrate N vs M so N is never less than M
  const wasNDays = Math.max(historicMaxAge, currentMaxAge, 45); // fallback default is 45 days if empty database
  const nowMDays = currentMaxAge;

  // 4. SEPARATE celebrated counter: "Released: K tasks that were only noise" (buried tasks)
  const buriedCount = tasks.filter(t => t.buried).length;

  // 5. Per-direction breakdown: horizontal meters of activity inside the past 7 days
  const directionEnergies = directions.map(dir => {
    // Count active tasks completed in this direction this week
    const completedInPastSevenDays = completedThisWeek.filter(t => t.directionId === dir.id).length;
    // Let's calculate percentage matching max to give a relative width
    return {
      direction: dir,
      count: completedInPastSevenDays,
    };
  });

  // Find max count to scale bars cleanly
  const maxWeeklyCount = Math.max(...directionEnergies.map(d => d.count), 1);

  return (
    <div id="mirror-container" className="max-w-2xl mx-auto py-12 px-4 sm:px-6 space-y-10">
      {/* Header section */}
      <div className="text-center">
        <h1 id="mirror-title" className="text-3xl font-sans font-medium tracking-tight text-neutral-100">
          The Mirror
        </h1>
        <p id="mirror-subtitle" className="mt-3 text-sm text-neutral-400 font-mono tracking-wide">
          Proof of progress. No illusions, only actual steps recorded.
        </p>
      </div>

      {/* Main Stats Grid Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Oldest Important Task (Single Most Important Number Hero Card) */}
        <div id="headline-metric-card" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-amber-500">
            <span>Primary Focus Metric</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-sans font-medium text-neutral-300">
              Oldest Action Weight
            </h2>
            <div className="mt-2 flex items-baseline space-x-2">
              <span id="now-days-val" className="text-5xl font-mono font-bold text-neutral-100">
                {nowMDays}
              </span>
              <span className="text-sm font-mono text-neutral-400">days delay now</span>
            </div>
            <div className="mt-2 flex items-center space-x-1.5 font-mono text-xs text-neutral-500">
              <span>Historical record: {wasNDays} days.</span>
              {nowMDays < wasNDays && (
                <span className="text-emerald-500 font-bold">Resisted block has decreased!</span>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-400 leading-normal font-sans">
            Your single goal is keeping this weight as close to zero as humanly possible. Completing old avoided tasks frees critical cognitive memory.
          </p>
        </div>

        {/* Celebrating Noise Release (Dismissing noise matches signal gains) */}
        <div id="released-noise-card" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-amber-500">
            <span>Redundancy Filter</span>
            <Ban className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-sans font-medium text-neutral-300">
              Noise Released
            </h2>
            <div className="mt-2 flex items-baseline space-x-2">
              <span id="released-count-val" className="text-5xl font-mono font-bold text-neutral-100">
                {buriedCount}
              </span>
              <span className="text-sm font-mono text-neutral-400">tasks dissolved</span>
            </div>
            <p className="mt-2 font-mono text-xs text-neutral-500">
              Acknowledge details you will never focus on.
            </p>
          </div>
          <p className="text-xs text-neutral-400 leading-normal font-sans">
            Burying unneeded dreams and decluttering your agenda is a primary sign of focus calibration. Dismissing noise earns identical weight to signal execution.
          </p>
        </div>
      </div>

      {/* Accomplishments Overviews */}
      <div id="accomplishment-comparison-panel" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6">
        <h3 className="text-sm font-sans font-medium uppercase tracking-wider text-neutral-300 border-b border-neutral-850 pb-3">
          Self-Comparison Rhythms
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-neutral-400 block uppercase">This Week</span>
            <span id="week-done-val" className="text-3xl font-mono font-semibold text-neutral-200">{completedThisWeek.length}</span>
            <span className="text-neutral-500 font-mono text-[11px] block">completed</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-neutral-400 block uppercase">This Month</span>
            <span id="month-done-val" className="text-3xl font-mono font-semibold text-neutral-200">{completedThisMonth.length}</span>
            <span className="text-neutral-500 font-mono text-[11px] block">completed</span>
          </div>

          <div className="col-span-2 md:col-span-1 space-y-1">
            <span className="text-xs font-mono text-neutral-400 block uppercase">Last Month</span>
            <span id="last-month-done-val" className="text-3xl font-mono font-semibold text-neutral-400">{completedLastMonth.length}</span>
            <span className="text-neutral-500 font-mono text-[11px] block">reference standard</span>
          </div>
        </div>

        {/* Comparison evaluation sentence */}
        <div className="bg-neutral-950 p-4 border border-neutral-850 rounded text-xs font-sans text-neutral-300 leading-relaxed">
          {completedThisMonth.length >= completedLastMonth.length ? (
            <span>
              You are keeping pace. This month you secured <strong className="text-emerald-400">{completedThisMonth.length}</strong> tasks versus <strong className="text-neutral-400">{completedLastMonth.length}</strong> previously. Focus momentum is expanding.
            </span>
          ) : (
            <span>
              You resolved <strong className="text-amber-500">{completedThisMonth.length}</strong> tasks vs last period&apos;s <strong className="text-neutral-450">{completedLastMonth.length}</strong>. Procrastination resistance is hovering, seek out the single oldest task in Heute screen.
            </span>
          )}
        </div>
      </div>

      {/* Long Avoided Conquered Tasks list */}
      <div id="conquered-ghosts-panel" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-5">
        <h3 className="text-sm font-sans font-medium uppercase tracking-wider text-neutral-300 border-b border-neutral-850 pb-3">
          Deep Resistance Dissolved
        </h3>
        <p className="text-xs text-neutral-400 font-mono leading-relaxed">
          Completed tasks that had stayed in hibernation for more than 30 days before execution:
        </p>

        {longWaitingConquered.length > 0 ? (
          <ul id="long-waiting-list" className="space-y-3.5 pt-1">
            {longWaitingConquered.map(({ task: t, waitedDays }) => (
              <li key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-neutral-950 border border-neutral-850 p-3.5 rounded space-y-2 sm:space-y-0 text-xs">
                <span className="text-neutral-200 font-sans font-medium line-clamp-2 max-w-md">
                  {t.title}
                </span>
                <span className="shrink-0 text-[11px] font-mono tracking-wider text-amber-500 bg-amber-950/20 px-2.5 py-1 border border-amber-900/30 rounded uppercase text-right">
                  waited {formatWaitDuration(waitedDays)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs italic text-neutral-500 font-mono">
            No long-hibernating tasks completed yet. Defeat your oldest active task to unlock this category.
          </p>
        )}
      </div>

      {/* Weekly Energy Direction Breakdown */}
      <div id="thread-energies-breakdown" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6">
        <div className="space-y-1 border-b border-neutral-850 pb-3">
          <h3 className="text-sm font-sans font-medium uppercase tracking-wider text-neutral-300">
            Life Thread Energy Distribution
          </h3>
          <p className="text-xs text-neutral-400 font-mono">
            Tracks which core directions received energy from executed actions this week:
          </p>
        </div>

        <div className="space-y-4 pt-1">
          {directionEnergies.map(({ direction: d, count }) => {
            const pct = Math.min(100, Math.round((count / maxWeeklyCount) * 100));
            return (
              <div key={d.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className={`uppercase font-medium ${d.active ? 'text-neutral-200' : 'text-neutral-500'}`}>
                    {d.name} {!d.active && '(Dormant)'}
                  </span>
                  <span className="text-neutral-400 font-mono">
                    {count} action{count !== 1 ? 's' : ''} this week
                  </span>
                </div>
                
                {/* Horizontal bar implementation */}
                <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      !d.active 
                        ? 'bg-neutral-750' 
                        : count > 0 
                          ? 'bg-gradient-to-r from-amber-600 to-amber-400' 
                          : 'bg-neutral-900'
                    }`} 
                    style={{ width: `${count > 0 ? pct : 3}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
