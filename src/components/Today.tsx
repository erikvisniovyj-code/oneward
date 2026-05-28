import React from 'react';
import { Sparkles, EyeOff, Zap, Flame, ShieldAlert, RotateCcw } from 'lucide-react';
import { Task, Direction, EnergyLevel } from '../types';
import { calculateTaskPriority, daysBetween } from '../data';

interface TodayProps {
  tasks: Task[];
  directions: Direction[];
  currentEnergy: EnergyLevel | null;
  onSetEnergy: (energy: EnergyLevel) => void;
  onResetEnergy: () => void;
  frogMode: boolean;
  onToggleFrogMode: () => void;
  onStartTask: (taskId: string) => void;
}

export default function Today({
  tasks,
  directions,
  currentEnergy,
  onSetEnergy,
  onResetEnergy,
  frogMode,
  onToggleFrogMode,
  onStartTask
}: TodayProps) {
  // We keep a local state of skipped task IDs in this session to prevent suggesting the same skipped task over and over
  const [skippedTaskIds, setSkippedTaskIds] = React.useState<string[]>([]);

  // Find eligible tasks: must be active (not frozen), not buried (buried are archived), and not completed (no completedDate)
  const activeUncompletedTasks = tasks.filter(t => t.state === 'active' && !t.buried && !t.completedDate);

  // Generate the meaning chain text based on task direction and affected person
  const getMeaningChain = (task: Task): string => {
    const dir = directions.find(d => d.id === task.directionId);
    const dirName = dir ? dir.name : 'Work';
    const person = task.affectedPerson && task.affectedPerson !== 'no one' ? task.affectedPerson : null;

    if (person) {
      if (person === 'son' || person === 'wife') {
        return `This is not about the task itself. It is about whether your ${person} sees that you do what you promise, building real trust instead of false intentions.`;
      }
      return `This is not about the chore. It is about whether you keep your pact with ${person}, or let them carry the weight of delay.`;
    }

    switch (dirName.toLowerCase()) {
      case 'work':
        return 'This is not about writing on a screen. This is about whether you build a real calling or spend your hours imagining the applause without doing the work.';
      case 'family':
        return 'This is not about the immediate task. It is about whether your family knows they can rely on your word.';
      case 'health':
        return 'This is not about convenience or fatigue. It is about whether you respect your body\'s longevity and survival.';
      case 'finance':
        return 'This is not about spreadsheets or money. It is about who owns your tomorrow and whether your future is secured or mortgaged.';
      case 'english':
        return 'This is not about vocabulary exercises. This is about expanding your boundaries, finding safety in expression, and opening closed doors.';
      case 'relocation':
        return 'This is not about packing boxes. It is about actively creating a safe haven and initiating the reset you desperately wanted.';
      case 'games club':
        return 'This is not about recreation. It is about honoring human connection and keeping a space alive for your comrades.';
      case 'travel':
        return 'This is not about tickets or tourism. It is about keeping your spirit active, expanding boundaries, and seeking active inspiration.';
      default:
        return 'This is not about the chore. It is about whether you control your attention, or allow instant gratification to consume your life.';
    }
  };

  // Find the single suggested task based on priority scoring
  const getSuggestedTask = (): { task: Task; priorityInfo: { score: number; explanation: string } } | null => {
    if (activeUncompletedTasks.length === 0) return null;

    // Filter tasks based on current energy unless Frog Mode is on
    let eligible = activeUncompletedTasks;
    if (!frogMode && currentEnergy) {
      eligible = activeUncompletedTasks.filter(t => t.energy === currentEnergy);
    }

    // Filter out skipped tasks in this session
    let unskippedEligible = eligible.filter(t => !skippedTaskIds.includes(t.id));

    // If we filtered out EVERYTHING because of skips, reset skips for this energy level
    if (unskippedEligible.length === 0 && eligible.length > 0) {
      setSkippedTaskIds([]);
      unskippedEligible = eligible;
    }

    if (unskippedEligible.length === 0) return null;

    // Calculate score for each
    const scoredTasks = unskippedEligible.map(t => {
      const priorityInfo = calculateTaskPriority(t, directions);
      return { task: t, priorityInfo };
    });

    // Sort by score descending. Ties broken by daydreamAnticipation (inverted: lower is better/more trusted)
    scoredTasks.sort((a, b) => {
      if (b.priorityInfo.score !== a.priorityInfo.score) {
        return b.priorityInfo.score - a.priorityInfo.score;
      }
      return a.task.daydreamAnticipation - b.task.daydreamAnticipation;
    });

    return scoredTasks[0];
  };

  const suggested = getSuggestedTask();

  const handleNotNow = () => {
    if (suggested) {
      setSkippedTaskIds(prev => [...prev, suggested.task.id]);
    }
  };

  const currentAgeDays = suggested ? daysBetween(new Date(suggested.task.createdDate), new Date()) : 0;

  return (
    <div id="today-container" className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      {/* Header and Control Panels */}
      <div className="text-center mb-10">
        <h1 id="today-title" className="text-3xl font-sans font-medium tracking-tight text-neutral-100">
          The suggestions engine
        </h1>
        <p id="today-subtitle" className="mt-3 text-sm text-neutral-400 font-mono tracking-wide">
          One single step. No lists to scroll, no planning loops.
        </p>
      </div>

      {/* Energy Level Selection Panel */}
      {!currentEnergy && !frogMode ? (
        <div id="energy-selector-card" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6 text-center">
          <h2 className="text-lg font-sans font-medium text-neutral-200">
            What is your current cognitive fuel level?
          </h2>
          <p className="text-xs text-neutral-400 font-mono max-w-sm mx-auto">
            Matching task complexity to current neurological stamina reduces activation resistance.
          </p>
          <div id="energy-buttons-grid" className="grid grid-cols-3 gap-3 pt-2">
            {(['low', 'normal', 'high'] as EnergyLevel[]).map((level) => (
              <button
                key={level}
                id={`energy-btn-${level}`}
                onClick={() => onSetEnergy(level)}
                className="rounded py-3 text-xs font-mono font-semibold tracking-wider text-neutral-300 bg-neutral-950 border border-neutral-850 hover:border-amber-500 hover:text-amber-400 transition-colors uppercase"
              >
                {level === 'low' ? 'Low' : level === 'normal' ? 'Normal' : 'High'}
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-850 pt-5">
            <button
              onClick={onToggleFrogMode}
              className="inline-flex items-center space-x-2 text-xs font-mono tracking-wide text-neutral-500 hover:text-amber-500 transition-colors uppercase"
            >
              <span>Or directly activate Frog Mode</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div id="suggestion-controls-bar" className="flex flex-col sm:flex-row items-center justify-between bg-neutral-950 border border-neutral-900 rounded-md p-3.5 space-y-3 sm:space-y-0 text-xs font-mono text-neutral-400">
            <div className="flex items-center space-x-3">
              {frogMode ? (
                <div className="flex items-center space-x-1.5 text-amber-500">
                  <Flame className="h-4 w-4" />
                  <span className="uppercase font-semibold">Frog Mode: ON</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-neutral-300">
                  <Zap className="h-4 w-4" />
                  <span className="uppercase">Fuel level: {currentEnergy}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                id="toggle-frog-btn"
                onClick={onToggleFrogMode}
                className={`transition-colors hover:text-amber-400 ${frogMode ? 'text-amber-500 font-bold' : 'text-neutral-500'}`}
              >
                {frogMode ? 'Deactivate Frog Mode' : 'Activate Frog Mode'}
              </button>

              {!frogMode && (
                <button
                  id="reset-energy-btn"
                  onClick={onResetEnergy}
                  className="flex items-center space-x-1 text-neutral-500 hover:text-neutral-300 transition-colors"
                  title="Change energy fuel level"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Fuel</span>
                </button>
              )}
            </div>
          </div>

          {/* Prompt explaining Frog Mode on request */}
          {frogMode && (
            <div className="bg-amber-950/20 border border-amber-900/30 rounded p-3 text-xs text-amber-500/90 font-mono">
              <strong>Frog Mode active:</strong> Bypasses energy logic to output the single absolute hardest, oldest important task in the basement first. Overcoming this wins your peak hours.
            </div>
          )}

          {/* Suggested Task Card */}
          {suggested ? (
            <div id="suggested-task-card" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6 shadow-xl relative overflow-hidden">
              {/* Left Accent indicator for high scores */}
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-amber-500 to-transparent" />

              {/* Status Tags */}
              <div className="flex items-center justify-between text-neutral-400 font-mono text-xs">
                <div>
                  <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">
                    Waiting {currentAgeDays} day{currentAgeDays !== 1 ? 's' : ''}
                  </span>
                </div>
                {suggested.task.affectedPerson && suggested.task.affectedPerson !== 'no one' && (
                  <div className="flex items-center space-x-1 text-amber-400 font-semibold uppercase tracking-wider">
                    <span>Impacts: {suggested.task.affectedPerson}</span>
                  </div>
                )}
              </div>

              {/* Title focus */}
              <div className="pt-2">
                <h2 className="text-xl sm:text-2xl font-sans font-medium text-neutral-100 tracking-tight leading-snug">
                  {suggested.task.title}
                </h2>
              </div>

              {/* Meaning chain line - core anti-procrastination truth */}
              <div className="border-t border-b border-neutral-850 py-4 font-sans text-neutral-300 italic text-sm leading-relaxed">
                {getMeaningChain(suggested.task)}
              </div>

              {/* Inaction consequence indicator */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <ShieldAlert className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div className="text-xs font-mono text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-semibold uppercase mr-1">Consequence:</span>
                    {suggested.task.consequence === 'irreversible' && 'Irreversible damage or major missed life-path shift if not executed.'}
                    {suggested.task.consequence === 'real_loss' && 'Real loss, immediate friction, or emotional debt.'}
                    {suggested.task.consequence === 'minor' && 'Minor annoyance or secondary backlog delays only.'}
                    {suggested.task.consequence === 'nothing' && 'No external impact. It is purely personal maintenance.'}
                  </div>
                </div>

                <div className="text-xs font-mono text-neutral-500 leading-relaxed">
                  <span className="text-neutral-400">Score justification:</span> {suggested.priorityInfo.explanation}
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-850">
                <button
                  id="skip-task-btn"
                  onClick={handleNotNow}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-neutral-800 rounded-md text-sm font-semibold text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors uppercase font-mono tracking-wider bg-neutral-950"
                >
                  Not now
                </button>
                <button
                  id="start-task-btn"
                  onClick={() => onStartTask(suggested.task.id)}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-md text-sm font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 transition-colors uppercase tracking-wider shadow-lg hover:shadow-amber-500/10"
                >
                  Start (2 min)
                </button>
              </div>
            </div>
          ) : (
            <div id="empty-suggested-card" className="bg-neutral-900 border border-neutral-800 rounded-lg p-10 text-center space-y-4">
              <EyeOff className="h-8 w-8 text-neutral-600 mx-auto" />
              <h3 className="text-base font-sans font-medium text-neutral-200">
                No active signals match this filter
              </h3>
              <p className="text-xs text-neutral-400 font-mono max-w-sm mx-auto leading-relaxed">
                {activeUncompletedTasks.length > 0
                  ? `You have active tasks waiting, but none matching your selected fuel level of "${currentEnergy}". Try toggling Frog Mode or changing your fuel level.`
                  : 'All your designated tasks are currently frozen or completed. Search the basement/backlog for things to promote, or park a new action.'}
              </p>
              {activeUncompletedTasks.length > 0 && !frogMode && (
                <button
                  id="empty-suggest-toggle-frog"
                  onClick={onToggleFrogMode}
                  className="inline-flex px-4 py-2 border border-neutral-800 hover:border-amber-500 hover:text-amber-400 rounded text-xs font-mono tracking-wide text-neutral-400 bg-neutral-950 uppercase"
                >
                  Toggle Frog Mode directly
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
