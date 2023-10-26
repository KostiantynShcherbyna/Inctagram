import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { FilesS3Adapter } from '../../../../infrastructure/adapters/files-s3.adapter'
import { UsersRepository } from '../../repo/users.repository'

export class UploadPhotoS3Command {
	constructor(
		public userId: string,
		public originalName: string,
		public wallpaperBuffer: Buffer
	) {
	}
}


@CommandHandler(UploadPhotoS3Command)
export class UploadPhotoS3UseCase
	implements ICommandHandler<UploadPhotoS3Command> {
	constructor(
		protected filesS3Adapter: FilesS3Adapter,
		protected usersRepository: UsersRepository
	) {
	}

	async execute(command: UploadPhotoS3Command) {
		// await validateOrRejectFunc(bodyBlog, BodyBlogModel)
		const photoS3RelativePath = await this.filesS3Adapter
			.saveWallpaper({
				userId: command.userId,
				fileName: command.originalName,
				photoBuffer: command.wallpaperBuffer
			})

		const user = await this.usersRepository.findUserById(command.userId)

		return photoS3RelativePath
	}

}