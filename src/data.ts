import { Task, Direction, EnergyLevel, ConsequenceLevel, LeverageLevel } from './types';
import { Language, translateDirectionName, formatDays } from './i18n';

// Configurable keyword rules for inferring energy from task titles
export const ENERGY_KEYWORDS: { keywords: string[]; level: EnergyLevel }[] = [
  { keywords: ['call', 'email', 'buy', 'ask', 'ping', 'text', 'check', 'read', 'get', 'send'], level: 'low' },
  { keywords: ['fix', 'build', 'write', 'clean', 'update', 'test', 'prepare', 'setup', 'review', 'make'], level: 'normal' },
  { keywords: ['finish', 'launch', 'plan', 'design', 'conclude', 'create', 'refactor', 'solve', 'analyze'], level: 'high' }
];

// Configurable direction mapping rules
export interface DirectionRule {
  keywords: string[];
  directionName: string;
}

export const DIRECTION_KEYWORDS: DirectionRule[] = [
  { keywords: ['son', 'wife', 'kids', 'family', 'husband', 'daughter', 'dad', 'mom', 'parent', 'sister', 'brother', 'child'], directionName: 'Family' },
  { keywords: ['work', 'project', 'client', 'server', 'code', 'deploy', 'office', 'meeting', 'task', 'job', 'boss'], directionName: 'Work' },
  { keywords: ['english', 'learn', 'vocabulary', 'read book', 'speak', 'write essay', 'grammar'], directionName: 'English' },
  { keywords: ['gym', 'run', 'health', 'workout', 'stretch', 'doctor', 'sleep', 'diet', 'walk', 'vitamin'], directionName: 'Health' },
  { keywords: ['move', 'georgia', 'tbilisi', 'relocate', 'visa', 'flight', 'rent', 'apartment'], directionName: 'Relocation' },
  { keywords: ['money', 'finance', 'budget', 'tax', 'invest', 'bank', 'pay', 'billing'], directionName: 'Finance' },
  { keywords: ['game', 'club', 'chess', 'boardgame', 'dnd', 'session', 'host'], directionName: 'Games club' },
  { keywords: ['travel', 'trip', 'hotel', 'luggage', 'vacation', 'ticket', 'explore'], directionName: 'Travel' }
];

// Default life directions
export const DEFAULT_DIRECTIONS: Direction[] = [
  { id: 'dir-work', name: 'Work', active: true },
  { id: 'dir-family', name: 'Family', active: true },
  { id: 'dir-health', name: 'Health', active: true },
  { id: 'dir-relocation', name: 'Relocation', active: false },
  { id: 'dir-english', name: 'English', active: false },
  { id: 'dir-finance', name: 'Finance', active: false },
  { id: 'dir-games-club', name: 'Games club', active: false },
  { id: 'dir-travel', name: 'Travel', active: false }
];

export const DEFAULT_PEOPLE = ['son', 'wife', 'neighbor', 'myself', 'no one'];

