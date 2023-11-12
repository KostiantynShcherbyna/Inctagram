export interface ICreatePostImagePath {
	imageId: string
	userId: string
	postId: string
	originalname: string
}

export interface ICreatePostImage {
	id: string
	userId: string
	postId: string
	path: string
	contentType: string
	height: number
	width: number
	size: number
}