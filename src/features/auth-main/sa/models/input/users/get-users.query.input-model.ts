import {Type} from "class-transformer"
import {IsEnum, IsInt, IsOptional, IsString, MaxLength, Min} from "class-validator"
import {
  BanStatus,
  PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT,
  SORT_BY_DEFAULT,
  SortDirection
} from "../../../../infrastructure/utils/constants";


export class QueryUserSAInputModel {
  @IsOptional()
  @IsEnum(BanStatus)
  banStatus: BanStatus = BanStatus.All

  @IsOptional()
  @IsString()
  @MaxLength(100)
  searchLoginTerm: string = ""

  @IsOptional()
  @IsString()
  @MaxLength(100)
  searchEmailTerm: string = ""

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
