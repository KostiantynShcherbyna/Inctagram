import { User } from '@prisma/client'

export class EmailAdapterMock {
  async sendConfirmationCode(user: User): Promise<boolean> {
    return true
  }

  async sendPasswordRecovery(email: string, passwordRecoveryToken: string): Promise<boolean> {
    return true
  }
}
