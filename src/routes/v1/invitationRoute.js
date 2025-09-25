/* Local */
import { invitationValidation } from '~/validations/invitationValidation.js'
import { invitationController } from '~/controllers/invitationController.js'
import { authMiddleware } from '~/middlewares/authMiddleware.js'

/* Library */
import express from 'express'

const Router = express.Router()

Router.route('/board')
  .post(authMiddleware.isAuthorized,
    invitationValidation.createNewBoardInvitation,
    invitationController.createNewBoardInvitation
  )


export const invitationRoute = Router
