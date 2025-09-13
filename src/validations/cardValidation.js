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
    boardId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
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

export const cardValidation = {
  createNew
}
