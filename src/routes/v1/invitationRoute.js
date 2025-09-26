/* Local */
import { invitationValidation } from '~/validations/invitationValidation.js'
import { invitationController } from '~/controllers/invitationController.js'
import { authMiddleware } from '~/middlewares/authMiddleware.js'

/* Library */
import express from 'express'

const Router = express.Router()

// Get invitations by User
Router.route('/')
  .get(authMiddleware.isAuthorized,
    invitationController.getInvitations
  )

Router.route('/board')
  .post(authMiddleware.isAuthorized,
    invitationValidation.createNewBoardInvitation,
    invitationController.createNewBoardInvitation
  )

export const invitationRoute = Router
