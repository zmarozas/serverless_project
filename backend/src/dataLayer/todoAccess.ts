import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todo-access')


export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = createS3Client(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.USER_ID_INDEX
  ) { }



  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log(`Getting all todos for ${userId}`)
    const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ScanIndexForward: false
    }).promise();
    return result.Items as TodoItem[];
  }

  async createToDoItem(todoItem: TodoItem) :Promise<TodoItem> {
    console.log(`creating group ${todoItem.todoId}`)

    todoItem.attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoItem.todoId}`
    await this.docClient.put({
      TableName:this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }  

  async updateTodo(updatedItem: TodoItem): Promise<TodoItem> {
    logger.info(`Updating a todo with ID ${updatedItem.todoId}`)
    await this.docClient.update({
      TableName:this.todosTable,
      Key: {
        todoId: updatedItem.todoId,
        userId: updatedItem.userId
      },
      UpdateExpression: 'set #name = :name, #dueDate = :due, #done= :d',
      ExpressionAttributeValues: {
        ':name' : updatedItem.name,
        ':due': updatedItem.dueDate,
        ':d': updatedItem.done
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ReturnValues: 'UPDATED_NEW'
    }).promise()
    return updatedItem
  }

 
  async deleteTodo(todoId:string, userId:string): Promise<string>{
    console.log(`delete item ${todoId}`)

    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()
    return userId

  }

  
  async generateUploadUrl(todoId: string): Promise<string> {
    logger.info('Generating upload Url')

    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}



const createDynamoDBClient = () => {
  return new XAWS.DynamoDB.DocumentClient()
}

const createS3Client = () => {
  return new  XAWS.S3({ signatureVersion: 'v4' })
}
