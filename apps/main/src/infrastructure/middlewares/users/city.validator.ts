import { Injectable } from '@nestjs/common'
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import cities from 'all-the-cities'

@ValidatorConstraint({ name: 'CityValidator', async: true })
@Injectable()
export class CityValidator implements ValidatorConstraintInterface {
	async validate(city: string) {
		return !!cities.find(c => c.name === city)
	}

	defaultMessage(): string {
		return 'The selected city does not exist'
	}
}