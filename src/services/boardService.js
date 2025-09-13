/* eslint-disable no-useless-catch */
/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Local
import { slugify } from '~/utils/formatters.js'
import { boardModel } from '~/models/boardModel.js'
import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'

// Thư viện ngoài
import { cloneDeep } from 'lodash'

const createNew = async (data) => {
  try {
    const newBoard = {
      ...data,
      slug: slugify(data.title)
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(newBoard)
    console.log(createdBoard)

    // Vì MongoDB không trả về đầy đủ bản ghi mà chỉ trả về insertedId của mỗi bản ghi
    // Nên ta phải dựa vào insertedId để chọc vào DB một lần nữa để lấy toàn bộ dữ liệu
    // rồi mới trả về tầng Controller
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    console.log(getNewBoard)

    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án, ...vv
    // Bắn email, notification về cho admin khi có 1 board được tạo, ...vv

    // Trả kết quả về tầng Controller
    // Trong Service luôn phải có return
    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (boardId) => {
  try {
    // Gọi tới tầng Model để xử lý lấy bản ghi trong DB ra
    const board = await boardModel.getDetails(boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    // B1: Deep Clone board ra một cái mới để xử lý, không ảnh hưởng tới board ban đầu,
    // tùy mục đích về sau mà có cần clone deep hay không
    const resBoard = cloneDeep(board)

    // B2: Đưa card về đúng column của nó
    resBoard.columns.forEach((column) => {

      // Cách dùng .equals này là bởi vì chúng ta hiểu ObjectId trong mongoDB có support method .equals
      column.cards = resBoard.cards.filter(
        (card) => card.columnId.equals(column._id)
      )

      // // Cách đơn giản là convert ObjectId về string bằng hàm toString của JS
      // column.cards = resBoard.cards.filter(
      //   (card) => card.columnId.toString() === column._id.toString()
      // )
    })

    // B3: Sau khi đưa card vào column thì ta xóa đi mảng cards khỏi board ban đầu
    delete resBoard.cards

    // Trả kết quả về tầng Controller
    // Trong Service luôn phải có return
    return resBoard
  } catch (error) {
    throw error
  }
}

const updateData = async (boardId, reqBody) => {
  try {
    // Biến chứa dữ liệu gửi lên để update
    const data = {
      ...reqBody,
      updatedAt: Date.now()
    }
    // Gọi tới tầng Model để xử lý lấy bản ghi trong DB ra
    const updatedData = await boardModel.updateData(boardId, data)

    // Trả kết quả về tầng Controller
    // Trong Service luôn phải có return
    return updatedData
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  updateData
}
