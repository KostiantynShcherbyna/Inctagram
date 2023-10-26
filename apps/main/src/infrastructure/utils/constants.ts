export const EMAIL_REGISTRATION_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
export const LOGIN_REGEX = /^[a-zA-Z0-9_-]*$/
export const LOGIN_MAX_LENGTH = 30
export const LOGIN_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 20
export const PASSWORD_MIN_LENGTH = 6

export enum BadResponse {
	REGISTRATION = 'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
	REGISTRATION_CONFIRMATION = 'If the confirmation code is incorrect, expired or already been applied'
}

export enum ValidResponse {
	REGISTRATION = 'Input data is accepted. Email with confirmation code will be send to passed email address',
	REGISTRATION_CONFIRMATION = 'Email was verified. Account was activated'
}

export const WALLPAPER_NORMAL_SIZE = 100 * (2 ** 10) // 100 KB
export enum WallpaperNormalDimensions {
	Width = 1028,
	Height = 312,
}

export enum WallpaperNormalTypes {
	Png = 'image/png',
	Jpg = 'image/jpg',
	Jpeg = 'image/jpeg',
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
	EMAIL_CONFIRMATION_CODE_SECRET = 'EMAIL_CONFIRMATION_CODE_SECRET'
}
