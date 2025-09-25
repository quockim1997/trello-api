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

export const invitationController = {
  createNewBoardInvitation
}