import {IsEnum, IsInt, IsOptional, IsString, MaxLength, Min} from "class-validator"
import {Type} from "class-transformer"
import {
  PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT,
  PublishedStatus,
  SORT_BY_DEFAULT,
  SortDirection
} from "../../../../infrastructure/utils/constants";


export class GetQuestionsQueryInputModel {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bodySearchTerm: string = ""

  @IsOptional()
  @IsEnum(PublishedStatus)
  publishedStatus: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sortBy: string = SORT_BY_DEFAULT

  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = PAGE_NUMBER_DEFAULT

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = PAGE_SIZE_DEFAULT
}
