/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

/* Local */
import { cardValidation } from '~/validations/cardValidation.js'
import { cardController } from '~/controllers/cardController.js'
import { authMiddleware } from '~/middlewares/authMiddleware.js'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware.js'

/* Library */
import express from 'express'

const Router = express.Router()

// Trước khi chạy vào tầng Validation và Controller thì phải chạy qua tầng Middleware
Router.route('/')
  // cardValidation validate ok rồi thì mới chạy tới cardController thông qua next() trong cardValidation
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

Router.route('/:id')
  .put(authMiddleware.isAuthorized,
    // signle là upload 1 ảnh. còn 'cardCover' lấy từ FE truyền lên trong file AccountTab ở hàm onUploadCardCover bên FE
    multerUploadMiddleware.upload.single('cardCover'),
    cardValidation.updateData,
    cardController.updateData)

export const cardRoute = Router
