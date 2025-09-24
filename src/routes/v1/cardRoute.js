/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import express from 'express'

// Local
import { cardValidation } from '~/validations/cardValidation.js'
import { cardController } from '~/controllers/cardController.js'
import { authMiddleware } from '~/middlewares/authMiddleware.js'

const Router = express.Router()

// Trước khi chạy vào tầng Validation và Controller thì phải chạy qua tầng Middleware
Router.route('/')
  // cardValidation validate ok rồi thì mới chạy tới cardController thông qua next() trong cardValidation
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

Router.route('/:id')
  .put(authMiddleware.isAuthorized, cardValidation.updateData, cardController.updateData)

export const cardRoute = Router
