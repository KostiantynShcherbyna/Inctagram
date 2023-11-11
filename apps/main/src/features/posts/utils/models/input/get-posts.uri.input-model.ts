import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT, SortDirection } from '../../../../../infrastructure/utils/constants'

export class GetPostsUriInputModel {
	@IsOptional()
	@IsString()
	@MaxLength(100)
	searchNameTerm: string = ''

	@IsOptional()
	@IsString()
	@MaxLength(100)
	sortBy: string = ''

	@IsOptional()
	@IsEnum(SortDirection)
	@MaxLength(4)
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
