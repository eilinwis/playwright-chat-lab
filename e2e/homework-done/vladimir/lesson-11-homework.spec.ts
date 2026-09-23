import { test, expect } from '@playwright/test'
import { ChatPage } from './testPages/ChatPage'
import { SearchPage } from './testPages/SearchPage'

test.describe('Homework 11: CI, parallelism & best practices', () => {
  test.describe('a test that needs exactly one retry', () => {
    test.describe.configure({ retries: 1 })

    test('fails once, then passes', async ({}, testInfo) => {
      if (testInfo.retry === 0) {
        throw new Error('fail on the first attempt')
      }

      expect(testInfo.retry).toBe(1)
    })
  })

  test('searching for a sent message, organized into labeled steps', async ({ page }) => {
    const chat = new ChatPage(page)
    const search = new SearchPage(page)

    await test.step('send a message from Chat', async () => {
      await chat.goto()
      await chat.sendMessage('Ostriches assemble')
    })

    await test.step('go to Search and look for it', async () => {
      await search.openFromNav()
      await search.find('Ostriches')
    })

    await test.step('assert exactly one result', async () => {
      await expect(search.results).toHaveCount(1)
    })
  })

  test.describe('two independent tests, safe to run at the same time', () => {
    test.describe.configure({ mode: 'parallel' })

    test('one test sends bananas and checks only bananas', async ({ page }) => {
      const chat = new ChatPage(page)
      await chat.goto()
      await chat.sendNoWait('Bananas are great')

      await expect(chat.lastUserMessage).toHaveText('Bananas are great')
    })

    test('the other sends ostriches and checks only ostriches', async ({ page }) => {
      const chat = new ChatPage(page)
      await chat.goto()
      await chat.sendNoWait('Ostriches assemble')

      await expect(chat.lastUserMessage).toHaveText('Ostriches assemble')
    })
  })
})
