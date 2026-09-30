# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Phillip Casingal, built with Angular 20 using standalone components and zoneless change detection. The application showcases projects, skills, certifications, and contact information.

## Common Commands

### Development
- **Start dev server**: `npm start` or `ng serve`
  - Serves at http://localhost:4200/
  - Auto-reloads on file changes

### Building
- **Production build**: `npm run build` or `ng build`
  - Output directory: `dist/`
  - Configured with output hashing and budgets (500kB warning, 1MB error)
- **Development build (watch mode)**: `npm run watch`

### Testing
- **Run unit tests**: `npm test` or `ng test`
  - Uses Karma + Jasmine test runner

### Code Generation
- **Generate component**: `ng generate component component-name`
- **See all generators**: `ng generate --help`

## Architecture

### Angular Configuration
- **Angular Version**: 20.0.0
- **Build System**: Uses `@angular/build:application` (new application builder)
- **Change Detection**: Zoneless (via `provideZonelessChangeDetection()`)
- **TypeScript**: Strict mode enabled with experimental decorators

### Application Structure
- **Entry Point**: `src/main.ts` - Bootstraps standalone `App` component
- **App shell**: `src/app/app.ts` (+ `app.html`, `app.css`) - ambient background (lazy-loaded LiquidEther WebGL), navbar, `<router-outlet>`, footer, certificate viewer
- **Configuration**: `src/app/app.config.ts` - zoneless change detection, router with component input binding and anchor scrolling
- **Routing**: `src/app/app.routes.ts` - single `Home` route. Case studies open on the same route via `/?project=<slug>` (no server rewrites needed on Vercel)
- **Content**: `src/app/data/portfolio.data.ts` - single source of truth for profile, projects, tech stack, experience and certifications. Only add facts backed by the CV or certificates.

### Folders
- `layout/navbar` - top nav + mobile drawer, active-section highlight
- `pages/home` - composes the sections, scroll-spy, renders `ProjectDetail` via `@defer`
- `sections/*` - hero, about, projects, project-detail, tech-stack, experience, certifications, contact
- `shared/*` - `ProjectCard`, `SectionHeader`, `RevealDirective`, `CertViewer` (native `<dialog>`), `ActiveSectionService`, motion helpers

### Effects
- Vanilla effect classes live in `src/app/*.ts` (`liquid-ether-full`, `chroma-grid`, `profile-card-tilt`, plus currently unused `blur-text`, `typewriter`, `card-swap`, `lanyard-drag`, `profile-card`)
- Heavy ones are dynamically imported (Three.js, GSAP) and skipped under `prefers-reduced-motion`; pointer effects only on hover-capable devices

### Styling Approach
- Design tokens (colors, radii, spacing, fonts) and shared primitives (`.btn`, `.chip`, `.card`, `.eyebrow`, `.reveal`) in `src/styles.css`
- Component styles live next to each component
- Inter + JetBrains Mono (Google Fonts) and Font Awesome 6.4.0 (CDN), both loaded in `src/index.html`

### Assets
- `public/projects/*.jpg` and `public/certs/*.jpg` are optimized JPEGs extracted from the original SVG exports (originals kept in `public/`)
- `public/profile-portrait.jpg` is the hero portrait slot; a monogram shows until it exists
- CV served from `public/Casingal_John_Phillip_CV.pdf`
