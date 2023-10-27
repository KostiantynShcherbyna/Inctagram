import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { PhotoNormalTypes, WALLPAPER_NORMAL_SIZE } from '../utils/constants'

@Injectable()
export class UserPhotoPipe implements PipeTransform {
	async transform(file: Express.Multer.File) {

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