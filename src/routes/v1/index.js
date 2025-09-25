/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import express from 'express'
import { StatusCodes } from 'http-status-codes'

// Local
import { boardRoute } from '~/routes/v1/boardRoute.js'
import { columnRoute } from '~/routes/v1/columnRoute.js'
import { cardRoute } from '~/routes/v1/cardRoute.js'
import { userRouter } from '~/routes/v1/userRoute.js'
import { invitationRoute } from './invitationRoute.js'

const Router = express.Router()

/* Check APIs v1/status */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use' })
})

/* Boards APIs */
Router.use('/boards', boardRoute)

/* Columns APIs */
Router.use('/columns', columnRoute)

/* Cards APIs */
Router.use('/cards', cardRoute)

/* Users  APIs */
Router.use('/users', userRouter)

// /* Invitations  APIs */
Router.use('/invitations', invitationRoute)

export const APIs_V1 = Router
