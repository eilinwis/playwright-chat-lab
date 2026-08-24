import { test, expect } from '@playwright/test'

/**
 * Homework 11 — CI, parallelism & best practices
 *
 * Test 1 is pure retry mechanics; test 2 is the Chat → Search flow,
 * organized into labeled test.step()s.
 *
 * Note: test 1 is reported as **1 flaky**, not a plain pass — it fails on
 * attempt 1 and passes on the retry, which is exactly what it sets out to
 * demonstrate.
 */
test.describe('Homework 11: CI, parallelism & best practices', () => {
  test.describe('a test that needs exactly one retry', () => {
    // Overrides the config's retry count for this block only.
    test.describe.configure({ retries: 1 })

    test('fails once, then passes', async ({}, testInfo) => {
      // Branching on the attempt number is what makes the flake synthetic
      // and predictable; eslint-plugin-playwright flags conditionals in
      // tests for good reason, so this one exception is opted out by hand.
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (testInfo.retry === 0) {
        throw new Error('Simulated flake — only fails on the very first attempt.')
      }

      expect(testInfo.retry).toBe(1)
    })
  })

  /**
   * Test 2 — test.step() on a familiar flow
   */
  test('searching for a sent message, organized into labeled steps', async ({ page }) => {
    await test.step('send a message from Chat', async () => {
      await page.goto('/')
      await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
      await page.getByTestId('chat-input').fill('Ostriches assemble')
      await page.getByTestId('send-button').click()
      await expect(page.getByTestId('message-assistant').last()).toBeVisible()
    })

    await test.step('go to Search and look for it', async () => {
      await page.getByTestId('nav-tab-search').click()
      await page.getByPlaceholder('Type words from a message…').fill('Ostriches')
    })

    await test.step('assert exactly one result', async () => {
      await expect(page.locator('li.search-results__item')).toHaveCount(1)
    })
  })
})
