import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { PhotoNormalTypes, WALLPAPER_NORMAL_SIZE } from '../../../../infrastructure/utils/constants'
import { outputMessageException } from '../../../../infrastructure/utils/output-message-exception'
import { ErrorEnum } from '../../../../infrastructure/utils/error-enum'

@Injectable()
export class UserPhotoGuard implements PipeTransform {
	async transform(file: Express.Multer.File) {
		if (!file) throw new BadRequestException(outputMessageException(
			ErrorEnum.FILE_IS_REQUIRED, 'file'))

		if (file.mimetype ! in PhotoNormalTypes)
			throw new BadRequestException({
				message: `type have to be one of ${PhotoNormalTypes}`,
				field: 'file'
			})
		if (file.size > WALLPAPER_NORMAL_SIZE)
			throw new BadRequestException({
				message: `size don't have to be more then ${WALLPAPER_NORMAL_SIZE}`,
				field: 'file'
			})

		return file
	}
}