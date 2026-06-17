import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

import { addIcons } from 'ionicons';
import {
  listOutline,
  personOutline,
  trailSignOutline,
  refreshOutline,
  refresh,
  arrowBackOutline,
  leafOutline,
  cashOutline,
  personCircleOutline,
  logOutOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule],
  templateUrl: 'app.component.html',
})
export class AppComponent {
  constructor(private auth: AuthService, private router: Router) {

    addIcons({
      'list-outline': listOutline,
      'person-outline': personOutline,
      'trail-sign-outline': trailSignOutline,
      'refresh-outline': refreshOutline,
      refresh,
      'arrow-back-outline': arrowBackOutline,
      'leaf-outline': leafOutline,
      'cash-outline': cashOutline,
      'person-circle-outline': personCircleOutline,
      'log-out-outline': logOutOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
    });

    this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    await this.auth.initSession();

    if (this.auth.isLogged) {
      await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    } else {
      await this.router.navigateByUrl('/auth', { replaceUrl: true });
    }
  }
}
