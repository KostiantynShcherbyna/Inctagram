export enum ErrorEnum {
	NOT_FOUND = `Not found`,
	UNAUTHORIZED = `Unauthorized`,
	FORBIDDEN = `Forbidden`,


	FAIL_LOGIC = `Fail logic`,
	EXCEPTION = `EXCEPTION`,
	EMAIL_NOT_SENT = `Email not sent`,

	//↓↓↓ AUTH
	INVALID_TOKEN = `Token not verified`,
	DEVICE_NOT_FOUND = `Device not found`,
	DEVICE_NOT_DELETE = `Device_not deleted`,
	DEVICES_NOT_DELETE = `Devices not deleted`,
	INVALID_PASSWORD = `Password not compared`,
	INVALID_RECOVERY_CODE = `RECOVERY_CODE_INVALID`,
	RECOVERY_CODE_NOT_FOUND = `RECOVERY_CODE_NOT_FOUND`,
	RECOVERY_CODE_NOT_DELETE = `RECOVERY_CODE_NOT_DELETE`,
	FOREIGN_DEVICE = `Foreign device`,
	CONFIRMATION_CODE_EXPIRED = `Confirmation code is expired`,
	CONFIRMATION_CODE_NOT_FOUND = `Confirmation code not found`,

	// ↓↓↓ USERS
	USER_IS_BANNED = `User is banned`,
	USER_NOT_FOUND = `User not found`,
	AVATAR_NOT_FOUND = `Avatar not found`,
	USER_NOT_BANNED = `User not banned`,
	USER_NOT_DELETED = `User not deleted`,
	EMAIL_EXIST = `User with this email is already registered`,
	LOGIN_EXIST = `User with this login is already registered`,
	EMAIL_CONFIRMED = `User email is confirmed`,
	EMAIL_NOT_CONFIRMED = `User email not confirmed`,

	// ↓↓↓ POSTS
	POST_NOT_FOUND = `Post not found`,

	PHOTO_NOT_FOUND = `Photo not found`,
	FILE_IS_REQUIRED = `File is required`,

}