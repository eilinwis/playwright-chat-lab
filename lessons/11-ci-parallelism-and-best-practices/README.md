# Lesson 11 — CI, Parallelism & Best Practices

## Recap

Ten lessons in, you know how to write a single test well. This last one is
about what changes once that test is one of hundreds, run by a machine you
can't watch, on a schedule you don't control — and it closes with a
checklist of everything the course has actually been arguing for along the
way.

## What actually changes in CI

A CI runner is a fresh Linux box with no browsers, no display, and no
patience. Four things a local run gets for free have to be arranged:

1. **Browsers**: `npx playwright install --with-deps chromium` — the
   binaries *and* the system libraries they need. This is the step a
   lint/build job doesn't have.
2. **No display**: this course runs **headed** by default so you can watch
   it, and a runner has no screen to show that on. Both configs handle it
   with `headless: !!process.env.CI` — hardcoding `headless: false` would
   simply fail there.
3. **The app under test**: nothing needs starting by hand. The `webServer`
   block in both configs runs `npm run dev` and waits for
   `http://localhost:5173` before the first test. `reuseExistingServer:
   !process.env.CI` says "reuse the dev server I already have open" locally
   and "always start a clean one" in CI.
4. **Different failure economics**: a red run you can't re-run by hand
   deserves `retries: process.env.CI ? 2 : 0`, and `forbidOnly:
   !!process.env.CI` turns a `test.only` left in by accident into a failed
   run instead of a green one that quietly ran a single test.

`process.env.CI` is set by GitHub Actions (and every other CI) on its own —
you never set it yourself.

## The three workflows in this repo

Read them; they're short, and they're the real thing rather than a snippet.

**`.github/workflows/ci.yml`** — `npm run lint`, `npm run test` (the Vitest
unit tests), `npm run build`, on every push and PR. Deliberately **no
Playwright**: it's the fast feedback loop, and it stays fast by not
installing browsers.

**`.github/workflows/playwright.yml`** — the one this lesson is about,
three jobs:

- `e2e` runs the `e2e/` suite across a **two-runner matrix**
  (`--shard=${{ matrix.shard }}/2`), each writing a **blob** report, each
  uploading it as an artifact with `if: always()` — because the report
  matters most exactly when the step before it failed.
- `report` waits for both shards (`needs`), downloads both blobs, and runs
  `npx playwright merge-reports --reporter=html` to turn them back into a
  single HTML report, uploaded as one artifact.
- `lessons` runs this course unsharded, the plain shape of a Playwright job
  for contrast. Unsolved homework is `test.fixme()`'d, so it reports as
  *skipped* instead of failing the run.

**`.github/workflows/e2e.yml`** — the homework-submission runner, and a
useful example of CI that isn't triggered by a push at all. It listens for
an `issue_comment` on a PR, parses `e2e <path/to/spec.ts>` out of the
comment body, runs *just that file*, and posts the result back as a commit
status on the PR's head SHA — which is what makes it show up under the PR's
own Checks. That last part exists because an `issue_comment` run isn't tied
to a commit on its own.

## Reporters and artifacts

The reporter decides what a run *produces*, and CI wants something
different from your terminal:

| Reporter | Good for |
|---|---|
| `list` (default locally) | watching a run |
| `line` | a compact live log |
| `github` | annotations on the PR diff, at the failing line |
| `html` | the report you open afterward (`npx playwright show-report`) |
| `blob` | a machine-readable report meant to be **merged** later |
| `json` / `junit` | feeding a dashboard or a test-management tool |

Pick per run with `--reporter=blob`, or list several in the config:
`reporter: [['github'], ['html', { open: 'never' }]]`.

An HTML report is only useful if you can reach it, and a runner is deleted
minutes after the run. `actions/upload-artifact` is what keeps it — the
`playwright-report/` directory (and `test-results/`, which holds traces and
videos) becomes a downloadable zip on the run page. Download it, unzip,
`npx playwright show-report path/to/it`, and you're looking at the same
report you'd get locally, traces included.

## Workers, fullyParallel & sharding

Three different knobs, often confused:

- **`workers: N`** — how many parallel processes on *one* machine.
  `undefined` means "half the cores". `lessons/playwright.config.ts` sets
  `workers: 1` on purpose, so one failure's output isn't interleaved with
  three others' while you're still learning to read it.
- **`fullyParallel: true`** — parallelize *tests*, not just files. With it
  off (both configs here), files run in parallel but the tests inside one
  file run in order, on one worker. `test.describe.configure({ mode:
  'parallel' })` turns it on for a single block, and `mode: 'serial'` does
  the opposite — the escape hatch for tests that genuinely must run in
  order (where a failure skips the rest of the block).
- **`--shard=1/3`** (with `2/3` and `3/3` elsewhere) — splits the suite
  across *separate machines*. Each shard is a normal, complete Playwright
  run that happens to own a third of the files, which is why each produces
  its own report and why `merge-reports` exists.

