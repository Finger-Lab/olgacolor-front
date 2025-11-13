import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from './shared/custom-paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withHashLocation(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideCharts(withDefaultRegisterables()),
    provideStorage(() => getStorage()),
    {
      provide: TranslateLoader,
      useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
      deps: [HttpClient]
    },
    ...TranslateModule.forRoot({
      defaultLanguage: 'pt',
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
        deps: [HttpClient]
      }
    }).providers!,
    provideFirebaseApp(() => initializeApp({
      projectId: "olgacolor-5ed0f",
      appId: "1:233409123677:web:d8ee6c9736663b65bac4b4",
      storageBucket: "olgacolor-5ed0f.firebasestorage.app",
      apiKey: "AIzaSyCBwotnNHxhfh78y3R7mpvGRT_SSmhm4j4",
      authDomain: "olgacolor-5ed0f.firebaseapp.com",
      messagingSenderId: "233409123677",
      measurementId: "G-2J9VZ9TTEB"
    })),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl }
  ]
};