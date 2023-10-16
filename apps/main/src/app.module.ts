import { Module } from '@nestjs/common'
import { PostController } from './features/posts/api/post.controller'
import { UserController } from './features/users/api/user.controller'
import { PostService } from './features/posts/app/post.service'
import { UserService } from './features/users/app/user.service'
import { PrismaService } from './prisma.service'

@Module({
	imports: [],
	controllers: [PostController, UserController],
	providers: [PrismaService, PostService, UserService]
})
export class AppModule {}
