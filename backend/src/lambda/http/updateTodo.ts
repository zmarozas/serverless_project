import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import {ApiResponseHelper}  from '../../utils/ApiResponseHelper'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLayer/todos'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('update-todo')
const apiResponseHelper = new ApiResponseHelper()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      logger.info(`In UpdateTodo`)
      const todoId: string = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      const jwtToken: string = getToken(event.headers.Authorization)
      await updateTodo(todoId, updatedTodo, jwtToken)
      return apiResponseHelper.generateEmptySuccessResponse(200)

    } catch (e) {
      logger.error('Error', { error: e.message })
      return apiResponseHelper.generateErrorResponse(500,e.message)
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)



