import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/core/services/auth.service';
import type { NinjaRank } from 'src/app/core/models/ninja.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {
  segment: 'login' | 'register' = 'login';

  username = '';
  password = '';
  rank: NinjaRank = 'Genin';
  ranks: NinjaRank[] = ['Genin', 'Chunin', 'Jonin', 'ANBU', 'Hokage'];

  constructor(
    private auth: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async submit(): Promise<void> {
    const username = this.username.trim();
    const password = this.password.trim();

    if (!username || !password) {
      await this.toast('Rellena usuario y contraseña');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Procesando...' });
    await loading.present();

    try {
      if (this.segment === 'login') {
        await this.auth.login(username, password);
        await this.toast(`Bienvenido, ${username}`);
      } else {
        await this.auth.register(username, password, this.rank);
        await this.toast(`Ninja creado: ${username}`);
      }

      await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    } catch (e) {
      console.error(e);
      await this.toast('Error: credenciales incorrectas o backend caído');
    } finally {
      await loading.dismiss();
    }
  }

  private async toast(message: string) {
    const t = await this.toastCtrl.create({ message, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
