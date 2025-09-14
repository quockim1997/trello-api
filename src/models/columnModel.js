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
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé,
  // (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định ra những field mà chúng ta không muốn cho phép cập nhật trong hàm updateData()
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']

// Hàm validate data 1 lần nữa trước khi lưu vào DB thông qua phương thức validateAsync
// Nếu không validate 1 lần nữa thì sẽ nhận vào các data rác
const validateBeforeCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

// Hàm tạo mới một data mới
const createNew = async (data) => {
  try {
    // Lưu data đã validate vào biến này và sử dụng biến này đưa vào phương thức insertOne để lưu vào DB
    const dataBeforeValidate = await validateBeforeCreate(data)

    // Ghi đè lại dữ liệu boardId thành ObjectId vì khi tạo column mới
    // thì boardId sẽ là String nhưng dữ liệu để lưu vào DB phải là ObjectId
    const newDataBeforeValidate = {
      ...dataBeforeValidate,
      boardId: new ObjectId(String(data.boardId))
    }

    // Thêm mới(insert) một document(data) vào collection(bảng) trong MongoDB.
    const createdColumn = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .insertOne(newDataBeforeValidate)

    // Trả kết quả về tầng Service
    return createdColumn
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm tìm data trong DB dựa vào insertedId trả về
// Hàm này chỉ lấy ra column thôi
const findOneById = async (id) => {
  try {
    // Thêm ObjectId của MongoDB vào để mặc định _id trả về sẽ luôn là ObjectId
    // vì MongoDB sẽ trả về _id là một ObjectId
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id))
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Hàm thêm cardId vào cuối mảng cardOrderIds trong bảng column
const pushCardOrderIds = async (card) => {
  try {
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        // phương thức này có trong mondoDB
        { _id: new ObjectId(String(card.columnId)) },
        { $push: { cardOrderIds: new ObjectId(String(card._id)) } }, // doc: https://www.mongodb.com/docs/manual/reference/operator/update/push/
        { returnDocument: 'after' } // Muốn trả về bản ghi sau khi đã findOneAndUpdate thì phải có phương thức returnDocument = false
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateData = async (columnId, data) => {
  try {
    // Xóa đi các trường không muốn cập nhật:
    // VD: _id, createdAt, ...vv
    Object.keys(data).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete data[fieldName]
      }
    })

    // Đối với những dữ liệu liên quan đến ObjectId, biến đổi ở đây
    if (data.cardOrderIds) {
      data.cardOrderIds = data.cardOrderIds.map(_id => (new ObjectId(String(_id))))
    }

    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        // phương thức này có trong mondoDB
        { _id: new ObjectId(String(columnId)) },
        { $set: data }, // doc: https://www.mongodb.com/docs/manual/reference/operator/update/push/
        { returnDocument: 'after' } // Muốn trả về bản ghi sau khi đã findOneAndUpdate thì phải có phương thức returnDocument = false
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}


export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds,
  updateData
}
