#!/bin/bash

# Migration Verification Script
# Run this after pulling the migration changes to verify everything is in place

echo "🔍 Verifying Vue Project Migration..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
    else
        echo -e "${RED}✗${NC} $1 is missing"
        errors=$((errors + 1))
    fi
}

# Function to check if file is removed
check_removed() {
    if [ ! -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 removed (as expected)"
    else
        echo -e "${YELLOW}⚠${NC} $1 still exists (should be removed)"
        warnings=$((warnings + 1))
    fi
}

echo "📁 Checking new files..."
check_file "eslint.config.ts"
check_file "vitest.config.ts"
check_file "tsconfig.vitest.json"
check_file "env.d.ts"
check_file ".editorconfig"
check_file ".gitattributes"
check_file ".prettierrc.json"
check_file "MIGRATION.md"
check_file "PROJECT_STRUCTURE.md"

echo ""
echo "🗑️  Checking removed files..."
check_removed "src/shims-vue.d.ts"
check_removed ".prettierrc"

echo ""
echo "📝 Checking modified files..."
check_file "package.json"
check_file "tsconfig.json"
check_file "tsconfig.app.json"
check_file "tsconfig.node.json"
check_file "vite.config.ts"
check_file ".gitignore"

echo ""
echo "📦 Checking package.json scripts..."
if grep -q '"lint":' package.json; then
    echo -e "${GREEN}✓${NC} lint script exists"
else
    echo -e "${RED}✗${NC} lint script missing"
    errors=$((errors + 1))
fi

if grep -q '"format": "prettier --write --experimental-cli' package.json; then
    echo -e "${GREEN}✓${NC} format script updated"
else
    echo -e "${YELLOW}⚠${NC} format script may not be updated"
    warnings=$((warnings + 1))
fi

echo ""
echo "📚 Checking ESLint dependencies..."
eslint_deps=(
    "eslint"
    "eslint-plugin-vue"
    "@vue/eslint-config-typescript"
    "@vue/eslint-config-prettier"
    "@vitest/eslint-plugin"
)

for dep in "${eslint_deps[@]}"; do
    if grep -q "\"$dep\":" package.json; then
        echo -e "${GREEN}✓${NC} $dep in package.json"
    else
        echo -e "${RED}✗${NC} $dep missing from package.json"
        errors=$((errors + 1))
    fi
done

echo ""
echo "🔧 Checking TypeScript config updates..."
if grep -q '"path": "./tsconfig.vitest.json"' tsconfig.json; then
    echo -e "${GREEN}✓${NC} tsconfig.json references vitest config"
else
    echo -e "${RED}✗${NC} tsconfig.json missing vitest reference"
    errors=$((errors + 1))
fi

if grep -q '@tsconfig/node24' package.json; then
    echo -e "${GREEN}✓${NC} Using @tsconfig/node24"
else
    echo -e "${YELLOW}⚠${NC} Still using older node tsconfig"
    warnings=$((warnings + 1))
fi

echo ""
echo "═══════════════════════════════════════"

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm install"
    echo "2. Run: npm run type-check"
    echo "3. Run: npm run lint"
    echo "4. Run: npm run build"
    echo "5. Run: npm run test:unit"
    exit 0
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Verification completed with $warnings warnings${NC}"
    echo ""
    echo "Review the warnings above. The migration might be incomplete."
    echo "Then proceed with:"
    echo "1. Run: npm install"
    echo "2. Run: npm run type-check"
    exit 0
else
    echo -e "${RED}❌ Verification failed with $errors errors and $warnings warnings${NC}"
    echo ""
    echo "Please review the errors above before proceeding."
    echo "Some files may be missing or incorrectly configured."
    exit 1
fi
