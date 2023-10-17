import { IsBoolean, IsNotEmpty } from "class-validator";

export class BanBlogBodyInputModel {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean
}

