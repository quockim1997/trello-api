/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Local
import { cardModel } from '~/models/cardModel.js'
import { columnModel } from '~/models/columnModel.js'

// Thư viện ngoài

const createNew = async (data) => {
  try {
    const newCard = {
      ...data
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newCard vào trong Database
    const createdCard = await cardModel.createNew(newCard)

    // Vì MongoDB không trả về đầy đủ bản ghi mà chỉ trả về insertedId của mỗi bản ghi
    // Nên ta phải dựa vào insertedId để chọc vào DB một lần nữa để lấy toàn bộ dữ liệu
    // rồi mới trả về tầng Controller
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật lại mảng cardOrderIds trong bảng column
      await columnModel.pushCardOrderIds(getNewCard)
    }

    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án, ...vv
    // Bắn email, notification về cho admin khi có 1 card được tạo, ...vv

    // Trả kết quả về tầng Controller
    // Trong Service luôn phải có return
    return getNewCard
  } catch (error) {
    throw error
  }
}

const updateData = async (cardId, reqBody) => {
  try {
    // Biến chứa dữ liệu gửi lên để update
    const data = {
      ...reqBody,
      updatedAt: Date.now()
    }
    // Gọi tới tầng Model để xử lý lấy bản ghi trong DB ra
    const updatedCard = await cardModel.updateData(cardId, data)

    // Trả kết quả về tầng Controller
    // Trong Service luôn phải có return
    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  updateData
}
