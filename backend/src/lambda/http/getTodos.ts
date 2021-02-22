
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import {ApiResponseHelper}  from '../../utils/ApiResponseHelper'
import { getAllTodos } from '../../businessLayer/todos'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('get-todos')
const apiResponseHelper = new ApiResponseHelper()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try {
      const jwtToken: string = getToken(event.headers.Authorization)
      const todos = await getAllTodos(jwtToken)

      return {
        statusCode: 200,
        body: JSON.stringify({items: todos })
      }
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


