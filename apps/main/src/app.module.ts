import { Module } from '@nestjs/common'
import { PostController } from './features/posts/api/post.controller'
import { UserController } from './features/users/api/user.controller'
import { PostService } from './features/posts/app/post.service'
import { UserService } from './features/users/app/user.service'
import { PrismaService } from './prisma.service'
import { AuthController } from './features/auth/api/auth.controller'
import { RegistrationUseCase } from './features/auth/app/use-cases/registration.use-case'
import { CommandBus } from '@nestjs/cqrs'

@Module({
	imports: [],
	controllers: [PostController, UserController, AuthController],
	providers: [
		CommandBus,
		PrismaService,
		PostService,
		UserService,
		RegistrationUseCase
	]
})
export class AppModule {}