None of this is free: they only work if tests don't depend on each other or
on shared, mutable state. Every test in this course is parallel-safe
regardless of the `workers: 1` setting — each gets its own `page` and
browser context (Lesson 8) — and that property is exactly what
`--workers`/`--shard` require to be safe to turn on at all.

## Timeouts

Four layers, and knowing which one fired saves the guessing:

- **Test timeout** — 30s by default, per test (`timeout:` in the config,
  or `test.setTimeout(...)`). `test.slow()` triples it for one test that's
  legitimately slow.
- **Expect timeout** — 5s by default, how long a web-first assertion
  retries (`expect: { timeout: ... }`, or per-assertion as in this course's
  `toBeEnabled({ timeout: 15_000 })`).
- **Action/navigation timeouts** — `use: { actionTimeout, navigationTimeout }`.
- **`globalTimeout`** — a ceiling on the whole run, so a hung suite can't
  burn an hour of CI minutes.

A CI runner is usually slower than your laptop, so timeouts are a common
source of "passes locally, fails in CI". Raise the specific one that fired
— never paper over it with `waitForTimeout`, which is the subject of the
next section.

## Retries and `testInfo.retry`

`retries: N` (config, CLI `--retries`, or `test.describe.configure({
retries })` for one block, as the demo does) reruns a failed test up to N
times before calling it failed for real. `testInfo.retry` tells a test
which attempt it's currently on (`0` the first time) — the demo's first
test uses it to simulate a flake deterministically, so you can watch the
mechanism work without waiting for a real one to happen.

One thing worth noticing in the demo's output: a test that fails once and
then passes on retry is reported as **1 flaky** — a third status, distinct
from both "passed" and "failed." Playwright doesn't pretend the failure
didn't happen; it just doesn't fail the whole run over a rescued one
either.

## Flaky test strategies

Retries are a safety net, not a fix — they buy time, they don't diagnose
anything. Lesson 5's demo found a real example of the difference: an
`e2e/` page object's locator could transiently match a "Thinking…"
placeholder instead of the real reply, and the original code masked it with
a hardcoded `page.waitForTimeout(1000)` instead of fixing the locator. A
timeout like that "works" the same way retries can — by giving a race
condition enough time to resolve itself most of the time — right up until a
slower CI runner makes "most of the time" not often enough. The actual fix
was narrowing the locator so it could never match the wrong element, not
waiting longer and hoping.

If a real flake can't be fixed immediately, `test.fixme()` (used throughout
this course for unfinished homework) or `test.skip()` mark it as known and
excluded, so it stops eroding trust in the rest of the suite while it's
diagnosed properly, without deleting the coverage it represents.

## Test design best practices — a checklist

Everything below has a lesson behind it, not just an opinion:

- **Prefer web-first, auto-retrying assertions** (`expect(locator).toBe...`)
  **over manual reads and arbitrary waits** — Lesson 3, and the same real
  bug Lesson 5 found and fixed.
- **Target elements by role or `data-testid`, not brittle CSS** — Lesson 2.
- **Extract shared setup into fixtures, not copy-pasted helpers** —
  Lesson 6.
- **Extract a screen's locators and actions into a page object once it's
  used by more than a couple of tests** — Lesson 7.
- **Don't assume two tests share state — each gets its own context, so
  don't rely on ordering** — Lesson 8, and this lesson's own demo.
- **Mock the network for determinism** — a test that depends on a real
  backend's timing or data is a test that depends on the network being
  fast, reachable, and in the right state — Lesson 9.
- **When something fails and you don't know why, reach for a trace before
  adding a `waitForTimeout`** — Lesson 10, and again, Lesson 5.
- **Keep the suite runnable by a machine that can't see a screen and has
  no browsers installed** — headless in CI, `--with-deps`, and an app the
  config knows how to start — this lesson.
- **Upload the report and the traces as artifacts; a CI failure you can't
  open is a CI failure you'll re-run instead of fixing** — this lesson.

## The screen for this lesson: Chat & Search

Same locators as Lessons 1 and 2 — nothing new about the screens
themselves. What's new is everything *around* the tests that use them.

## Now

1. Read and run `demo.spec.ts` — pay attention to the summary line at the
   end (`1 flaky`, not `1 failed`).
2. Read `.github/workflows/playwright.yml` top to bottom, then find its
   last run under the repo's **Actions** tab, download the
   `playwright-report` artifact, and open it:

   ```bash
   npx playwright show-report ~/Downloads/playwright-report
   ```

3. Reproduce what CI does, locally:

   ```bash
   # what one sharded runner does
   npx playwright test --shard=1/2 --reporter=blob
   npx playwright test --shard=2/2 --reporter=blob

   # what the report job does with the pieces
   npx playwright merge-reports --reporter=html ./blob-report
   npx playwright show-report
   ```

4. Open `homework.spec.ts` and complete all three exercises described there
   — your own retry-rescued test, a familiar flow reorganized with
   `test.step()`, and a parallel-safe block that proves it.
5. That's the course. If you want to see it all working together, revisit
   an early lesson's `demo.spec.ts` with fresh eyes — most of what looked
   like new syntax back then is really one of the practices above, just not
   named yet.
