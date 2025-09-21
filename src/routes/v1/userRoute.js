/* Library */
import express from 'express'

/* Local */
import { userValidation } from '~/validations/userValidation.js'
import { userController } from '~/controllers/userController.js'

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

export const userRouter = Router
