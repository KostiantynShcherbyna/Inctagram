export interface ICreateAvatarPath {
	userId: string
	avatarId: string
	originalname: string
}

export interface ICreateAvatar {
	id: string
	userId: string
	uploadPath: string
	contentType: string
	height: number
	width: number
	size: number
}