/* Local */
import { userModel } from '~/models/userModel.js'
import ApiError from '~/utils/ApiError'
import { pickUser } from '~/utils/formatters.js'
import { WEBSITE_DOMAIN } from '~/utils/constants.js'
import { BrevoProvider } from '~/providers/BrevoProvider.js'

/* Library */
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const createNew = async (reqBody) => {
  try {
    // B1: Kiếm tra xem email đã tồn tại trong hệ thống hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')

    // B2: Tạo data để lưu vào DB
    // nameFromEmail: nếu email là quockimdev1997@gmail.com thì sẽ lấy được "quockimdev1997"
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      // Sử dụng bcryptjs,hashSync để băm password ra thành một chuỗi kí tự ngẫu nhiên
      // Tham số thứ 2 của bcrypt.hashSync số càng cao thì
      // chuỗi kí tự càng phức tạp và băm càng lâu. Mặc định 8 là ok rồi.
      password: bcrypt.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail, // Mặc định để giống username khi user đăng kí mới, về sau làm tính năng update cho user
      verifyToken: uuidv4() // Sử dụng thư viện uuid để render ra một token
    }


    // B3: Thực hiện lưu thông tin user vào DB
    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdUser = await userModel.createNew(newUser)
    // Vì MongoDB không trả về đầy đủ bản ghi mà chỉ trả về insertedId của mỗi bản ghi
    // Nên ta phải dựa vào insertedId để chọc vào DB một lần nữa để lấy toàn bộ dữ liệu
    // rồi mới trả về tầng Controller
    const getNewUser = await userModel.findOneById(createdUser.insertedId)


    // B4: Gửi email cho người dùng xác thực tài khoản
    // Link này sẽ đưa vào content của email để người dùng click vào xác thực
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    // Tiêu đề email
    const customSubject = 'Trello MERN Stack Advanced: Please verify your email before using our services!'
    // Nội dung email
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,</br> - Quockimdev1997 - </h3>
    `
    // Gọi tới Provider gửi email
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // B5: Trả về dữ liệu cho phía controller
    // Sử dụng pickUser của file formatters.js để lấy một vài dữ liệu cụ thể trong User
    // để tránh việc trả về các dữ liệu nhạy cảm như hash password
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew
}