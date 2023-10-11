import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DeviceSessionOptional = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.deviceSession) return
    return request.deviceSession;
  },
);       