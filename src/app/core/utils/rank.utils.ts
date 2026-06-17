import type { NinjaRank } from '../models/ninja.model';
import type { MissionRank } from '../models/mission.model';

const ninjaPower: Record<NinjaRank, number> = {
  Genin: 1,   
  Chunin: 2,  
  Jonin: 3,   
  ANBU: 4,    
  Hokage: 5,  
};

const missionPower: Record<MissionRank, number> = {
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S: 5,
};

export function canAcceptMission(ninjaRank: NinjaRank, missionRank: MissionRank): boolean {
  return ninjaPower[ninjaRank] >= missionPower[missionRank];
}

export function rankColor(
  rank: MissionRank
): 'success' | 'warning' | 'danger' | 'tertiary' | 'primary' {
  switch (rank) {
    case 'D': return 'success';
    case 'C': return 'tertiary';
    case 'B': return 'primary';
    case 'A': return 'warning';
    case 'S': return 'danger';
  }
}
