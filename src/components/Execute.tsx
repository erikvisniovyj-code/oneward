import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Check, Timer, Landmark, ShieldCheck, Milestone } from 'lucide-react';
import { Task } from '../types';

interface ExecuteProps {
  task: Task;
  onCompleteTask: (taskId: string, durationMinutes: number, milestones: string[]) => void;
  onCancelExecution: () => void;
  streakCount: number;
}

export default function Execute({ task, onCompleteTask, onCancelExecution, streakCount }: ExecuteProps) {
  const [phase, setPhase] = useState<'ignition' | 'flow'>('ignition');
  const [secondsRemaining, setSecondsRemaining] = useState(120); // 2 minutes
  const [secondsElapsed, setSecondsElapsed] = useState(0); // For flow stopwatch
  const [isCompleted, setIsCompleted] = useState(false);
  const [milestones, setMilestones] = useState<string[]>([]);
  const [currentMilestoneText, setCurrentMilestoneText] = useState('');
  const [showMilestoneInput, setShowMilestoneInput] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Tick timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (phase === 'ignition') {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setPhase('flow');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setSecondsElapsed((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    onCancelExecution();
  };

  const handleDone = () => {
    // Calculate total duration in decimal minutes
    const totalSpentSeconds = (120 - secondsRemaining) + secondsElapsed;
    const durationMinutes = Math.max(1, Math.round(totalSpentSeconds / 60));
    
    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    setTimeout(() => {
      onCompleteTask(task.id, durationMinutes, milestones);
    }, 2800); // Allow time to see the subtle pulse completion before moving screen
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMilestoneText.trim()) return;
    const timestamp = formatTime(secondsElapsed);
    setMilestones((prev) => [...prev, `[${timestamp}] ${currentMilestoneText.trim()}`]);
    setCurrentMilestoneText('');
    setShowMilestoneInput(false);
  };

  // Get the coaching motivational labels based on flow stopwatch duration
  const getSubTitleText = () => {
    if (phase === 'ignition') {
      return 'Just two minutes. Only start. The friction is only in starting.';
    }
    const mins = Math.floor(secondsElapsed / 60);
    if (mins >= 60) {
      return 'This is a real sprint. You have overridden procrastination details entirely.';
    }
    if (mins >= 30) {
      return 'You are in flow. The resistance has dissolved.';
    }
    if (mins >= 10) {
      return 'Deep focus activated. Keep building momentum.';
    }
    return 'Ignition succeeded. You are now in flow state.';
  };

  // Skip ignition 2-min countdown directly to flow state for prototype testing
  const skipIgnition = () => {
    setPhase('flow');
    setSecondsRemaining(0);
  };

  return (
    <div id="execute-container" className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      {!isCompleted ? (
        <div 
          id="active-timer-card" 
          className={`bg-neutral-900 border border-neutral-850 rounded-lg p-8 text-center space-y-8 shadow-2xl relative transition-all duration-500 ${
            phase === 'flow' ? 'ring-2 ring-emerald-500/20 shadow-emerald-950/20' : 'ring-1 ring-neutral-800'
          }`}
        >
          {/* Header tracking context */}
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
              Active Focus
            </span>
            <h2 id="execute-task-title" className="text-xl sm:text-2xl font-sans font-medium text-neutral-100 tracking-tight max-w-md mx-auto">
              {task.title}
            </h2>
          </div>

          {/* Big Timer display */}
          <div className="py-6 select-none relative flex flex-col items-center justify-center">
            {phase === 'ignition' ? (
              <div className="space-y-2">
                <div id="countdown-big-number" className="text-7xl font-mono font-bold tracking-tight text-amber-500/90 tabular-nums">
                  {formatTime(secondsRemaining)}
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-500/60">
                  Ignition Countdown
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-pulse">
                <div id="stopwatch-big-number" className="text-7xl font-mono font-bold tracking-tight text-emerald-500/90 tabular-nums">
                  {formatTime(secondsElapsed)}
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-emerald-500/60">
                  Flow stopwatch active
                </div>
              </div>
            )}
            
            {/* Ambient Background Wave effect */}
            <div className={`absolute inset-0 rounded-full w-48 h-48 mx-auto -z-10 bg-gradient-to-r opacity-5 blur-xl pointer-events-none ${
              phase === 'flow' ? 'from-emerald-500 to-transparent' : 'from-amber-500 to-transparent'
            }`} />
          </div>

          {/* Subtitle feedback with coach advice */}
          <div className="border-t border-b border-neutral-850 py-4">
            <p id="execute-motivational-line" className="text-sm font-mono text-neutral-300 leading-relaxed">
              {getSubTitleText()}
            </p>
          </div>

          {/* Milestone displays */}
          {milestones.length > 0 && (
            <div id="milestones-history" className="text-left bg-neutral-950/60 p-4 border border-neutral-850 rounded space-y-2 max-h-36 overflow-y-auto">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                <Milestone className="h-3.5 w-3.5 text-neutral-500" />
                Logged Milestones:
              </span>
              <ul className="space-y-1.5 font-mono text-xs text-neutral-300">
                {milestones.map((m, idx) => (
                  <li key={idx} className="border-b border-neutral-900 pb-1 last:border-0 pl-2 border-l border-emerald-500">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* In-flow Milestone Entry Dialog Form */}
          {showMilestoneInput ? (
            <form onSubmit={handleAddMilestone} className="text-left bg-neutral-950 p-4 rounded border border-amber-500/30 space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400">
                Specify milestone description:
              </label>
              <input
                type="text"
                value={currentMilestoneText}
                onChange={(e) => setCurrentMilestoneText(e.target.value)}
                placeholder="What progress did you just secure?"
                className="block w-full rounded border-0 py-2 px-3 bg-neutral-900 text-neutral-100 ring-1 ring-inset ring-neutral-800 placeholder:text-neutral-500 focus:ring-1 focus:ring-amber-500 text-xs focus:outline-none"
                required
                autoFocus
              />
              <div className="flex justify-end gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setShowMilestoneInput(false);
                    setCurrentMilestoneText('');
                  }}
                  className="rounded px-2.5 py-1.5 text-neutral-400 hover:text-neutral-200 uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded px-3 py-1.5 bg-amber-500 text-neutral-950 font-bold uppercase"
                >
                  Log
                </button>
              </div>
            </form>
          ) : null}

          {/* Action Row */}
          <div className="pt-4 flex flex-wrap gap-3 justify-center">
            {/* Stop Action */}
            <button
              id="stop-execution-btn"
              onClick={handleStop}
              className="px-5 py-3 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-red-400 rounded-md text-sm font-semibold tracking-wider font-mono uppercase transition-colors flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              <span>Stop</span>
            </button>

            {/* In-flow details extra action buttons */}
            {phase === 'flow' && !showMilestoneInput && (
              <button
                id="milestone-log-btn"
                onClick={() => setShowMilestoneInput(true)}
                className="px-5 py-3 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 rounded-md text-sm font-semibold tracking-wider font-mono uppercase transition-colors flex items-center gap-2"
              >
                <Milestone className="h-4 w-4 text-emerald-400" />
                <span>Milestone</span>
              </button>
            )}

            {/* Complete action */}
            <button
              id="complete-task-btn"
              onClick={handleDone}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-md text-sm font-semibold tracking-wider uppercase transition-colors flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Done</span>
            </button>
          </div>

          {/* Prototype Skip countdown helper */}
          {phase === 'ignition' && (
            <div className="pt-6 border-t border-neutral-900 flex justify-center">
              <button
                type="button"
                id="skip-ignition-btn"
                onClick={skipIgnition}
                className="text-[10px] font-mono tracking-widest text-neutral-600 hover:text-neutral-400 transition-colors uppercase"
              >
                Skip 2M Ignition (Test Shortcut)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Subtle Glow/Pulsing Completion State Effect (No flash particles/emoji, pure CSS) */
        <div 
          id="completion-glow-screen" 
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-10 text-center space-y-6 shadow-2xl animate-pulse"
          style={{ animationDuration: '2s' }}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-500">
              Task Completed
            </span>
            <h3 className="text-2xl font-sans font-medium text-neutral-100 tracking-tight">
              Action secured.
            </h3>
            <p className="text-sm font-sans text-neutral-400 italic max-w-sm mx-auto leading-relaxed pt-2">
              &quot;{task.title}&quot; moved to the Done Log. No planning daydream, just pure execution.
            </p>
          </div>

          <div className="pt-6 border-t border-neutral-850 font-mono text-xs text-neutral-500 space-y-1">
            <p>Active streak: {streakCount} continuous days</p>
            <p>Moving back to Sugggestion Engine shortly...</p>
          </div>
        </div>
      )}
    </div>
  );
}
