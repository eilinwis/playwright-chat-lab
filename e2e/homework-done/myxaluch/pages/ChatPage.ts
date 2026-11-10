import { expect, type Locator, type Page } from '@playwright/test'

/**
 * A page object for the Chat screen ("/") — same shape as the one in
 * lessons/07-page-object-model/pages/ChatPage.ts, kept here so the homework
 * spec is self-contained.
 */
export class ChatPage {
  readonly page: Page
  readonly funnyModeToggle: Locator
  readonly chatInput: Locator
  readonly sendButton: Locator
  readonly lastUserMessage: Locator
  readonly lastAssistantMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.funnyModeToggle = page.getByTestId('funny-mode-toggle')
    this.chatInput = page.getByTestId('chat-input')
    this.sendButton = page.getByTestId('send-button')
    this.lastUserMessage = page.getByTestId('message-user').last()
    this.lastAssistantMessage = page.getByTestId('message-assistant').last()
  }

  async goto() {
    await this.page.goto('/')
    await expect(this.chatInput).toBeEnabled({ timeout: 15_000 })
  }

  async sendMessage(text: string) {
    await this.chatInput.fill(text)
    await this.sendButton.click()
    await expect(this.lastAssistantMessage).toBeVisible()
  }
}
