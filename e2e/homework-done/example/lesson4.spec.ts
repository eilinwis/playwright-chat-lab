import { test, expect } from '@playwright/test'

test.describe('Homework 4: Forms & input', () => {
  test('toggling funny mode, validating empty input, and submitting via keyboard', async ({ page }) => {
    const chatInput = page.getByTestId('chat-input')
    const sendButton = page.getByTestId('send-button')
    const funnyMode = page.getByTestId('funny-mode-toggle')
    await page.goto('/')
    await expect(chatInput).toBeEnabled({ timeout: 15_000 })
    await expect(funnyMode).toBeChecked() // on by default
    await funnyMode.uncheck()
    await expect(funnyMode).not.toBeChecked()
    await funnyMode.check()
    await expect(funnyMode).toBeChecked()
    await chatInput.fill('    ')
    await expect(sendButton).toBeDisabled()
    await chatInput.fill('')
    await chatInput.pressSequentially('Variables first')
    await chatInput.press('Shift+Enter')
    await chatInput.pressSequentially('Then values')
    await expect(chatInput).toHaveValue('Variables first\nThen values')
    await chatInput.press('Enter')
    await expect(chatInput).toHaveValue('')
    await expect(page.getByTestId('message-assistant').last()).toHaveText(
      'Variables hold hands with values in a strictly platonic scope.',
    )
  })
})
