import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app/app.routes';
import { provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './app/Components/services/auth-interceptor.service';

bootstrapApplication(AppComponent, {
  providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideAnimations(),
      provideHttpClient(withInterceptorsFromDi()), // Habilita el uso de interceptores
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ]
}).catch(err => console.error(err));