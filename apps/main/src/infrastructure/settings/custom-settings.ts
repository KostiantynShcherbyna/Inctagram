export const customSettings = () => {
	return {
		PORT: Number(process.env.PORT) || 3001,
		DATABASE_URL: process.env.DATABASE_URL || 'postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public',
		DATABASE_URL_NEON: process.env.DATABASE_URL_NEON || 'postgres://kstntn.sch:l41eCMbNpPzE@ep-lively-grass-37577731.eu-central-1.aws.neon.tech/inctagram',
		PASSWORD_RECOVERY_CODE_SECRET: process.env.PASSWORD_RECOVERY_CODE_SECRET || 'PASSWORD_RECOVERY_CODE_SECRET',
		ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET || 'ACCESSJWTSECRET',
		REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || 'REFRESHJWTSECRET',
		EMAIL_CONFIRMATION_CODE_SECRET: process.env.EMAIL_CONFIRMATION_SECRET || 'EMAILCONFIRMATIONCODESECRET',
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '335612510782-1csenfo6k4fglm7oofv815v07jrhknmj.apps.googleusercontent.com',
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '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',
		GOOGLE_OAUTH_REDIRECT_URL: process.env.GOOGLE_OAUTH_REDIRECT_URL || 'http://localhost:3000/api/auth/google/redirect',
		GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'c7d6b6fdee01d44d60fa',
		GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'c0af6c13bda37d0f4cedcfb2d5b5bf78431beb88',
		GITHUB_OAUTH_REDIRECT_URL: process.env.GITHUB_OAUTH_REDIRECT_URL || 'http://localhost:3000/api/auth/github/redirect'
	}
}
export type ConfigType = ReturnType<typeof customSettings>
