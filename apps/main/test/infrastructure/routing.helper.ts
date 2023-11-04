const authController = `/auth`
const bloggerController = `/blogger`
const blogsController = `/blogs`
const commentsController = `/comments`
const devicesController = `/security/devices`
const postsController = `/posts`
const saController = `/sa`
const testingController = `/testing`
const quizController = `/pair-game-quiz`


export const endpoints = {
	// PUBLIC ↓↓↓
	authController: {
		passwordRecovery() {
			return `${authController}/password-recovery`
		},
		newPassword() {
			return `${authController}/new-password`
		},
		login() {
			return `${authController}/login`
		},
		refreshToken() {
			return `${authController}/refresh-token`
		},
		registrationConfirmation() {
			return `${authController}/registration-confirmation`
		},
		registration() {
			return `${authController}/registration`
		},
		registrationConfirmationResend() {
			return `${authController}/registration-email-resending`
		},
		logout() {
			return `${authController}/logout`
		},
		me() {
			return `${authController}/me`
		}
	},

	postsController: {
		postComment(postId: string) {
			return `${postsController}/${postId}/comments`
		}
	},

	blogsController: {
		getBlog(blogId: string) {
			return `${blogsController}/${blogId}`
		}

	},

	commentsController: {
		getComment(commentId: string) {
			return `${commentsController}/${commentId}`
		}

	},


	// BLOGGER ↓↓↓
	bloggerController: {
		getBlogsComments() {
			return `${bloggerController}/blogs/comments`
		},
		putBlog(id: string) {
			return `${bloggerController}/blogs/${id}`
		},
		deleteBlog(id: string) {
			return `${bloggerController}/blogs/${id}`
		},
		postBlog() {
			return `${bloggerController}/blogs`
		},
		getBlogs() {
			return `${bloggerController}/blogs`
		},
		postPost(blogId: string) {
			return `${bloggerController}/blogs/${blogId}/posts`
		},
		getPosts(blogId: string) {
			return `${bloggerController}/blogs/${blogId}/posts`
		},
		putPost(blogId: string, postId: string) {
			return `${bloggerController}/blogs/${blogId}/posts/${postId}`
		},
		deletePost(blogId: string, postId: string) {
			return `${bloggerController}/blogs/${blogId}/posts/${postId}`
		},
		banUser(id: string) {
			return `${bloggerController}/users/${id}/ban`
		},
		getBannedUsersOfBlog(id: string) {
			return `${bloggerController}/users/blog/${id}`
		}
	},


	publicController: {
		connection() {
			return `${quizController}/pairs/connection`
		}
	},

	// SA ↓↓↓
	saController: {
		postUser() {
			return `${saController}/users`
		},
		getUsers() {
			return `${saController}/users`
		},
		banUser(id: string) {
			return `${saController}/users/${id}/ban`
		},
		deleteUser(id: string) {
			return `${saController}/users/${id}`
		},
		banBlog(id: string) {
			return `${saController}/blogs/${id}/ban`
		},
		bindBlog(id: string, userId: string) {
			return `${saController}/blogs/${id}/bind-with-user/${userId}`
		},
		getBlogs() {
			return `${saController}/blogs`
		},
		createQuestion() {
			return `${saController}/quiz/questions`
		},
		publishQuestion(questionId: string) {
			return `${saController}/quiz/questions/${questionId}/publish`
		},
		updateQuestion(questionId: string) {
			return `${saController}/quiz/questions/${questionId}`
		},
		getQuestions() {
			return `${saController}/quiz/questions/`
		}
	}


	// bloggerController: {
	//   getBlogsComments: `${bloggerController}/blogs/comments`,
	//   putBlog: `${bloggerController}/blogs/`,
	//   deleteBlog: `${bloggerController}/blogs/`,
	//   postBlog: `${bloggerController}/blogs`,
	//   getBlogs: `${bloggerController}/blogs`,
	//   postBlogPost: `${bloggerController}/blogs/`,
	//   blogsComments: `${bloggerController}/blogs/comments`,
	//   blogsComments: `${bloggerController}/blogs/comments`,
	// },
	// blogsController,
	// commentsController,
	// devicesController,
	// postsController,
	// saController,
	// testingController,
}

// export const Endpoints = {
//   authController: {
//     passwordRecovery: `${authController}/password-recovery`,
//     newPassword: `${authController}/new-password`,
//     login: `${authController}/login`,
//     refreshToken: `${authController}/refresh-token`,
//     registrationConfirmation: `${authController}/registration-confirmation`,
//     registration: `${authController}/registration`,
//     registrationEmailResending: `${authController}/registration-email-resending`,
//     logout: `${authController}/logout`,
//     me: `${authController}/me`,
//   },
//   bloggerController: {
//     getBlogsComments: `${bloggerController}/blogs/comments`,
//     putBlog: `${bloggerController}/blogs/`,
//     deleteBlog: `${bloggerController}/blogs/`,
//     postBlog: `${bloggerController}/blogs`,
//     getBlogs: `${bloggerController}/blogs`,
//     postBlogPost: `${bloggerController}/blogs/`,
//     blogsComments: `${bloggerController}/blogs/comments`,
//     blogsComments: `${bloggerController}/blogs/comments`,
//   },
//   blogsController,
//   commentsController,
//   devicesController,
//   postsController,
//   saController,
//   testingController,
// }
