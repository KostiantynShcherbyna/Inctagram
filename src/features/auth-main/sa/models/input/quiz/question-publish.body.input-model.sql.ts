import {IsBoolean, IsNotEmpty} from "class-validator"


export class QuestionPublishBodyInputModelSql {
  @IsNotEmpty()
  @IsBoolean()
  published: boolean
}
