# Playwright Testing Course

11 lessons, "what is Playwright" to CI-ready end-to-end tests, using this
repo's own chat app as the system under test.

## Setup

```bash
npm install
npx playwright install chromium
```

## Each lesson

- `README.md` — theory
- `demo.spec.ts` — a working example, run it and experiment
- `homework.spec.ts` — an exercise gated by `test.fixme()`; delete that line
  once your test passes

```bash
# one file
npx playwright test --config=lessons/playwright.config.ts lessons/01-getting-started/demo.spec.ts

# a whole lesson
npx playwright test --config=lessons/playwright.config.ts lessons/01-getting-started

# everything
npx playwright test --config=lessons/playwright.config.ts
```

Useful flags: `--ui` (the runner UI — Lesson 10), `--debug` (the
Inspector), `--headed`/`--headless`, `--workers=N`, `--shard=1/2`,
`--reporter=line|github|blob`. Report after a run: `npx playwright
show-report`.

## CI

- `.github/workflows/ci.yml` — lint, unit tests, build on every push/PR.
- `.github/workflows/playwright.yml` — the e2e suite sharded across two
  runners, the merged HTML report, and this course's own tests. Lesson 11
  reads it line by line.
- `.github/workflows/e2e.yml` — runs one spec file on demand when you
  comment `e2e <path>` on a PR, and reports back as a check. That's what
  the homework flow below uses.

## Submitting homework

1. Branch off `main`: `git checkout -b <your-name>/lesson-<NN>`.
2. Solve the lesson's `homework.spec.ts` and delete its `test.fixme()`.
3. Run it locally until it passes.
4. Place your `homework.spec.ts` into e2e/homework-done and rename it as lesson 
5. Commit and push the branch.
6. Open a PR with <[homework] lesson <NN>> .
7. Comment on the PR: `e2e e2e/homework-done` — CI runs just that file and reports back as a check on the PR.
NOTE: check opened PR #28 for reference
