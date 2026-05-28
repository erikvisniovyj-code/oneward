import React from 'react';
import { Sparkles, EyeOff, Zap, Flame, ShieldAlert, RotateCcw } from 'lucide-react';
import { Task, Direction, EnergyLevel } from '../types';
import { calculateTaskPriority, daysBetween } from '../data';
import { Language, t, translatePersonName, translateDirectionName, formatDays } from '../i18n';

interface TodayProps {
  tasks: Task[];
  directions: Direction[];
  currentEnergy: EnergyLevel | null;
  onSetEnergy: (energy: EnergyLevel) => void;
  onResetEnergy: () => void;
  frogMode: boolean;
  onToggleFrogMode: () => void;
  onStartTask: (taskId: string) => void;
  lang: Language;
}

export default function Today({
  tasks,
  directions,
  currentEnergy,
  onSetEnergy,
  onResetEnergy,
  frogMode,
  onToggleFrogMode,
  onStartTask,
  lang
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

    if (lang === 'ru') {
      if (person) {
        const lowerPerson = person.toLowerCase();
        if (lowerPerson === 'son') {
          return 'Дело не в самой задаче. Дело в том, видит ли твой сын, что ты держишь слово, укрепляя подлинное доверие вместо пустых обещаний.';
        }
        if (lowerPerson === 'wife') {
          return 'Дело не в самой задаче. Дело в том, видит ли твоя жена, что ты держишь слово, укрепляя подлинное доверие вместо пустых обещаний.';
        }
        const mappedPerson = translatePersonName(person, lang);
        return `Дело не в рутине. Дело в том, держишь ли ты договор со следующим человеком: ${mappedPerson}, или позволяешь ему тащить на себе весь груз задержки.`;
      }

      switch (dirName.toLowerCase()) {
        case 'work':
          return 'Дело не в писанине на экране. Дело в том, создаёшь ли ты реальное призвание или тратишь часы, воображая аплодисменты вместо того, чтобы делать работу.';
        case 'family':
          return 'Дело не в сиюминутном деле. Дело в том, знает ли твоя семья, что они могут положиться на твоё слово.';
        case 'health':
          return 'Дело не в удобстве или усталости. Дело в том, уважаешь ли ты долголетие и выживание своего тела.';
        case 'finance':
          return 'Дело не в таблицах или деньгах. Дело в том, кому принадлежит твоё завтра и застраховано ли твоё будущее или заложено.';
        case 'english':
          return 'Дело не в упражнениях со словарём. Дело в расширении твоих границ, обретении лёгкости в разговоре и открытии закрытых дверей.';
        case 'relocation':
          return 'Дело не в упаковке коробок. Дело в активном создании надёжного убежища и запуске перезагрузки, которую ты так отчаянно хотел.';
        case 'games club':
          return 'Дело не в развлечениях. Дело в уважении к общению с людьми и сохранении пространства живым для своих товарищей.';
        case 'travel':
          return 'Дело не в билетах или туризме. Дело в том, чтобы держать свой дух активным, раздвигать рамки и искать истинное вдохновение.';
        default:
          return 'Дело не в рутине. Дело в том, контролируешь ли ты своё внимание или позволяешь минутному удовольствию пожирать твою жизнь.';
      }
    }

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
      const priorityInfo = calculateTaskPriority(t, directions, new Date(), lang);
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
          {t(lang, 'suggestionsEngineTitle')}
        </h1>
        <p id="today-subtitle" className="mt-3 text-sm text-neutral-400 font-mono tracking-wide">
          {t(lang, 'suggestionsEngineDesc')}
        </p>
      </div>

      {/* Energy Level Selection Panel */}
      {!currentEnergy && !frogMode ? (
        <div id="energy-selector-card" className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6 text-center">
          <h2 className="text-lg font-sans font-medium text-neutral-200">
            {t(lang, 'questionFuelLevel')}
          </h2>
          <p className="text-xs text-neutral-400 font-mono max-w-sm mx-auto">
            {t(lang, 'matchingComplexity')}
          </p>
          <div id="energy-buttons-grid" className="grid grid-cols-3 gap-3 pt-2">
            {(['low', 'normal', 'high'] as EnergyLevel[]).map((level) => (
              <button
                key={level}
                id={`energy-btn-${level}`}
                onClick={() => onSetEnergy(level)}
                className="rounded py-3 text-xs font-mono font-semibold tracking-wider text-neutral-300 bg-neutral-950 border border-neutral-850 hover:border-amber-500 hover:text-amber-400 transition-colors uppercase"
              >
                {level === 'low' 
                  ? (lang === 'ru' ? 'Тлею' : 'Low') 
                  : level === 'normal' 
                  ? (lang === 'ru' ? 'Норм' : 'Normal') 
                  : (lang === 'ru' ? 'Взрываюсь' : 'High')}
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-850 pt-5">
            <button
              onClick={onToggleFrogMode}
              className="inline-flex items-center space-x-2 text-xs font-mono tracking-wide text-neutral-500 hover:text-amber-500 transition-colors uppercase cursor-pointer"
            >
              <span>{t(lang, 'frogModeButtonDirect')}</span>
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
                  <span className="uppercase font-semibold">{t(lang, 'frogModeActivePrefix')}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-neutral-300">
                  <Zap className="h-4 w-4" />
                  <span className="uppercase">
                    {t(lang, 'fuelLevelPrefix', { 
                      level: currentEnergy === 'low' 
                        ? (lang === 'ru' ? 'Тлею' : 'low') 
                        : currentEnergy === 'normal' 
                        ? (lang === 'ru' ? 'Норм' : 'normal') 
                        : (lang === 'ru' ? 'Взрываюсь' : 'high') 
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                id="toggle-frog-btn"
                onClick={onToggleFrogMode}
                className={`transition-colors hover:text-amber-400 cursor-pointer ${frogMode ? 'text-amber-500 font-bold' : 'text-neutral-500'}`}
              >
                {frogMode ? t(lang, 'deactivateFrogMode') : t(lang, 'activateFrogMode')}
              </button>

              {!frogMode && (
                <button
                  id="reset-energy-btn"
                  onClick={onResetEnergy}
                  className="flex items-center space-x-1 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  title={t(lang, 'changeFuelLevel')}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{t(lang, 'resetFuelButton')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Prompt explaining Frog Mode on request */}
          {frogMode && (
            <div className="bg-amber-950/20 border border-amber-900/30 rounded p-3 text-xs text-amber-500/90 font-mono leading-relaxed">
              <strong>{lang === 'ru' ? 'Режим лягушки:' : 'Frog Mode active:'}</strong> {t(lang, 'frogModeExplainer')}
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
                    {lang === 'ru' 
                      ? `Ожидает ${formatDays(currentAgeDays, lang)}` 
                      : `Waiting ${currentAgeDays} day${currentAgeDays !== 1 ? 's' : ''}`}
                  </span>
                </div>
                {suggested.task.affectedPerson && suggested.task.affectedPerson !== 'no one' && (
                  <div className="flex items-center space-x-1 text-amber-400 font-semibold uppercase tracking-wider">
                    <span>{t(lang, 'impactsPrefix', { person: translatePersonName(suggested.task.affectedPerson, lang) })}</span>
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
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <ShieldAlert className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div className="text-xs font-mono text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-semibold uppercase mr-1">{t(lang, 'consequenceHeader')}</span>
                    {suggested.task.consequence === 'irreversible' && (lang === 'ru' ? 'Необратимый ущерб или упущенный поворот судьбы в случае невыполнения.' : 'Irreversible damage or major missed life-path shift if not executed.')}
                    {suggested.task.consequence === 'real_loss' && (lang === 'ru' ? 'Реальные потери, немедленные неприятности или эмоциональный долг.' : 'Real loss, immediate friction, or emotional debt.')}
                    {suggested.task.consequence === 'minor' && (lang === 'ru' ? 'Незначительные неудобства или просто задержки во второстепенных делах.' : 'Minor annoyance or secondary backlog delays only.')}
                    {suggested.task.consequence === 'nothing' && (lang === 'ru' ? 'Никаких внешних последствий. Это дело чисто для личного порядка.' : 'No external impact. It is purely personal maintenance.')}
                  </div>
                </div>

                <div className="text-xs font-mono text-neutral-500 leading-relaxed bg-black/20 p-2.5 rounded border border-neutral-850/50">
                  <span className="text-neutral-400 font-semibold uppercase mr-1">{lang === 'ru' ? 'Обоснование приоритета:' : 'Score justification:'}</span>
                  {suggested.priorityInfo.explanation}
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-850">
                <button
                  id="skip-task-btn"
                  onClick={handleNotNow}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-neutral-800 rounded-md text-sm font-semibold text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors uppercase font-mono tracking-wider bg-neutral-950 cursor-pointer"
                >
                  {t(lang, 'notNow')}
                </button>
                <button
                  id="start-task-btn"
                  onClick={() => onStartTask(suggested.task.id)}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-md text-sm font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 transition-colors uppercase tracking-wider shadow-lg hover:shadow-amber-500/10 cursor-pointer"
                >
                  {t(lang, 'startTimer')}
                </button>
              </div>
            </div>
          ) : (
            <div id="empty-suggested-card" className="bg-neutral-900 border border-neutral-800 rounded-lg p-10 text-center space-y-4">
              <EyeOff className="h-8 w-8 text-neutral-600 mx-auto" />
              <h3 className="text-base font-sans font-medium text-neutral-200">
                {t(lang, 'noActiveSignals')}
              </h3>
              <p className="text-xs text-neutral-400 font-mono max-w-sm mx-auto leading-relaxed">
                {activeUncompletedTasks.length > 0
                  ? (lang === 'ru' 
                      ? 'У вас есть активные дела в очереди, но ни одно не соответствует выбранному запасу сил. Кликните Режим лягушки или измените запас сил.' 
                      : `You have active tasks waiting, but none matching your selected fuel level of "${currentEnergy}". Try toggling Frog Mode or changing your fuel level.`)
                  : (lang === 'ru' 
                      ? 'Все запланированные дела выполнены или находятся в спящем режиме в подвале. Найдите дела в подвале подвала для активации, либо припаркуйте новые.' 
                      : 'All your designated tasks are currently frozen or completed. Search the basement/backlog for things to promote, or park a new action.')}
              </p>
              {activeUncompletedTasks.length > 0 && !frogMode && (
                <button
                  id="empty-suggest-toggle-frog"
                  onClick={onToggleFrogMode}
                  className="inline-flex px-4 py-2 border border-neutral-800 hover:border-amber-500 hover:text-amber-400 rounded text-xs font-mono tracking-wide text-neutral-400 bg-neutral-950 uppercase cursor-pointer"
                >
                  {lang === 'ru' ? 'Включить Режим лягушки напрямую' : 'Toggle Frog Mode directly'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
