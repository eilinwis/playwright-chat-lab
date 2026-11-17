import { expect, type Page } from '@playwright/test'

export async function waitForChatReady(page: Page) {
  await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })
}

export async function sendMessage(page: Page, text: string) {
  const chatInput = page.getByTestId('chat-input')
  const replies = page.getByTestId('message-assistant')

  await waitForChatReady(page)
  const repliesBefore = await replies.count()

  await chatInput.fill(text)
  await page.getByTestId('send-button').click()
  await expect(replies).toHaveCount(repliesBefore + 1)
}
