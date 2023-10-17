export const EMAIL_REGISTRATION_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
export const LOGIN_REGEX = /^[a-zA-Z0-9_-]*$/
export const LOGIN_MAX_LENGTH = 10
export const LOGIN_MIN_LENGTH = 3
export const PASSWORD_MAX_LENGTH = 20
export const PASSWORD_MIN_LENGTH = 6

export enum StrategyNames {
	loginLocalStrategy = 'login-local-strategy'
}
