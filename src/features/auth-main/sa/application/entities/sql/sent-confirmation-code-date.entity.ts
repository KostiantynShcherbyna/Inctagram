import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm"
import { AccountEntity } from "./account.entity"

@Entity()
export class SentConfirmationCodeDateEntity {

  @PrimaryGeneratedColumn("uuid")
  SentConfirmationCodeDateId: string

  @Column({ type: "uuid" })
  UserId: string

  @Column()
  SentDate: string

  @JoinColumn({ name: "UserId" })
  @ManyToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}