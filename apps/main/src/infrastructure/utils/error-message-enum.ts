export enum ErrorMessageEnum {

	FAIL_LOGIC = `Fail logic`,
	EMAIL_NOT_SENT = `Email not sent`,

	//↓↓↓ AUTH
	TOKEN_NOT_VERIFY = `Token not verified`,
	DEVICE_NOT_FOUND = `Device not found`,
	DEVICE_NOT_DELETE = `Device_not deleted`,
	DEVICES_NOT_DELETE = `Devices not deleted`,
	PASSWORD_NOT_COMPARED = `Password not compared`,
	RECOVERY_CODE_INVALID = `RECOVERY_CODE_INVALID`,
	RECOVERY_CODE_NOT_FOUND = `RECOVERY_CODE_NOT_FOUND`,
	RECOVERY_CODE_NOT_DELETE = `RECOVERY_CODE_NOT_DELETE`,
	FOREIGN_DEVICE = `Foreign device`,
	CONFIRMATION_CODE_EXPIRED = `Confirmation code is expired`,

	// ↓↓↓ USERS
	USER_IS_BANNED = `User is banned`,
	USER_NOT_FOUND = `User not found`,
	USER_NOT_BANNED = `User not banned`,
	USER_NOT_DELETED = `User not deleted`,
	USER_EMAIL_EXIST = `User email exist`,
	USER_LOGIN_EXIST = `User login exist`,
	USER_EMAIL_CONFIRMED = `User email is confirmed`,
	USER_EMAIL_NOT_CONFIRMED = `User email not confirmed`,


}