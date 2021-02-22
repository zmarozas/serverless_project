import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import {ApiResponseHelper}  from '../../utils/ApiResponseHelper'

import { generateUploadUrl } from '../../businessLayer/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generate-upload-url')
const apiResponseHelper = new ApiResponseHelper()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const uploadUrl = await generateUploadUrl(todoId)

      return apiResponseHelper.generateSucessResponse(200, 'uploadUrl', uploadUrl)

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

