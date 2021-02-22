import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import {ApiResponseHelper}  from '../../utils/ApiResponseHelper'

import { deleteTodo } from '../../businessLayer/todos'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('delete-todo')
const apiResponseHelper = new ApiResponseHelper()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const jwtToken: string = getToken(event.headers.Authorization)

    try {
      await deleteTodo(todoId, jwtToken)

      return apiResponseHelper.generateEmptySuccessResponse(200)
    } catch (e) {
      logger.error('Error: ' + e.message)

      return apiResponseHelper.generateErrorResponse(500,e.message)
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)

