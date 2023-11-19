import { ConfigService } from '@nestjs/config'
import { emailService } from '../services/email.service'

export class EmailAdapter {
	constructor(protected configService: ConfigService) {
	}
	async sendConfirmationCode(email: string, confirmationCode: string, domain: string) {
		console.log('confirmationCode', confirmationCode)
		// const domain = this.configService.get<string>('DOMAIN')
		await emailService.sendEmail({
			service: 'gmail',
			user: 'kstntn.xxx@gmail.com',
			pass: 'lkzebhjjcjymsvqc',
			from: 'inctagram <visualvoyage@gmail.com>',
			email: email,
			subject: 'registration confirmation',
			message: `<h1>Thanks for your registration</h1>
            <p>To finish registration please follow the link below: 
            <a href='${domain}/signIn/registration-confirmation/${confirmationCode}'
            >link</a>
            </p>`
		})
	}

	async sendPasswordRecovery(email: string, passwordRecoveryCode: string) {
		console.log('passwordRecoveryCode', passwordRecoveryCode)
		const domain = this.configService.get<string>('DOMAIN')
		const emailDTO = {
			service: 'gmail',
			user: 'kstntn.xxx@gmail.com',
			pass: 'lkzebhjjcjymsvqc',
			from: 'inctagram <visualvoyage@gmail.com>',

			email: email,
			subject: 'recovery password',
			message: `<h1>Password Recovery</h1>
            <p>To finish to recovery password follow the link below:
            <a href='${domain}/newPassword/${passwordRecoveryCode}'
            >link</a> 
            </p>`
		}
		await emailService.sendEmail(emailDTO)
	}
}
