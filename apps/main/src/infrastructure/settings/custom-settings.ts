export const customSettings = () => {
	return {
		PORT: Number(process.env.PORT) || 3001,
		DATABASE_URL: process.env.DATABASE_URL || 'postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public',
		DATABASE_URL_NEON: process.env.DATABASE_URL_NEON || 'postgres://kstntn.sch:l41eCMbNpPzE@ep-lively-grass-37577731.eu-central-1.aws.neon.tech/inctagram',
		PASSWORD_RECOVERY_CODE_SECRET: process.env.PASSWORD_RECOVERY_CODE_SECRET || 'PASSWORD_RECOVERY_CODE_SECRET',
		ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET || 'ACCESSJWTSECRET',
		REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET || 'REFRESHJWTSECRET',
		EMAIL_CONFIRMATION_CODE_SECRET: process.env.EMAIL_CONFIRMATION_SECRET || 'EMAILCONFIRMATIONCODESECRET'
	}
}
export type ConfigType = ReturnType<typeof customSettings>
