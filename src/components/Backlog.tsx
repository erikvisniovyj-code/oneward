import React, { useState } from 'react';
import { Search, Compass, Inbox, AlertTriangle, ShieldCheck, ChevronRight, Edit2, Check, Eye } from 'lucide-react';
import { Task, EnergyLevel, ConsequenceLevel, LeverageLevel, Direction } from '../types';
import { Language, t, translateDirectionName, translatePersonName } from '../i18n';

interface BacklogProps {
  tasks: Task[];
  directions: Direction[];
  onActivateTask: (taskId: string) => void;
  onBuryTask: (taskId: string) => void;
  onUpdateTaskDetails: (
    taskId: string, 
    update: Partial<Omit<Task, 'id' | 'createdDate'>>
  ) => void;
  lang: Language;
}

export default function Backlog({
  tasks,
  directions,
  onActivateTask,
  onBuryTask,
  onUpdateTaskDetails,
  lang
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
          {t(lang, 'basementScreenTitle')}
        </h1>
        <p id="backlog-subtitle" className="mt-3 text-sm text-neutral-400 font-mono tracking-wide">
          {t(lang, 'basementScreenDesc')}
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div id="backlog-tabs" className="flex border-b border-neutral-850">
        <button
          onClick={() => setActiveTab('basement')}
          className={`py-3 px-6 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
            activeTab === 'basement'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {t(lang, 'parkedSignalsTab').replace('{count}', String(frozenTasks.length))}
        </button>
        <button
          onClick={() => {
            setActiveTab('review');
            setReviewIndex(0);
            setReviewTasksCompleted([]);
          }}
          className={`py-3 px-6 text-xs font-mono tracking-wider uppercase border-b-2 transition-colors relative cursor-pointer ${
            activeTab === 'review'
              ? 'border-amber-500 text-amber-500 font-bold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {t(lang, 'reviewBasementTab')}
          {frozenTasks.length >= 3 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-amber-950 border border-amber-900 text-amber-500">
              {t(lang, 'reviewActive')}
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
              placeholder={t(lang, 'filterIntentionsPlaceholder')}
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
                            <label className="block uppercase text-[10px] tracking-wide text-neutral-500">{t(lang, 'directionLabel')}</label>
                            <select
                              value={editDirection}
                              onChange={(e) => setEditDirection(e.target.value)}
                              className="w-full bg-neutral-950 ring-1 ring-neutral-800 border-0 rounded p-2 text-neutral-300 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            >
                              {directions.map(d => (
                                <option key={d.id} value={d.id}>
                                  {translateDirectionName(d.name, lang)}{!d.active && (lang === 'ru' ? ' (Спящее)' : ' (Dormant)')}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Energy required selection */}
                          <div className="space-y-1">
                            <label className="block uppercase text-[10px] tracking-wide text-neutral-500">{t(lang, 'staminaFuelLabel')}</label>
                            <select
                              value={editEnergy}
                              onChange={(e) => setEditEnergy(e.target.value as EnergyLevel)}
                              className="w-full bg-neutral-950 ring-1 ring-neutral-800 border-0 rounded p-2 text-neutral-300 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            >
                              <option value="low">{lang === 'ru' ? 'Тлею' : 'Low'}</option>
                              <option value="normal">{lang === 'ru' ? 'Норм' : 'Normal'}</option>
                              <option value="high">{lang === 'ru' ? 'Взрываюсь' : 'High'}</option>
                            </select>
                          </div>

                          {/* Consequence degree */}
                          <div className="space-y-1">
                            <label className="block uppercase text-[10px] tracking-wide text-neutral-500">{t(lang, 'inactionBreakdownLabel')}</label>
                            <select
                              value={editConsequence}
                              onChange={(e) => setEditConsequence(e.target.value as ConsequenceLevel)}
                              className="w-full bg-neutral-950 ring-1 ring-neutral-800 border-0 rounded p-2 text-neutral-300 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            >
                              <option value="nothing">{lang === 'ru' ? 'Ничего не сломается' : 'Nothing breaks'}</option>
                              <option value="minor">{lang === 'ru' ? 'Небольшая задержка' : 'Minor delay'}</option>
                              <option value="real_loss">{lang === 'ru' ? 'Реальное последствие' : 'Real consequence'}</option>
                              <option value="irreversible">{lang === 'ru' ? 'Необратимый ущерб' : 'Irreversible damage'}</option>
                            </select>
                          </div>

                          {/* Leverage effect level */}
                          <div className="space-y-1">
                            <label className="block uppercase text-[10px] tracking-wide text-neutral-500">{t(lang, 'leverageLevelLabel')}</label>
                            <select
                              value={editLeverage}
                              onChange={(e) => setEditLeverage(e.target.value as LeverageLevel)}
                              className="w-full bg-neutral-950 ring-1 ring-neutral-800 border-0 rounded p-2 text-neutral-300 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            >
                              <option value="busywork">{lang === 'ru' ? 'Суета (Daydreaming)' : 'Busywork'}</option>
                              <option value="neutral">{lang === 'ru' ? 'Обычное дело' : 'Neutral'}</option>
                              <option value="unlocks">{lang === 'ru' ? 'Разблокирует дело' : 'Unlocks task'}</option>
                              <option value="cancels_others">{lang === 'ru' ? 'Заменяет другие рутины' : 'Cancels other chores'}</option>
                            </select>
                          </div>
                        </div>

                        {/* Daydream scale Slider */}
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between items-center">
                            <label className="uppercase text-[10px] tracking-wide text-neutral-500">{t(lang, 'daydreamPleasureLabel')}</label>
                            <span className="text-amber-500 font-bold">{t(lang, 'scaleValue', { val: String(editDaydream) })}</span>
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
                            {t(lang, 'daydreamExplanationDesc')}
                          </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 text-xs font-mono">
                          <button
                            type="button"
                            onClick={() => setEditingTaskId(null)}
                            className="rounded px-3 py-2 border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 uppercase cursor-pointer"
                          >
                            {t(lang, 'cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(task.id)}
                            className="rounded px-4 py-2 bg-amber-500 text-neutral-950 font-bold uppercase transition-colors cursor-pointer"
                          >
                            {t(lang, 'saveDetails')}
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
                              className="p-1 px-2 border border-neutral-800 bg-neutral-950 rounded text-[10px] font-mono tracking-wider uppercase text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer animate-none"
                              title={t(lang, 'tuneTooltip')}
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>{t(lang, 'tuneBtn')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Badges indicators row */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                          <span className="uppercase tracking-wide px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850">
                            {t(lang, 'threadLabel', { thread: dir ? translateDirectionName(dir.name, lang) : (lang === 'ru' ? 'Не назначено' : 'Unassigned') })}
                          </span>
                          <span className="uppercase tracking-wide px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850">
                            {t(lang, 'fuelLabel', { 
                              fuel: task.energy === 'low' 
                                ? (lang === 'ru' ? 'Тлею' : 'low') 
                                : task.energy === 'normal' 
                                ? (lang === 'ru' ? 'Норм' : 'normal') 
                                : (lang === 'ru' ? 'Взрываюсь' : 'high') 
                            })}
                          </span>
                          <span className="uppercase tracking-wide px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850">
                            {t(lang, 'impactLabel', { 
                              impact: task.consequence === 'irreversible' ? (lang === 'ru' ? 'Необратимый ущерб' : 'irreversible') :
                                      task.consequence === 'real_loss' ? (lang === 'ru' ? 'Реальный урон' : 'real loss') :
                                      task.consequence === 'minor' ? (lang === 'ru' ? 'Мелкая задержка' : 'minor') :
                                      (lang === 'ru' ? 'Никакого' : 'none')
                            })}
                          </span>
                          {task.affectedPerson && task.affectedPerson !== 'no one' && (
                            <span className="uppercase tracking-wide px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850 text-amber-500 font-semibold">
                              {t(lang, 'attachedLabel', { person: translatePersonName(task.affectedPerson, lang) })}
                            </span>
                          )}
                        </div>

                        {/* Basement direct actions */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-neutral-850/30 text-xs font-mono">
                          <button
                            id={`direct-bury-btn-${task.id}`}
                            onClick={() => onBuryTask(task.id)}
                            className="rounded px-3 py-1.5 border border-dashed border-neutral-800 hover:border-neutral-600 text-neutral-500 hover:text-neutral-300 uppercase transition-colors cursor-pointer"
                            title={t(lang, 'buryAsNoiseTooltip')}
                          >
                            {t(lang, 'buryAsNoise')}
                          </button>

                          <button
                            id={`direct-activate-btn-${task.id}`}
                            onClick={() => onActivateTask(task.id)}
                            className="rounded px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-amber-500 text-neutral-400 hover:text-amber-400 uppercase transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <ChevronRight className="h-3 w-3" />
                            <span>{t(lang, 'activateBtn')}</span>
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
              <h4 className="text-sm font-sans font-medium text-neutral-300">{t(lang, 'noMatchingSignals')}</h4>
              <p className="text-xs text-neutral-500 font-mono">
                {t(lang, 'cellarLooksClear')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* WEEKLY ACTIVE REVIEW TAB */}
      {activeTab === 'review' && (
        <div id="basement-review-workflow" className="space-y-6">
          <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded text-xs leading-relaxed text-amber-500 font-mono">
            <strong>{t(lang, 'activeFocusReviewHeader')}</strong> {t(lang, 'activeFocusReviewExplainer')}
          </div>

          {currentReviewTask ? (
            <div id="individual-review-task" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6 relative">
              {/* Progress dots inside loop */}
              <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
                <span>{t(lang, 'intentionReviewIndex').replace('{index}', String(reviewIndex + 1)).replace('{total}', String(reviewTasksList.length))}</span>
                <span>{t(lang, 'cellarIndex')}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-sans font-semibold text-neutral-100 leading-snug tracking-tight">
                {currentReviewTask.title}
              </h2>

              <p className="border-t border-b border-neutral-850 py-4 font-mono text-xs text-neutral-400 leading-relaxed">
                {t(lang, 'determineConsequenceHeader')}
              </p>

              {/* Action grid options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                {/* Bury Option */}
                <button
                  id="review-action-bury"
                  onClick={() => handleReviewAction('bury')}
                  className="rounded px-4 py-3.5 border border-dashed border-neutral-800 hover:border-red-900 hover:text-red-400 font-mono text-xs uppercase text-center transition-colors bg-neutral-950 cursor-pointer"
                >
                  {t(lang, 'buryNoiseWin')}
                </button>

                {/* Keep Frozen */}
                <button
                  id="review-action-keep"
                  onClick={() => handleReviewAction('keep')}
                  className="rounded px-4 py-3.5 border border-neutral-800 hover:border-neutral-600 text-neutral-300 font-mono text-xs uppercase text-center transition-colors bg-neutral-950 cursor-pointer"
                >
                  {t(lang, 'keepFrozen')}
                </button>

                {/* Promote / Activate */}
                <button
                  id="review-action-activate"
                  onClick={() => handleReviewAction('activate')}
                  className="rounded px-4 py-3.5 bg-amber-500 text-neutral-950 font-mono text-xs font-bold uppercase text-center transition-colors cursor-pointer"
                >
                  {t(lang, 'promoteToActive')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-850 rounded-lg p-10 text-center space-y-4">
              <ShieldCheck className="h-9 w-9 text-emerald-500 mx-auto" strokeWidth={1.5} />
              <h3 className="text-base font-sans font-medium text-neutral-200">
                {t(lang, 'weeklyReviewSecured')}
              </h3>
              <p className="text-xs text-neutral-400 font-mono max-w-sm mx-auto leading-relaxed">
                {t(lang, 'noActiveInReviewQueue')}
              </p>
              <button
                onClick={() => setActiveTab('basement')}
                className="mt-2 px-4 py-2 bg-neutral-950 border border-neutral-805 hover:text-amber-400 text-xs font-mono uppercase rounded transition-colors cursor-pointer"
              >
                {t(lang, 'backToCellarList')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
