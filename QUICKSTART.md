# Vue Project Migration - Quick Start Guide

This project has been migrated to align with the latest `pnpm create vue@latest` scaffold while preserving all existing functionality.

## 🚀 Quick Start

After pulling these changes:

```bash
# 1. Verify the migration
./verify-migration.sh

# 2. Install dependencies (includes new ESLint packages)
pnpm install

# 3. Verify everything works
pnpm run type-check
pnpm run lint
pnpm run build
pnpm run test:unit

# 4. Start developing
pnpm run dev
```

## ⚠️ Breaking Changes

### Node.js Version Update
- **Before:** `>= 20.10.0`
- **After:** `^20.19.0 || >=22.12.0`
- **Action:** Update Node.js if needed: `node --version`

### New Dependencies
- Added ESLint and related plugins (~7 packages)
- **Action:** Run `pnpm install` after pulling

## 🆕 New Features

### ESLint Integration
```bash
# Auto-fix linting issues
pnpm run lint

# Check without fixing
pnpm run lint -- --max-warnings 0
```

### Enhanced TypeScript
- Dedicated test configuration (`tsconfig.vitest.json`)
- Modern TypeScript setup with project references
- Updated to `@tsconfig/node24`

### Editor Configuration
- `.editorconfig` for cross-editor consistency
- `.gitattributes` for line ending normalization

## 📝 New Scripts

| Command | Description |
|---------|-------------|
| `pnpm run lint` | Run ESLint with auto-fix |
| `pnpm run format` | Format code with Prettier (experimental CLI) |

All other scripts remain unchanged.

## 📁 What Changed

### Added (9 files)
- `eslint.config.ts` - ESLint configuration
- `vitest.config.ts` - Test configuration
- `tsconfig.vitest.json` - Test TypeScript config
- `env.d.ts` - Type declarations
- `.editorconfig` - Editor settings
- `.gitattributes` - Git line endings
- `.prettierrc.json` - Prettier config (JSON)
- `MIGRATION.md` - Detailed migration guide
- `PROJECT_STRUCTURE.md` - Structure comparison

### Modified (7 files)
- `package.json` - New ESLint deps, updated versions
- `tsconfig.json` - Project references only
- `tsconfig.app.json` - Removed lib field
- `tsconfig.node.json` - Updated to node24
- `vite.config.ts` - Formatting
- `.gitignore` - More patterns

### Removed (2 files)
- `src/shims-vue.d.ts` → Replaced by `env.d.ts`
- `.prettierrc` → Replaced by `.prettierrc.json`

## ✅ What Stayed the Same

- ✅ All application code
- ✅ All Vue components
- ✅ All business logic
- ✅ All custom dependencies
- ✅ Tailwind CSS v4 setup
- ✅ VitePress documentation
- ✅ All existing scripts

## 🔍 Verification

Run the verification script to ensure everything is in place:

```bash
./verify-migration.sh
```

Expected output: `✅ All checks passed!`

## 📚 Detailed Documentation

- **[MIGRATION.md](./MIGRATION.md)** - Complete migration details
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Before/after comparison

## 🛠️ Troubleshooting

### ESLint errors after install
```bash
# Clear cache and reinstall
rm -rf node_modules .eslintcache
pnpm install
```

### TypeScript errors
```bash
# Clear TypeScript build cache
rm -rf node_modules/.tmp
pnpm run type-check
```

### Build issues
```bash
# Clear all caches
rm -rf node_modules/.tmp dist .eslintcache
pnpm install
pnpm run build
```

## 🎯 Benefits

1. **Modern Tooling** - Latest ESLint, TypeScript, Vite
2. **Better DX** - Linting, formatting, type checking
3. **Consistency** - Matches fresh Vue projects
4. **Maintainability** - Standard structure for onboarding
5. **Performance** - Updated to latest stable versions

## 🤝 Contributing

Before committing:

```bash
pnpm run lint    # Fix linting issues
pnpm run format  # Format code
pnpm run type-check  # Verify types
```

## 📦 Package Manager

This project uses **pnpm** as its package manager:

- Always use `pnpm` instead of `npm` or `yarn`
- Package manager is enforced via `packageManager` field in package.json
- Minimum version: pnpm 10.25.0

## 🔗 Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vite.dev/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [pnpm Documentation](https://pnpm.io/)

---

**Migration completed successfully!** 🎉

For questions or issues, see the troubleshooting section above or refer to the detailed documentation.
