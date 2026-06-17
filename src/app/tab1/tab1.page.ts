import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { MissionsService } from '../core/services/missions.service';
import { AuthService } from '../core/services/auth.service';

import type { Mission, MissionRank, MissionStatus } from '../core/models/mission.model';
import { canAcceptMission, rankColor } from '../core/utils/rank.utils';
import { MyMissionsStore } from '../core/services/my-missions.store';
import { tsushimaLoreFor } from '../core/utils/tushima-missions';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class Tab1Page {

  status: MissionStatus = 'DISPONIBLE';
  rank: '' | MissionRank = '';
  ranks: MissionRank[] = ['D', 'C', 'B', 'A', 'S'];

  all: Mission[] = [];
  missions: Mission[] = [];

  constructor(
    private missionsService: MissionsService,
    private auth: AuthService,
    private myStore: MyMissionsStore,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    this.reload();
  }

  loreTitle(m: Mission): string {
  return tsushimaLoreFor(m.id, m.rankRequirement).title;
}

loreDesc(m: Mission): string {
  return tsushimaLoreFor(m.id, m.rankRequirement).description;
}


 async reload(event?: any) {
  const loading = !event ? await this.loadingCtrl.create({ message: 'Cargando misiones...' }) : null;
  if (loading) await loading.present();

  try {
    this.all = await this.missionsService.getAllMissions();
    this.applyFilters();
  } catch (e: any) {
    console.error(e);

    if (e?.status === 401) {
      await this.auth.logout();
      await this.toast('Sesión caducada. Vuelve a iniciar sesión.');
      await this.router.navigateByUrl('/auth', { replaceUrl: true });
      return;
    }

    if (e?.status === 403) {
      await this.toast('No permitido (403). Revisa permisos / token / backend.');
    } else {
      await this.toast('No se pudieron cargar las misiones');
    }

    this.all = [];
    this.missions = [];
  } finally {
    if (loading) await loading.dismiss();
    if (event) event.target?.complete?.();
  }
}

  applyFilters() {
    const status = this.status;
    const rank = this.rank;

    this.missions = this.all
      .filter((m) => m.status === status)
      .filter((m) => !rank || m.rankRequirement === rank)
      .sort((a, b) => {
        const order: Record<MissionRank, number> = { D: 1, C: 2, B: 3, A: 4, S: 5 };
        return order[b.rankRequirement] - order[a.rankRequirement];
      });
  }



  badgeColor(rank: MissionRank) {
    return rankColor(rank);
  }

private acceptBlockReason(m: Mission): string | null {
  const ninja = this.auth.currentNinja;
  if (!ninja) return 'No hay sesión activa';

  if (m.status !== 'DISPONIBLE') {
    return `No disponible: está ${m.status}`;
  }

  if (m.acceptedByNinjaName) {
    return `Ya está tomada por ${m.acceptedByNinjaName}`;
  }

  if (!canAcceptMission(ninja.rank, m.rankRequirement)) {
    return `Rango insuficiente: necesitas ${m.rankRequirement}`;
  }

  return null; 
}

canAccept(m: Mission): boolean {
  return this.acceptBlockReason(m) === null;
}

async accept(m: Mission, ev: Event) {
  ev.preventDefault();
  ev.stopPropagation();

  const loading = await this.loadingCtrl.create({ message: 'Aceptando misión...' });
  await loading.present();

  try {
    await this.missionsService.acceptMission(m.id);

    const username = this.auth.currentNinja?.username;
    if (username) {

      await this.myStore.accept(username, m.id);
    }

    await this.toast('Misión aceptada');
    await this.router.navigateByUrl('/tabs/tab2');

  } catch (e: any) {
    console.error(e);

    if (e?.status === 401) {
      await this.auth.logout();
      await this.toast('Sesión caducada. Vuelve a iniciar sesión.');
      await this.router.navigateByUrl('/auth', { replaceUrl: true });
      return;
    }

    if (e?.status === 403) {
      await this.toast('No puedes aceptar esta misión (ya está tomada o no tienes permiso).');
      return;
    }

    if (e?.status === 409) {
      await this.toast('Esa misión ya fue aceptada por otro ninja.');
      return;
    }

    await this.toast('No se pudo aceptar la misión');
  } finally {
    await loading.dismiss();
  }
}



  openDetail(m: Mission) {
    this.router.navigateByUrl(`/mission/${m.id}`);
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
