/* Local */
import { userModel } from '~/models/userModel.js'
import { boardModel } from '~/models/boardModel.js'
import { invitationModel } from '~/models/invitationModel.js'
import ApiError from '~/utils/ApiError'
import { pickUser } from '~/utils/formatters.js'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'

/* Library */
import { StatusCodes } from 'http-status-codes'


const createNewBoardInvitation = async (reqBody, inviterId) => {

  try {
    // Người đi mời: chính là người đang request, nên chúng ta tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId)

    // Người được mời: lấy theo email nhận từ phía FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)

    // Tìm luôn cái Board ra để lấy data xử lý
    const board = await boardModel.findOneById(reqBody.boardId)

    // Nếu không tồn tại 1 trong 3 thì => reject
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    // Tạo data cần thiết để lưu vào trong DB
    // Có thể thử bỏ hoặc làm sai lệch type, boardInvitation, status để test xem Model validate ok chưa.
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // chuyển từ ObjectId về String vì sang bên Model có check lại
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING // Default ban đầu luôn là PENDING
      }
    }

    // Gọi sang Model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)

    // Vì MongoDB không trả về đầy đủ bản ghi mà chỉ trả về insertedId của mỗi bản ghi
    // Nên ta phải dựa vào insertedId để chọc vào DB một lần nữa để lấy toàn bộ dữ liệu
    // rồi mới trả về tầng Controller
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board, inviter, invitee cho FE xử lý
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation
  } catch (error) {
    throw new Error(error)
  }
}
const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // console.log('getInvitations: ', getInvitations)

    // Vì các dữ liệu inviter, invitee và board là đang ở giá trị mảng 1 phần tử nếu lấy ra được thì chúng ta nên
    // biến đổi chúng về Json Object trước khi trả về cho phía FE
    const resInvitations = getInvitations.map(item => {
      return {
        ...item,
        inviter: item.inviter[0] || {},
        invitee: item.invitee[0] || {},
        board: item.board[0] || {}
      }
    })

    return resInvitations
  } catch (error) {
    throw new Error(error)
  }
}


export const invitationService = {
  createNewBoardInvitation,
  getInvitations
}