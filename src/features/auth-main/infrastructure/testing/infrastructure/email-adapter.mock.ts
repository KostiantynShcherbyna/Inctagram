import { EmailAdapter } from "../../adapters/email.adapter"
import { UsersDocument } from "../../../features/sa/application/entities/mongoose/users.schema"

export class EmailAdapterMock {
  async sendConfirmationCode(user: UsersDocument): Promise<boolean> {
    return true
  }

  async sendPasswordRecovery(email: string, passwordRecoveryToken: string): Promise<boolean> {
    return true
  }
}
