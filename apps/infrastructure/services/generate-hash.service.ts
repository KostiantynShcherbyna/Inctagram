import bcrypt from 'bcrypt'

export const generateHashService = async (dto: string) => {
	const salt = await bcrypt.genSalt()
	return bcrypt.hash(dto, salt)
}