import fs from 'node:fs'
import { test, expect } from '@playwright/test'

/**
 * Homework 10 — Debugging & visual tools
 *
 * Screens under test: Chat ("/") → Search ("/search") for the trace, and
 * Playground ("/playground") for the screenshot — earlier flows, capturing
 * evidence about them this time instead of just asserting on them.
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
})
