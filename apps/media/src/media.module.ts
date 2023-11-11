import { Module } from '@nestjs/common'
import { UsersModule } from './modules/users/users.module'
import { PostsModule } from './modules/posts/posts.module'
import { FirebaseAdapter } from './infrastructure/adapters/firebase.adapter'

@Module({
	imports: [UsersModule, PostsModule],
	providers: [FirebaseAdapter]
})
export class MediaModule {
}
