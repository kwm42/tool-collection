# AGENTS.md - Agent Coding Guidelines

This is a multi-tool collection project with 3 independent sub-projects. Each has its own technology stack and commands.

## Project Structure

```
tool-collection/
├── index.html              # Main navigation page
├── image-concat/           # React image拼接工具 (Vite + React + Tailwind)
├── pip-calculator/         # 外汇仓位计算器 (Vanilla HTML/JS/Bootstrap)
├── pip-calculator-react/  # 外汇仓位计算器 (React + Vite + Tailwind)
└── WallTools/              # Wallhaven图片下载器 (Electron + React + TypeScript)
```

---

## Build / Lint / Test Commands

### WallTools (Electron App)

```bash
# Navigate to WallTools directory
cd WallTools

# Install dependencies
yarn install  # or npm install

# Development
yarn dev                    # Run Vite dev server
yarn dev:electron           # Run Electron app

# Build
yarn build                  # Build Vite + Electron
yarn build:vite            # Build Vite only
yarn build:electron        # Build Electron only

# Package
yarn dist                   # Create distributable
yarn dist:linux            # Package for Linux
yarn dist:win              # Package for Windows
yarn dist:mac              # Package for macOS

# Linting
yarn lint                   # Run ESLint
yarn lint:fix              # Fix ESLint errors
yarn type-check            # TypeScript type check
```

### image-concat (React Image Tool)

```bash
cd image-concat

# Install dependencies
pnpm install  # or npm install

# Development
pnpm dev

# Build
pnpm build
pnpm preview
```

### pip-calculator (Vanilla JS)

No build required. Direct HTML/JS files - edit directly.

### pip-calculator-react (React Calculator)

```bash
cd pip-calculator-react

# Install dependencies
pnpm install  # or npm install

# Development
pnpm dev

# Build
pnpm build
pnpm preview
```

---

## Code Style Guidelines

### General

- **No comments** unless explicitly requested by user
- Use English for all code (variable names, comments, commit messages)
- Use Chinese in user-facing text (UI labels, error messages)

### JavaScript / TypeScript

- Use **ESLint** with Airbnb config (enforced in WallTools)
- Use **Prettier** for formatting (endOfLine: auto)
- Use `const` by default, `let` when mutation needed, never `var`
- Use **arrow functions** for callbacks and anonymous functions
- Use **async/await** over raw Promises
- Use **template literals** over string concatenation

### Imports (WallTools)

```typescript
// Order: external → internal → relative
import React from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks';
import { Button } from './components';
import './styles.css';
```

- Use path aliases (`@/` for src) when available
- Do NOT use default exports (enforced: `import/prefer-default-export: warn`)
- Use named exports for components and utilities

### React Components (WallTools)

- Use **function declarations** for named components:
  ```tsx
  export function MyComponent({ title }: Props) {
    return <div>{title}</div>;
  }
  ```
- Use **function expressions** for anonymous/inline components
- Avoid spreading props: `react/jsx-props-no-spreading: 0` (disabled but prefer explicit)
- Use TypeScript interfaces for props:
  ```tsx
  interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }
  ```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile`, `ImageGrid` |
| Hooks | camelCase starting with `use` | `useAuth`, `useFetch` |
| Variables | camelCase | `userName`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY`, `API_BASE_URL` |
| Files | kebab-case for utilities | `api-client.ts`, `utils.ts` |
| Files | PascalCase for components | `UserProfile.tsx` |

### TypeScript

- Avoid `any` (`@typescript-eslint/no-explicit-any: warn`)
- Define interfaces for all component props and API responses
- Use proper types instead of relying on inference for function parameters

### Error Handling

- Use try/catch with async/await
- Provide meaningful error messages
- Handle errors at component level with error boundaries where appropriate

### CSS / Tailwind

- Use **Tailwind CSS** in React projects
- Use utility classes over custom CSS
- Keep custom CSS minimal (only when Tailwind can't handle it)

---

## Git Conventions

- Commit messages in English, present tense
- Format: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `build`

---

## Important Notes

1. **Never commit secrets** - .env files are in .gitignore
2. **Always run lint/typecheck** before submitting changes in WallTools
3. For pip-calculator: it's plain HTML/JS, no build needed
4. For image-concat and pip-calculator-react: uses pnpm as package manager
