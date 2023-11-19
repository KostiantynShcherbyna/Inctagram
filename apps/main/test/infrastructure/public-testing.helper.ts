import { faker } from '@faker-js/faker'
import request from 'supertest'
import { endpoints } from './routing.helper'
import { LoginBodyInputModel } from '../../src/features/auth/utils/models/input/login.body.input-model'
import { NewPasswordBodyInputModel } from '../../src/features/auth/utils/models/input/new-password.body.input-model'

export const preparedBlog = {
  valid: {
    name: "valid name",
    description: "valid description",
    websiteUrl: "https://it-incubator.io/",
  },
  newValid: {
    name: "new valid name",
    description: "new valid description",
    websiteUrl: "https://it-incubator.io/new",
  },
  invalid: {
    name: "",
    description: "",
    websiteUrl: "",
  },
}

export const preparedPost = {
  valid: {
    title: "valid title",
    shortDescription: "valid shortDescription",
    content: "valid content",
  },
  newValid: {
    title: "new valid title",
    shortDescription: "new valid shortDescription",
    content: "new valid content",
  },
  invalid: {
    title: "",
    shortDescription: "",
    content: "",
    blogId: "",
  },
  defaultPostsCount: 5,

  // generatePostInputData(blogs: Blog): CreatePostWithBlogIdDto {
  //   return {
  //     ...preparedPost.valid,
  //     blogId: blogs.id,
  //   };
  // },
  // generateNewPostInputData(blogs: Blog): CreatePostWithBlogIdDto {
  //   return {
  //     ...preparedPost.newValid,
  //     blogId: blogs.id,
  //   };
  // },
}

type CreateUserTestType = {
  id: string;
  login: string;
  email: string;
  password: string;
};

type CreateAndLoginUserTestType = {
  id: string;
  login: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
};

export class PublicTestingHelper {
  constructor(private readonly server: any) {
  }

  private createInputUserData() {
    return {
      login: faker.person.firstName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    }
  }

  private createCommentInputData() {
    return {
      content: faker.lorem.words(10),
    }
  }


  // AUTH ↓↓↓
  async registration() {
    const inputUserData = this.createInputUserData()
    const response = await request(this.server)
      .post(endpoints.authController.registration())
      .send(inputUserData)

    return { status: response.status, inputUserData }
  }

  async registrationUsers(usersCount: number): Promise<CreateUserTestType[]> {
    const registrationsDto: CreateUserTestType[] = []
    for (let i = 0; i < usersCount; i++) {
      const inputUserData = {
        login: `user${i}`,
        email: `user${i}@email.com`,
        password: `password${i}`,
      }
      const response = await request(this.server)
        .post(endpoints.authController.registration())
        .send(inputUserData)

      registrationsDto.push({ id: response.body.id, ...inputUserData })
    }
    return registrationsDto
  }

  async registrationConfirmation(confirmationCode: string) {
    const response = await request(this.server)
      .post(endpoints.authController.registrationConfirmation())
      .send({ code: confirmationCode })

    return { status: response.status }
  }

  async registrationConfirmationUsers(confirmationCodes: string[]) {
    const confirmationsDto: { confirmationCode: string, status: number }[] = []

    for (const confirmationCode of confirmationCodes) {
      const response = await request(this.server)
        .post(endpoints.authController.registrationConfirmation())
        .send({ code: confirmationCodes })

      confirmationsDto.push({ confirmationCode: confirmationCode, status: response.status })
    }

    return confirmationsDto
  }

  async registrationEmailResending(email: string) {
    const response = await request(this.server)
      .post(endpoints.authController.registrationConfirmationResend())
      .send({ email })

    return { status: response.status }
  }

  async login({ loginOrEmail, password }: LoginBodyInputModel) {
    const response = await request(this.server)
      .post(endpoints.authController.login())
      .set("User-Agent", faker.internet.userAgent())
      .send({ loginOrEmail, password })

    const accessToken = response.body.accessToken
    const refreshToken = response.headers["set-cookie"][0].split(";")[0].split("=")[1]

    return { status: response.status, accessToken, refreshToken }
  }

  async loginUsers(loginBodyInputs: LoginBodyInputModel[]) {
    const loginsDto: { loginOrEmail: string, status: number, accessToken: string, refreshToken: string }[] = []

    for (const loginBodyInput of loginBodyInputs) {
      const response = await request(this.server)
        .post(endpoints.authController.login())
        .set("User-Agent", faker.internet.userAgent())
        .send({ loginOrEmail: loginBodyInput.loginOrEmail, password: loginBodyInput.password })

      const accessToken = response.body.accessToken
      const refreshToken = response.headers["set-cookie"][0].split(";")[0].split("=")[1]

      loginsDto.push({ loginOrEmail: loginBodyInput.loginOrEmail, status: response.status, accessToken, refreshToken })
    }

    return loginsDto
  }

  async refreshToken(oldRefreshToken: string) {
    const response = await request(this.server)
      .post(endpoints.authController.refreshToken())
      .set("User-Agent", faker.internet.userAgent())
      .set("cookie", `refreshToken=${oldRefreshToken}`)

    const accessToken = response.body.accessToken
    const refreshToken = response.headers["set-cookie"][0].split(";")[0].split("=")[1]

    return { status: response.status, accessToken, refreshToken }
  }

  async passwordRecovery(email: string) {
    const response = await request(this.server)
      .post(endpoints.authController.passwordRecovery())
      .send({ email })
    return { status: response.status }
  }

  // async newPassword({ newPassword, recoveryCode }: NewPasswordBodyInputModel) {
  //   const response = await request(this.server)
  //     .post(endpoints.authController.newPassword())
  //     .send({ newPassword, recoveryCode })
  //
  //   return { status: response.status }
  // }

  async me(accessToken: string) {
    const response = await request(this.server)
      .get(endpoints.authController.me())
      .auth(accessToken, { type: "bearer" })

    return { status: response.status, body: response.body }
  }

  async logout(refreshToken: string) {
    const response = await request(this.server)
      .post(endpoints.authController.logout())
      .set("cookie", `refreshToken=${refreshToken}`)

    return { status: response.status }
  }


// POSTS ↓↓↓
  async createComments(accessToken: string, postsId: string[], countOfComments: number) {
    const commentsDto: any = []
    for (let i = 0; i < postsId.length; i++) {
      for (let j = 0; j < countOfComments; j++) {
        const inputCommentData = this.createCommentInputData()
        const response = await request(this.server)
          .post(endpoints.postsController.postComment(postsId[i]))
          .auth(accessToken, { type: "bearer" })
          .send(inputCommentData)
        commentsDto.push({ status: response.status, body: response.body, postId: postsId[i] })
      }
    }
    return commentsDto
  }

  async createComment(accessToken: string, postId: string) {
    const inputCommentData = this.createCommentInputData()
    const response = await request(this.server)
      .post(endpoints.postsController.postComment(postId))
      .auth(accessToken, { type: "bearer" })
      .send(inputCommentData)

    return { status: response.status, body: response.body, postId: postId }
  }


//    BLOGS ↓↓↓
  async getBlog(accessToken: string, blogId: string) {
    const response = await request(this.server)
      .get(endpoints.blogsController.getBlog(blogId))
      .auth(accessToken, { type: "bearer" })

    return { status: response.status, body: response.body }
  }

  //    COMMENTS ↓↓↓
  async getComment(accessToken: string, commentId: string) {
    const response = await request(this.server)
      .get(endpoints.commentsController.getComment(commentId))
      .auth(accessToken, { type: "bearer" })

    return { status: response.status, body: response.body }
  }


}