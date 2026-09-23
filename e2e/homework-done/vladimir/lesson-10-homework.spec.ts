import fs from 'node:fs'
import { test, expect } from '@playwright/test'
import { ChatPage } from './testPages/ChatPage'
import { SearchPage } from './testPages/SearchPage'
import { PlaygroundPage } from './testPages/PlaygroundPage'

test.describe('Homework 10: Debugging & visual tools', () => {
  test('tracing a Chat -> Search flow produces a trace file', async ({ page, context }, testInfo) => {
    await context.tracing.start({ screenshots: true, snapshots: true })

    const chat = new ChatPage(page)
    await chat.goto()
    await chat.sendMessage('Ducks like bread')

    const search = new SearchPage(page)
    await search.openFromNav()
    await search.find('Ducks')
    await expect(search.results).toHaveCount(1)

    const traceFile = testInfo.outputPath('search-trace.zip')
    await context.tracing.stop({ path: traceFile })

    expect(fs.existsSync(traceFile)).toBe(true)
  })

  test('a locator screenshot of a Playground widget saves a non-empty image', async ({
    page,
  }, testInfo) => {
    const playground = new PlaygroundPage(page)
    await playground.goto()
    await expect(playground.gallery).toBeVisible()

    const imgPath = testInfo.outputPath('gallery.png')
    await playground.galleryImage.screenshot({ path: imgPath })

    expect(fs.existsSync(imgPath)).toBe(true)
    expect(fs.statSync(imgPath).size).toBeGreaterThan(0)
  })

  test('two screenshots attached to the report tell the before/after story', async ({
    page,
  }, testInfo) => {
    const playground = new PlaygroundPage(page)
    await playground.goto()
    await expect(playground.gallery).toBeVisible()

    const before = testInfo.outputPath('gallery-section.png')
    await playground.gallery.screenshot({ path: before })
    await testInfo.attach('gallery section', { path: before, contentType: 'image/png' })

    await playground.thumb('vite').click()
    await expect(playground.galleryCaption).toHaveText('Vite logo')

    const after = testInfo.outputPath('gallery-section-vite.png')
    await playground.gallery.screenshot({ path: after })
    await testInfo.attach('gallery section after click', { path: after, contentType: 'image/png' })

    expect(testInfo.attachments).toHaveLength(2)
  })
})
