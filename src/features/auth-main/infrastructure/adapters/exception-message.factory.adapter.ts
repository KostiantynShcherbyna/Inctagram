import { BadRequestException } from "@nestjs/common"

export const errorsFactory = (errors) => {
    const customErrors = errors.map(err => {
        return {
            messages: Object.values(err.constraints || ""),
            field: err.property,
        }
    })

    throw new BadRequestException(customErrors)
}