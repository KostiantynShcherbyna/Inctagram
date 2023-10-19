import nodemailer from 'nodemailer'
import { EmailBodyDto } from '../dto/email-body.dto'

export const emailService = {
	async sendEmail(emailBody: EmailBodyDto) {
		const transporter = nodemailer.createTransport({
			service: emailBody.service,
			auth: {
				user: emailBody.user,
				pass: emailBody.pass
			}
		})

		try {
			await transporter.sendMail({
				from: emailBody.from,
				to: emailBody.email,
				subject: emailBody.subject,
				html: emailBody.message
			})
			return true
		} catch (err) {
			console.log(`email-adapter-sendEmail - ` + err)
			return false
		}
	}
}
