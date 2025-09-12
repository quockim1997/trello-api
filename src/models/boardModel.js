/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import Joi from 'joi'
import { ObjectId } from 'mongodb'

// Local
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { GET_DB } from '~/config/mongodb.js'
import { BOARD_TYPE } from '~/utils/constants.js'
import { columnModel } from '~/models/columnModel.js'
import { cardModel } from '~/models/cardModel.js'

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

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Hàm validate data 1 lần nữa trước khi lưu vào DB thông qua phương thức validateAsync
// Nếu không validate 1 lần nữa thì sẽ nhận vào các data rác
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

// Hàm tạo mới một data mới
const createNew = async (data) => {
  try {
    // Lưu data đã validate vào biến này và sử dụng biến này đưa vào phương thức insertOne để lưu vào DB
    const dataBeforeValidate = await validateBeforeCreate(data)

    // Thêm mới(insert) một document(data) vào collection(bảng) trong MongoDB.
    const createdBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(dataBeforeValidate)

    // Trả kết quả về tầng Service
    return createdBoard
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm tìm data trong DB dựa vào insertedId trả về
// Hàm này chỉ lấy ra board thôi
const findOneById = async (id) => {
  try {
    // Thêm ObjectId của MongoDB vào để mặc định _id trả về sẽ luôn là ObjectId
    // vì MongoDB sẽ trả về _id là một ObjectId
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id))
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm lấy data theo id
// Hàm này lấy ra Board, Column và Card khác với hàm findOneById ở trên
// Query tổng hợp (aggregate) để lấy toàn bộ Column và Card thuộc về Board
const getDetails = async (boardId) => {
  try {
    // Thêm ObjectId của MongoDB vào để mặc định _id trả về sẽ luôn là ObjectId
    // vì MongoDB sẽ trả về _id là một ObjectId
    // const result = await GET_DB()
    //   .collection(BOARD_COLLECTION_NAME)
    //   .findOne({
    //     _id: new ObjectId(String(boardId))
    //   })
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(String(boardId)), // Tìm Board theo _id
            _destroy: false // Tìm Board theo _destroy(xóa cứng hoặc xóa mềm)
          }
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
        }
      ])
      .toArray() // phải có toArray() để lấy ra đúng kết quả mong muốn
    console.log(result)
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails
}
