import type { NinjaRank } from './ninja.model';

export interface Stats {
  xp: number;
  rank?: NinjaRank;             
  missionsCompleted: number;
}
