import puppeteer from 'puppeteer'
import { env } from '../config/env'
import { ClientError } from '../utils/trpc'

export class PdfService {
  public async getPdf(url: string) {
    // Verify that the url contains the selected and preview queries
    if (
      !url.includes('compose-feedback') ||
      !url.includes('selected') ||
      !url.includes('preview')
    ) {
      throw new ClientError('Invalid feedback URL')
    }

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    const loginUrl = `${env.PORTAL_APP_BASE_URL}/auth/login`
    // const websiteUrl = `${env.PORTAL_APP_BASE_URL}/dashboard/my-surveys/survey-details/1/patient-list/patient-records/1/feedback-records/compose-feedback?preview=true`
    const websiteUrl = url

    //  TODO: Replace with admin login credentials that can access the html page
    await page.goto(loginUrl, { waitUntil: 'networkidle0' })
    await page.type('input[name=email]', 'diet@test.com')
    await page.type('input[name=password]', 'password')
    await page.click('#login-form-submit')
    await page.waitForNavigation()

    await page.goto(websiteUrl, { waitUntil: 'networkidle0' })
    await new Promise(r => {
      setTimeout(r, 1000)
    })
    await page.emulateMediaType('print')

    const pdf = await page.pdf({
      path: 'feedback-outputs/feedback.pdf',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
      format: 'A2',
    })

    await browser.close()
    return pdf
  }
}
