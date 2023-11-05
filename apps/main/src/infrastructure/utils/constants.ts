export const EMAIL_REGISTRATION_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
export const LOGIN_REGEX = /^[a-zA-Z0-9_-]*$/
export const LOGIN_MAX_LENGTH = 30
export const LOGIN_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 20
export const PASSWORD_MIN_LENGTH = 6
export const FIRSTNAME_MAX_LENGTH = 50
export const FIRSTNAME_MIN_LENGTH = 1
export const LASTNAME_MAX_LENGTH = 50
export const LASTNAME_MIN_LENGTH = 1
export const ABOUT_ME_MAX_LENGTH = 200

export enum BadResponse {
	REGISTRATION = 'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
	REGISTRATION_CONFIRMATION = 'If the confirmation code is incorrect, expired or already been applied'
}

export enum ValidResponse {
	REGISTRATION = 'Input data is accepted. Email with confirmation code will be send to passed email address',
	REGISTRATION_CONFIRMATION = 'Email was verified. Account was activated'
}

export const AVATAR_NORMAL_SIZE = 10000 * (2 ** 10) // 10 000 KB (10МB)
export const POST_IMAGE_NORMAL_SIZE = 20000 * (2 ** 10) // 20 000 KB (20МB)
export enum WallpaperNormalDimensions {
	Width = 1028,
	Height = 312,
}

export enum PhotoNormalTypes {
	Png = 'image/png',
	Jpg = 'image/jpg',
	Jpeg = 'image/jpeg',
}

export enum EnvConfigEnum {
	PORT = 3001,
	DATABASE_URL = 'postgresql://kstntn.sch:2425@localhost:5432/inctagram',
	DATABASE_URL_NEON = 'postgres://kstntn.sch:l41eCMbNpPzE@ep-lively-grass-37577731.eu-central-1.aws.neon.tech/inctagram',
	ACCESS_JWT_SECRET = 'ACCESSJWTSECRET',
	REFRESH_JWT_SECRET = 'REFRESHJWTSECRET',
	GOOGLE_CLIENT_ID = '742750804533-hc4t5pt5l7glcm2tqopjhi139q3kalg0.apps.googleusercontent.com',
	GOOGLE_CLIENT_SECRET = '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',
	GOOGLE_OAUTH_REDIRECT_URL = 'http://localhost:3000/api/v1/auth/google/redirect',
	GITHUB_CLIENT_ID = 'c7d6b6fdee01d44d60fa',
	GITHUB_CLIENT_SECRET = 'c0af6c13bda37d0f4cedcfb2d5b5bf78431beb88',
	GITHUB_OAUTH_REDIRECT_URL = 'http://localhost:3000/api/v1/auth/github/redirect',
	EMAIL_CONFIRMATION_CODE_SECRET = 'EMAILCONFIRMATIONCODESECRET',
	PASSWORD_RECOVERY_CODE_SECRET = 'PASSWORDRECOVERYCODESECRET'
}


export enum ExpiresTime {
	EMAIL_CONFIRMATION_CODE_EXP_TIME = '300s',
	ACCESS_EXPIRES_TIME = '100000000000s',
	REFRESH_EXPIRES_TIME = '20000000000s',
	PASSWORD_HASH_EXPIRES_TIME = '5m',
}

export enum StrategyNames {
	loginLocalStrategy = 'login-local-strategy'
}

export enum Secrets {
	ACCESS_JWT_SECRET = 'ACCESS_JWT_SECRET',
	REFRESH_JWT_SECRET = 'REFRESH_JWT_SECRET',
	PASSWORD_RECOVERY_CODE_SECRET = 'PASSWORD_RECOVERY_CODE_SECRET',
	EMAIL_CONFIRMATION_CODE_SECRET = 'EMAIL_CONFIRMATION_CODE_SECRET',
	USERPHOTO_SECRET = 'USERPHOTO_SECRET'
}
