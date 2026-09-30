import { Injectable, signal } from '@angular/core';

/** Which page section is currently in view — written by Home, read by the navbar. */
@Injectable({ providedIn: 'root' })
export class ActiveSectionService {
  readonly active = signal('home');
}
