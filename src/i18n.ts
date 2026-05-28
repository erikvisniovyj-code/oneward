export type Language = 'ru' | 'en';

export function translateDirectionName(name: string, lang: Language): string {
  if (lang === 'en') return name;
  const lower = name.toLowerCase();
  if (lower === 'work') return 'Работа';
  if (lower === 'family') return 'Семья';
  if (lower === 'health') return 'Здоровье';
  if (lower === 'relocation') return 'Переезд';
  if (lower === 'english') return 'Английский';
  if (lower === 'finance') return 'Финансы';
  if (lower === 'games club') return 'Игровой клуб';
  if (lower === 'travel') return 'Путешествия';
  return name;
}

export function translatePersonName(name: string, lang: Language): string {
  if (lang === 'en') return name;
  const lower = name.toLowerCase();
  if (lower === 'son') return 'Сын';
  if (lower === 'wife') return 'Жена';
  if (lower === 'neighbor') return 'Сосед';
  if (lower === 'myself') return 'Себя';
  if (lower === 'no one') return 'Никого';
  return name;
}

export function getRussianPlural(number: number, one: string, two: string, five: string): string {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
}

export function formatDays(days: number, lang: Language): string {
  if (lang === 'en') {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  const plural = getRussianPlural(days, 'день', 'дня', 'дней');
  return `${days} ${plural}`;
}

export function formatYears(years: number, lang: Language): string {
  if (lang === 'en') {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  const plural = getRussianPlural(Math.floor(years), 'год', 'года', 'лет');
  return `${years} ${plural}`;
}

export function formatMonths(months: number, lang: Language): string {
  if (lang === 'en') {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const plural = getRussianPlural(Math.floor(months), 'месяц', 'месяца', 'месяцев');
  return `${months} ${plural}`;
}

export function formatWaitDuration(days: number, lang: Language): string {
  if (days >= 365) {
    const years = +(days / 365).toFixed(1);
    return formatYears(years, lang);
  }
  if (days >= 30) {
    const months = +(days / 30).toFixed(1);
    return formatMonths(months, lang);
  }
  return formatDays(days, lang);
}

export function t(lang: Language, key: keyof typeof translations['ru'], replacements?: Record<string, string | number>): string {
  const dict = translations[lang] || translations['ru'];
  let text = dict[key] || translations['ru'][key] || String(key);
  if (replacements) {
    Object.entries(replacements).forEach(([k, val]) => {
      text = text.replace(`{${k}}`, String(val));
    });
  }
  return text;
}

export const translations = {
  ru: {
    // Today Applet Keys
    suggestionsEngineTitle: 'Двигатель рекомендаций',
    suggestionsEngineDesc: 'Один единственный шаг. Никаких списков, никакого блуждания по планам.',
    questionFuelLevel: 'Каков уровень твоего когнитивного топлива?',
    matchingComplexity: 'Соответствие сложности задачи текущему запасу сил снижает внутреннее сопротивление.',
    frogModeButtonDirect: 'Или сразу запустить Режим лягушки',
    frogModeActivePrefix: 'Режим лягушки: ВКЛ',
    fuelLevelPrefix: 'Запас сил: {level}',
    resetFuelButton: 'Сбросить топливо',
    frogModeExplainer: 'Запуск в Режиме лягушки в обход уровня энергии выводит самое старое из важных дел. Расправа с ним делает твой день.',
    impactsPrefix: 'Влияет на: {person}',
    consequenceHeader: 'Последствия:',
    startTimer: 'Начать (2 минуты)',
    noActiveSignals: 'Нет активных дел по этому фильтру',

    // Timer Execution
    timerIgnitionSubtitle: 'Всего две минуты. Просто начни. Сопротивление возникает только на старте.',
    timerFlow60: 'Настоящий спринт! Ты полностью отбросил прокрастинацию и вторые мысли.',
    timerFlow30: 'Ты в потоке. Препятствия растворились.',
    timerDeepFocus: 'Глубокий фокус активирован. Продолжай в том же духе!',
    timerFlowSubtitle: 'Запуск успешен. Теперь ты в состоянии потока.',
    movedToDoneLog: 'перенесено в лог выполненного. Никаких праздных фантазий, только чистая реализация.',
    movingBackShortly: 'Возврат к рекомендациям через три секунды...',

    // Mirror Dashboard
    mirrorScreenTitle: 'Зеркало',
    mirrorScreenDesc: 'Доказательство прогресса. Никаких иллюзий, только реальные шаги.',
    primaryFocusMetric: 'Основная метрика фокуса',
    keepWeightCloseToZero: 'Твоя главная цель — держать этот вес как можно ближе к нулю. Выполнение старых откладываемых дел освобождает важную оперативную память.',
    acknowledgeDetails: 'Признай дела, на которые ты никогда не выделишь фокус.',
    buryingUnneededDreams: 'Погребение ненужных мечтаний и очистка списка дел — главный признак калибровки внимания. Отказ от шума приносит столько же пользы, сколько выполнение полезных дел.',
    selfComparisonRhythms: 'Ритмы самосравнения',
    completed: 'выполнено',
    completedHibernateThirtyDays: 'Выполненные дела, которые находились в спячке более 30 дней перед реализацией:',
    noLongHibernate: 'Пока нет завершённых долгостроев. Победи своё старейшее активное дело, чтобы разблокировать эту категорию.',
    tracksCoreDirections: 'Показывает, какие ключевые направления получали энергию от совершённых действий на этой неделе:',
    waitedDaysPrefix: 'ждало {days}',

    // Basement & Backlog
    basementScreenTitle: 'Подвал',
    basementScreenDesc: 'Все припаркованные намерения хранятся здесь. Освободи свой разум.',
    reviewActive: 'Активен',
    filterIntentionsPlaceholder: 'Фильтровать отложенные намерения...',
    directionLabel: 'Направление',
    staminaFuelLabel: 'Запас сил',
    inactionBreakdownLabel: 'Последствия бездействия',
    leverageLevelLabel: 'Уровень рычага',
    daydreamPleasureLabel: 'Приятное предвкушение (Ловушка планирования)',
    scaleValue: 'уровень {val} из 5',
    daydreamExplanationDesc: 'Высокие значения означают дела, вызывающие ложное чувство удовлетворения. Система занижает их приоритет, защищая от ловушек планирования.',
    saveDetails: 'Сохранить детали',
    tuneTooltip: 'Настроить веса метаданных вручную',
    tuneBtn: 'Настроить',
    fuelLabel: 'Топливо: {fuel}',
    impactLabel: 'Влияние: {impact}',
    attachedLabel: 'Коснётся: {person}',
    buryAsNoiseTooltip: 'Признать это шумом и отпустить насовсем',
    activateBtn: 'Активировать',
    cellarLooksClear: 'В подвале ничего не найдено по этому критерию.',
    activeFocusReviewHeader: 'Разбор активного фокуса:',
    activeFocusReviewExplainer: 'Мы выбрали от 3 до 5 дел из подвала для разбора. По каждому примите решение немедленно — активируйте или отпустите.',
    intentionReviewIndex: 'РАЗБОР НАМЕРЕНИЙ: {index} ИЗ {total}',
    cellarIndex: 'Индекс подвала',
    determineConsequenceHeader: 'Оцени последствия: если полностью проигнорировать это занятие, пострадает ли реальная жизнь? Либо это просто пустые мечты?',
    buryNoiseWin: 'В подвал (Победа над шумом)',
    keepFrozen: 'Оставить в подвале',
    promoteToActive: 'Вытащить в активные',
    weeklyReviewSecured: 'Еженедельный разбор завершён',
    noActiveInReviewQueue: 'В очереди разбора не осталось дел. Продолжайте убирать в подвал или выполнять активные дела на панели «Сегодня».',
    backToCellarList: 'Вернуться к списку дел',

    // Coach Custom
    coachMorning: 'Утро. Резервуар силы воли полон. Выберите вкладку Сегодня, отбросьте планирование и вгрызайтесь в предложенное дело.',
    coachEvening: 'Солнце село. Ничего не делать — это нормально. Отключите мозг, отдохните и начните с новыми силами завтра.',
    coachBase: 'Compass: Одно конкретное действие — единственная связь между мыслью и реальностью.',
    coachOneCompleted: 'Отлично. День твой. Остальное подождёт.',
    coachMultipleCompleted: 'Импульс действий поддерживается. Не перегружайте батарейку, обеспечьте себе качественный отдых.',

    appName: 'Compass',
    microPrototype: 'Микро-прототип',
    capture: 'Припарковать',
    today: 'Сегодня',
    mirror: 'Зеркало',
    basement: 'Подвал',
    executionLock: 'Блокировка выполнения активна',
    tweakParams: 'Настроить параметры Compass',
    configWeights: 'Настройка весов параметров v1',
    settingsCategoryDirections: 'Ключевые направления жизни (макс. 3 активных)',
    settingsCategoryDirectionsDesc: 'Ограничьте число активных приоритетов до трёх. Задачи из спящих направлений получат огромный штраф в предложении на сегодня.',
    settingsCategoryPeople: 'Список связанных людей',
    settingsCategoryPeopleDesc: 'Определите круг лиц для привязки к задачам. Привязка дела к реальному человеку уничтожает пустую иллюзию планирования.',
    addBtn: 'Добавить',
    directionPlaceholder: 'Название направления',
    personPlaceholder: 'Например, Дочь, Сосед',
    maxDirectionsError: 'Максимум 3 активных направления разрешено одновременно, чтобы избежать распыления внимания.',
    duplicateDirectionError: 'Направление с таким названием уже существует.',
    duplicatePersonError: 'Человек с таким именем уже добавлен.',
    lowEnergy: 'Тлею',
    normalEnergy: 'Норм',
    highEnergy: 'Взрываюсь',
    energyPrompt: 'Каков ваш текущий уровень когнитивного топлива?',
    energySubtitle: 'Сопоставление сложности задачи с текущей ментальной энергией снижает сопротивление к действию.',
    orToggleFrogMode: 'Или активировать Режим лягушки напрямую',
    frogModeActive: 'Режим лягушки активен',
    frogModeDesc: 'Игнорирует уровень энергии, чтобы предложить самое трудное и самое старое важное дело из подвала. Преодоление этого блока высвобождает тонну энергии.',
    activateFrogMode: 'Включить Режим лягушки',
    deactivateFrogMode: 'Выключить Режим лягушки',
    resetFuel: 'Сбросить топливо',
    changeFuelLevel: 'Изменить уровень энергии',
    waitingTag: 'Ожидает',
    impactsTag: 'Коснётся:',
    notNow: 'Не сейчас',
    startTwoMinutes: 'Начать (2 минуты)',
    emptyActiveSignals: 'Нет активных задач для этого фильтра',
    emptyActiveDesc: 'У вас есть активные дела в подвале, но ни одно из них не подходит под уровень энергии "{energy}". Попробуйте включить Режим лягушки или сбросить фильтр энергии.',
    emptyNoActiveDescForReal: 'Все ваши намерения выполнены или заморожены. Разберите подвал, чтобы продвинуть намерения в работу, или припаркуйте новое дело.',
    toggleFrogDirectly: 'Включить Режим лягушки напрямую',

    // Execute Screen
    activeFocus: 'Активный фокус',
    ignitionCountdown: 'Обратный отчёт зажигания',
    flowStopwatchActive: 'Секундомер потока активен',
    flowLabel30: 'Вы в потоке. Сопротивление растворилось.',
    flowLabel60: 'Настоящий спринт. Вы полностью победили прокрастинацию.',
    flowLabel10: 'Глубокий фокус активирован. Продолжайте движение.',
    flowLabelIgnition: 'Только две минуты. Главное начать. Трудность лишь в старте.',
    flowLabelSuccess: 'Зажигание успешно. Вы вошли в состояние потока.',
    loggedMilestones: 'Зафиксированные вехи:',
    milestoneDescriptionLabel: 'Описание вехи:',
    milestonePlaceholder: 'Какой прогресс вы только что зафиксировали?',
    cancel: 'Отмена',
    log: 'Записать',
    stop: 'Остановить',
    milestone: 'Веха',
    done: 'Готово',
    skipIgnition: 'Пропустить 2 мин зажигания (тест)',
    taskCompleted: 'Дело завершено',
    actionSecured: 'Действие выполнено.',
    actionSecuredDesc: 'перенесено в лог готовых дел. Никаких пустых мечтаний — только чистое действие.',
    activeStreak: 'Активная серия:',
    streakDays: 'дней подряд',
    returningToSuggestion: 'Возвращение к предложениям...',

    // Capture Screen
    captureTitle: 'Припарковать трение',
    captureSubtitle: 'Подвал сбережет ваши мысли, чтобы разум мог отдохнуть. Действие покупает мечту.',
    taskInputPlaceholder: 'Какое дело нужно припарковать?',
    tapToSpeak: 'Нажмите, чтобы говорить',
    listening: 'Слушаю...',
    parkIt: 'Припарковать',
    silentConfirmation: 'Тихое сохранение',
    storedQuietly: 'сохранено без шума.',
    affectedQuestion: 'Кого это коснётся, если не сделаешь?',
    affectedDesc: 'Связь последствий с живыми людьми разрушает фальшивую мотивацию.',
    parkedAndFrozen: 'Припарковано и заморожено в подвале.',
    parkedAndConnected: 'Припарковано. Коснётся: {person}.',
    parkedAndConnectedSelf: 'Припарковано. Сделаете для себя.',

    // Backlog Screen
    basementTitle: 'Подвал',
    basementSubtitle: 'Все припаркованные намерения хранятся здесь. Разгрузите мозг.',
    parkedSignalsTab: 'Припаркованные намерения',
    reviewBasementTab: 'Разбор подвала',
    activeReviewBadge: 'Активен',
    filterPlaceholder: 'Фильтровать припаркованное...',
    tuneMetadataBtn: 'Настроить',
    saveDetailsBtn: 'Сохранить настройки',
    threadLabel: 'Направление',
    staminaLabel: 'Топливо',
    inactionLabel: 'Последствия бездействия',
    leverageLabel: 'Эффект рычага',
    daydreamLabel: 'Приятность мечтаний',
    daydreamDesc: 'Высокий балл означает дела, о которых приятно просто фантазировать. Система немного занизит их приоритет, чтобы защитить от ментальной ловушки.',
    unassigned: 'Не определено',
    buryAsNoise: 'Списать в шум',
    activate: 'В работу',
    noMatchingSignals: 'Совпадений не найдено',
    cellarClearDesc: 'В подвале чисто.',
    reviewBannerTitle: 'Активный разбор:',
    reviewBannerDesc: 'Мы отобрали 3-5 ваших старых намерений. Сделайте выбор по каждому сейчас. Не копите папки без решений.',
    reviewProgress: 'РАЗБОР НАМЕРЕНИЙ: {current} ИЗ {total}',
    reviewCellarIndex: 'Индекс подвала',
    reviewDetermineConsequence: 'Определите последствия: Если вы просто проигнорируете это дело, пострадает ли что-то действительно важное? Или это был просто пустой шум?',
    reviewBuryAction: 'Списать в шум (Победа над шумом)',
    reviewKeepAction: 'Оставить в подвале',
    reviewPromoteAction: 'Продвинуть в работу',
    reviewNoTasksTitle: 'Разбор подвала завершён',
    reviewNoTasksDesc: 'В очереди разбора больше нет зависших намерений. Продолжайте вычищать незавершённые дела на сегодня.',
    backToCellar: 'К списку подвала',

    // Mirror Screen
    mirrorTitle: 'Зеркало',
    mirrorSubtitle: 'Доказательство прогресса. Никаких иллюзий, только записанные шаги.',
    headlineMetricTitle: 'Главная метрика фокуса',
    oldestActionWeight: 'Вес самого старого дела',
    daysDelayNow: 'дней откладывания',
    historicalRecord: 'Исторический рекорд: {days} дн.',
    resistedBlockDecreased: 'Стена сопротивления рушится!',
    oldestActionDesc: 'Ваша главная цель — держать эту цифру как можно ближе к нулю. Завершение старых откладываемых дел освобождает тонны ментальной оперативной памяти.',
    redundancyFilter: 'Очистка от лишнего',
    noiseReleased: 'Отпущено шума',
    tasksDissolved: 'дел списано',
    acknowledgeUnneeded: 'Признание лишних дел.',
    noiseReleasedDesc: 'Списание ненужных мечтаний и очистка ваших планов — важнейший признак калибровки внимания. Отпуск шума ценится так же высоко, как выполнение задач.',
    selfComparisonTitle: 'Сравнение периодов',
    thisWeek: 'Эта неделя',
    thisMonth: 'Этот месяц',
    lastMonth: 'Прошлый месяц',
    referenceStandard: 'эталон сравнения',
    comparisonPaceKeeping: 'Вы держите темп! За этот месяц вы одолели {thisMonth} дел по сравнению с {lastMonth} в прошлый раз. Импульс фокуса нарастает.',
    comparisonPaceBehind: 'Вы закрыли {thisMonth} дел против {lastMonth} в прошлый период. Сопротивление берёт верх, найдите самое старое важное дело во вкладке Сегодня.',
    deepResistanceDissolved: 'Растопленный блок сопротивления',
    longAvoidedDesc: 'Выполненные важные дела, которые пролежали в спячке более 30 дней перед исполнением:',
    noLongAvoidedYet: 'Ни одного долго висевшего дела пока не выполнено. Победа над самым старым активным делом откроет этот раздел!',
    lifeThreadDistribution: 'Энергия по направлениям',
    lifeThreadDesc: 'Направления жизни, получившие когнитивную энергию от выполненных действий на этой неделе:',
    actionsThisWeek: 'действий на этой неделе',
    dormantLabel: 'Спящий',

    // Coach Component & Messages
    coachPrefix: 'Инструктор Compass:',
    coachConcept: 'Compass: Одно конкретное действие — единственная связь между мыслью и реальностью.',
    completedTodayOne: 'Отлично. День твой. Остальное подождёт.',
    completedTodayMultiple: 'Импульс действий поддерживается. Не перегружайте батарейку, обеспечьте себе качественный отдых.',
    streakWarmMessage: 'Выдающаяся серия из {streak} дней подряд. Вы управляете своим вниманием. Попробуйте взять вызов поинтереснее.',
    eveningNothingDone: 'Солнце село. Ничего не делать — это нормально. Отключите мозг, отдохните и начните с новыми силами завтра.',
    morningWillpower: 'Утро. Резервуар силы воли полон. Выберите вкладку Сегодня, отбросьте планирование и вгрызайтесь в предложенное дело.',
    oldestUntouchedCoach: 'Дело "{title}" висит уже {days} дн. Оно действительно важно для твоей жизни — или нет? Что на самом деле мешает начать?',
    completedLongAvoidedCoach: 'Настоящая глыба повержена. Дело "{title}" лежало отложенным {days} дн., но вы взяли и сделали это. Действие разорвало порочный круг мечтаний.',
    
    // Priorities options
    nothingBreaks: 'Ничего не сломается',
    minorDelay: 'Мелкая заминка',
    realLoss: 'Реальный ущерб',
    irreversibleDamage: 'Необратимый вред',
    busywork: 'Прокрастинация',
    neutral: 'Нейтрально',
    unlocks: 'Разблокирует дело',
    cancelsOthers: 'Убирает другие рутины',
    myself: 'меня',
    noOne: 'кого-либо',
  },
  en: {
    // Today Applet Keys
    suggestionsEngineTitle: 'The Suggestions Engine',
    suggestionsEngineDesc: 'One single step. No lists to scroll, no planning loops.',
    questionFuelLevel: 'What is your current cognitive fuel level?',
    matchingComplexity: 'Matching task complexity to current neurological stamina reduces activation resistance.',
    frogModeButtonDirect: 'Or directly activate Frog Mode',
    frogModeActivePrefix: 'Frog Mode: ON',
    fuelLevelPrefix: 'Fuel level: {level}',
    resetFuelButton: 'Reset Fuel',
    frogModeExplainer: 'Bypasses energy logic to output the single absolute hardest, oldest important task in the basement first. Overcoming this wins your peak hours.',
    impactsPrefix: 'Impacts: {person}',
    consequenceHeader: 'Consequence:',
    startTimer: 'Start (2 min)',
    noActiveSignals: 'No active signals match this filter',

    // Timer Execution
    timerIgnitionSubtitle: 'Just two minutes. Only start. The friction is only in starting.',
    timerFlow60: 'This is a real sprint. You have overridden procrastination details entirely.',
    timerFlow30: 'You are in flow. The resistance has dissolved.',
    timerDeepFocus: 'Deep focus activated. Keep building momentum.',
    timerFlowSubtitle: 'Ignition succeeded. You are now in flow state.',
    movedToDoneLog: 'moved to the Done Log. No planning daydream, just pure execution.',
    movingBackShortly: 'Moving back to Suggestion Engine shortly...',

    // Mirror Dashboard
    mirrorScreenTitle: 'The Mirror',
    mirrorScreenDesc: 'Proof of progress. No illusions, only actual steps recorded.',
    primaryFocusMetric: 'Primary Focus Metric',
    keepWeightCloseToZero: 'Your single goal is keeping this weight as close to zero as humanly possible. Completing old avoided tasks frees critical cognitive memory.',
    acknowledgeDetails: 'Acknowledge details you will never focus on.',
    buryingUnneededDreams: 'Burying unneeded dreams and decluttering your agenda is a primary sign of focus calibration. Dismissing noise earns identical weight to signal execution.',
    selfComparisonRhythms: 'Self-Comparison Rhythms',
    completed: 'completed',
    completedHibernateThirtyDays: 'Completed tasks that had stayed in hibernation for more than 30 days before execution:',
    noLongHibernate: 'No long-hibernating tasks completed yet. Defeat your oldest active task to unlock this category.',
    tracksCoreDirections: 'Tracks which core directions received energy from executed actions this week:',
    waitedDaysPrefix: 'waited {days}',

    // Basement & Backlog
    basementScreenTitle: 'The basement',
    basementScreenDesc: 'All parked intentions are stored here indefinitely. Calm your brain.',
    reviewActive: 'Active',
    filterIntentionsPlaceholder: 'Filter backlogged intentions...',
    directionLabel: 'Direction',
    staminaFuelLabel: 'Stamina Fuel',
    inactionBreakdownLabel: 'Inaction Breakdown',
    leverageLevelLabel: 'Leverage Level',
    daydreamPleasureLabel: 'Daydream Pleasure (Anticipation Loop)',
    scaleValue: '{val}/5 scale',
    daydreamExplanationDesc: 'Higher scores represent actions that trigger false daydream dopamine. The engine deprioritizes these slightly to defend you against planning traps.',
    saveDetails: 'Save Details',
    tuneTooltip: 'Tune metadata weights manually',
    tuneBtn: 'Tune',
    fuelLabel: 'Fuel: {fuel}',
    impactLabel: 'Impact: {impact}',
    attachedLabel: 'Attached: {person}',
    buryAsNoiseTooltip: 'Acknowledge this was noise and release it entirely',
    activateBtn: 'Activate',
    cellarLooksClear: 'The cellar looks clear. Secure any unneeded tasks from here.',
    activeFocusReviewHeader: 'Active focus review:',
    activeFocusReviewExplainer: 'We hold 3 to 5 tasks from your cellar to examine. For each, commit or clear immediately. Avoid parking files without decisions.',
    intentionReviewIndex: 'INTENTION REVIEW: {index} OF {total}',
    cellarIndex: 'Cellar Index',
    determineConsequenceHeader: 'Determine consequence: If you choose to ignore this completely, is it really important? Or was it just daydream noise?',
    buryNoiseWin: 'Bury (Noise Win)',
    keepFrozen: 'Keep Frozen',
    promoteToActive: 'Promote to Active',
    weeklyReviewSecured: 'Weekly review process secured',
    noActiveInReviewQueue: 'No active requirements pending in your immediate review queue. Keep freezing or complete existing signals in today panel.',
    backToCellarList: 'Back to Cellar List',

    // Coach Custom
    coachMorning: 'Morning. Willpower is at peak limit. Select the Today tab, ignore planning loops, and lock in the Suggestion.',
    coachEvening: 'The sun is setting. It is acceptable if nothing got completed. Secure your mind, rest, and reset with energy tomorrow.',
    coachBase: 'Compass: One single action is the only link between intention and reality.',
    coachOneCompleted: 'Good. The day is yours. The rest can wait.',
    coachMultipleCompleted: 'Action maintains momentum. Do not overwhelm your stamina; focus on securing rest today.',

    appName: 'Compass',
    microPrototype: 'Micro Prototype',
    capture: 'Capture',
    today: 'Today',
    mirror: 'Mirror',
    basement: 'Basement',
    executionLock: 'Execution Lock Active',
    tweakParams: 'Tweak Compass Parameters',
    configWeights: 'Tweak parameters and weights v1',
    settingsCategoryDirections: 'Core life threads (Max 3 Active)',
    settingsCategoryDirectionsDesc: 'Limit active priorities to a maximum of 3 at once. All dormant direction tasks are penalized heavily inside the today suggestor.',
    settingsCategoryPeople: 'Affected People Directory',
    settingsCategoryPeopleDesc: 'Define the list of people used inside the capture questions. Tying a chore to a human element removes planning noise.',
    addBtn: 'Add',
    directionPlaceholder: 'Direction Name',
    personPlaceholder: 'E.g. Neighbor, Daughter',
    maxDirectionsError: 'Max 3 active threads are allowed at once to prevent attention fragmentation.',
    duplicateDirectionError: 'Direction with this label already exists.',
    duplicatePersonError: 'Person with this name is already configured.',
    lowEnergy: 'Smoldering',
    normalEnergy: 'Normal',
    highEnergy: 'Exploding',
    energyPrompt: 'What is your current cognitive fuel level?',
    energySubtitle: 'Matching task complexity to current neurological stamina reduces activation resistance.',
    orToggleFrogMode: 'Or directly activate Frog Mode',
    frogModeActive: 'Frog Mode active',
    frogModeDesc: 'Bypasses energy logic to output the single absolute hardest, oldest important task in the basement first. Overcoming this wins your peak hours.',
    activateFrogMode: 'Activate Frog Mode',
    deactivateFrogMode: 'Deactivate Frog Mode',
    resetFuel: 'Reset Fuel',
    changeFuelLevel: 'Change energy fuel level',
    waitingTag: 'Waiting',
    impactsTag: 'Impacts:',
    notNow: 'Not now',
    startTwoMinutes: 'Start (2 min)',
    emptyActiveSignals: 'No active signals match this filter',
    emptyActiveDesc: 'You have active tasks waiting, but none matching your selected fuel level of "{energy}". Try toggling Frog Mode or changing your fuel level.',
    emptyNoActiveDescForReal: 'All your designated tasks are currently frozen or completed. Search the basement/backlog for things to promote, or park a new action.',
    toggleFrogDirectly: 'Toggle Frog Mode directly',

    // Execute Screen
    activeFocus: 'Active Focus',
    ignitionCountdown: 'Ignition Countdown',
    flowStopwatchActive: 'Flow stopwatch active',
    flowLabel30: 'You are in flow. The resistance has dissolved.',
    flowLabel60: 'This is a real sprint. You have overridden procrastination details entirely.',
    flowLabel10: 'Deep focus activated. Keep building momentum.',
    flowLabelIgnition: 'Just two minutes. Only start. The friction is only in starting.',
    flowLabelSuccess: 'Ignition succeeded. You are now in flow state.',
    loggedMilestones: 'Logged Milestones:',
    milestoneDescriptionLabel: 'Specify milestone description:',
    milestonePlaceholder: 'What progress did you just secure?',
    cancel: 'Cancel',
    log: 'Log',
    stop: 'Stop',
    milestone: 'Milestone',
    done: 'Done',
    skipIgnition: 'Skip 2M Ignition (Test Shortcut)',
    taskCompleted: 'Task Completed',
    actionSecured: 'Action secured.',
    actionSecuredDesc: 'moved to the Done Log. No planning daydream, just pure execution.',
    activeStreak: 'Active streak:',
    streakDays: 'continuous days',
    returningToSuggestion: 'Moving back to Suggestion Engine shortly...',

    // Capture Screen
    captureTitle: 'Capture the Friction',
    captureSubtitle: 'The basement keeps your thoughts safe so your mind can rest. Action buys the dream.',
    taskInputPlaceholder: 'What task needs parking?',
    tapToSpeak: 'Tap to speak',
    listening: 'Listening...',
    parkIt: 'Park it',
    silentConfirmation: 'Silent Confirmation',
    storedQuietly: 'stored quietly.',
    affectedQuestion: 'Who is affected if you do not do this?',
    affectedDesc: 'Connecting consequence to human lives destroys fake motivation.',
    parkedAndFrozen: 'Parked and frozen in backlog.',
    parkedAndConnected: 'Parked. Connected to {person}.',
    parkedAndConnectedSelf: 'Parked. Made for yourself.',

    // Backlog Screen
    basementTitle: 'The basement',
    basementSubtitle: 'All parked intentions are stored here indefinitely. Calm your brain.',
    parkedSignalsTab: 'Parked Signals',
    reviewBasementTab: 'Review Basement',
    activeReviewBadge: 'Active',
    filterPlaceholder: 'Filter backlogged intentions...',
    tuneMetadataBtn: 'Tune',
    saveDetailsBtn: 'Save Details',
    threadLabel: 'Direction',
    staminaLabel: 'Stamina Fuel',
    inactionLabel: 'Inaction Breakdown',
    leverageLabel: 'Leverage Level',
    daydreamLabel: 'Daydream Pleasure (Anticipation Loop)',
    daydreamDesc: 'Higher scores represent actions that trigger false daydream dopamine. The engine deprioritizes these slightly to defend you against planning traps.',
    unassigned: 'Unassigned',
    buryAsNoise: 'Bury as Noise',
    activate: 'Activate',
    noMatchingSignals: 'No matching signals found',
    cellarClearDesc: 'The cellar looks clear. Secure any unneeded tasks from here.',
    reviewBannerTitle: 'Active focus review:',
    reviewBannerDesc: 'We hold 3 to 5 tasks from your cellar to examine. For each, commit or clear immediately. Avoid parking files without decisions.',
    reviewProgress: 'INTENTION REVIEW: {current} OF {total}',
    reviewCellarIndex: 'Cellar Index',
    reviewDetermineConsequence: 'Determine consequence: If you choose to ignore this completely, is it really important? Or was it just daydream noise?',
    reviewBuryAction: 'Bury (Noise Win)',
    reviewKeepAction: 'Keep Frozen',
    reviewPromoteAction: 'Promote to Active',
    reviewNoTasksTitle: 'Weekly review process secured',
    reviewNoTasksDesc: 'No active requirements pending in your immediate review queue. Keep freezing or complete existing signals in today panel.',
    backToCellar: 'Back to Cellar List',

    // Mirror Screen
    mirrorTitle: 'The Mirror',
    mirrorSubtitle: 'Proof of progress. No illusions, only actual steps recorded.',
    headlineMetricTitle: 'Primary Focus Metric',
    oldestActionWeight: 'Oldest Action Weight',
    daysDelayNow: 'days delay now',
    historicalRecord: 'Historical record: {days} days.',
    resistedBlockDecreased: 'Resisted block has decreased!',
    oldestActionDesc: 'Your single goal is keeping this weight as close to zero as humanly possible. Completing old avoided tasks frees critical cognitive memory.',
    redundancyFilter: 'Redundancy Filter',
    noiseReleased: 'Noise Released',
    tasksDissolved: 'tasks dissolved',
    acknowledgeUnneeded: 'Acknowledge details you will never focus on.',
    noiseReleasedDesc: 'Burying unneeded dreams and decluttering your agenda is a primary sign of focus calibration. Dismissing noise earns identical weight to signal execution.',
    selfComparisonTitle: 'Self-Comparison Rhythms',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    referenceStandard: 'reference standard',
    comparisonPaceKeeping: 'You are keeping pace. This month you secured {thisMonth} tasks versus {lastMonth} previously. Focus momentum is expanding.',
    comparisonPaceBehind: 'You resolved {thisMonth} tasks vs last period\'s {lastMonth}. Procrastination resistance is hovering, seek out the single oldest task in Heute screen.',
    deepResistanceDissolved: 'Deep Resistance Dissolved',
    longAvoidedDesc: 'Completed tasks that had stayed in hibernation for more than 30 days before execution:',
    noLongAvoidedYet: 'No long-hibernating tasks completed yet. Defeat your oldest active task to unlock this category.',
    lifeThreadDistribution: 'Life Thread Energy Distribution',
    lifeThreadDesc: 'Tracks which core directions received energy from executed actions this week:',
    actionsThisWeek: 'actions this week',
    dormantLabel: 'Dormant',

    // Coach Component & Messages
    coachPrefix: 'Coach Compass:',
    coachConcept: 'Compass: One single action is the only link between intention and reality.',
    completedTodayOne: 'Good. The day is yours. The rest can wait.',
    completedTodayMultiple: 'Action maintains momentum. Do not overwhelm your stamina; focus on securing rest today.',
    streakWarmMessage: 'Outstanding streak of {streak} consecutive days. Your attention stamina is solid. Consider choosing a slightly deeper challenge.',
    eveningNothingDone: 'The sun is setting. It is acceptable if nothing got completed. Secure your mind, rest, and reset with energy tomorrow.',
    morningWillpower: 'Morning. Willpower is at peak limit. Select the Today tab, ignore planning loops, and lock in the Suggestion.',
    oldestUntouchedCoach: '"{title}" has waited {days} days. Is this actually important to your life, or not? What is the specific anxiety blocking your start?',
    completedLongAvoidedCoach: 'Real block defeated. "{title}" spent {days} days avoided, but you finally executed. Action resolved the daydream loop.',
    
    // Priorities options
    nothingBreaks: 'Nothing breaks',
    minorDelay: 'Minor delay',
    realLoss: 'Real consequence',
    irreversibleDamage: 'Irreversible damage',
    busywork: 'Busywork',
    neutral: 'Neutral',
    unlocks: 'Unlocks next major step',
    cancelsOthers: 'Eliminates other requirements',
    myself: 'myself',
    noOne: 'no one',
  }
} as const;
