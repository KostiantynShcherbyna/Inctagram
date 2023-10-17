import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"
import { DeviceEntity } from "../../application/entites/sql/device.entity"

@Injectable()
export class DevicesQueryRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findDevicesByUserId(userId: string) {
    const devices = await this.dataSource.createQueryBuilder(DeviceEntity, "d")
      .select([
        `d.DeviceId as "deviceId"`,
        `d.Ip as "ip"`,
        `d.Title as "title"`,
        `d.LastActiveDate as "lastActiveDate"`
      ])
      .where(`d.Userid = :userId`, { userId })
      .getRawMany()
    return devices ? devices : null
  }


}
