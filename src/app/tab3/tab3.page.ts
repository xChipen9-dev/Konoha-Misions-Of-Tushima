import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
import { ProfileService } from '../core/services/profile.service';
import { MyMissionsStore } from '../core/services/my-missions.store';

import type { Ninja } from '../core/models/ninja.model';
import type { Stats } from '../core/models/stats.model';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class Tab3Page {
  ninja: Ninja | null = null;
  stats: Stats | null = null;
  avatarUrl = '';

  progressValue = 0;
  progressPercent = 0;

  private readonly COMPLETED_GOAL = 10;

  constructor(
    private auth: AuthService,
    private profileService: ProfileService,
    private myStore: MyMissionsStore,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async ionViewWillEnter() {
    this.ninja = this.auth.currentNinja;

    this.avatarUrl = this.ninja
      ? this.buildAvatar(this.ninja.username, this.ninja.rank)
      : '';

    await this.reload();
  }

  async reload() {
    if (!this.auth.isLogged) return;

    const loading = await this.loadingCtrl.create({ message: 'Cargando perfil...' });
    await loading.present();

    try {
      this.stats = await this.profileService.getMyStats();

      if (this.ninja && this.stats?.rank) {
        this.avatarUrl = this.buildAvatar(this.ninja.username, this.stats.rank);
      }

      const username = this.auth.currentNinja?.username;
      if (username) {
        const completedCount = await this.myStore.getCompletedCount(username);
        this.computeProgressByCompleted(completedCount, this.COMPLETED_GOAL);
      } else {
        this.computeProgressByCompleted(0, this.COMPLETED_GOAL);
      }
    } catch (e: any) {
      console.error(e);

      if (e?.status === 401) {
        await this.auth.logout();
        await this.toast('Sesión caducada. Vuelve a iniciar sesión.');
        await this.router.navigateByUrl('/auth', { replaceUrl: true });
        return;
      }

      await this.toast('No se pudieron cargar las estadísticas');
      this.stats = null;

      const username = this.auth.currentNinja?.username;
      if (username) {
        const completedCount = await this.myStore.getCompletedCount(username);
        this.computeProgressByCompleted(completedCount, this.COMPLETED_GOAL);
      } else {
        this.computeProgressByCompleted(0, this.COMPLETED_GOAL);
      }
    } finally {
      await loading.dismiss();
    }
  }

  async logout() {
    await this.auth.logout();
    await this.toast('Sesión cerrada');
    await this.router.navigateByUrl('/auth', { replaceUrl: true });
  }

  private computeProgressByCompleted(completed: number, goal: number) {
    const safeGoal = Math.max(1, goal);
    const ratio = Math.min(1, Math.max(0, completed) / safeGoal);
    this.progressValue = ratio;
    this.progressPercent = Math.round(ratio * 100);
  }

  private buildAvatar(username: string, rank: string): string {
    const rankMap: Record<string, string[]> = {
      Genin: ['genin-01.jpg', 'genin-02.jpg'],
      Chunin: ['ronin-01.jpg', 'ronin-02.jpg'],
      Jonin: ['samurai-01.jpg', 'samurai-02.jpg'],
      ANBU: ['anbu-01.jpg', 'anbu-02.jpg'],
      Hokage: ['shogun-01.jpg', 'shogun-02.jpg'],
    };

    const list = rankMap[rank] ?? ['samurai-01.jpg'];
    const hash = this.simpleHash(username);
    const file = list[hash % list.length];

    return `assets/avatars/${file}`;
  }

  private simpleHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
