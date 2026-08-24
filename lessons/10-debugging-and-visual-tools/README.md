# Lesson 10 — Debugging & Visual Tools

## Recap

Every test so far has produced a pass/fail and, on failure, an error
message. That's often not enough to figure out *why* — especially for a
failure you can't reproduce locally, or one buried in a CI run you weren't
watching live. This lesson is about the evidence Playwright can capture
alongside a test, so a failure comes with a recording of what actually
happened.

## Debugging while it runs, before you debug the wreckage

Traces, screenshots, and video are *post-mortem* evidence — everything
below is for a test you can still watch. Reach for these first; the
capture tools are what you fall back on when the failure only happens on
someone else's machine.

**UI mode — `npx playwright test --ui`** is the one to learn properly. It
opens a runner with the whole suite in a sidebar: pick a test, run it, and
get the same timeline a trace gives you, live and re-runnable. Watch mode
re-runs a test on every file save, "Pick locator" points at an element and
writes the locator for it, and every step can be replayed against the DOM
snapshot without re-running anything. Try it now:

```bash
npx playwright test --config=lessons/playwright.config.ts --ui
```

**The Inspector — `--debug`, or `page.pause()`.** `npx playwright test
--debug` runs headed, one worker, with the Inspector attached and the run
stopped at the first action, so you can step through it. Dropping
`await page.pause()` into a test does the same thing at exactly the line
you care about, and the rest of the test runs at full speed:

```ts
await page.getByTestId('chat-input').fill('Hello there!')
await page.pause() // Inspector opens here; the browser stays interactive
await page.getByTestId('send-button').click()
```

`pause()` only pauses in a headed run — under `--headless` (or on a CI
runner) it's a no-op that keeps going, which is why it's a debugging aid
and not a wait. Leaving one behind is easy; `forbidOnly` (Lesson 11) won't
catch it for you, so it belongs in the same mental bin as `test.only`.

**Slowing it down — `--headed --slow-mo=500`** puts half a second between
actions in a headed run. Useful when a flow is *correct* but too fast to
see what it's doing.

**The HTML report — `npx playwright show-report`.** The default reporter
in both configs here writes one after every run: each test with its steps,
its error, and every attachment (screenshots, traces, video) inline. It is
the first thing to open after a failed run, local or downloaded from CI.

**`DEBUG=pw:api npx playwright test <file>`** prints every Playwright API
call and what it resolved to. It's noisy, but it's the fastest way to see
*which* action is hanging when a test just sits there until it times out.

The **VS Code extension** ("Playwright Test for VSCode") wraps most of the
above — run a single test from a gutter icon, set breakpoints in test code,
and pick locators from the editor.

## The trace viewer

A trace is a timeline of everything Playwright did — every action, every
network request, a screenshot before and after each step, even a DOM
snapshot you can inspect like DevTools. `lessons/playwright.config.ts`
already sets `trace: 'on-first-retry'`, so a flaky test that fails once and
passes on retry gets one automatically.

You can also capture one by hand, around just the part of a test you care
about: `context.tracing.start({ screenshots: true, snapshots: true })` …
`context.tracing.stop({ path })` — that's what the demo does. Open the
result with:

```bash
npx playwright show-trace test-results/.../trace.zip
```

## Screenshots

`page.screenshot({ path })` captures the whole page; a locator's own
`.screenshot({ path })` crops to just that element — useful when only one
widget's appearance is what you're checking, not the full page around it.
(Playwright also has `expect(locator).toHaveScreenshot()` for pixel-diffing
against a saved baseline — a different, larger topic: visual regression
testing, with its own baseline-management workflow. Out of scope here; this
lesson only covers taking a screenshot as *evidence*, not comparing one.)

## Video

Unlike tracing, video can't be turned on mid-test — it's set when a context
is created: `browser.newContext({ recordVideo: { dir } })`. The recording
only finishes encoding once that context closes, so `page.video()?.path()`
has to be read *after* `context.close()`, not before. (You can also turn
video on for every test in a run via `use: { video: 'on' }` in the config —
the per-context approach the demo uses is how you'd record just one
specific test instead.)

## `codegen` — recording actions into code

`npx playwright codegen http://localhost:5173` opens a real browser next to
an inspector window: click and type in the browser, and Playwright writes
the equivalent code live. It's not something a test asserts on — it's a
workflow tool, most useful for two things: getting a locator you're not
sure how to target by hand, or a first draft of a new test to edit down
afterward. Try it against this app's own Chat screen.

## Attachments — evidence the report shows you

Saving a PNG next to a test is fine; attaching it to the *run* is better.
`testInfo.attach(name, { path })` (or `{ body, contentType }`) files the
artifact under that test in the HTML report and in the trace, so whoever
opens a CI failure sees it without knowing which directory to dig through:

```ts
await testInfo.attach('gallery', { path: imagePath, contentType: 'image/png' })
```

That's how Playwright's own screenshot-on-failure and trace-on-retry show
up in the report — same mechanism, available to anything you capture
yourself.

## Iframes and shadow DOM — for reference

This app doesn't use either, so there's nothing here to run a live demo
against — but both come up often enough elsewhere to be worth knowing:

- **Iframes**: `page.frameLocator('iframe[title="..."]').getByRole(...)` —
  a `FrameLocator` scopes every query inside it to that frame's document,
  the same locator API you already know, just rooted somewhere other than
  the top-level page.
- **Shadow DOM**: nothing special needed. Playwright's locators pierce open
  shadow roots automatically — `page.getByTestId(...)` (or any other
  locator) finds elements inside a shadow tree the same way it finds
  anything else, with no extra API to learn.

## The screens for this lesson: Chat, Search & Playground

`demo.spec.ts` reuses Chat's `chat-input`/`send-button`/`message-assistant`
locators (Lessons 1 and 4). The homework adds Search's flow (Lesson 2) for
the trace exercise, and the Playground gallery (Lesson 5) for the
screenshot exercise — nothing new to learn about the screens themselves.

## Now

1. Read and run `demo.spec.ts` — four tests, each capturing a different
   kind of evidence (trace, screenshots, video, and a report attachment).
   After running it, open one of the generated files: `npx playwright
   show-trace` on the trace, or just look at the PNGs/`.webm` under
   `test-results/`.
2. Run this lesson in **UI mode** and click through a test's timeline:
   `npx playwright test --config=lessons/playwright.config.ts
   lessons/10-debugging-and-visual-tools --ui`. Then add a
   `await page.pause()` in the middle of one of the demo tests, run that
   file with `--debug`, and step through it. Delete the pause afterward.
3. Open `homework.spec.ts` and complete all three exercises described there
   — tracing a multi-screen flow, screenshotting one Playground widget, and
   attaching that screenshot to the report.
4. Run `npx playwright show-report` and find your attachment in it.
