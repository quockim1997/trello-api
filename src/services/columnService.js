/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Local
import { columnModel } from '~/models/columnModel.js'
import { boardModel } from '~/models/boardModel.js'
import { cardModel } from '~/models/cardModel.js'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// Thư viện ngoài

const createNew = async (data) => {
  try {
    const newColumn = {
      ...data
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newColumn vào trong Database
    const createdColumn = await columnModel.createNew(newColumn)

    // Vì MongoDB không trả về đầy đủ bản ghi mà chỉ trả về insertedId của mỗi bản ghi
    // Nên ta phải dựa vào insertedId để chọc vào DB một lần nữa để lấy toàn bộ dữ liệu
    // rồi mới trả về tầng Controller
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      // Thêm mảng cards vào column
      getNewColumn.cards = []

      // Cập nhật lại mảng columnOrderIds trong bảng boards
      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án, ...vv
    // Bắn email, notification về cho admin khi có 1 column được tạo, ...vv

    // Trả kết quả về tầng Controller
    // Trong Service luôn phải có return
    return getNewColumn
  } catch (error) {
    throw error
  }
}

const updateData = async (columnId, reqBody) => {
  try {
    // Biến chứa dữ liệu gửi lên để update
    const data = {
      ...reqBody,
      updatedAt: Date.now()
    }
    // Gọi tới tầng Model để xử lý lấy bản ghi trong DB ra
    const updatedColumn = await columnModel.updateData(columnId, data)

    // Trả kết quả về tầng Controller
    // Trong Service luôn phải có return
    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteData = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }

    // Xóa Column 
    await columnModel.deleteOneById(columnId)

    // Xóa toàn bộ Cards thuộc cái Column trên
    await cardModel.deleteManyByColumnId(columnId)

    // Xóa columnId trong mảng columnOrderIds của cái Board chứa nó
    await boardModel.pullColumnOrderIds(targetColumn)

    return { deleteResult: 'Column and its Cards deleted successfully' }
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  updateData,
  deleteData
}
