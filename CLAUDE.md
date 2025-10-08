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
- **Root Component**: `src/app/app.ts` - Uses separate template/style files (`app.html`, `app.css`)
- **Configuration**: `src/app/app.config.ts` - Provides router, zoneless change detection, and global error listeners
- **Routing**: `src/app/app.routes.ts` - Currently empty, single-page application with anchor navigation

### Key Implementation Details
- **Component Pattern**: Uses standalone components (no NgModule)
- **Template/Style Separation**: Root component uses external HTML template (`app.html`) and CSS (`app.css`), not inline
- **Navigation**: Implements both sticky top nav and bottom nav with anchor links (#home, #about, #contact, #projects)
- **Sections**: Home, About Me, Certifications, What I Do (projects), Skills, Contact Me
- **Assets**: Profile images, project screenshots, skill icons, and CV stored in `public/` directory

### Styling Approach
- Single main stylesheet (`src/styles.css`) for global styles
- Component-specific styles in `app.css`
- Uses Font Awesome 6.4.0 for icons (loaded via CDN)
- Implements sticky navigation with scroll-based visibility toggle

### Important Notes
- The HTML template (`app.html`) contains a full document structure including `<html>`, `<head>`, and `<body>` tags, which is unconventional for an Angular component template. This may need refactoring to follow Angular best practices.
- Application uses inline JavaScript in the template for sticky navigation functionality - consider moving to TypeScript component logic.
- No routing is configured despite having `provideRouter()` - all navigation is anchor-based within single page.
