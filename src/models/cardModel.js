/**
 * Updated by trungquandev.com's author on Oct 8 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import Joi from 'joi'
import { ObjectId } from 'mongodb'

// Local
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { GET_DB } from '~/config/mongodb.js'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Hàm validate data 1 lần nữa trước khi lưu vào DB thông qua phương thức validateAsync
// Nếu không validate 1 lần nữa thì sẽ nhận vào các data rác
const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

// Hàm tạo mới một data mới
const createNew = async (data) => {
  try {
    // Lưu data đã validate vào biến này và sử dụng biến này đưa vào phương thức insertOne để lưu vào DB
    const dataBeforeValidate = await validateBeforeCreate(data)

    // Ghi đè lại dữ liệu boardId và columnId thành ObjectId vì khi tạo column mới
    // thì boardId và columnId sẽ là String nhưng dữ liệu để lưu vào DB phải là ObjectId
    const newDataBeforeValidate = {
      ...dataBeforeValidate,
      boardId: new ObjectId(String(data.boardId)),
      columnId: new ObjectId(String(data.columnId))
    }

    // Thêm mới(insert) một document(data) vào collection(bảng) trong MongoDB.
    const createdCard = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .insertOne(newDataBeforeValidate)

    // Trả kết quả về tầng Service
    return createdCard
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm tìm data trong DB dựa vào insertedId trả về
// Hàm này chỉ lấy ra card thôi
const findOneById = async (id) => {
  try {
    // Thêm ObjectId của MongoDB vào để mặc định _id trả về sẽ luôn là ObjectId
    // vì MongoDB sẽ trả về _id là một ObjectId
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id))
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById
}
