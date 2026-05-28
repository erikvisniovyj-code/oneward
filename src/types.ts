export type EnergyLevel = 'low' | 'normal' | 'high';

export type ConsequenceLevel = 'nothing' | 'minor' | 'real_loss' | 'irreversible';

export type LeverageLevel = 'busywork' | 'neutral' | 'unlocks' | 'cancels_others';

export interface Task {
  id: string;
  title: string;
  createdDate: string; // ISO String
  completedDate?: string; // ISO String when finished
  durationMinutes?: number; // How long was spent on the task
  energy: EnergyLevel;
  directionId: string;
  affectedPerson?: string;
  consequence: ConsequenceLevel;
  buried: boolean; // Burying is celebrated as dismissing noise
  state: 'frozen' | 'active'; // Frozen in basement, active for suggestion
  leverageLevel: LeverageLevel;
  daydreamAnticipation: number; // 1-5, higher moves slightly lower to avoid daydream trap
  milestones?: string[]; // Logged progress during execute mode
}

export interface Direction {
  id: string;
  name: string;
  active: boolean; // maximum of 3 are active at any time, others are dormant
}

export type ScreenType = 'capture' | 'today' | 'execute' | 'mirror' | 'backlog';

export interface AppState {
  tasks: Task[];
  directions: Direction[];
  people: string[];
  activeScreen: ScreenType;
  currentEnergy: EnergyLevel;
  executingTaskId: string | null;
  frogMode: boolean;
  streakCount: number;
}
