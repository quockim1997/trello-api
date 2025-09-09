/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Thư viện ngoài
import { MongoClient, ServerApiVersion } from 'mongodb'

// Local
import { env } from '~/config/environment.js'

// Khởi tạo một đối tượng trelloDatabseInstance ban đầu là null vì chưa kết nối tới MongoDB
let trelloDatabseInstance = null

// Khởi tạo một đối tượng mongoClientInstance để connect tới MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // Lưu ý: cái serverApi có từ phiên bản MongoDB 5.0.0 trở lên, có thể không cần dùng nó
  // còn nếu dùng nó là chúng ta sẽ chỉ định một cài Stable API version của MongoDB
  // Đọc thêm ở đây: https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/stable-api/
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối tới Database
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của mongoClientInstance
  await mongoClientInstance.connect()

  // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến trelloDatabseInstance
  // ở trên của chúng ta
  trelloDatabseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

// Đóng kết nối tới Database khi cần
export const CLOSE_DB = async () => {
  console.log('code chạy vào đây')
  await mongoClientInstance.close()
}

// Function GET_DB (không async) này có nhiệm vụ export ra cái trelloDatabseInstance sau khi đã connect thành công
// tới MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong code.
// Lưu ý: phải đảm bảo chỉ luôn gọi cái GET_DB này sau khi đã kết nối thành công với MongoDB
export const GET_DB = () => {
  if (!trelloDatabseInstance) throw new Error('Must connect to Database first')
  return trelloDatabseInstance
}
