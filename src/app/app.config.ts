// 📁 src/app/app.config.ts
import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';

import {appRoutes} from './app.routes';
import {AuthInterceptor} from './pages/interceptor/auth.interceptor';
import {loaderInterceptor} from "./pages/interceptor/loader.interceptor";

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideZoneChangeDetection({eventCoalescing: true}),
        provideRouter(appRoutes),
        provideHttpClient(
            withFetch(),
            withInterceptors([
                loaderInterceptor,
                AuthInterceptor // toujours après le loader
            ])
        )
    ]
};
