import { test, expect } from '@playwright/test'

/**
 * Homework 4 — Forms & input
 *
 * Screen under test: Chat — the same screen as demo.spec.ts, at "/".
 *
 * Complete the test below:
 *   1. Go to the chat page and wait for the chat input to be enabled
 *   2. Assert the funny mode checkbox (data-testid="funny-mode-toggle") is
 *      checked, uncheck it and assert it's unchecked, then check it again
 *      and assert it's checked
 *   3. Assert the Send button is disabled when the input holds only
 *      whitespace (e.g. fill it with "    ")
 *   4. Clear the input, then, using real keystrokes (pressSequentially /
 *      press — not .fill()), type a two-line message into the chat input:
 *        - line 1: "Variables first"
 *        - Shift+Enter
 *        - line 2: "Then values"
 *      Assert the input's value is exactly "Variables first\nThen values"
 *      before submitting
 *   5. Press Enter to submit. Assert the input is cleared, and that the
 *      assistant's reply is exactly:
 *      "Variables hold hands with values in a strictly platonic scope."
 */
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
