import bcrypt from 'bcrypt'

export const generateHashService = async (dto: string) => {
	const salt = await bcrypt.genSalt(10)
	return bcrypt.hash(dto, salt)
}