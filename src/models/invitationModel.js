/* Local */
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants.js'
import { GET_DB } from '~/config/mongodb.js'
import { userModel } from './userModel'
import { boardModel } from './boardModel'

/* Library */
import Joi from 'joi'
import { ObjectId } from 'mongodb'

// Define Collection (name & schema)
const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // Người đi mời
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // Người được mời
  //  Cho dù bên INVITATION_TYPES có truyền vào bao nhiêu đi nữa,
  // thì nó cũng lấy được hết thay vì phải .valid(INVITATION_TYPES.BOARD_INVITATION, ...vvv)
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)), // Kiểu của lời mời (trong vd này là mời vào board)

  // Lời mời là board thì sẽ lưu thêm dữ liệu boardInvitation - optional
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định ra những field mà chúng ta không muốn cho phép cập nhật trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt']

// Hàm validate data 1 lần nữa trước khi lưu vào DB thông qua phương thức validateAsync
// Nếu không validate 1 lần nữa thì sẽ nhận vào các data rác
const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

// Hàm tạo mới một data mới
const createNewBoardInvitation = async (data) => {
  try {
    // Lưu data đã validate vào biến này và sử dụng biến này đưa vào phương thức insertOne để lưu vào DB
    const dataBeforeValidate = await validateBeforeCreate(data)

    // Biến đổi một số dữ liệu liên quan tới ObjectId chuẩn chỉnh
    let newInvitationToAdd = {
      ...dataBeforeValidate,
      inviterId: new ObjectId(String(dataBeforeValidate.inviterId)),
      inviteeId: new ObjectId(String(dataBeforeValidate.inviteeId))
    }

    // Nếu tồn tại dữ liệu boardInvitation thì update cho cái boardId
    if (dataBeforeValidate.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...dataBeforeValidate.boardInvitation,
        boardId: new ObjectId(String(dataBeforeValidate.boardInvitation.boardId))
      }
    }

    // Thêm mới(insert) một document(data) vào collection(bảng) trong MongoDB.
    const createdInvitation = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .insertOne(newInvitationToAdd)

    // Trả kết quả về tầng Service
    return createdInvitation
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm tìm data trong DB dựa vào insertedId trả về
// Hàm này chỉ lấy ra user thôi
const findOneById = async (invitationId) => {
  try {
    // Thêm ObjectId của MongoDB vào để mặc định _id trả về sẽ luôn là ObjectId
    // vì MongoDB sẽ trả về _id là một ObjectId
    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(invitationId))
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm cập nhật User
const update = async (invitationId, updateData) => {
  try {
    // Xóa đi các trường không muốn cập nhật:
    // VD: inviterId, inviteeId,...vv
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Đối với những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(String(updateData.boardInvitation.boardId))
      }
    }

    const result = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .findOneAndUpdate(
        // phương thức này có trong mondoDB
        { _id: new ObjectId(String(invitationId)) },
        { $set: updateData }, // doc: https://www.mongodb.com/docs/manual/reference/operator/update/push/
        { returnDocument: 'after' } // Muốn trả về bản ghi sau khi đã findOneAndUpdate thì phải có phương thức returnDocument = false
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm lấy data theo id
// Query tổng hợp (aggregate) để lấy những bản ghi invation thuộc về một User cụ thể
const findByUser = async (userId) => {
  try {
    // Các điều kiện để thực hiện một truy vấn
    const queryConditions = [
      // Điều kiện 01: Board theo _id
      // Tìm theo inviteeId (người được mời - chính là người đang thực hiện request này)
      { inviteeId: new ObjectId(String(userId)) },

      // Điều kiện 02: Board chưa bị xóa
      { _destroy: false }
    ]

    const results = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        {
          // Phải thỏa mãn 2 điều kiện bên trên.
          $match: { $and: queryConditions }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME, // Tìm đến bảng User
            localField: 'inviterId', // Lấy thông tin thằng mời
            foreignField: '_id', // Còn đây là id mà bảng User dùng để liên kết với bảng Invitation để cho biết User này thuộc Invitation nào
            as: 'inviter', // Khi User lấy được danh sách invations thì danh sách này sẽ được gán vào trường này có tên là inviter
            // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
            // $project để chỉ định và field không muốn lấy về bằng cách gán nó giá trị 0
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME, // Tìm đến bảng User
            localField: 'inviteeId', // Lấy thông tin thằng được mời
            foreignField: '_id', // Còn đây là id mà bảng User dùng để liên kết với bảng Invitation để cho biết User này thuộc Invitation nào
            as: 'invitee', // Khi User lấy được danh sách invations thì danh sách này sẽ được gán vào trường này có tên là inviter
            // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
            // $project để chỉ định và field không muốn lấy về bằng cách gán nó giá trị 0
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME, // Tìm đến bảng Board
            localField: 'boardInvitation.boardId', //Lấy thông tin của Board
            foreignField: '_id', // Còn đây là id mà bảng Board dùng để liên kết với bảng Invitation để cho biết Board này thuộc Invitation nào
            as: 'board' // Khi Board lấy được danh sách Invations thì danh sách này sẽ được gán vào trường này có tên là board
          }
        }
      ]).toArray() // phải có toArray() để lấy ra đúng kết quả mong muốn
    return results
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update,
  findByUser
}
