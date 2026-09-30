import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // `?project=` binds straight to Home's `project` input.
      withComponentInputBinding(),
      // Nav links scroll to their #fragment; opening/closing a case study leaves the page where it was.
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'disabled' }),
      // Clicking the link for the section you're already on still scrolls to it.
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    )
  ]
};
