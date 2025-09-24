/**
 * Updated by trungquandev.com's author on Oct 8 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import Joi from 'joi'
import { ObjectId } from 'mongodb'

// Local
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
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

  cover: Joi.string().default(null),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Dữ liệu comments của Card chúng ta sẽ học cách nhúng - embedded vào bản ghi Card luôn như dưới đây:
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    // Chỗ này lưu ý vì dùng hàm $push để thêm comment nên không set default Date.now luôn giống hàm
    // insertOne khi create được
    commentedAt: Joi.date().timestamp()
  }).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định ra những field mà chúng ta không muốn cho phép cập nhật trong hàm updateData()
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']

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

const updateData = async (cardId, data) => {
  try {
    // Xóa đi các trường không muốn cập nhật:
    // VD: _id, createdAt, ...vv
    Object.keys(data).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete data[fieldName]
      }
    })

    // Đối với những dữ liệu liên quan đến ObjectId, biến đổi ở đây
    if (data.columnId) {
      data.columnId = new ObjectId(String(data.columnId))
    }

    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate(
        // phương thức này có trong mondoDB
        { _id: new ObjectId(String(cardId)) },
        { $set: data }, // doc: https://www.mongodb.com/docs/manual/reference/operator/update/push/
        { returnDocument: 'after' } // Muốn trả về bản ghi sau khi đã findOneAndUpdate thì phải có phương thức returnDocument = false
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    // Thêm ObjectId của MongoDB vào để mặc định _id trả về sẽ luôn là ObjectId
    // vì MongoDB sẽ trả về _id là một ObjectId
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({
        columnId: new ObjectId(String(columnId))
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
  findOneById,
  updateData,
  deleteManyByColumnId
}
