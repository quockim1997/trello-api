/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

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
    description: Joi.string().required().min(3).max(256).trim().strict()
  })

  try {
    console.log('req.body:', req.body)

    // Sử dụng validateAsync kiểm tra dữ liệu từ phía FE gửi lên có đúng với hàm correctCondition đã khai báo hay không
    // abortEarly: flase sẽ cho phép trả về tất cả các trường bị lỗi
    // thay vì trả về từng trường , fix xong rồi trả về trường lỗi tiếp theo
    // docs: https://joi.dev/api/?v=17.13.3 (search 'abortEarly')
    await correctCondition.validateAsync(req.body, { abortEarly: false })

    // next()

    res
      .status(StatusCodes.CREATED)
      .json({ message: 'POST: APIs created new board' })
  } catch (error) {
    console.log(error)
    res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .json({ errors: new Error(error).message })
  }
}

export const boardValidation = {
  createNew
}
