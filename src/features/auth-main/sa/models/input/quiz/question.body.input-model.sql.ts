import {IsArray, IsNotEmpty, IsString, Length} from "class-validator"
import {Transform} from "class-transformer"
import {trimValue} from "../../../../infrastructure/decorators/trim.decorator";
import {QUESTION_MAX_LENGTH, QUESTION_MIN_LENGTH} from "../../../../infrastructure/utils/constants";


export class QuestionBodyInputModelSql {
  @Transform(({ value }) => trimValue(value, "body"))
  @IsNotEmpty()
  @IsString()
  @Length(QUESTION_MIN_LENGTH, QUESTION_MAX_LENGTH)
  body: string

  @IsNotEmpty()
  @IsArray()
  correctAnswers: string[]
}
