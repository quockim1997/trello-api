/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  try {
    console.log('req.body:', req.body)
    console.log('req.query:', req.query)
    console.log('req.param:', req.param)
    res
      .status(StatusCodes.CREATED)
      .json({ message: 'POST: APIs created new board' })
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ errors: error.message })
  }
}

export const boardController = {
  createNew
}
