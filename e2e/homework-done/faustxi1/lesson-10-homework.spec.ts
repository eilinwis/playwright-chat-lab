import { test, expect } from '@playwright/test'
import fs from 'node:fs'

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
  const tracePath = testInfo.outputPath('search-trace.zip')
  await context.tracing.stop({ path: tracePath })
  expect(fs.existsSync(tracePath)).toBe(true)
})

test('a locator screenshot of a Playground widget saves a non-empty image', async ({ page }, testInfo) => {
  await page.goto('/playground')
  await expect(page.getByTestId('playground-section-gallery')).toBeVisible()
  const imagePath = testInfo.outputPath('gallery.png')
  await page.getByTestId('gallery-main-image').screenshot({ path: imagePath })
  expect(fs.existsSync(imagePath)).toBe(true)
  expect(fs.statSync(imagePath).size).toBeGreaterThan(0)
})

test('two screenshots attached to the report tell the before/after story', async ({ page }, testInfo) => {
  const section = page.getByTestId('playground-section-gallery')
  await page.goto('/playground')
  const before = testInfo.outputPath('gallery-section.png')
  await section.screenshot({ path: before })
  await testInfo.attach('gallery section', { path: before, contentType: 'image/png' })
  await page.getByTestId('gallery-thumb-vite').click()
  const after = testInfo.outputPath('gallery-section-after.png')
  await section.screenshot({ path: after })
  await testInfo.attach('gallery section after', { path: after, contentType: 'image/png' })
  expect(testInfo.attachments).toHaveLength(2)
})
