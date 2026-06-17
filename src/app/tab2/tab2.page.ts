import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { MissionsService } from '../core/services/missions.service';
import { AuthService } from '../core/services/auth.service';
import { MyMissionsStore } from '../core/services/my-missions.store';
import { tsushimaLoreFor } from '../core/utils/tushima-missions';

import type { Mission, MissionStatus } from '../core/models/mission.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class Tab2Page {
  missions: Mission[] = [];
  status: MissionStatus = 'ACEPTADA';

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


  async reload() {
    const username = this.auth.currentNinja?.username;
    if (!username) {
      this.missions = [];
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Cargando...' });
    await loading.present();

    try {
      const ids =
        this.status === 'ACEPTADA'
          ? await this.myStore.getAccepted(username)
          : await this.myStore.getCompleted(username);

      const all = await this.missionsService.getAllMissions();

      const idSet = new Set(ids);
      this.missions = all.filter((m) => idSet.has(m.id));
    } catch (e) {
      console.error(e);
      await this.toast('No se pudieron cargar tus misiones');
      this.missions = [];
    } finally {
      await loading.dismiss();
    }
  }

  openDetail(missionId: string) {
    this.router.navigateByUrl(`/mission/${missionId}`);
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom' });
    await t.present();
  }
  async remove(missionId: string, ev: Event) {
  ev.preventDefault();
  ev.stopPropagation();

  const username = this.auth.currentNinja?.username;
  if (!username) return;

  const loading = await this.loadingCtrl.create({ message: 'Quitando misión...' });
  await loading.present();

  try {
    await this.myStore.unaccept(username, missionId);
    await this.toast('Misión quitada de tus aceptadas');
    await this.reload();
  } catch (e) {
    console.error(e);
    await this.toast('No se pudo quitar la misión');
  } finally {
    await loading.dismiss();
  }
}

}
