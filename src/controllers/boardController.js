/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import { StatusCodes } from 'http-status-codes'

// Local
import ApiError from '~/utils/ApiError.js'
import { boardService } from '~/services/boardService.js'

const createNew = async (req, res, next) => {
  try {
    console.log('req.body:', req.body)
    console.log('req.query:', req.query)
    console.log('req.param:', req.param)

    // Điều hướng dữ liệu sang tầng Service
    const createdBoard = await boardService.createNew(req.body)

    // Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createdBoard)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test error tầng controller')
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params:', req.params)
    const boardId = req.params.id

    // Điều hướng dữ liệu sang tầng Service
    const board = await boardService.getDetails(boardId)

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(board)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test error tầng controller')
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetails
}
