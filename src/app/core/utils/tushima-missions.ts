import type { MissionRank } from '../models/mission.model';

type Lore = { title: string; description: string };

const LORE_BY_RANK: Record<MissionRank, Lore[]> = {
  D: [
    { title: 'Proteger la aldea de Komoda', description: 'Un pequeño grupo de saqueadores merodea por los campos. Protege a los campesinos antes de que caiga la noche.' },
    { title: 'Escoltar a los refugiados', description: 'Varias familias huyen hacia el sur. Asegura el camino y evita emboscadas en los bosques.' },
    { title: 'Recuperar suministros robados', description: 'Han robado arroz y medicinas. Recupera los suministros antes de que la aldea pase hambre.' },
  ],
  C: [
    { title: 'Explorar campamento enemigo', description: 'Se han visto hogueras enemigas cerca del bosque. Observa sus movimientos y regresa con información.' },
    { title: 'Sabotear torre de vigilancia', description: 'Una torre mongola controla el camino principal. Actúa con sigilo y derríbala sin ser detectado.' },
    { title: 'Interceptar mensajero', description: 'Un mensajero enemigo transporta información crítica. Detén su avance y recupera los documentos.' },
  ],
  B: [
    { title: 'Eliminar patrulla mongola', description: 'Una patrulla bloquea el acceso al norte. Derrota a los invasores y libera el paso.' },
    { title: 'Defender el puente sagrado', description: 'El enemigo planea cruzar un puente estratégico. Resiste el ataque y evita la invasión.' },
    { title: 'Vengar la aldea quemada', description: 'Una aldea ha sido arrasada. Persigue a los responsables y haz justicia.' },
  ],
  A: [
    { title: 'Liberar la aldea ocupada', description: 'Los mongoles han tomado una aldea entera. Libera prisioneros y elimina a los líderes.' },
    { title: 'Asaltar fortaleza costera', description: 'Una fortaleza controla el acceso marítimo. Rompe sus defensas y destruye la base.' },
    { title: 'Proteger al monje del templo', description: 'Un monje porta conocimientos sagrados. Acompáñalo mientras el enemigo lo persigue.' },
  ],
  S: [
    { title: 'El Fantasma de Tsushima', description: 'Un general mongol lidera la invasión. Derrótalo y convierte tu nombre en leyenda.' },
    { title: 'La última resistencia', description: 'Tsushima está al borde del colapso. Defiende el último bastión contra un asalto sin piedad.' },
    { title: 'El honor del samurái', description: 'Elige entre el honor tradicional o salvar al pueblo. Tus decisiones marcarán la isla.' },
  ],
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function tsushimaLoreFor(missionId: string, rank: MissionRank): Lore {
  const list = LORE_BY_RANK[rank] ?? LORE_BY_RANK.D;
  const idx = hash(`${missionId}_${rank}`) % list.length;
  return list[idx];
}
