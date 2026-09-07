import { test, expect } from '@playwright/test'

test.describe('Homework 1: Getting started', () => {
  test('sending two messages shows their expected replies', async ({page}) => {

    await page.goto('/')

    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })

    await page.getByTestId('chat-input').fill('Queue up the tests')

    await page.getByTestId('send-button').click()

    await expect(page.getByText('Queue is just Q with four impatient friends standing behind it.')).toBeVisible()

    await page.getByTestId('chat-input').fill('Programmers unite')

    await page.getByTestId('send-button').click()

    await expect(page.getByText('Programmers don’t panic; we just `console.log` our feelings.')).toBeVisible()
    
  })
})