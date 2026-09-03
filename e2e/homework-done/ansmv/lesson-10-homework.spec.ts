import fs from 'node:fs'
import { test, expect } from '@playwright/test'

/**
 * Homework 10 — Debugging & visual tools
 *
 * Screens under test: Chat ("/") → Search ("/search") for the trace, and
 * Playground ("/playground") for the screenshots — earlier flows, capturing
 * evidence about them this time instead of just asserting on them, and
 * attaching that evidence to the HTML report.
 */
test.describe('Homework 10: Debugging & visual tools', () => {
  /**
   * Test 1 — tracing a multi-screen flow
   */
  test('tracing a Chat -> Search flow produces a trace file', async ({ page, context }, testInfo) => {
    await context.tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
    await page.getByTestId('chat-input').fill('Ducks like bread')
    await page.getByTestId('send-button').click()
    await expect(page.getByTestId('message-assistant').last()).toBeVisible()

    await page.getByTestId('nav-tab-search').click()
    await page.getByPlaceholder('Type words from a message…').fill('Ducks')
    await expect(page.locator('li.search-results__item')).toHaveCount(1)

    // outputPath() gives this test its own directory under test-results/,
    // so two tests can't collide on the same filename.
    const tracePath = testInfo.outputPath('search-trace.zip')
    await context.tracing.stop({ path: tracePath })

    expect(fs.existsSync(tracePath)).toBe(true)
  })

  /**
   * Test 2 — an element screenshot
   */
  test('a locator screenshot of a Playground widget saves a non-empty image', async ({ page }, testInfo) => {
    await page.goto('/playground')
    await expect(page.getByTestId('playground-section-gallery')).toBeVisible()

    const imagePath = testInfo.outputPath('gallery.png')
    await page.getByTestId('gallery-main-image').screenshot({ path: imagePath })

    expect(fs.existsSync(imagePath)).toBe(true)
    // Present isn't enough — a zero-byte file would pass existsSync too.
    expect(fs.statSync(imagePath).size).toBeGreaterThan(0)
  })

  /**
   * Test 3 — attaching evidence to the report
   */
  test('two screenshots attached to the report tell the before/after story', async ({
    page,
  }, testInfo) => {
    await page.goto('/playground')
    const gallery = page.getByTestId('playground-section-gallery')
    await expect(gallery).toBeVisible()

    const beforePath = testInfo.outputPath('gallery-section.png')
    await gallery.screenshot({ path: beforePath })
    // Saving the PNG only puts it on disk; attaching it files it under this
    // test in the HTML report, where whoever opens a CI failure will find it
    // without knowing which directory to dig through.
    await testInfo.attach('gallery section (before)', {
      path: beforePath,
      contentType: 'image/png',
    })

    await page.getByTestId('gallery-thumb-vite').click()

    const afterPath = testInfo.outputPath('gallery-section-vite.png')
    await gallery.screenshot({ path: afterPath })
    await testInfo.attach('gallery section (after)', {
      path: afterPath,
      contentType: 'image/png',
    })

    // The assertion only proves the wiring — the point of the exercise is
    // seeing both images inline under this test in `npx playwright show-report`.
    expect(testInfo.attachments).toHaveLength(2)
  })
})
