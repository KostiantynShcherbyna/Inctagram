import { emailService } from '../services/email.service'
import { User } from '@prisma/client'

export class EmailAdapter {
	async sendConfirmationCode(user: User) {
		const domain = `https://visualvoyage.ru`
		await emailService.sendEmail({
			service: 'gmail',
			user: 'kstntn.xxx@gmail.com',
			pass: 'lkzebhjjcjymsvqc',
			from: 'inctagram <kstntn.xxx@gmail.com>',
			email: user.email,
			subject: 'registration confirmation',
			message: `<h1>Thanks for your registration</h1>
            <p>To finish registration please follow the link below:
            <a href='${domain}/confirm-email?code=${
				user.confirmationCodes[user.confirmationCodes.length - 1]
			}'>
            complete registration with code </a>${
							user.confirmationCodes[user.confirmationCodes.length - 1]
						}
            </p>`
		})
	}

	async sendPasswordRecovery(email: string, passwordRecoveryToken: string) {
		console.log('passwordRecoveryToken - ' + passwordRecoveryToken)

		const domain = `https://somesite.com`

		const emailDTO = {
			service: 'gmail',
			user: 'kstntn.xxx@gmail.com',
			pass: 'lkzebhjjcjymsvqc',
			from: 'inctagram <kstntn.xxx@gmail.com>',

			email: email,
			subject: 'recovery password',
			message: `<h1>Thanks for your registration</h1>
            <p>To finish registration please follow the link below:
            <a href='${domain}/password-recovery?recoveryCode=${passwordRecoveryToken}'>${passwordRecoveryToken}</a> 
            </p>`
		}
		await emailService.sendEmail(emailDTO)
	}
}
