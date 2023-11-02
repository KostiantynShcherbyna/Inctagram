import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { PhotoNormalTypes, USER_PHOTO_NORMAL_SIZE } from '../../utils/constants'
import { outputMessageException } from '../../utils/output-message-exception'
import { ErrorEnum } from '../../utils/error-enum'

@Injectable()
export class UploadAvatarPipe implements PipeTransform {
	async transform(file: Express.Multer.File) {
		if (!file) throw new BadRequestException(outputMessageException(
			ErrorEnum.FILE_IS_REQUIRED, 'file'))

		if (file.mimetype ! in PhotoNormalTypes)
			throw new BadRequestException({
				message: `type have to be one of ${PhotoNormalTypes}`,
				field: 'file'
			})
		if (file.size > USER_PHOTO_NORMAL_SIZE)
			throw new BadRequestException({
				message: `size don't have to be more then ${USER_PHOTO_NORMAL_SIZE}`,
				field: 'file'
			})

		return file
	}
}