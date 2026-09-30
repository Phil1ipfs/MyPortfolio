import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

/**
 * Single page with anchor sections. Case studies open on the same route via
 * `?project=<slug>`, so deep links work without server rewrites.
 */
export const routes: Routes = [
  { path: '', component: Home, title: 'John Phillip Casingal — Mobile & Web Application Developer' },
  { path: '**', redirectTo: '' }
];
