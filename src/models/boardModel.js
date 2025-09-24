/* Local */
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { GET_DB } from '~/config/mongodb.js'
import { BOARD_TYPE } from '~/utils/constants.js'
import { columnModel } from '~/models/columnModel.js'
import { cardModel } from '~/models/cardModel.js'
import { pagingSkipValue } from '~/utils/algorithms.js'
import { userModel } from '~/models/userModel.js'

/* Library */
import Joi from 'joi'
import { ObjectId } from 'mongodb'


// Define Conllection (Name & Schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),

  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  // Những Admin của board
  ownerIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  // Những thành viên của board
  memberIds : Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định ra những field mà chúng ta không muốn cho phép cập nhật trong hàm updateData()
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

// Hàm validate data 1 lần nữa trước khi lưu vào DB thông qua phương thức validateAsync
// Nếu không validate 1 lần nữa thì sẽ nhận vào các data rác
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

// Hàm tạo mới một data mới
const createNew = async (userId, data) => {
  try {
    // Lưu data đã validate vào biến này và sử dụng biến này đưa vào phương thức insertOne để lưu vào DB
    const dataBeforeValidate = await validateBeforeCreate(data)

    // Khi tạo mới board thì userId sẽ là chủ của cái board đó nên sẽ lưu userId vào ownerIds
    const newBoardToAdd = {
      ...dataBeforeValidate,
      ownerIds: [new ObjectId(String(userId))]
    }

    // Thêm mới(insert) một document(data) vào collection(bảng) trong MongoDB.
    const createdBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(newBoardToAdd)

    // Trả kết quả về tầng Service
    return createdBoard
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm tìm data trong DB dựa vào insertedId trả về
// Hàm này chỉ lấy ra board thôi
const findOneById = async (boardId) => {
  try {
    // Thêm ObjectId của MongoDB vào để mặc định _id trả về sẽ luôn là ObjectId
    // vì MongoDB sẽ trả về _id là một ObjectId
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(boardId))
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm lấy data theo id
// Hàm này lấy ra Board, Column và Card khác với hàm findOneById ở trên
// Query tổng hợp (aggregate) để lấy toàn bộ Column và Card thuộc về Board
const getDetails = async (userId, boardId) => {
  try {
    // Các điều kiện để thực hiện một truy vấn
    const queryConditions = [
      // Điều kiện 01: Board theo _id
      { _id: new ObjectId(String(boardId)) },

      // Điều kiện 02: Board chưa bị xóa
      { _destroy: false },

      // Điều kiện 03: userId đang thực hiện request này nó phải thuộc vào một
      // trong 2 mảng ownerIds hoặc memberIds (có nghĩa là: 1.phải là chủ của board đấy hoặc 2.phải là thành viên của cái board đấy),
      // sử dụng toán tử $all của mongodb
      // Toán tử $or có nghĩa là: 1.phải là chủ của board đấy HOẶC 2.phải là thành viên của cái board đấy, thì sẽ lấy được board đấy ra
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          // Phải thỏa mãn 3 điều kiện bên trên.
          $match: { $and: queryConditions }
        },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME, // Tìm đến bảng Column
            localField: '_id', // Đây là id của bảng Board
            foreignField: 'boardId', // Còn đây là id mà bảng Column dùng để liên kết với bảng Boad để cho biết Column này thuộc Board nào
            as: 'columns' // Khi Board lấy được danh sách Column thì danh sách này sẽ được gán vào trường này có lên là columns
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME, // Tìm đến bảng Card
            localField: '_id', // Đây là id của bảng Board
            foreignField: 'boardId', // Còn đây là id mà bảng Card dùng để liên kết với bảng Boad để cho biết Card này thuộc Board nào
            as: 'cards' // Khi Board lấy được danh sách Card thì danh sách này sẽ được gán vào trường này có tên là cards (trường này do ta tự để tên)
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME, // Tìm đến bảng User
            localField: 'ownerIds', // Đây là mảng
            foreignField: '_id', // Còn đây là id mà bảng User dùng để liên kết với bảng Boad để cho biết User này thuộc Board nào
            as: 'owners', // Khi Board lấy được danh sách User thì danh sách này sẽ được gán vào trường này có tên là owners (trường này do ta tự để tên)
            // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
            // $project để chỉ định và field không muốn lấy về bằng cách gán nó giá trị 0
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME, // Tìm đến bảng User
            localField: 'memberIds', // Đây là mảng
            foreignField: '_id', // Còn đây là id mà bảng User dùng để liên kết với bảng Boad để cho biết User này thuộc Board nào
            as: 'members', // Khi Board lấy được danh sách User thì danh sách này sẽ được gán vào trường này có tên là owners (trường này do ta tự để tên)
            // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
            // $project để chỉ định và field không muốn lấy về bằng cách gán nó giá trị 0
            pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
          }
        }
      ])
      .toArray() // phải có toArray() để lấy ra đúng kết quả mong muốn
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm thêm columnId vào cuối mảng columnOrderIds trong bảng board
// Dùng $push trong MongoDB trong trường hợp này để đẩy một phần tử vào cuối mảng
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        // phương thức này có trong mondoDB
        { _id: new ObjectId(String(column.boardId)) },
        { $push: { columnOrderIds: new ObjectId(String(column._id)) } }, // doc: https://www.mongodb.com/docs/manual/reference/operator/update/push/
        { returnDocument: 'after' } // Muốn trả về bản ghi sau khi đã findOneAndUpdate thì phải có phương thức returnDocument = false
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm lấy một phần tử columnId ra khỏi mảng columnOrderIds
// Dùng $pull trong MongoDB trong trường hợp này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        // phương thức này có trong mondoDB
        { _id: new ObjectId(String(column.boardId)) },
        { $pull: { columnOrderIds: new ObjectId(String(column._id)) } }, // doc: https://www.mongodb.com/docs/manual/reference/operator/update/pull/
        { returnDocument: 'after' } // Muốn trả về bản ghi sau khi đã findOneAndUpdate thì phải có phương thức returnDocument = false
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateData = async (boardId, data) => {
  try {
    // Xóa đi các trường không muốn cập nhật:
    // VD: _id, createdAt, ...vv
    Object.keys(data).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete data[fieldName]
      }
    })

    // Đối với những dữ liệu liên quan đến ObjectId, biến đổi ở đây
    if (data.columnOrderIds) {
      data.columnOrderIds = data.columnOrderIds.map(_id => (new ObjectId(String(_id))))
    }

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        // phương thức này có trong mondoDB
        { _id: new ObjectId(String(boardId)) },
        { $set: data }, // doc: https://www.mongodb.com/docs/manual/reference/operator/update/push/
        { returnDocument: 'after' } // Muốn trả về bản ghi sau khi đã findOneAndUpdate thì phải có phương thức returnDocument = false
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Các điều kiện để thực hiện một truy vấn
    const queryConditions = [
      // Điều kiện 01: Board chưa bị xóa
      { _destroy: false },
      // Điều kiện 02: userId đang thực hiện request này nó phải thuộc vào một
      // trong 2 mảng ownerIds hoặc memberIds (có nghĩa là: 1.phải là chủ của board đấy hoặc 2.phải là thành viên của cái board đấy),
      // sử dụng toán tử $all của mongodb
      // Toán tử $or có nghĩa là: 1.phải là chủ của board đấy HOẶC 2.phải là thành viên của cái board đấy, thì sẽ lấy được board đấy ra
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]

    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
        // Phải thỏa mãn 2 điều kiện bên trên.
          { $match: { $and: queryConditions } },

          // sort title của board theo A-Z (mặc định sẽ bị chữ B hoa đứng trước chữ a thường, theo chuẩn bảng mã ASCII).
          { $sort: { title: 1 } },

          // $facet để xử lý nhiều luồng trong một query.
          { $facet: {
          // Luồng 01: Query boards.
            'queryBoards': [
              { $skip: pagingSkipValue(page, itemsPerPage) }, // Bỏ qua số lượng bản ghi của những page trước đó
              { $limit: itemsPerPage } // Giới hạn tối đa số lượng bản ghi trả về trên một page
            ],

            // Luồng 02: Query đếm tổng tất cả số lượng bảng ghi boards trong DB và trả về vào biến countedAllBoards
            'queryTotalBoards': [{ $count: 'countedAllBoards' }]
          } }
        ],
        // Khai báo thêm thuộc tính collation locale 'en' để fix vụ chữ B và a thường ở trên
        // Doc: https://www.mongodb.com/docs/v6.0/reference/collation/#std-label-collation-document-fields
        { collation: { locale: 'en' } }
      ).toArray()

    console.log('query: ', query)

    // Lấy response trả về của thằng mondoDB là dạng object
    const res = query[0]

    return {
      boards: res.queryBoards || [], // Lấy theo tên luồng 01 bên trên
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0 // Lấy theo tên luồng 02 bên trên
    }

  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  updateData,
  pullColumnOrderIds,
  getBoards
}
