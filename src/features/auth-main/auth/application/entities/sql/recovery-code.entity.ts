import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { AccountEntity } from "../../../../sa/application/entities/sql/account.entity"

@Entity()
export class RecoveryCodeEntityCopy {

  @PrimaryGeneratedColumn()
  RecoveryCodeId: number

  @Column({ nullable: false })
  Email: string

  @Column({ nullable: false })
  RecoveryCode: string

  @Column({ nullable: false })
  Active: boolean

  @JoinColumn({name: "Email"})
  @OneToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}
