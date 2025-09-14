/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

// Local
import ApiError from '~/utils/ApiError.js'
import { BOARD_TYPE } from '~/utils/constants.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const createNew = async (req, res, next) => {
  /**
   * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì
   * vì để cho FE tự validate và custom message ở phía FE cho đẹp
   * BE chỉ cần validate đảm bảo dữ liệu chính xác, và trả về message mặc định từ thư viện là được
   * Quan trọng việc validate dữ liệu BẮT BUỘC phải có ở phía BE vì đây là điểm cuối để lưu trữ dữ liệu vào DB
   * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là hãy luôn validate dữ liệu ở cả BE và FE
   */

  // Tạo biến điều kiện đúng
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE).required()
  })

  try {
    // Sử dụng validateAsync kiểm tra dữ liệu từ phía FE gửi lên có đúng với hàm correctCondition đã khai báo hay không
    // abortEarly: flase sẽ cho phép trả về tất cả các trường bị lỗi
    // thay vì trả về từng trường , fix xong rồi trả về trường lỗi tiếp theo
    // docs: https://joi.dev/api/?v=17.13.3 (search 'abortEarly')
    await correctCondition.validateAsync(req.body, { abortEarly: false })

    // Validate dữ liệu hợp lệ thì mới cho request đi tiếp tới controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message // Lấy message lỗi khi validate
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    )
    // Đưa về Middleware xử lý lỗi tập chung ở file Server.js
    next(customError)
  }
}

const updateData = async (req, res, next) => {
  /**
   * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì
   * vì để cho FE tự validate và custom message ở phía FE cho đẹp
   * BE chỉ cần validate đảm bảo dữ liệu chính xác, và trả về message mặc định từ thư viện là được
   * Quan trọng việc validate dữ liệu BẮT BUỘC phải có ở phía BE vì đây là điểm cuối để lưu trữ dữ liệu vào DB
   * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là hãy luôn validate dữ liệu ở cả BE và FE
   */

  // Tạo biến điều kiện đúng
  const correctCondition = Joi.object({
    // Lưu ý: không dùng hàm required() trong trường hợp Update
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE),
    columnOrderIds: Joi.array()
      .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
      .default([])
  })

  try {
    // Sử dụng validateAsync kiểm tra dữ liệu từ phía FE gửi lên có đúng với hàm correctCondition đã khai báo hay không
    // docs: https://joi.dev/api/?v=17.13.3 (search 'abortEarly')
    await correctCondition.validateAsync(req.body, {
      abortEarly: false, // abortEarly: flase sẽ cho phép trả về tất cả các trường bị lỗi thay vì trả về từng trường , fix xong rồi trả về trường lỗi tiếp theo
      allowUnknown: true // Đối với trường hợp Update, cho phép Unknoww để không đẩy một số field không cần thiết lên
    })

    // Validate dữ liệu hợp lệ thì mới cho request đi tiếp tới controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message // Lấy message lỗi khi validate
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    )
    // Đưa về Middleware xử lý lỗi tập chung ở file Server.js
    next(customError)
  }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  /**
   * Note: Mặc định chúng ta không cần phải custom message ở phía BE làm gì
   * vì để cho FE tự validate và custom message ở phía FE cho đẹp
   * BE chỉ cần validate đảm bảo dữ liệu chính xác, và trả về message mặc định từ thư viện là được
   * Quan trọng việc validate dữ liệu BẮT BUỘC phải có ở phía BE vì đây là điểm cuối để lưu trữ dữ liệu vào DB
   * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là hãy luôn validate dữ liệu ở cả BE và FE
   */

  // Tạo biến điều kiện đúng
  const correctCondition = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required()
      .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
      .default([]),

    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds: Joi.array().required()
      .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
      .default([])
  })

  try {
    // Sử dụng validateAsync kiểm tra dữ liệu từ phía FE gửi lên có đúng với hàm correctCondition đã khai báo hay không
    // docs: https://joi.dev/api/?v=17.13.3 (search 'abortEarly')
    // abortEarly: flase sẽ cho phép trả về tất cả các trường bị lỗi thay vì trả về từng trường , fix xong rồi trả về trường lỗi tiếp theo
    await correctCondition.validateAsync(req.body, { abortEarly: false })


    // Validate dữ liệu hợp lệ thì mới cho request đi tiếp tới controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message // Lấy message lỗi khi validate
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    )
    // Đưa về Middleware xử lý lỗi tập chung ở file Server.js
    next(customError)
  }
}

export const boardValidation = {
  createNew,
  updateData,
  moveCardToDifferentColumn
}
