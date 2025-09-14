/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import { StatusCodes } from 'http-status-codes'

// Local
import { columnService } from '~/services/columnService.js'

const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const createdColumn = await columnService.createNew(req.body)

    // Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createdColumn)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test error tầng controller')
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const updateData = async (req, res, next) => {
  try {
    // console.log('req.params:', req.params)
    const columnId = req.params.id

    // Điều hướng dữ liệu sang tầng Service
    const updatedColumn = await columnService.updateData(columnId, req.body)

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedColumn)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test error tầng controller')
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}


export const columnController = {
  createNew,
  updateData
}
