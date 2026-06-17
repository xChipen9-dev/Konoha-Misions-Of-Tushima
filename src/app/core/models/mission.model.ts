export type MissionStatus = 'DISPONIBLE' | 'ACEPTADA' | 'EN_CURSO' | 'COMPLETADA';
export type MissionRank = 'D' | 'C' | 'B' | 'A' | 'S';

export interface Mission {
  id: string;
  title: string;
  description: string;

  rankRequirement: MissionRank;
  reward: number;
  status: MissionStatus;

  acceptedByNinjaName?: string | null;
  acceptedByNinjaAvatar?: string | null;
}
