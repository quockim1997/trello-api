/* Local */
import { userValidation } from '~/validations/userValidation.js'
import { userController } from '~/controllers/userController.js'
import { authMiddleware } from '~/middlewares/authMiddleware.js'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware.js'

/* Library */
import express from 'express'

const Router = express.Router()

Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

Router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

Router.route('/login')
  .post(userValidation.login, userController.login)

Router.route('/logout')
  .delete(userController.logout)

Router.route('/refresh_token')
  .get(userController.refreshToken)

Router.route('/update')
  .put(
    authMiddleware.isAuthorized,
    // signle là upload 1 ảnh. còn 'avatar' lấy từ FE truyền lên trong file AccountTab ở hàm uploadAvatar bên FE
    multerUploadMiddleware.upload.single('avatar'),
    userValidation.update,
    userController.update
  )

export const userRouter = Router
