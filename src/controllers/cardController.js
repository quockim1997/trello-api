/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import { StatusCodes } from 'http-status-codes'

// Local
import { cardService } from '~/services/cardService.js'

const createNew = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const createdCard = await cardService.createNew(req.body)

    // Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json(createdCard)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test error tầng controller')
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const updateData = async (req, res, next) => {
  try {
    // console.log('req.params:', req.params)
    const cardId = req.params.id
    const cardCoverFile = req.file
    const userInfo = req.jwtDecoded

    // console.log(userInfo)

    // Điều hướng dữ liệu sang tầng Service
    const updatedCard = await cardService.updateData(cardId, req.body, cardCoverFile, userInfo)

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedCard)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test error tầng controller')
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

export const cardController = {
  createNew,
  updateData
}
