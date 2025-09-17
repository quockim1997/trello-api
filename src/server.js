/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư mục ngoài
import express from 'express'
import exitHook from 'async-exit-hook'
import cors from 'cors'
import { corsOptions } from './config/cors.js'

// Local
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment.js'
import { APIs_V1 } from '~/routes/v1/index.js'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js'

const START_SERVER = () => {
  const app = express()

  // Thêm thư viện cors vào để khắc phục lỗi CORS huyền thoại
  // Truyền thêm hàm corsOptions để chỉ định những domain nào có thể truy cập được tài nguyên của server
  app.use(cors(corsOptions))

  // Cho phép gửi dữ liệu json data
  app.use(express.json())

  // Use APIs V1
  app.use('/v1', APIs_V1)

  // Middleware xử lý lỗi tập chung
  app.use(errorHandlingMiddleware)

  // Môi trường Production (cụ thể hiện tại đang deploy trên render.com)
  if (env.BUILD_MODE === 'production') {
    // Khi deploy lên thì render.com sẽ tự động render ra cho một PORT ngẫu nhiên
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(
        `Production: Hello ${env.AUTHOR}, BE Server is running successfully running at PORT: ${process.env.PORT}`
      )
    })
  } else {
    // Môi trường Local
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(
        `Local: Hello ${env.AUTHOR}, BE Server is running successfully running at HOST: ${env.LOCAL_DEV_APP_HOST} and PORT: ${env.LOCAL_DEV_APP_PORT}`
      )
    })

  }


  // Thực hiện các tác vụ cleanup trước khi dừng server lại
  exitHook(() => {
    console.log('4. Server is shutting down...')
    CLOSE_DB()
    console.log('5. Disconnected from MongoDB Cloud Atlas')
  })
}

// Chỉ khi kết nối tới Database thành công thì mới Start Server Back-end lên
console.log('1. Connecting to MongoDB Cloud Atlas!')
CONNECT_DB()
  .then(() => console.log('2. Connected to MongoDB Cloud Atlas!'))
  .then(() => START_SERVER())
  .catch((error) => {
    console.error(error)
    process.exit(0)
  })
