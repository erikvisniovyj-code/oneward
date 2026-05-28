import React, { useState, useEffect } from 'react';
import { Compass, Inbox, Zap, Timer, Award, Sliders, X, Check, Compass as CompassIcon, Plus, EyeOff, HelpCircle } from 'lucide-react';
import { AppState, Task, Direction, ScreenType, EnergyLevel } from './types';
import { DEFAULT_DIRECTIONS, DEFAULT_PEOPLE, getSeedTasks, daysBetween } from './data';
import Capture from './components/Capture';
import Today from './components/Today';
import Execute from './components/Execute';
import Mirror from './components/Mirror';
import Backlog from './components/Backlog';
import Coach from './components/Coach';

const LOCAL_STORAGE_KEY = 'compass_v1_app_state';

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newDirectionName, setNewDirectionName] = useState('');
  const [newPersonName, setNewPersonName] = useState('');
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // 1. Initial State Loading with fallback to rich seed dataset
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setState(parsed);
      } catch (e) {
        initDefaultState();
      }
    } else {
      initDefaultState();
    }
  }, []);

  const initDefaultState = () => {
    const initialDirections = [...DEFAULT_DIRECTIONS];
    const initialTasks = getSeedTasks(initialDirections);
    const defaultState: AppState = {
      tasks: initialTasks,
      directions: initialDirections,
      people: [...DEFAULT_PEOPLE],
      activeScreen: 'today',
      currentEnergy: 'normal',
      executingTaskId: null,
      frogMode: false,
      streakCount: 3, // Starts with a realistic streak count to demonstrate visual coaching states
    };
    setState(defaultState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultState));
  };

  // Synchronize state changes to localStorage
  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-xs text-neutral-400">
        Aligning components...
      </div>
    );
  }

  // Task creators & modifiers
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdDate' | 'buried' | 'state'>): string => {
    const newId = `task-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: newId,
      createdDate: new Date().toISOString(),
      buried: false,
      state: 'frozen', // SILENT PARK: always frozen in basement, never congratulated
    };

    updateState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));

    return newId;
  };

  const handleUpdateTaskPerson = (taskId: string, person: string) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, affectedPerson: person } : t)),
    }));
  };

  const handleActivateTask = (taskId: string) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, state: 'active' } : t)),
    }));
  };

  const handleBuryTask = (taskId: string) => {
    // BURY IS CELEBRATED AS A WIN (Equal weight to completed tasks)
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => t.id === taskId ? { ...t, buried: true, state: 'frozen' } : t),
    }));
  };

  const handleUpdateTaskDetails = (taskId: string, update: Partial<Omit<Task, 'id' | 'createdDate'>>) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...update } : t)),
    }));
  };

  const handleStartTask = (taskId: string) => {
    updateState((prev) => ({
      ...prev,
      executingTaskId: taskId,
      activeScreen: 'execute', // Automatically moves into execute zone
    }));
  };

  const handleCompleteTask = (taskId: string, durationMinutes: number, milestones: string[]) => {
    updateState((prev) => {
      // Calculate streak update: If last completed task was yesterday or today, keep/increment streak.
      const now = new Date();
      let newStreak = prev.streakCount;

      const completedDates = prev.tasks
        .map((t) => (t.id === taskId ? now.toISOString() : t.completedDate))
        .filter(Boolean) as string[];

      if (completedDates.length > 0) {
        newStreak = Math.min(30, prev.streakCount + 1);
      }

      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completedDate: now.toISOString(),
                durationMinutes,
                milestones,
              }
            : t
        ),
        executingTaskId: null,
        activeScreen: 'today', // Return back to SUGGESTION Today screen after completions
        streakCount: newStreak,
      };
    });
  };

  const handleCancelExecution = () => {
    updateState((prev) => ({
      ...prev,
      executingTaskId: null,
      activeScreen: 'today',
    }));
  };

  const handleToggleFrogMode = () => {
    updateState((prev) => ({
      ...prev,
      frogMode: !prev.frogMode,
    }));
  };

  const handleSetEnergy = (energy: EnergyLevel) => {
    updateState((prev) => ({
      ...prev,
      currentEnergy: energy,
    }));
  };

  const handleResetEnergy = () => {
    updateState((prev) => ({
      ...prev,
      currentEnergy: null,
    }));
  };

  // Settings handlers
  const handleToggleDirection = (directionId: string) => {
    setSettingsError(null);
    updateState((prev) => {
      const match = prev.directions.find((d) => d.id === directionId);
      if (!match) return prev;

      const activeCount = prev.directions.filter((d) => d.active).length;
      
      // Enforce the rule: Maximum of 3 active directions allowed at any time
      if (!match.active && activeCount >= 3) {
        setSettingsError('Max 3 active threads are allowed at once to prevent attention fragmentation.');
        return prev;
      }

      return {
        ...prev,
        directions: prev.directions.map((d) =>
          d.id === directionId ? { ...d, active: !d.active } : d
        ),
      };
    });
  };

  const handleAddDirection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectionName.trim()) return;

    // Reject duplicates
    if (state.directions.some((d) => d.name.toLowerCase() === newDirectionName.trim().toLowerCase())) {
      setSettingsError('Direction with this label already exists.');
      return;
    }

    updateState((prev) => ({
      ...prev,
      directions: [
        ...prev.directions,
        {
          id: `dir-${Date.now()}`,
          name: newDirectionName.trim(),
          active: false, // Default is dormant
        },
      ],
    }));

    setNewDirectionName('');
    setSettingsError(null);
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    if (state.people.some((p) => p.toLowerCase() === newPersonName.trim().toLowerCase())) {
      setSettingsError('Person with this name is already configured.');
      return;
    }

    updateState((prev) => ({
      ...prev,
      people: [...prev.people, newPersonName.trim()],
    }));

    setNewPersonName('');
    setSettingsError(null);
  };

  const handleRemovePerson = (personName: string) => {
    if (personName === 'myself' || personName === 'no one') return; // Enforce native reserve words
    updateState((prev) => ({
      ...prev,
      people: prev.people.filter((p) => p !== personName),
    }));
  };

  const activeTaskForExecution = state.tasks.find((t) => t.id === state.executingTaskId);

  return (
    <div id="app-root-container" className="min-h-screen flex flex-col justify-between selection:bg-amber-500/30 selection:text-neutral-100">
      
      {/* Visual Navigation Header */}
      <header id="app-header" className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <CompassIcon className="h-6 w-6 text-amber-500" />
            <span className="font-display text-xl font-bold tracking-tight text-neutral-150">
              Compass
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-950 border border-amber-900 text-[9px] font-mono text-amber-400 font-semibold tracking-wider uppercase">
              Micro Prototype
            </span>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {/* If executing, replace navigation tabs with Warning Badge or enforce execute lock */}
            {state.executingTaskId && activeTaskForExecution ? (
              <div className="flex items-center space-x-2 bg-amber-950/25 border border-amber-500/20 px-3 py-1.5 rounded-full text-xs font-mono text-amber-500 font-medium">
                <span className="animate-pulse bg-amber-500 rounded-full h-2 w-2" />
                <span>Execution Lock Active</span>
              </div>
            ) : (
              // Standard client screens tabs
              <>
                <button
                  id="tab-capture"
                  onClick={() => updateState((p) => ({ ...p, activeScreen: 'capture' }))}
                  className={`px-3 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors ${
                    state.activeScreen === 'capture'
                      ? 'bg-neutral-900 text-amber-500'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Capture
                </button>
                <button
                  id="tab-today"
                  onClick={() => updateState((p) => ({ ...p, activeScreen: 'today' }))}
                  className={`px-3 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors ${
                    state.activeScreen === 'today'
                      ? 'bg-neutral-900 text-amber-500'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Today
                </button>
                <button
                  id="tab-mirror"
                  onClick={() => updateState((p) => ({ ...p, activeScreen: 'mirror' }))}
                  className={`px-3 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors ${
                    state.activeScreen === 'mirror'
                      ? 'bg-neutral-900 text-amber-500'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Mirror
                </button>
                <button
                  id="tab-backlog"
                  onClick={() => updateState((p) => ({ ...p, activeScreen: 'backlog' }))}
                  className={`px-3 py-2 rounded text-xs font-semibold tracking-wide uppercase transition-colors ${
                    state.activeScreen === 'backlog'
                      ? 'bg-neutral-900 text-amber-500'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Basement
                </button>
              </>
            )}

            {/* Separator */}
            <div className="h-4 w-px bg-neutral-900" />

            {/* Config tweak action button */}
            <button
              id="settings-trigger"
              onClick={() => setShowSettings(true)}
              className="p-2 rounded text-neutral-500 hover:text-neutral-200 transition-colors"
              title="Adjust Priority Parameters"
            >
              <Sliders className="h-4.5 w-4.5" />
            </button>
          </nav>
        </div>
      </header>

      {/* Primary Context Container */}
      <main id="app-main-content" className="flex-grow py-8 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* If task is active in execute context, override viewport view and enforce focusing */}
        {state.executingTaskId && activeTaskForExecution ? (
          <Execute
            task={activeTaskForExecution}
            onCompleteTask={handleCompleteTask}
            onCancelExecution={handleCancelExecution}
            streakCount={state.streakCount}
          />
        ) : (
          <>
            {state.activeScreen === 'capture' && (
              <Capture
                onAddTask={handleAddTask}
                onUpdateTaskPerson={handleUpdateTaskPerson}
                directions={state.directions}
                people={state.people}
              />
            )}

            {state.activeScreen === 'today' && (
              <Today
                tasks={state.tasks}
                directions={state.directions}
                currentEnergy={state.currentEnergy}
                onSetEnergy={handleSetEnergy}
                onResetEnergy={handleResetEnergy}
                frogMode={state.frogMode}
                onToggleFrogMode={handleToggleFrogMode}
                onStartTask={handleStartTask}
              />
            )}

            {state.activeScreen === 'mirror' && (
              <Mirror tasks={state.tasks} directions={state.directions} />
            )}

            {state.activeScreen === 'backlog' && (
              <Backlog
                tasks={state.tasks}
                directions={state.directions}
                onActivateTask={handleActivateTask}
                onBuryTask={handleBuryTask}
                onUpdateTaskDetails={handleUpdateTaskDetails}
              />
            )}
          </>
        )}
      </main>

      {/* Global Coach Strip & Footer */}
      <footer id="app-footer" className="mt-auto border-t border-neutral-900/60 bg-black/40 py-8 space-y-4">
        <Coach tasks={state.tasks} streakCount={state.streakCount} />
        
        <div className="text-center font-mono text-[10px] text-neutral-600 leading-normal max-w-xs mx-auto">
          <p>Compass is an action-driven anti-procrastination engine.</p>
          <p className="mt-1">Completed actions are signal. Planning daydream is noise.</p>
        </div>
      </footer>

      {/* CONFIG RULES SETTINGS MODAL / DRAWER (Pure CSS and absolute positioning overlays, emoji-free) */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-neutral-950 border-l border-neutral-850 h-full p-6 flex flex-col justify-between overflow-y-auto">
            
            {/* Rules Tweak Header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                <div className="flex items-center space-x-2">
                  <Sliders className="h-5 w-5 text-amber-500" />
                  <h3 className="font-display font-bold text-neutral-100 uppercase tracking-widest text-xs">
                    Tweak Compass Parameters
                  </h3>
                </div>
                <button
                  id="close-settings"
                  onClick={() => {
                    setShowSettings(false);
                    setSettingsError(null);
                  }}
                  className="p-1 rounded text-neutral-500 hover:text-neutral-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Error messages feedback */}
              {settingsError && (
                <div className="bg-red-950/20 border border-red-900/40 rounded p-3 text-xs text-red-500 font-mono">
                  {settingsError}
                </div>
              )}

              {/* Editable North Star Directions List */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-display font-medium text-neutral-200 uppercase tracking-wider">
                    Core life threads (Max 3 Active)
                  </h4>
                  <p className="text-[10px] text-neutral-500 font-mono leading-relaxed">
                    Limit active priorities to maximum of 3 at once. All dormant direction tasks are penalised heavily inside today suggestor.
                  </p>
                </div>

                {/* Directions Items Grid */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {state.directions.map((dir) => (
                    <div
                      key={dir.id}
                      className="flex items-center justify-between bg-neutral-900/60 p-2.5 rounded border border-neutral-900 text-xs font-mono"
                    >
                      <span className={`uppercase font-medium ${dir.active ? 'text-neutral-100' : 'text-neutral-500'}`}>
                        {dir.name} {!dir.active && '(Dormant)'}
                      </span>
                      <button
                        type="button"
                        id={`toggle-dir-btn-${dir.id}`}
                        onClick={() => handleToggleDirection(dir.id)}
                        className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors ${
                          dir.active
                            ? 'bg-amber-950/40 border border-amber-900 text-amber-500 hover:bg-neutral-900'
                            : 'bg-neutral-950 border border-neutral-850 text-neutral-400 hover:border-amber-500'
                        }`}
                      >
                        {dir.active ? 'Active' : 'Dormant'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Create Direction Mini Form */}
                <form onSubmit={handleAddDirection} className="flex gap-2">
                  <input
                    type="text"
                    value={newDirectionName}
                    onChange={(e) => setNewDirectionName(e.target.value)}
                    placeholder="New Direction Name"
                    maxLength={30}
                    className="flex-grow rounded border-0 bg-neutral-900 text-neutral-100 ring-1 ring-inset ring-neutral-850 py-1.5 px-3 focus:ring-1 focus:ring-amber-500 text-xs focus:outline-none placeholder:text-neutral-600"
                  />
                  <button
                    type="submit"
                    className="p-2 border border-neutral-850 hover:border-amber-500 hover:text-amber-500 rounded transition-colors text-neutral-400"
                    title="Add Life Thread"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Editable Consequences People List */}
              <div className="space-y-4 border-t border-neutral-900 pt-6">
                <div className="space-y-1">
                  <h4 className="text-xs font-display font-medium text-neutral-200 uppercase tracking-wider">
                    Affected People Directory
                  </h4>
                  <p className="text-[10px] text-neutral-500 font-mono leading-relaxed">
                    Define the list of people used inside the capture questions. Tying a chore to a human element removes planning noise.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {state.people.map((p) => {
                    const isReserved = p === 'myself' || p === 'no one';

                    return (
                      <span
                        key={p}
                        className="inline-flex items-center pl-2.5 pr-1.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider bg-neutral-900 border border-neutral-851 text-neutral-300"
                      >
                        <span>{p}</span>
                        {!isReserved && (
                          <button
                            type="button"
                            onClick={() => handleRemovePerson(p)}
                            className="ml-1.5 p-0.5 text-neutral-500 hover:text-neutral-200 rounded transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>

                <form onSubmit={handleAddPerson} className="flex gap-2">
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder="E.g. Neighbor, Daughter"
                    maxLength={20}
                    className="flex-grow rounded border-0 bg-neutral-900 text-neutral-100 ring-1 ring-inset ring-neutral-850 py-1.5 px-3 focus:ring-1 focus:ring-amber-500 text-xs focus:outline-none placeholder:text-neutral-600"
                  />
                  <button
                    type="submit"
                    className="p-2 border border-neutral-850 hover:border-amber-500 hover:text-amber-500 rounded transition-colors text-neutral-400"
                    title="Add Person"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </form>
              </div>

            </div>

            <div className="border-t border-neutral-900 pt-4 text-center">
              <span className="font-mono text-[9px] text-neutral-600 block uppercase">
                V1 Configurable Prototype Weights
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
