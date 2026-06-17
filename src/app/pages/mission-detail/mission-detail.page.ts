import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';

import { MissionsService } from 'src/app/core/services/missions.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MyMissionsStore } from 'src/app/core/services/my-missions.store';
import { tsushimaLoreFor } from 'src/app/core/utils/tushima-missions';

import type { Mission } from 'src/app/core/models/mission.model';

@Component({
  selector: 'app-mission-detail',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './mission-detail.page.html',
  styleUrls: ['./mission-detail.page.scss'],
})
export class MissionDetailPage {
  missionId = '';
  mission: Mission | null = null;

  reportText = '';
  evidenceImageUrl = 'https://picsum.photos/seed/konoha/600/400';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private missionsService: MissionsService,
    private auth: AuthService,
    private myStore: MyMissionsStore,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async ionViewWillEnter(): Promise<void> {
    this.missionId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.missionId) {
      await this.toast('ID de misión inválido');
      await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
      return;
    }

    await this.loadMission();
  }

  get lore() {
  if (!this.mission) return null;
  return tsushimaLoreFor(this.mission.id, this.mission.rankRequirement);
}
  async loadMission(): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Cargando misión...' });
    await loading.present();

    try {
      this.mission = await this.missionsService.getMissionById(this.missionId);

      if (!this.mission) {
        await this.toast('No se encontró la misión');
        await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
        return;
      }
    } catch (e: any) {
      console.error(e);

      if (e?.status === 401) {
        await this.auth.logout();
        await this.toast('Sesión caducada. Vuelve a iniciar sesión.');
        await this.router.navigateByUrl('/auth', { replaceUrl: true });
        return;
      }

      if (e?.status === 403) {
        await this.toast('No permitido (403). Puede ser una restricción del servidor.');
        return;
      }

      await this.toast('Error cargando la misión');
    } finally {
      await loading.dismiss();
    }
  }

  isCompleted(): boolean {
    return this.mission?.status === 'COMPLETADA';
  }

  isAcceptedLike(): boolean {
    const st = this.mission?.status;
    return st === 'ACEPTADA' || st === 'EN_CURSO';
  }

  isMine(): boolean {
    const me = (this.auth.currentNinja?.username ?? '').trim().toLowerCase();
    const who = (this.mission?.acceptedByNinjaName ?? '').trim().toLowerCase();
    return !!me && !!who && me === who;
  }

  canReport(): boolean {
    return !!this.mission && this.isAcceptedLike() && this.isMine();
  }

  statusLabel(): string {
    const st = this.mission?.status ?? '';
    if (st === 'EN_CURSO') return 'ACEPTADA';
    return st;
  }

  async sendReport(): Promise<void> {
  const text = this.reportText.trim();
  const url = this.evidenceImageUrl.trim();

  if (!text) {
    await this.toast('Escribe un informe');
    return;
  }
  if (!url) {
    await this.toast('Añade una URL de evidencia');
    return;
  }

  const loading = await this.loadingCtrl.create({ message: 'Enviando reporte...' });
  await loading.present();

  try {
    await this.missionsService.ensureAccepted(this.missionId);

    await this.missionsService.reportMission(this.missionId, text, url);

    const username = this.auth.currentNinja?.username;
    if (username) {
      await this.myStore.markCompleted(username, this.missionId);
    }

    await this.toast('Reporte enviado ¡XP ganada!');
    await this.router.navigateByUrl('/tabs/tab2', { replaceUrl: true });
  } catch (e: any) {
    console.error(e);

    if (e?.status === 401) {
      await this.auth.logout();
      await this.toast('Sesión caducada. Vuelve a iniciar sesión.');
      await this.router.navigateByUrl('/auth', { replaceUrl: true });
      return;
    }

    if (e?.status === 403) {
      await this.toast('No permitido: esta misión no es tuya o no está aceptada por tu cuenta.');
      return;
    }

    if (e?.status === 409) {
      await this.toast('Conflicto: la misión ya fue reportada o no está en estado reportable.');
      return;
    }

    await this.toast('No se pudo enviar el reporte');
  } finally {
    await loading.dismiss();
  }
}



  async back(): Promise<void> {
    await this.router.navigateByUrl('/tabs/tab1');
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
