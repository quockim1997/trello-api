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
    // console.log('req.body:', req.body)
    // console.log('req.query:', req.query)
    // console.log('req.param:', req.param)

    // Do hàm createNew này phải đi qua tầng Middleware nên nó đã có được accessToken
    // thông qua jwtDecoded (tự định nghĩa bên file authMiddleware),
    // từ đó ta lấy được _id gán vào biến userId.
    const userId = req.jwtDecoded._id

    // Điều hướng dữ liệu sang tầng Service
    const createdBoard = await boardService.createNew(userId, req.body)

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
    // Do hàm getDetails này phải đi qua tầng Middleware nên nó đã có được accessToken
    // thông qua jwtDecoded (tự định nghĩa bên file authMiddleware),
    // từ đó ta lấy được _id gán vào biến userId.
    const userId = req.jwtDecoded._id

    // console.log('req.params:', req.params)
    const boardId = req.params.id

    // Điều hướng dữ liệu sang tầng Service
    const board = await boardService.getDetails(userId, boardId)

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(board)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test error tầng controller')
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const updateData = async (req, res, next) => {
  try {
    // console.log('req.params:', req.params)
    const boardId = req.params.id

    // Điều hướng dữ liệu sang tầng Service
    const updatedBoard = await boardService.updateData(boardId, req.body)

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(updatedBoard)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test error tầng controller')
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    // Điều hướng dữ liệu sang tầng Service
    const result = await boardService.moveCardToDifferentColumn(req.body)

    // Có kết quả thì trả về Client
    res.status(StatusCodes.OK).json(result)
    // throw new ApiError(StatusCodes.BAD_GATEWAY, 'test error tầng controller')
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  try {
    // Do hàm getBoards này phải đi qua tầng Middleware nên nó đã có được accessToken
    // thông qua jwtDecoded (tự định nghĩa bên file authMiddleware),
    // từ đó ta lấy được _id gán vào biến userId.
    const userId = req.jwtDecoded._id

    // page và itemsPerPage được truyền vào trong query url từ phía FE nên BE sẽ lấy thông qua req.query
    const { page, itemsPerPage, q } = req.query

    const queryFilters = q

    console.log('queryFilters: ', queryFilters)

    const result = await boardService.getBoards(userId, page, itemsPerPage, queryFilters)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}


export const boardController = {
  createNew,
  getDetails,
  updateData,
  moveCardToDifferentColumn,
  getBoards
}
