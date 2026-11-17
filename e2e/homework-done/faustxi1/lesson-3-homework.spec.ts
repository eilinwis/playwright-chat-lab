import { test, expect } from '@playwright/test'
import { sendMessage } from './helpers'

const MESSAGES = ['Gravity always wins', 'How odd', 'If only']
const GRAVITY_ANSWER = 'Gravity is just the Earth being clingy in a scientifically dignified way.'
const EMPTY_STATE_TEXT = 'No history yet. Send a message in Chat to build your archive.'

test.describe('Homework 3: Assertions & auto-waiting', () => {
  test('history starts empty, then fills up and enables delete as messages are sent', async ({ page }) => {
    const deleteButton = page.getByTestId('delete-history-button')
    const items = page.locator('li.history-day__item')
    const emptyState = page.getByText(EMPTY_STATE_TEXT)

    await page.goto('/history')
    await expect(emptyState).toBeVisible()
    await expect(deleteButton).toBeDisabled()
    await expect(items).toHaveCount(0)

    await page.goto('/')
    for (const message of MESSAGES) {
      await sendMessage(page, message)
    }

    await page.goto('/history')
    await expect(page).toHaveURL(/\/history$/)

    await expect(emptyState).toBeHidden()
    await expect(items).toHaveCount(MESSAGES.length)
    await expect(deleteButton).toBeEnabled()

    const firstTexts = items.first().locator('.history-exchange__text')
    await expect.soft(firstTexts.first()).toHaveText(MESSAGES[0])
    await expect.soft(firstTexts.last()).toHaveText(GRAVITY_ANSWER)
  })
})
