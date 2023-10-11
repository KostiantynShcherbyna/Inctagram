import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm"
import {AccountEntity} from "../../../../sa/application/entities/sql/account.entity"

@Entity()
export class DeviceEntity {

  @PrimaryGeneratedColumn("uuid")
  DeviceId: string

  @Column({ type: "uuid" })
  UserId: string

  @Column()
  Ip: string

  @Column()
  Title: string

  @Column()
  LastActiveDate: string

  @Column()
  ExpireAt: string

  @JoinColumn({ name: "UserId" })
  @ManyToOne(() => AccountEntity)
  AccountEntity: AccountEntity

}
