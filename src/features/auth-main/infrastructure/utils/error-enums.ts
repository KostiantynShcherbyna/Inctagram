export enum ErrorEnums {

  FAIL_LOGIC = `Fail logic`,

  EMAIL_NOT_SENT = `Email not sent`,

  //↓↓↓ AUTH
  TOKEN_NOT_VERIFY = `Token not verified`,
  DEVICE_NOT_FOUND = `Device not found`,
  DEVICE_NOT_DELETE = `Device_not deleted`,
  DEVICES_NOT_DELETE = `Devices not deleted`,
  PASSWORD_NOT_COMPARED = `Password not compared`,
  RECOVERY_CODE_INVALID = `RECOVERY_CODE_INVALID`,
  RECOVERY_CODE_NOT_FOUND = `RECOVERY_CODE_NOT_FOUND`,
  RECOVERY_CODE_NOT_DELETE = `RECOVERY_CODE_NOT_DELETE`,
  FOREIGN_DEVICE = `Foreign device`,
  CONFIRMATION_CODE_EXPIRED = `Confirmation code is expired`,

  // ↓↓↓ BLOGS
  BLOG_NOT_FOUND = `Blog not found`,
  BLOG_IS_BANNED = `Blog is banned`,
  BLOG_NOT_DELETED = `Blog not deleted`,
  FOREIGN_BLOG = `Foreign blog`,
  BLOG_ALREADY_BOUND = `Blog already bound`,

  // ↓↓↓ POSTS
  POST_NOT_FOUND = `Post not found`,
  POST_NOT_DELETED = `Post not deleted`,
  POST_NOT_UPDATED = `Post not updated`,
  POSTS_NOT_DELETED = `Posts not deleted`,
  FOREIGN_POST = `Foreign post`,


  // ↓↓↓ USERS
  USER_IS_BANNED = `User is banned`,
  USER_NOT_FOUND = `User not found`,
  USER_NOT_BANNED = `User not banned`,
  USER_NOT_DELETED = `User not deleted`,
  USER_EMAIL_EXIST = `User email exist`,
  USER_LOGIN_EXIST = `User login exist`,
  USER_EMAIL_CONFIRMED = `User email is confirmed`,
  USER_EMAIL_NOT_CONFIRMED = `User email not confirmed`,

  // ↓↓↓ COMMENTS
  COMMENT_NOT_FOUND = `Comment not found`,
  COMMENT_NOT_DELETE = `Comment not deleted`,
  COMMENT_NOT_UPDATED = `Comment not deleted`,
  FOREIGN_COMMENT = `Foreign comment not updated`,
  POST_COMMENT_NOT_DELETE = `Post's comment not deleted`,

  // ↓↓↓ LIKES
  LIKE_NOT_UPDATED = `Like not updated`,

  // ↓↓↓ QUIZ
  GAME_WAITING_OR_STARTED = `You are already participating in active pair`,
  GAME_NOT_STARTED = `You are not in active pair`,
  QUESTION_NOT_FOUND = `Question not found`,
  FOREIGN_GAME = `Foreign game`,
  OVERDO_ANSWER = `Non-existent question`,

}



// export const errorMessages = {

//     // ↓↓↓ BLOGS
//     notFoundBlog(id: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `blogs with id: '${id}' does't exist`,
//                         field: `id`
//                     }
//                 ]
//             })
//     },

//     newBlogNotCreated() {

//         return {
//             errorsMessages: [
//                 {
//                     message: `new blogs didn't create`,
//                 }
//             ]
//         }
//     },


//     // ↓↓↓ POSTS
//     notFoundPost(id: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `post with id: '${id}' does't exist`,
//                         field: `id`
//                     }
//                 ]
//             })
//     },

//     notFoundPostByPostId(postId: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `post with postId: '${postId}' does't exist`,
//                         field: `postId`
//                     }
//                 ]
//             })
//     },


//     // ↓↓↓ USERS
//     notFoundUserById(id: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `user with id: '${id}' does't exist`,
//                         field: `id`
//                     }
//                 ]
//             })
//     },


//     notFoundUserByLoginOrEmail(loginOrEmail: string, field?: string) {
//         return {
//             errorsMessages: [
//                 {
//                     message: `user with '${loginOrEmail}' does't exist`,
//                     field: `loginOrEmail`
//                 }
//             ]
//         }
//     },


//     // ↓↓↓ AUTH
//     confirmationError(code: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.bad_request_400)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `confirmation code '${code}' is incorrect, expired or already been applied`,
//                         field: `code`
//                     }
//                 ]
//             })
//     },

//     authError(message: string, field: string) {

//         if (!field.length) {
//             return {
//                 errorsMessages: [
//                     {
//                         message: message,
//                     }
//                 ]
//             }
//         }

//         return {
//             errorsMessages: [
//                 {
//                     message: message,
//                     field: field,
//                 }
//             ]
//         }


//     },


//     // ↓↓↓ JWT
//     signJWTError() {
//         return {
//             errorsMessages: [
//                 {
//                     message: `login error`,
//                     field: `login/password`
//                 }
//             ]
//         }
//     },

//     verifyJWTError(res: Response) {
//         res
//             .status(HTTP_STATUSES.unauthorization_401)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `error of login: can't verify token`,
//                         field: `authorization`
//                     }
//                 ]
//             })
//     },


//     // ↓↓↓ POST COMMENTS
//     notFoundPostComment(id: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `comment with 'id': '${id}' does't exist`,
//                         field: `id`
//                     }
//                 ]
//             })
//     },

//     notFoundPostCommentByCommentId(commentId: string, res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `comment with 'commentId': '${commentId}' does't exist`,
//                         field: `commentId`
//                     }
//                 ]
//             })
//     },

//     cantUpdateForeignPostComment(res: Response) {
//         res
//             .status(HTTP_STATUSES.forbidden_403)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `can't update foreign comment`,
//                         field: `authorization`
//                     }
//                 ]
//             })
//     },
//     cantDeleteForeignPostComment(res: Response) {
//         res
//             .status(HTTP_STATUSES.forbidden_403)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `can't delete foreign comment`,
//                         field: `authorization`
//                     }
//                 ]
//             })
//     },

//     notCreatedPostComment(res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `can't create comment`,
//                         // field: `postId`
//                     }
//                 ]
//             })
//     },

//     notUpdatedPostComment(res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `can't update comment`,
//                         // field: `postId`
//                     }
//                 ]
//             })
//     },

//     notDeletedPostComment(res: Response) {
//         res
//             .status(HTTP_STATUSES.not_found_404)
//             .send({
//                 errorsMessages: [
//                     {
//                         message: `can't delete comment`,
//                         // field: `postId`
//                     }
//                 ]
//             })
//     },

// }
