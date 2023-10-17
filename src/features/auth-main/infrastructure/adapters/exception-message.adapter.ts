import { ErrorsType } from "./types/exception-message.type"

export const callErrorMessage = (message: string, field: string): ErrorsType => {
    return {
        message: message,
        field: field,
    }
}
