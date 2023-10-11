import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform, } from "@nestjs/common"
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator"
import { BlogsRepository } from "../../features/blogs/repository/mongoose/blogs.repository"
import sharp from "sharp"
import * as Buffer from "buffer"
import { WALLPAPER_NORMAL_SIZE, WallpaperNormalDimensions, WallpaperNormalTypes } from "../utils/constants"

@Injectable()
export class BlogWallpaperDecorator implements PipeTransform {
  async transform(file: Express.Multer.File) {
    const metadata = await sharp(file.buffer).metadata()
    const normalHeight = WallpaperNormalDimensions.Height
    const normalWidth = WallpaperNormalDimensions.Width

    if (file.mimetype ! in WallpaperNormalTypes) throw new BadRequestException(
      { message: `type have to be one of ${WallpaperNormalTypes}`, field: "file" })
    if (file.size > WALLPAPER_NORMAL_SIZE) throw new BadRequestException(
      { message: `size don't have to be more then ${WALLPAPER_NORMAL_SIZE}`, field: "file" })
    if (metadata.height !== normalHeight) throw new BadRequestException(
      { message: `height have to be ${normalHeight}`, field: "file" })
    if (metadata.width !== normalWidth) throw new BadRequestException(
      { message: `width have to be ${normalWidth}`, field: "file" })

    return true
  }
}