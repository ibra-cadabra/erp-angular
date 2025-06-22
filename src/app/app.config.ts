import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { AuthInterceptor } from './services/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    )
  ]
};
