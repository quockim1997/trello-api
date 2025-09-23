/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import express from 'express'

// Local
import { boardValidation } from '~/validations/boardValidation.js'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware.js'

const Router = express.Router()

// Trước khi chạy vào tầng Validation và Controller thì phải chạy qua tầng Middleware
Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  // boardValidation validate ok rồi thì mới chạy tới boardController thông qua next() trong boardValidation
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.updateData, boardController.updateData)

// API hỗ trợ việc di chuyển card giữa các Column khác nhau trong một Board
Router.route('/supports/moving_card')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)

export const boardRoute = Router
