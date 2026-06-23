---
name: gitpush
description: Commit local Git changes and push them to the remote repository. Use when the user asks to run gitpush, /gitpush, commit and push current changes, or optionally run gitpush --squash to squash the current feature branch into one commit before pushing with --force-with-lease.
---

# GitPush

Run one commit-and-push workflow. Treat squash as an optional preparation step, not a separate workflow.

## Invocation

- Use the default path for `gitpush`, `/gitpush`, or requests to commit and push current changes.
- Enable squash mode only when the user explicitly passes `--squash`, says `/gitpush --squash`, or clearly asks to squash the branch before pushing.
- In squash mode, accept an optional target branch argument. For unqualified names like `develop`, prefer `upstream/develop` when `upstream` exists, then fall back to `origin/develop`. Keep remote-qualified refs like `origin/release` or `upstream/release` unchanged.

## Workflow

1. Record the start time.
2. Verify the current directory is inside a Git worktree:

```bash
git rev-parse --is-inside-work-tree
```

3. Verify `HEAD` is attached to a branch:

```bash
git branch --show-current
```

4. Inspect the worktree:

```bash
git status --porcelain
```

5. If squash mode is enabled, run the squash preparation steps below before generating the final commit message.
6. Stage all current changes:

```bash
git add -A
```

7. Inspect staged changes:

```bash
git diff --cached --stat
git diff --cached --name-status
```

8. If there is no staged content, stop and report that there is nothing to commit.
9. Generate a concise Chinese Conventional Commit message from the staged diff:

```text
feat: 描述
fix: 描述
docs: 描述
style: 描述
refactor: 描述
test: 描述
chore: 描述
```

Use `chore: 更新代码` only when the type cannot be inferred.

10. Commit:

```bash
git commit -m "提交信息"
```

11. Verify a remote exists:

```bash
git remote
```

12. Push to the user's writable fork remote, normally `origin`:

```bash
git push origin CURRENT_BRANCH
```

If the branch has no upstream, also set it:

```bash
git push -u origin CURRENT_BRANCH
```

If squash mode was enabled, push with lease protection instead:

```bash
git push --force-with-lease origin CURRENT_BRANCH
```

If squash mode was enabled and the branch has no upstream, use:

```bash
git push -u origin CURRENT_BRANCH --force-with-lease
```

Never use `git push --force`.

## Squash Preparation

Run these steps only when squash mode is enabled.

1. Stop immediately if the current branch is protected:

```text
main
master
develop
dev
release
staging
production
prod
```

2. Fetch remote refs. Prefer fetching `upstream` when it exists because it normally points to the source repository in fork workflows. Always fetch `origin` because pushes go there:

```bash
git remote
git fetch origin
```

If `upstream` is listed by `git remote`, also run:

```bash
git fetch upstream
```

3. Resolve the target branch:

- If the user supplied a remote-qualified target like `upstream/main` or `origin/develop`, use it as given.
- If the user supplied an unqualified target like `main` or `develop`, prefer `upstream/<target>` when it exists; otherwise use `origin/<target>`.
- If the user did not supply a target, choose the first existing ref from `upstream/main`, `upstream/master`, `upstream/develop`, then `origin/main`, `origin/master`, `origin/develop`.

Verify the selected target exists:

```bash
git rev-parse --verify TARGET_BRANCH
```

4. Verify the target branch is an ancestor of `HEAD`:

```bash
git merge-base --is-ancestor TARGET_BRANCH HEAD
```

If this fails, stop. Tell the user to rebase or merge the target branch first. This prevents a squash commit from accidentally reverting changes that exist on the target branch.

5. Count commits to squash:

```bash
git rev-list --count TARGET_BRANCH..HEAD
```

If the count is `0` and the worktree is clean, stop and report that there is nothing to commit.

6. Stage uncommitted work so it is included in the squashed commit:

```bash
git add -A
```

7. Capture summary information before rewriting:

```bash
git rev-list --count TARGET_BRANCH..HEAD
git diff --cached --name-status
git diff --name-status TARGET_BRANCH...HEAD
```

8. Soft-reset to the target branch:

```bash
git reset --soft TARGET_BRANCH
```

After this, return to the main workflow at staged-change inspection. The final commit message should describe the whole squashed diff.

## Failure Rules

- Stop on any failed precheck, failed fetch, missing remote, missing target branch, detached `HEAD`, protected branch squash, failed commit, or rejected push.
- Preserve the relevant Git output in the final error.
- If `--force-with-lease` rejects the push, do not retry with `--force`.

## Output

On success, summarize:

- Whether squash mode was used
- Current branch
- Target branch and squashed commit count, when applicable
- Commit message
- Changed file counts
- Push result
- Elapsed time

On failure, use:

```text
提交失败
原因: <specific reason>
```
