// Thư viện ngoài
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

// Local
import ApiError from '~/utils/ApiError.js'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators.js'

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
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
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

const verifyAccount = async (req, res, next) => {
  // Tạo biến điều kiện đúng
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    token: Joi.string().required()
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

const login = async (req, res, next) => {
  // Tạo biến điều kiện đúng
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
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

const update = async (req, res, next) => {
  // Tạo biến điều kiện đúng
  const correctCondition = Joi.object({
    displayName: Joi.string().trim().strict(),
    current_password: Joi.string().required().pattern(PASSWORD_RULE).message(`current_password: ${PASSWORD_RULE_MESSAGE}`),
    new_password: Joi.string().required().pattern(PASSWORD_RULE).message(`new_password: ${PASSWORD_RULE_MESSAGE}`)
  })

  try {
    // Sử dụng validateAsync kiểm tra dữ liệu từ phía FE gửi lên có đúng với hàm correctCondition đã khai báo hay không
    // abortEarly: flase sẽ cho phép trả về tất cả các trường bị lỗi
    // thay vì trả về từng trường , fix xong rồi trả về trường lỗi tiếp theo
    // docs: https://joi.dev/api/?v=17.13.3 (search 'abortEarly')
    // Lưu ý: với trường hợp update, cho phép Unknown để không cần đẩy một số field lên
    await correctCondition.validateAsync(res.body, { abortEarly: false, allowUnknown: true })

    // Validate dữ liệu hợp lệ thì mới cho request đi tiếp tới controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}


export const userValidation = {
  createNew,
  verifyAccount,
  login,
  update
}