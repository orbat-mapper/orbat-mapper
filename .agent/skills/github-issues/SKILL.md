---
name: github-issues
description: Manage GitHub issues using the GitHub CLI (gh)
---

# GitHub Issues Management

This skill provides instructions for managing GitHub issues directly from the terminal using the `gh` command-line tool.

## Key Commands

### 1. Listing Issues

To list open issues in the current repository:

```bash
gh issue list
```

Options:

- `--limit <number>`: Limit the number of issues (default 30).
- `--label <label>`: Filter by label.
- `--assignee <user>`: Filter by assignee.
- `--search <query>`: Search issues with a query.
- `--state <all|closed|open>`: Filter by state.

### 2. Viewing Issue Details

To view a specific issue:

```bash
gh issue view <issue-number>
```

To view it in the browser:

```bash
gh issue view <issue-number> --web
```

### 3. Creating Issues

To create a new issue interactively:

```bash
gh issue create
```

To create an issue with title and body:

```bash
gh issue create --title "Issue Title" --body "Issue Body"
```

### 4. Adding Comments

To add a comment to an issue:

```bash
gh issue comment <issue-number> --body "Your comment here"
```

### 5. Managing State

To close an issue:

```bash
gh issue close <issue-number>
```

To reopen an issue:

```bash
gh issue reopen <issue-number>
```

### 6. Editing Issues

To add labels or assignees:

```bash
gh issue edit <issue-number> --add-label "bug" --add-assignee "@me"
```

## Best Practices

- Always check the current status of the repository with `gh issue list` before creating new ones to avoid duplicates.
- Use descriptive titles and detailed bodies for new issues.
- When working on an issue, assign it to yourself to avoid overlapping work.
- Use `gh issue status` to see a summary of issues relevant to you.
