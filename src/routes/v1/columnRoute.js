/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import express from 'express'

// Local
import { columnValidation } from '~/validations/columnValidation.js'
import { columnController } from '~/controllers/columnController.js'

const Router = express.Router()

Router.route('/')
  // columnValidation validate ok rồi thì mới chạy tới columnController thông qua next() trong columnValidation
  .post(columnValidation.createNew, columnController.createNew)

Router.route('/:id')
  .put(columnValidation.updateData, columnController.updateData)
  .delete(columnValidation.deleteData, columnController.deleteData)

export const columnRoute = Router
