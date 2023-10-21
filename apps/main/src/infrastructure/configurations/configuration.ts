export const configuration = () => {
	return {
		PORT: Number(process.env.PORT),
		DATABASE_URL: process.env.DATABASE_URL,
		DATABASE_URL_NEON: process.env.DATABASE_URL_NEON,
		ACCESS_JWT_SECRET: process.env.ACCESS_JWT_SECRET,
		REFRESH_JWT_SECRET: process.env.REFRESH_JWT_SECRET,
		EMAIL_CONFIRMATION_CODE_SECRET: process.env.EMAIL_CONFIRMATION_CODE_SECRET
	}
}
export type ConfigType = ReturnType<typeof configuration>
