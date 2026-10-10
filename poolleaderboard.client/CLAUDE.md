# Frontend CLAUDE.md

This file provides frontend-specific guidance for Claude Code when working in `poolleaderboard.client/`.

## Styling guidance

- The frontend uses **Nebular** for theming and component styling.
- When choosing colors in component SCSS, prefer Nebular theme tokens rather than hard-coded values.
- Use `@use '../../../themes.scss' as *;` at the top of component SCSS files if you need theme functions.
- Prefer `nb-theme(color-basic-200)` / `nb-theme(color-basic-300)` for subtle backgrounds.
- Pair every highlight background with a foreground token chosen for it, rather than inheriting the theme's text colour. A pale `color-primary-200` background with the inherited text is unreadable in the dark and cosmic themes (white text). Use a strong shade with its control text instead, e.g. `color-primary-700` with `text-control-color` (see the current row in `killer.component.scss`).
- Do not hardcode `rgba(...)` or fixed hex values for theme-sensitive UI elements unless you intentionally want a color that should not change with the theme.
- For text and contrast, `text-basic-color` follows the theme; the numbered `color-basic-*` shades do not invert in dark themes, so don't rely on them for text or icons.
- For muted or "dead" states (eliminated players, lost lives) mix text tokens, e.g. `color-mix(in srgb, #{nb-theme(text-hint-color)} 70%, #{nb-theme(text-basic-color)})`, rather than lowering opacity or using a light `color-basic-*` shade.
- Check new theme-sensitive styles in all three themes (`default`, `dark`, `cosmic`; see `ThemeService`) via the component showcase, aiming for WCAG AA (4.5:1 for text, 3:1 for icons).

## Component behavior

- Keep presentation logic in presenter components and state/service logic in container components.
- The component showcase routes are only registered in development (`environment.production === false`).
- If you add a new presenter, add a corresponding showcase entry under `src/app/component-showcase/`.
