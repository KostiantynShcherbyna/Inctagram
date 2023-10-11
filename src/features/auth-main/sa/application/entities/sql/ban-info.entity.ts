import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"
import { AccountEntity } from "./account.entity"

@Entity()
export class BanInfoEntity {

  @PrimaryColumn({ type: "uuid" })
  UserId: string

  @Column({ default: false })
  IsBanned: boolean

  @Column({ type: "character varying", nullable: true })
  BanDate: string | null

  @Column({ type: "character varying", nullable: true})
  BanReason: string | null

  @JoinColumn({ name: "UserId" })
  @OneToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}