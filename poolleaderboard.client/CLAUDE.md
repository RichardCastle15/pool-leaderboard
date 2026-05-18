# Frontend CLAUDE.md

This file provides frontend-specific guidance for Claude Code when working in `poolleaderboard.client/`.

## Styling guidance

- The frontend uses **Nebular** for theming and component styling.
- When choosing colors in component SCSS, prefer Nebular theme tokens rather than hard-coded values.
- Use `@use '../../../themes.scss' as *;` at the top of component SCSS files if you need theme functions.
- Prefer `nb-theme(color-primary-200)` or `nb-theme(color-primary-300)` for highlight backgrounds, and `nb-theme(color-basic-200)` / `nb-theme(color-basic-300)` for subtle backgrounds.
- Do not hardcode `rgba(...)` or fixed hex values for theme-sensitive UI elements unless you intentionally want a color that should not change with the theme.
- For text and contrast, use `nb-theme(color-basic-800)` / `nb-theme(color-basic-900)` in light themes and let Nebular handle inversion in dark themes.

## Component behavior

- Keep presentation logic in presenter components and state/service logic in container components.
- The component showcase routes are only registered in development (`environment.production === false`).
- If you add a new presenter, add a corresponding showcase entry under `src/app/component-showcase/`.