// Helper to determine natural number of days between two dates
export function daysBetween(d1: Date, d2: Date): number {
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Auto-completion helper to infer metadata from text
export function inferMetadata(title: string, directions: Direction[]): {
  energy: EnergyLevel;
  directionId: string;
  inferredType: string;
} {
  const lowercaseTitle = title.toLowerCase();

  // 1. Infer Energy Level
  let energy: EnergyLevel = 'normal';
  for (const rule of ENERGY_KEYWORDS) {
    if (rule.keywords.some(keyword => lowercaseTitle.includes(keyword))) {
      energy = rule.level;
      break;
    }
  }

  // 2. Infer Direction ID
  let directionId = directions.find(d => d.name === 'Work')?.id || directions[0]?.id || '';
  for (const rule of DIRECTION_KEYWORDS) {
    if (rule.keywords.some(keyword => lowercaseTitle.includes(keyword))) {
      const match = directions.find(d => d.name.toLowerCase() === rule.directionName.toLowerCase());
      if (match) {
        directionId = match.id;
        break;
      }
    }
  }

  // 3. Infer Type
  let inferredType = 'normal';
  if (['call', 'email', 'buy', 'ping', 'text'].some(kw => lowercaseTitle.includes(kw))) {
    inferredType = 'lightning'; // quick task
  } else if (['daily', 'weekly', 'every'].some(kw => lowercaseTitle.includes(kw))) {
    inferredType = 'habit'; // recurring
  } else if (['finish', 'launch', 'milestone', 'plan'].some(kw => lowercaseTitle.includes(kw))) {
    inferredType = 'path'; // project progress
  }

  return { energy, directionId, inferredType };
}

// Score Calculation and Explanation generator for the Importance Engine
export function calculateTaskPriority(
  task: Task,
  directions: Direction[],
  currentDate: Date = new Date(),
  lang: Language = 'ru'
): { score: number; explanation: string } {
  const direction = directions.find(d => d.id === task.directionId);
  const isDirectionActive = direction ? direction.active : false;

  let score = 0;
  const parts: string[] = [];

  // 1. Direction state rules (Active vs Dormant)
  if (isDirectionActive) {
    score += 100;
  } else {
    // Dormant directions receive a severe penalty
    score -= 100;
  }

  // 2. Consequence of inaction (Primary driver)
  let consequenceScore = 0;
  switch (task.consequence) {
    case 'irreversible':
      consequenceScore = 150;
      break;
    case 'real_loss':
      consequenceScore = 90;
      break;
    case 'minor':
      consequenceScore = 30;
      break;
    case 'nothing':
      consequenceScore = 0;
      break;
  }
  score += consequenceScore;

  // 3. Leverage vs busywork
  let leverageScore = 0;
  switch (task.leverageLevel) {
    case 'cancels_others':
      leverageScore = 40;
      break;
    case 'unlocks':
      leverageScore = 25;
      break;
    case 'neutral':
      leverageScore = 0;
      break;
    case 'busywork':
      leverageScore = -20;
      break;
  }
  score += leverageScore;

  // 4. Age of the task (Avoidance signal)
  const taskCreatedDate = new Date(task.createdDate);
  const ageInDays = daysBetween(taskCreatedDate, currentDate);
  // Cap age score influence or scale it linearly
  const ageScore = ageInDays * 1.5;
  score += ageScore;

  // 5. Daydream anticipation pull (INVERTED signal)
  // Higher pleasurable anticipation hurts ranking slightly (keeps focus on non-daydream actual goals)
  const daydreamInvertedScore = -(task.daydreamAnticipation - 1) * 3;
  score += daydreamInvertedScore;

  // Create human-readable explanation
  if (lang === 'ru') {
    const priorityWord = score >= 120 ? 'Высокий' : score >= 40 ? 'Средний' : 'Низкий';
    parts.push(`${priorityWord} приоритет`);

    if (!isDirectionActive) {
      parts.push(`связано со спящим направлением (${direction ? translateDirectionName(direction.name, lang) : 'Неизвестно'})`);
    } else {
      parts.push(`соответствует активному направлению ${direction ? translateDirectionName(direction.name, lang) : ''}`);
    }

    if (ageInDays > 0) {
      parts.push(`ожидает уже ${formatDays(ageInDays, lang)}`);
    } else {
      parts.push('создано сегодня');
    }

    if (task.consequence === 'irreversible') {
      parts.push('необратимые последствия при игнорировании');
    } else if (task.consequence === 'real_loss') {
      parts.push('реальные последствия прокрастинации');
    } else if (task.consequence === 'minor') {
      parts.push('незначительные задержки при промедлении');
    } else {
      parts.push('нет серьёзных последствий');
    }

    if (task.leverageLevel === 'cancels_others') {
      parts.push('исключает необходимость других сложных шагов');
    } else if (task.leverageLevel === 'unlocks') {
      parts.push('открывает следующий важный этап');
    } else if (task.leverageLevel === 'busywork') {
      parts.push('является пустой суетой');
    }

    if (task.daydreamAnticipation >= 4) {
      parts.push('слегка оштрафовано из-за ловушки предвкушения');
    }

    return {
      score,
      explanation: parts.join(', ') + '.'
    };
  }

  const priorityWord = score >= 120 ? 'High' : score >= 40 ? 'Medium' : 'Low';
  
  parts.push(`${priorityWord} priority`);

  if (!isDirectionActive) {
    parts.push(`associated with a dormant thread (${direction?.name || 'Unknown'})`);
  } else {
    parts.push(`serves active direction ${direction?.name || ''}`);
  }

  if (ageInDays > 0) {
    parts.push(`waited ${ageInDays} day${ageInDays !== 1 ? 's' : ''}`);
  } else {
    parts.push('created today');
  }

  if (task.consequence === 'irreversible') {
    parts.push('irreversible impact if ignored');
  } else if (task.consequence === 'real_loss') {
    parts.push('real consequence for procrastination');
  } else if (task.consequence === 'minor') {
    parts.push('minor friction if delayed');
  } else {
    parts.push('no heavy consequence');
  }

  if (task.leverageLevel === 'cancels_others') {
    parts.push('eliminates other complex requirements');
  } else if (task.leverageLevel === 'unlocks') {
    parts.push('unlocks next major step');
  } else if (task.leverageLevel === 'busywork') {
    parts.push('is high-daydream busywork');
  }

  if (task.daydreamAnticipation >= 4) {
    parts.push('penalized slightly for high anticipation daydream trap');
  }

  return {
    score,
    explanation: parts.join(', ') + '.'
  };
}

// Generate high quality seed data representing a real user profile over time
export function getSeedTasks(directions: Direction[], currentDate: Date = new Date()): Task[] {
  const now = currentDate.getTime();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const getPastDateStr = (daysAgo: number) => {
    return new Date(now - daysAgo * ONE_DAY).toISOString();
  };

  const workDir = directions.find(d => d.name === 'Work')?.id || 'dir-work';
  const familyDir = directions.find(d => d.name === 'Family')?.id || 'dir-family';
  const healthDir = directions.find(d => d.name === 'Health')?.id || 'dir-health';
  const relocationDir = directions.find(d => d.name === 'Relocation')?.id || 'dir-relocation';
  const englishDir = directions.find(d => d.name === 'English')?.id || 'dir-english';
  const financeDir = directions.find(d => d.name === 'Finance')?.id || 'dir-finance';

  return [
    // Completed Tasks (Demonstrates proof-of-progress stats in Screen 4)
    {
      id: 'task-completed-1',
      title: 'Review and sign dental insurance coverage options',
      createdDate: getPastDateStr(45), // Waited 40 days before doing
      completedDate: getPastDateStr(5), // Completed 5 days ago (this month, this week)
      durationMinutes: 12,
      energy: 'low',
      directionId: healthDir,
      affectedPerson: 'wife',
      consequence: 'real_loss',
      buried: false,
      state: 'active',
      leverageLevel: 'neutral',
      daydreamAnticipation: 1
    },
    {
      id: 'task-completed-2',
      title: 'Write draft deployment plan for core system update',
      createdDate: getPastDateStr(14), // Waited 13 days
      completedDate: getPastDateStr(1), // Completed yesterday (this month, this week)
      durationMinutes: 42,
      energy: 'high',
      directionId: workDir,
      consequence: 'real_loss',
      buried: false,
      state: 'active',
      leverageLevel: 'unlocks',
      daydreamAnticipation: 2
    },
    {
      id: 'task-completed-3',
      title: 'Bury alternative relocation plans for Canada',
      createdDate: getPastDateStr(60),
      completedDate: getPastDateStr(10), // Completed 10 days ago (this month)
      durationMinutes: 5,
      energy: 'low',
      directionId: relocationDir,
      buried: true, // Noise release! This is measured as released!
      state: 'frozen',
      consequence: 'nothing',
      leverageLevel: 'busywork',
      daydreamAnticipation: 5
    },
    {
      id: 'task-completed-4',
      title: 'Bury unneeded luxury subscription research',
      createdDate: getPastDateStr(12),
      completedDate: getPastDateStr(2), // Completed 2 days ago
      durationMinutes: 3,
      energy: 'low',
      directionId: financeDir,
      buried: true, // Another noise release!
      state: 'frozen',
      consequence: 'nothing',
      leverageLevel: 'busywork',
      daydreamAnticipation: 4
    },
    {
      id: 'task-completed-5',
      title: 'Fix leaked radiator pipe leak under bathroom sink',
      createdDate: getPastDateStr(720), // Waited 2 years!
      completedDate: getPastDateStr(4), // Completed 4 days ago
      durationMinutes: 98,
      energy: 'normal',
      directionId: healthDir,
      affectedPerson: 'neighbor',
      consequence: 'irreversible',
      buried: false,
      state: 'active',
      leverageLevel: 'cancels_others',
      daydreamAnticipation: 1
    },

    // Active suggestions and backlog (in basement/frozen)
    {
      id: 'task-active-1',
      title: 'Book dental root canal appointment to resolve persistent pain',
      createdDate: getPastDateStr(38), // 38 days old! An avoided main task
      energy: 'normal',
      directionId: healthDir,
      affectedPerson: 'myself',
      consequence: 'irreversible', // Higher consequence!
      buried: false,
      state: 'active',
      leverageLevel: 'cancels_others',
      daydreamAnticipation: 1
    },
    {
      id: 'task-active-2',
      title: 'Submit quarterly tax filings to avoid penalties',
      createdDate: getPastDateStr(8),
      energy: 'high',
      directionId: financeDir, // Dormant direction! Decelerated in engine
      affectedPerson: 'wife',
      consequence: 'real_loss',
      buried: false,
      state: 'active',
      leverageLevel: 'neutral',
      daydreamAnticipation: 1
    },
    {
      id: 'task-active-3',
      title: 'Fix broken shelf in son room before it drops books',
      createdDate: getPastDateStr(3),
      energy: 'normal',
      directionId: familyDir,
      affectedPerson: 'son',
      consequence: 'minor',
      buried: false,
      state: 'active',
      leverageLevel: 'neutral',
      daydreamAnticipation: 2
    },
    {
      id: 'task-active-4',
      title: 'Reply to client response queries about budget overrun',
      createdDate: getPastDateStr(1),
      energy: 'low',
      directionId: workDir,
      affectedPerson: 'no one',
      consequence: 'real_loss',
      buried: false,
      state: 'active',
      leverageLevel: 'unlocks',
      daydreamAnticipation: 2
    },
    {
      id: 'task-frozen-1',
      title: 'Research English grammar books on phrasal verbs',
      createdDate: getPastDateStr(25),
      energy: 'low',
      directionId: englishDir, // dormant
      buried: false,
      state: 'frozen', // Basement
      consequence: 'nothing',
      leverageLevel: 'busywork',
      daydreamAnticipation: 4
    },
    {
      id: 'task-frozen-2',
      title: 'Draft concept document for hypothetical indie RPG',
      createdDate: getPastDateStr(40),
      energy: 'high',
      directionId: workDir,
      buried: false,
      state: 'frozen', // Basement (daydream avoidance trap)
      consequence: 'nothing',
      leverageLevel: 'busywork',
      daydreamAnticipation: 5 // Pure anticipation daydreaming!
    },
    {
      id: 'task-frozen-3',
      title: 'Buy son recommended swimming goggles',
      createdDate: getPastDateStr(10),
      energy: 'low',
      directionId: familyDir,
      affectedPerson: 'son',
      consequence: 'minor',
      buried: false,
      state: 'frozen', // Basement
      leverageLevel: 'neutral',
      daydreamAnticipation: 3
    }
  ];
}
