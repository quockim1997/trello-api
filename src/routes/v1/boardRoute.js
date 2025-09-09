/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import express from 'express'
import { StatusCodes } from 'http-status-codes'

// Local
import {boardValidation} from '~/validations/boardValidation.js'
import { boardController } from '~/controllers/boardController'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'GET: APIs get list board' })
  })
  // boardValidation validate ok rồi thì mới chạy tới boardController thông qua next() trong boardValidation
  .post(boardValidation.createNew, boardController.createNew)

export const boardRoute = Router
