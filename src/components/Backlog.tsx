import React, { useState } from 'react';
import { Search, Compass, Inbox, AlertTriangle, ShieldCheck, ChevronRight, Edit2, Check, Eye } from 'lucide-react';
import { Task, EnergyLevel, ConsequenceLevel, LeverageLevel, Direction } from '../types';

interface BacklogProps {
  tasks: Task[];
  directions: Direction[];
  onActivateTask: (taskId: string) => void;
  onBuryTask: (taskId: string) => void;
  onUpdateTaskDetails: (
    taskId: string, 
    update: Partial<Omit<Task, 'id' | 'createdDate'>>
  ) => void;
}

export default function Backlog({
  tasks,
  directions,
  onActivateTask,
  onBuryTask,
  onUpdateTaskDetails
}: BacklogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'basement' | 'review'>('basement');
  
  // States for weekly Review workflow
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewTasksCompleted, setReviewTasksCompleted] = useState<string[]>([]);
  
  // State for active task editing
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editEnergy, setEditEnergy] = useState<EnergyLevel>('normal');
  const [editConsequence, setEditConsequence] = useState<ConsequenceLevel>('minor');
  const [editLeverage, setEditLeverage] = useState<LeverageLevel>('neutral');
  const [editDaydream, setEditDaydream] = useState(2);
  const [editDirection, setEditDirection] = useState('');

  // 1. Filter frozen backlogged tasks (not completed, not buried, state is frozen)
  const frozenTasks = tasks.filter(t => t.state === 'frozen' && !t.completedDate && !t.buried);

  // Generate Review Tasks subset (exactly 3 to 5 oldest/random frozen tasks)
  const getReviewTasks = (): Task[] => {
    // Return first 5 frozen tasks
    return frozenTasks.slice(0, 5);
  };

  const reviewTasksList = getReviewTasks();
  const currentReviewTask = reviewTasksList[reviewIndex];

  // Search filter
  const searchedTasks = frozenTasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditEnergy(task.energy);
    setEditConsequence(task.consequence);
    setEditLeverage(task.leverageLevel);
    setEditDaydream(task.daydreamAnticipation);
    setEditDirection(task.directionId);
  };

  const saveEdit = (taskId: string) => {
    onUpdateTaskDetails(taskId, {
      title: editTitle.trim(),
      energy: editEnergy,
      consequence: editConsequence,
      leverageLevel: editLeverage,
      daydreamAnticipation: editDaydream,
      directionId: editDirection
    });
    setEditingTaskId(null);
  };

  const handleReviewAction = (action: 'activate' | 'keep' | 'bury') => {
    if (!currentReviewTask) return;

    if (action === 'activate') {
      onActivateTask(currentReviewTask.id);
    } else if (action === 'bury') {
      onBuryTask(currentReviewTask.id);
    }

    setReviewTasksCompleted(prev => [...prev, currentReviewTask.id]);

    if (reviewIndex < reviewTasksList.length - 1) {
      setReviewIndex(prev => prev + 1);
    } else {
      // Finished all review items
      setReviewIndex(0);
      setActiveTab('basement');
    }
  };

  return (
    <div id="backlog-container" className="max-w-2xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 id="backlog-title" className="text-3xl font-sans font-medium tracking-tight text-neutral-100">
          The basement
        </h1>
        <p id="backlog-subtitle" className="mt-3 text-sm text-neutral-400 font-mono tracking-wide">
          All parked intentions are stored here indefinitely. Calm your brain.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div id="backlog-tabs" className="flex border-b border-neutral-850">
        <button
          onClick={() => setActiveTab('basement')}
          className={`py-3 px-6 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors ${
            activeTab === 'basement'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Parked Signals ({frozenTasks.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('review');
            setReviewIndex(0);
            setReviewTasksCompleted([]);
          }}
          className={`py-3 px-6 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors relative ${
            activeTab === 'review'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Review Basement
          {frozenTasks.length >= 3 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-amber-950 border border-amber-900 text-amber-500">
              Active
            </span>
          )}
        </button>
      </div>

      {/* SEARCH AND DIRECTORY TAB */}
      {activeTab === 'basement' && (
        <div id="basement-search-view" className="space-y-6">
          <div className="relative">
            <Search className="absolute top-3.5 left-4 h-5 w-5 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              id="backlog-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter backlogged intentions..."
              className="block w-full rounded-md border-0 py-3.5 pl-11 pr-4 bg-neutral-900 text-neutral-100 ring-1 ring-inset ring-neutral-800 placeholder:text-neutral-500 focus:ring-1 focus:ring-amber-500 text-sm focus:outline-none"
            />
          </div>

          {searchedTasks.length > 0 ? (
            <ul id="basement-list" className="space-y-4">
              {searchedTasks.map((task) => {
                const isEditing = editingTaskId === task.id;
                const dir = directions.find(d => d.id === (isEditing ? editDirection : task.directionId));

                return (
                  <li
                    key={task.id}
                    className={`bg-neutral-900 border rounded-lg p-5 transition-colors ${
                      isEditing ? 'border-amber-500' : 'border-neutral-850 hover:border-neutral-800'
                    }`}
                  >
                    {isEditing ? (
                      /* Editing prioritary configuration inline */
                      <div className="space-y-4">
                        <textarea
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="block w-full rounded border-0 py-2 px-3 bg-neutral-950 text-neutral-100 ring-1 ring-inset ring-neutral-800 focus:ring-1 focus:ring-amber-500 text-sm focus:outline-none"
                          rows={2}
                          maxLength={200}
                        />

                        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-neutral-400">
                          {/* Life Direction selection */}
                          <div className="space-y-1">
                            <label className="block uppercase text-[10px] tracking-wide text-neutral-500">Direction</label>
                            <select
                              value={editDirection}
                              onChange={(e) => setEditDirection(e.target.value)}
                              className="w-full bg-neutral-950 ring-1 ring-neutral-800 border-0 rounded p-2 text-neutral-300 focus:ring-1 focus:ring-amber-500"
                            >
                              {directions.map(d => (
                                <option key={d.id} value={d.id}>{d.name} {!d.active && '(Dormant)'}</option>
                              ))}
                            </select>
                          </div>

                          {/* Energy required selection */}
                          <div className="space-y-1">
                            <label className="block uppercase text-[10px] tracking-wide text-neutral-500">Stamina Fuel</label>
                            <select
                              value={editEnergy}
                              onChange={(e) => setEditEnergy(e.target.value as EnergyLevel)}
                              className="w-full bg-neutral-950 ring-1 ring-neutral-800 border-0 rounded p-2 text-neutral-300 focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="low">Low</option>
                              <option value="normal">Normal</option>
                              <option value="high">High</option>
                            </select>
                          </div>

                          {/* Consequence degree */}
                          <div className="space-y-1">
                            <label className="block uppercase text-[10px] tracking-wide text-neutral-500">Inaction Breakdown</label>
                            <select
                              value={editConsequence}
                              onChange={(e) => setEditConsequence(e.target.value as ConsequenceLevel)}
                              className="w-full bg-neutral-950 ring-1 ring-neutral-800 border-0 rounded p-2 text-neutral-300 focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="nothing">Nothing breaks</option>
                              <option value="minor">Minor delay</option>
                              <option value="real_loss">Real consequence</option>
                              <option value="irreversible">Irreversible damage</option>
                            </select>
                          </div>

                          {/* Leverage effect level */}
                          <div className="space-y-1">
                            <label className="block uppercase text-[10px] tracking-wide text-neutral-500">Leverage Level</label>
                            <select
                              value={editLeverage}
                              onChange={(e) => setEditLeverage(e.target.value as LeverageLevel)}
                              className="w-full bg-neutral-950 ring-1 ring-neutral-800 border-0 rounded p-2 text-neutral-300 focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="busywork">Busywork</option>
                              <option value="neutral">Neutral</option>
                              <option value="unlocks">Unlocks task</option>
                              <option value="cancels_others">Cancels other chores</option>
                            </select>
                          </div>
                        </div>

                        {/* Daydream scale Slider */}
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between items-center">
                            <label className="uppercase text-[10px] tracking-wide text-neutral-500">Daydream Pleasure (Anticipation Loop)</label>
                            <span className="text-amber-500 font-bold">{editDaydream}/5 scale</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={editDaydream}
                            onChange={(e) => setEditDaydream(parseInt(e.target.value))}
                            className="w-full h-1 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                          <p className="text-[10px] leading-relaxed text-neutral-500">
                            Higher scores represent actions that trigger false daydream dopamine. The engine deprioritizes these slightly to defend you against planning traps.
                          </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => setEditingTaskId(null)}
                            className="rounded px-3 py-2 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 uppercase"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(task.id)}
                            className="rounded px-4 py-2 bg-amber-500 text-neutral-950 font-bold uppercase transition-colors"
                          >
                            Save Details
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Flat View layout */
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <p className="font-sans font-medium text-neutral-200 text-sm leading-relaxed max-w-sm sm:max-w-md">
                            {task.title}
                          </p>

                          <div className="flex items-center space-x-2">
                            <button
                              id={`edit-details-btn-${task.id}`}
                              onClick={() => startEdit(task)}
                              className="p-1 px-2 border border-neutral-800 bg-neutral-950 rounded text-[10px] font-mono tracking-wider uppercase text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
                              title="Tune metadata weights manually"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Tune</span>
                            </button>
                          </div>
                        </div>

                        {/* Badges indicators row */}
                        <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono text-neutral-400">
                          <span className="uppercase tracking-wide px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850">
                            Thread: {dir ? dir.name : 'Unassigned'}
                          </span>
                          <span className="uppercase tracking-wide px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850">
                            Fuel: {task.energy}
                          </span>
                          <span className="uppercase tracking-wide px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850">
                            Impact: {task.consequence.replace('_', ' ')}
                          </span>
                          {task.affectedPerson && task.affectedPerson !== 'no one' && (
                            <span className="uppercase tracking-wide px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850 text-amber-500 font-semibold">
                              Attached: {task.affectedPerson}
                            </span>
                          )}
                        </div>

                        {/* Basement direct actions */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-neutral-850/30 text-xs font-mono">
                          <button
                            id={`direct-bury-btn-${task.id}`}
                            onClick={() => onBuryTask(task.id)}
                            className="rounded px-3 py-1.5 border border-dashed border-neutral-800 hover:border-neutral-600 text-neutral-500 hover:text-neutral-300 uppercase transition-colors"
                            title="Acknowledge this was noise and release it entirely"
                          >
                            Bury as Noise
                          </button>

                          <button
                            id={`direct-activate-btn-${task.id}`}
                            onClick={() => onActivateTask(task.id)}
                            className="rounded px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-amber-500 text-neutral-400 hover:text-amber-400 uppercase transition-colors flex items-center gap-1"
                          >
                            <ChevronRight className="h-3 w-3" />
                            <span>Activate</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="bg-neutral-900 border border-neutral-850 rounded-lg p-10 text-center space-y-3">
              <Inbox className="h-7 w-7 text-neutral-600 mx-auto" strokeWidth={1.5} />
              <h4 className="text-sm font-sans font-medium text-neutral-300">No matching signals found</h4>
              <p className="text-xs text-neutral-500 font-mono">
                The cellar looks clear. Secure any unneeded tasks from here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* WEEKLY ACTIVE REVIEW TAB */}
      {activeTab === 'review' && (
        <div id="basement-review-workflow" className="space-y-6">
          <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded text-xs leading-relaxed text-amber-500 font-mono">
            <strong>Active focus review:</strong> We hold 3 to 5 tasks from your cellar to examine. For each, commit or clear immediately. Avoid parking files without decisions.
          </div>

          {currentReviewTask ? (
            <div id="individual-review-task" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6 relative">
              {/* Progress dots inside loop */}
              <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                <span>INTENTION REVIEW: {reviewIndex + 1} OF {reviewTasksList.length}</span>
                <span>Cellar Index</span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-sans font-semibold text-neutral-100 leading-snug tracking-tight">
                {currentReviewTask.title}
              </h2>

              <p className="border-t border-b border-neutral-850 py-4 font-mono text-xs text-neutral-400 leading-relaxed">
                Determine consequence: If you choose to ignore this completely, is it really important? Or was it just daydream noise?
              </p>

              {/* Action grid options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                {/* Bury Option */}
                <button
                  id="review-action-bury"
                  onClick={() => handleReviewAction('bury')}
                  className="rounded px-4 py-3.5 border border-dashed border-neutral-800 hover:border-red-900 hover:text-red-400 font-mono text-xs uppercase uppercase text-center transition-colors bg-neutral-950"
                >
                  Bury (Noise Win)
                </button>

                {/* Keep Frozen */}
                <button
                  id="review-action-keep"
                  onClick={() => handleReviewAction('keep')}
                  className="rounded px-4 py-3.5 border border-neutral-800 hover:border-neutral-600 text-neutral-300 font-mono text-xs uppercase uppercase text-center transition-colors bg-neutral-950"
                >
                  Keep Frozen
                </button>

                {/* Promote / Activate */}
                <button
                  id="review-action-activate"
                  onClick={() => handleReviewAction('activate')}
                  className="rounded px-4 py-3.5 bg-amber-500 text-neutral-950 font-mono text-xs font-bold uppercase uppercase text-center transition-colors"
                >
                  Promote to Active
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-850 rounded-lg p-10 text-center space-y-4">
              <ShieldCheck className="h-9 w-9 text-emerald-500 mx-auto" />
              <h3 className="text-base font-sans font-medium text-neutral-200">
                Weekly review process secured
              </h3>
              <p className="text-xs text-neutral-400 font-mono max-w-sm mx-auto leading-relaxed">
                No active requirements pending in your immediate review queue. Keep freezing or complete existing signals in today panel.
              </p>
              <button
                onClick={() => setActiveTab('basement')}
                className="mt-2 px-4 py-2 bg-neutral-950 border border-neutral-805 hover:text-amber-400 text-xs font-mono uppercase rounded transition-colors"
              >
                Back to Cellar List
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
