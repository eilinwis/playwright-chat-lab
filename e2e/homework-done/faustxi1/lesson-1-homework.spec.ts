import { test, expect } from '@playwright/test'

test.describe('Homework 1: Getting started', () => {
  test('sending two messages shows their expected replies', async ({ page }) => {
    await page.goto('/')

    const chatInput = page.getByTestId('chat-input')
    const sendButton = page.getByTestId('send-button')

    await expect(chatInput).toBeEnabled({ timeout: 15000 })

    await chatInput.fill('Queue up the tests')
    await sendButton.click()

    const firstReply = page.getByTestId('message-assistant').first()
    await expect(firstReply).toHaveText('Queue is just Q with four impatient friends standing behind it.')

    await chatInput.fill('Programmers unite')
    await sendButton.click()

    const secondReply = page.getByTestId('message-assistant').last()
    await expect(secondReply).toHaveText('Programmers don’t panic; we just `console.log` our feelings.')
  })
})
