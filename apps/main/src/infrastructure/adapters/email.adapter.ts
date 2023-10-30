import { emailService } from '../services/email.service'

export class EmailAdapter {
	async sendConfirmationCode(email: string, confirmationCode: string) {
		const domain = `https://visualvoyage.ru`
		await emailService.sendEmail({
			service: 'gmail',
			user: 'kstntn.xxx@gmail.com',
			pass: 'lkzebhjjcjymsvqc',
			from: 'inctagram <visualvoyage@gmail.com>',
			email: email,
			subject: 'registration confirmation',
			message: `<h1>Thanks for your registration</h1>
            <p>To finish registration please follow the link below:
            <a href='${domain}/confirm-email?code=${confirmationCode}'
            >complete registration with code</a>
            </p>`
		})
	}

	async sendPasswordRecovery(email: string, passwordRecoveryToken: string) {
		console.log('passwordRecoveryToken - ' + passwordRecoveryToken)

		const domain = `https://visualvoyage.ru`

		const emailDTO = {
			service: 'gmail',
			user: 'kstntn.xxx@gmail.com',
			pass: 'lkzebhjjcjymsvqc',
			from: 'inctagram <visualvoyage@gmail.com>',

			email: email,
			subject: 'recovery password',
			message: `<h1>Password Recovery</h1>
            <p>To finish to recovery password follow the link below:
            <a href='${domain}/password-recovery?recoveryCode=${passwordRecoveryToken}'
            >link</a> 
            </p>`
		}
		await emailService.sendEmail(emailDTO)
	}
}
