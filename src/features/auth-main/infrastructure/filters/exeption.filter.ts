import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, } from "@nestjs/common"
import { Response } from "express"

@Catch()
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    console.log({ INTERNAL_ERROR: { message: exception.message, stack: exception.stack } })
    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send("Sorry, something went wrong...")
  }
}


@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    // ↓↓↓ BAD_REQUEST
    if (status === HttpStatus.BAD_REQUEST) {
      const errorsMessages = this.messagesModify(exceptionResponse)

      return errorsMessages
        ? response.status(status).send({ errorsMessages })
        : response.sendStatus(status)
    }
    // ↓↓↓ UNAUTHORIZED
    if (status === HttpStatus.UNAUTHORIZED) {
      const errorsMessages = this.messagesModify(exceptionResponse)

      return errorsMessages
        ? response.status(status).send({ errorsMessages })
        : response.sendStatus(status)
    }
    // ↓↓↓ NOT_FOUND
    if (status === HttpStatus.NOT_FOUND) {
      const errorsMessages = this.messagesModify(exceptionResponse)

      return errorsMessages
        ? response.status(status).send({ errorsMessages })
        : response.sendStatus(status)
    }

    return response.sendStatus(status)
  }


  private messagesModify(exceptionResponse: any) {
    console.log("exceptionResponse - " + JSON.stringify(exceptionResponse))

    if (Array.isArray(exceptionResponse.message)) {
      return exceptionResponse.message.map(err => {
        return {
          message: err.messages[0].trim(),
          field: err.field,
        }
      })
    }

    if (
      exceptionResponse instanceof Object
      && exceptionResponse.field
    ) return [exceptionResponse]

    return null
    // if (
    //   exceptionResponse instanceof Object
    //   && exceptionResponse !== null
    //   && !exceptionResponse.field
    // ) return [
    //   {
    //     message: exceptionResponse.message.trim(),
    //     field: ""
    //   }
    // ]

    // if (
    //   typeof exceptionResponse === "string"
    // ) return exceptionResponse.trim()


  }
  //   return Array.isArray(exceptionResponse.message)

  //     ? exceptionResponse.message.map(err => {
  //       return {
  //         message: err.messages[0],
  //         field: err.field,
  //       }
  //     })
  //     : exceptionResponse.message.trim()
  // }

}

// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const response = host.switchToHttp().getResponse<Response>();
//     const status = exception.getStatus();
//     const exceptionResponse: any = exception.getResponse();
//     if (status === HttpStatus.BAD_REQUEST && Array.isArray(exceptionResponse.message)) {
//       const errorMessages = exceptionResponseMap(exceptionResponse)

//       response.status(status).json({ errorMessages });
//       return
//     }

//     response.sendStatus(status);
//     return


//     function exceptionResponseMap(exceptionResponse: any) {
//       const errorMessages = exceptionResponse.message.map(err => {
//         return {
//           field: err.field,
//           message: err.message[0],
//         };
//       });

//       return errorMessages
//     }
//   }


// }


