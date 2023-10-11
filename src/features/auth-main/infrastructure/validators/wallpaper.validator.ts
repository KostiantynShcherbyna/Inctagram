import sharp from "sharp"

export class WallpaperValidator {
  async validateImage(imageBytes: Buffer, { size, height, width, }) {
    try {
      // Используйте Sharp для обработки и валидации изображения
      const metadata = await sharp(imageBytes).metadata()
      this.validateSize(imageBytes, size)
      this.validateDimension({ width: metadata.width, height: metadata.height })

      const fileType = metadata.format
      const width = metadata.width
      const height = metadata.height
      const fileSize = imageBytes.length / 1024 // Размер в KB

      // Проверка типа изображения (PNG)

    } catch (error) {
      // Если произошла ошибка, изображение недопустимо
      throw new Error("Недопустимое изображение")
    }
  }

  private validateSize(imageBytes: Buffer, size: number) {
    return ((imageBytes.length / 1024) > size)
  }

  private validateDimension({ height, width }) {
    const result: any = []
    if (height !== 300) result.push({ height, message: `height don't have to be ${height}` })
    if (width !== 100) result.push({ width, message: `width don't have to be ${width}` })
    return result
  }
}