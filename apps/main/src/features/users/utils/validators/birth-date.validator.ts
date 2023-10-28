import { Injectable } from '@nestjs/common'
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import differenceInCalendarYears from 'date-fns/differenceInCalendarYears'


@ValidatorConstraint({ name: 'BirthDayValidator', async: true })
@Injectable()
export class BirthDateValidator implements ValidatorConstraintInterface {
	async validate(birthDate: string) {
		const dateOfBirth = new Date(birthDate)
		const currentDate = new Date()
		const yearsDiff = differenceInCalendarYears(currentDate, dateOfBirth)
		return yearsDiff >= 13
	}

	defaultMessage(): string {
		return 'User is under 13 years old'
	}
}