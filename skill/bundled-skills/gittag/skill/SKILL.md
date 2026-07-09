---
name: gittag
description: Use when the user asks to run gittag, /gittag, create a Git release tag, or tag locally and push the exact tag to both origin fork and upstream source repository after syncing with gitsync.
---

# GitTag

Create one Git tag locally, then publish that exact tag to both remotes:

```text
local tag -> origin fork
          -> upstream source repository
```

`origin` must point to the user's fork of the source repository. `upstream` must point to the source repository.

## Required Sub-Skill

**REQUIRED SUB-SKILL: Use gitsync before creating any local tag.**

Invoke and complete `gitsync` first. If `gitsync` is unavailable, fails, or leaves the repository in an unresolved state, stop and do not create a tag. Do not manually skip this step.

## Invocation

- Require an explicit tag name, such as `v1.2.3`. If the user did not provide one, ask for it before running Git commands that change state.
- Create an annotated tag by default.
- Use the user-provided tag message when present. Otherwise use `Release TAG_NAME`.
- Create a lightweight tag only when the user explicitly asks for one.

## Workflow

1. Record the start time.
2. Run `gitsync` and stop unless it succeeds.
3. Verify the current directory is inside a Git worktree:

```bash
git rev-parse --is-inside-work-tree
```

4. Verify `HEAD` is attached to a branch:

```bash
git branch --show-current
```

Stop if the branch name is empty.

5. Inspect the worktree:

```bash
git status --porcelain
```

If there are any uncommitted, staged, untracked, or conflicted changes, stop and tell the user to commit, stash, or discard them before tagging.

6. Verify required remotes are configured and review their roles:

```bash
git remote
git remote get-url origin
git remote get-url upstream
```

If `origin` is missing, stop and tell the user: `origin` must point to the user's fork of the source repository. If `upstream` is missing, stop and tell the user: `upstream` must point to the source repository. If the URLs are identical, stop because the fork/source remote split is not valid.

7. Fetch tags from both remotes:

```bash
git fetch origin --tags
git fetch upstream --tags
```

8. Verify the tag does not already exist locally or on either remote:

```bash
git rev-parse --verify refs/tags/TAG_NAME
git ls-remote --tags origin TAG_NAME
git ls-remote --tags upstream TAG_NAME
```

If the local command succeeds, or either remote command returns a matching tag, stop. Do not delete, recreate, force-update, or overwrite an existing tag.

9. Capture the exact commit that will be tagged:

```bash
git rev-parse HEAD
git log -1 --oneline
```

10. Create the local tag:

```bash
git tag -a TAG_NAME -m "TAG_MESSAGE"
```

For an explicitly requested lightweight tag only:

```bash
git tag TAG_NAME
```

11. Verify the local tag points at `HEAD`:

```bash
git rev-list -n 1 TAG_NAME
git rev-parse HEAD
```

If the commit IDs differ, stop and preserve the output.

12. Push only the exact tag to the fork remote:

```bash
git push origin TAG_NAME
```

13. Push only the exact tag to the source remote:

```bash
git push upstream TAG_NAME
```

14. Verify both remotes now contain the tag:

```bash
git ls-remote --tags origin TAG_NAME
git ls-remote --tags upstream TAG_NAME
```

## Failure Rules

- Stop on failed `gitsync`, dirty worktree, detached `HEAD`, missing `origin`, missing `upstream`, identical remote URLs, failed fetch, existing local tag, existing remote tag, failed local tag creation, tag/HEAD mismatch, or rejected push.
- Never use `git push --tags`; push only `TAG_NAME`.
- Never use `--force` or `--force-with-lease` for tags.
- Never auto-delete or recreate local or remote tags.
- Never auto-stash user changes.
- If pushing to `origin` succeeds but pushing to `upstream` fails, report the partial publication clearly and preserve the Git output. Do not attempt cleanup unless the user explicitly asks.

## Output

On success, summarize:

- Tag name and tag type
- Current branch after `gitsync`
- Tagged commit
- `origin` URL and push result
- `upstream` URL and push result
- Remote verification result
- Elapsed time

On failure, use:

```text
打 tag 失败
原因: <specific reason>
```
