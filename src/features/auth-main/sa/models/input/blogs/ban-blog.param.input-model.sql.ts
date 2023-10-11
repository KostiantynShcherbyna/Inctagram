import { IsMongoId, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator"

export class BanBlogParamInputModelSql {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @IsUUID()
  id: string
}
