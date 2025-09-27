/* Local */
import { invitationService } from '~/services/invitationService.js'

/* Library */
import { StatusCodes } from 'http-status-codes'

const createNewBoardInvitation = async (req, res, next) => {
  try {
    // User thực hiện request này chính là Inviter (người đi mời)
    const inviterId = req.jwtDecoded._id
    const resInvitation = await invitationService.createNewBoardInvitation(req.body, inviterId)

    res.status(StatusCodes.CREATED).json(resInvitation)
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const getInvitations = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const reInvitations = await invitationService.getInvitations(userId)

    res.status(StatusCodes.OK).json(reInvitations)
  } catch (error) {
    next(error)
  }
}

const updateBoardInvitation = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    console.log('userId', userId)

    const { invitationId } = req.params
    const { status } = req.body

    const updatedInvitation = await invitationService.updateBoardInvitation(userId, invitationId, status)

    res.status(StatusCodes.OK).json(updatedInvitation)
  } catch (error) {
    next(error)
  }
}


export const invitationController = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}