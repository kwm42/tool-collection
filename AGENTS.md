# AGENTS.md - Agent Coding Guidelines

Multi-tool collection with web tools and desktop tools.

## Project Structure

```
tool-collection/
├── index.html
├── desktop-tools/WallTools/           # Electron + React + TypeScript
└── web-tools/
    ├── image-concat/                   # Vite + React + Tailwind
    ├── pip-calculator/                 # Vanilla HTML/JS
    ├── pip-calculator-react/           # Vite + React + Tailwind
    ├── prompt-generator/               # Vite + React + TypeScript + Tailwind
    └── vtt-to-srt/                     # Vanilla HTML/JS
```

---

## Build / Lint / Test Commands

### WallTools (Electron)

```bash
cd desktop-tools/WallTools
yarn install
yarn dev                    # Vite dev server
yarn dev:electron           # Electron app
yarn build                  # Build Vite + Electron
yarn dist                   # Create distributable
yarn lint && yarn lint:fix  # Lint + fix
yarn type-check             # TypeScript check
```

### prompt-generator (ComfyUI Prompt Generator)

```bash
cd web-tools/prompt-generator
pnpm install                # or npm install
pnpm dev                    # Vite dev server (port 3002)
pnpm build                  # TypeScript check + Vite build
pnpm lint                   # ESLint with typescript-eslint
pnpm preview                # Preview production build
```

### image-concat / pip-calculator-react

```bash
cd web-tools/[project]
pnpm install
pnpm dev
pnpm build && pnpm preview
```

### pip-calculator / vtt-to-srt

No build required. Edit HTML/JS directly.

---

## Code Style Guidelines

### General
- **No comments** unless explicitly requested
- English for code, Chinese for UI labels and error messages
- `const` by default, `let` when mutation needed, never `var`
- Arrow functions for callbacks and anonymous functions
- async/await over raw Promises, template literals over concatenation

### ESLint Configuration
| Project | ESLint Config | Default Exports |
|---------|---------------|-----------------|
| WallTools | Airbnb config | Not allowed |
| prompt-generator | typescript-eslint | Allowed |
| Others | None | - |

React Hooks rules enforced in prompt-generator (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`).

### Imports (WallTools)
```typescript
// Order: external → internal → relative
import React from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks';
import { Button } from './components';
```
- Use path aliases (`@/` for src) when available
- Named exports for components and utilities

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase + `use` prefix | `useAuth.ts` |
| Utils | kebab-case | `random-utils.ts` |
| Variables | camelCase | `userName`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY` |

### TypeScript
- Avoid `any`
- Define interfaces for all component props and API responses
- Use `ReactNode` for children prop

### Component Patterns
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

export function Button({ variant = 'primary', children }: ButtonProps) {
  return <button className={variant}>{children}</button>;
}
```

### CSS / Tailwind
- Use Tailwind CSS in React projects
- Keep custom CSS minimal (only when Tailwind can't handle it)

---

## prompt-generator Project Structure

```
prompt-generator/src/
├── components/           # React components (PascalCase)
│   └── common/           # Shared (Button, etc.)
├── hooks/                # Custom hooks (useXxx.ts)
├── utils/                # Utility functions
├── types/                # TypeScript interfaces
├── data/                 # JSON presets
└── index.css             # Global styles + Tailwind
```

---

## Git Conventions

- Messages in English, present tense
- Format: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `build`

---

## Important Notes

1. **Never commit secrets** - .env files in .gitignore
2. Run `yarn lint && yarn type-check` before submitting WallTools changes
3. Use pnpm for image-concat and pip-calculator-react
