export type NinjaRank = 'Genin' | 'Chunin' | 'Jonin' | 'ANBU' | 'Hokage';

export interface Ninja {
  id: string;
  username: string;
  rank: NinjaRank;
  xp?: number;
}
