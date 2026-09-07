import { test, expect } from '@playwright/test'

test.describe('Homework 1: Getting started', () => {
  test('sending two messages shows their expected replies', async ({page}) => {
    const chatInput = page.getByTestId('chat-input')
    const sendButton = page.getByTestId('send-button')
    await page.goto('/')
    await expect(chatInput).toBeEnabled({ timeout: 15_000 })
    
    await chatInput.fill('Queue up the tests')
    await sendButton.click()

    await expect(page.getByText('Queue is just Q with four impatient friends standing behind it.')).toBeVisible()
    
    await chatInput.fill('Programmers unite')
    await sendButton.click()
    await expect(page.getByText('Programmers don’t panic; we just `console.log` our feelings.')).toBeVisible()
  })
})