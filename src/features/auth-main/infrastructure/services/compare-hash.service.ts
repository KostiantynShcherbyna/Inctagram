import bcrypt from "bcrypt"

export const compareHashManager = async (hash: string, dto: string): Promise<boolean> => {

  const isCompare = await bcrypt
    .compare(
      dto,
      hash
    )

  if (!isCompare) {
    return false
  }

  return isCompare
}