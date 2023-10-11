import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { BanInfoEntity } from "./ban-info.entity"

@Entity()
export class AccountEntity {

  @PrimaryGeneratedColumn("uuid")
  UserId: string

  @Column()
  Login: string

  @Column()
  Email: string

  @Column()
  PasswordHash: string

  @Column()
  CreatedAt: string


}