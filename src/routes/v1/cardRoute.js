/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import express from 'express'

// Local
import { cardValidation } from '~/validations/cardValidation.js'
import { cardController } from '~/controllers/cardController'

const Router = express.Router()

Router.route('/')
  // cardValidation validate ok rồi thì mới chạy tới cardController thông qua next() trong cardValidation
  .post(cardValidation.createNew, cardController.createNew)

export const cardRoute = Router
