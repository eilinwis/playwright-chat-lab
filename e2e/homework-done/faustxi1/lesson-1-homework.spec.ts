import { test, expect } from '@playwright/test'
import { sendMessage, waitForChatReady } from './helpers'

const EXCHANGES = [
  {
    question: 'Queue up the tests',
    answer: 'Queue is just Q with four impatient friends standing behind it.',
  },
  {
    question: 'Programmers unite',
    answer: 'Programmers don’t panic; we just `console.log` our feelings.',
  },
]

test.describe('Homework 1: Getting started', () => {
  test('sending two messages shows their expected replies', async ({ page }) => {
    const replies = page.getByTestId('message-assistant')

    await page.goto('/')
    await waitForChatReady(page)

    for (const [index, { question, answer }] of EXCHANGES.entries()) {
      await sendMessage(page, question)
      await expect(replies).toHaveCount(index + 1)
      await expect(replies.nth(index)).toHaveText(answer)
    }

    await expect(page.getByTestId('message-user')).toHaveText(EXCHANGES.map((e) => e.question))
  })
})
