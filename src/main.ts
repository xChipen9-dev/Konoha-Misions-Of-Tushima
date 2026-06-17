import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { addIcons } from 'ionicons';
import {
  listOutline,
  trailSignOutline,
  personOutline,
  refreshOutline,
  arrowBackOutline,
  leafOutline,
  personCircleOutline,
  cashOutline,
} from 'ionicons/icons';

addIcons({
  'list-outline': listOutline,
  'trail-sign-outline': trailSignOutline,
  'person-outline': personOutline,
  'refresh-outline': refreshOutline,
  'arrow-back-outline': arrowBackOutline,
  'leaf-outline': leafOutline,
  'person-circle-outline': personCircleOutline,
  'cash-outline': cashOutline,
});

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
