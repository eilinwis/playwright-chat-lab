import type { Page } from '@playwright/test'
import { expect, test } from '../../hard-mode/test'

const CONSENT_KEY = 'chat-lab:hard-mode:consent'
const RESET_CONFIRM = 'Reset the chat? Messages on screen will be cleared.'
const IFRAME_TITLES = ['Discount form', 'Question form', 'Support chat']

test.use({ hardMode: { flags: 'iframe-widget, popups, latency' } })

async function sendAndAwaitReply(page: Page, text: string) {
  const input = page.getByTestId('chat-input')
  const replies = page.getByTestId('message-assistant')
  const before = await replies.count()

  await expect(input).toBeEnabled({ timeout: 15_000 })
  await input.fill(text)
  await page.getByTestId('send-button').click()

  await expect(replies).toHaveCount(before + 1, { timeout: 10_000 })
}

test.describe('Hard mode homework 1: Popups that get in the way', () => {
  test('by hand: every popup closed the way a user would', async ({ page }) => {
    await page.goto('/')

    const cookieBanner = page.getByRole('dialog', { name: 'We value your privacy' })
    await cookieBanner.getByRole('button', { name: 'Reject all' }).click()
    await expect(cookieBanner).toBeHidden()
    expect(await page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY)).toBe('rejected')

    await page.reload()
    await expect(page.getByTestId('chat-input')).toBeVisible()
    await expect(cookieBanner).toBeHidden()

    const promo = page.getByRole('dialog', { name: 'Upgrade to Chat Lab Pro' })
    await expect(promo).toBeVisible({ timeout: 15_000 })
    await promo.getByRole('button', { name: 'Maybe later' }).click()
    await expect(promo).toBeHidden()

    const discount = page.getByTitle('Discount form').contentFrame()
    const email = discount.getByLabel('Leave your email for a 10% discount')
    const getDiscount = discount.getByRole('button', { name: 'Get discount' })

    await email.fill('not-an-email')
    await expect(getDiscount).toBeDisabled()
    await email.fill('vucl@example.com')
    await expect(getDiscount).toBeEnabled()

    await getDiscount.click()
    await discount
      .getByRole('dialog', { name: 'How was your experience?' })
      .getByRole('button', { name: 'Skip' })
      .click()

    await expect(discount.getByRole('status')).toHaveText(/^Discount code #\d{4} sent\.$/)

    for (const title of IFRAME_TITLES) {
      await page.getByRole('button', { name: `Close ${title.toLowerCase()}` }).click()
      await expect(page.getByTitle(title)).toBeHidden()
    }
    await expect(page.locator('iframe')).toHaveCount(0)

    await sendAndAwaitReply(page, 'Gravity always wins')
    await expect(page.getByTestId('message-assistant').last()).toHaveText(
      'Gravity is just the Earth being clingy in a scientifically dignified way.',
    )

      page.once('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm')
        expect(dialog.message()).toBe(RESET_CONFIRM)
        await dialog.accept()
      })

    await page.getByTestId('reset-button').click()
    await expect(page.getByTestId('message-user')).toHaveCount(0)
    await expect(page.getByTestId('message-assistant')).toHaveCount(0)
  })

  test('with tricks: three messages get through popups that keep showing up', async ({ page }) => {
    await page.addInitScript(
      ({ key }) => {
        localStorage.setItem(key, 'accepted')
        const asked: string[] = []
        Object.assign(window, { confirmsAsked: asked })
        window.confirm = (message) => {
          asked.push(String(message))
          return true
        }
      },
      { key: CONSENT_KEY },
    )

    let promoRuns = 0
    const promo = page.getByRole('dialog', { name: 'Upgrade to Chat Lab Pro' })
    await page.addLocatorHandler(promo, async () => {
      await promo.getByRole('button', { name: 'Maybe later' }).click()
      promoRuns++
    })
    for (const title of IFRAME_TITLES) {
      await page.addLocatorHandler(page.getByTitle(title), async () => {
        await page.getByRole('button', { name: `Close ${title.toLowerCase()}` }).click()
      })
    }

    await page.clock.install()
    await page.goto('/')
    await expect(page.getByTestId('chat-input')).toBeEnabled({ timeout: 15_000 })

    for (const text of ['Gravity always wins', 'How odd', 'If only']) {
      await page.clock.fastForward(30_000)
      await sendAndAwaitReply(page, text)
    }

    await expect(page.getByTestId('message-user')).toHaveCount(3)
    await expect(page.getByTestId('message-assistant')).toHaveCount(3)
    await expect(page.getByTestId('message-assistant').last()).toHaveText(
      'If debugging was easy, it would be called “catching butterflies.”',
    )

    expect(promoRuns).toBe(3)
    await expect(page.locator('iframe')).toHaveCount(0)

    await page.getByTestId('reset-button').click()
    await expect(page.getByTestId('message-user')).toHaveCount(0)
    const asked = await page.evaluate(() => Reflect.get(window, 'confirmsAsked') as string[])
    expect(asked).toEqual([RESET_CONFIRM])
  })
})
