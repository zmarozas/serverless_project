import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'

const logger = createLogger('todos-business-layer')

const todoAccess = new TodoAccess()

export const getAllTodos = async (jwtToken: string): Promise<TodoItem[]> => {
  const userId = parseUserId(jwtToken)

  return await todoAccess.getAllTodos(userId)
}

export const createTodo = async (  createTodoRequest: CreateTodoRequest,  jwtToken: string): Promise<TodoItem> => {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  const todoItem: TodoItem={
    todoId: itemId,
    userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  }

  return await todoAccess.createToDoItem(todoItem)
}


export const updateTodo = async (  todoId: string,  updateTodoRequest: UpdateTodoRequest,  jwtToken: string): Promise<TodoItem> => {

  const userId = parseUserId(jwtToken)
  const todoItem: TodoItem=
  {
    todoId,
    userId,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done,
    createdAt: new Date().toISOString()
  }
  return await todoAccess.updateTodo(todoItem)
}


export const deleteTodo = async (  todoId: string,  jwtToken: string): Promise<string> => {
  const userId = parseUserId(jwtToken)
  return await todoAccess.deleteTodo(todoId, userId)
}

export const generateUploadUrl = async (todoId: string): Promise<string> => {
  return await todoAccess.generateUploadUrl(todoId)
}
