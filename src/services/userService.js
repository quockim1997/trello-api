/* Local */
import { userModel } from '~/models/userModel.js'
import ApiError from '~/utils/ApiError'
import { pickUser } from '~/utils/formatters.js'
import { WEBSITE_DOMAIN } from '~/utils/constants.js'
import { BrevoProvider } from '~/providers/BrevoProvider.js'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider.js'
import { env } from '~/config/environment.js'
import { JwtProvider } from '~/providers/JwtProvider.js'

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

const verifyAccount = async (reqBody) => {
  try {
    /** B1: Kiểm tra user đã tồn tại trong DB chưa thông qua kiểm tra email */
    const existUser = await userModel.findOneByEmail(reqBody.email)

    /** B2: Các bước kiểm tra cần thiết */
    // B2.1: Kiểm tra tài khoản này có tồn tại trong DB hay chưa
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    // B2.2: Kiểm tra tài khoản này có active hay chưa
    if (existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
    }
    // B2.3: Kiểm tra token có đúng hay chưa
    if (reqBody.token !== existUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token in valid!')
    }

    /** B3: Nếu như mọi thứ oke thì bắt đầu update lại thông tin user để verify account */
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    const updatedUser = await userModel.updateData(existUser._id, updateData)

    /** B4: Trả về dữ liệu cho phía controller */
    // Sử dụng pickUser của file formatters.js để lấy một vài dữ liệu cụ thể trong User
    // để tránh việc trả về các dữ liệu nhạy cảm như hash password
    return pickUser(updatedUser)

  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    /** B1: Kiểm tra user đã tồn tại trong DB chưa thông qua kiểm tra email */
    const existUser = await userModel.findOneByEmail(reqBody.email)

    /** B2: Các bước kiểm tra cần thiết */
    // B2.1: Kiểm tra tài khoản này có tồn tại trong DB hay chưa
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    // B2.2: Kiểm tra tài khoản này có active hay chưa
    if (!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    }

    // B2.3: Kiểm tra password thông qua thằng compareSync
    // reqBody.password(từ phía FE gửi lên thông qua ô input mà người dùng nhập) sẽ so sánh vơi
    // existUser.password(password đã băm và lưu trong DB)
    if (!bcrypt.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!')
    }

    /** B3: Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE */
    // B3.1: Tạo thông tin để đính kèm trong JWT Token: bao gồm _id và email của user
    const userInfo = { _id: existUser._id, email: existUser.email }

    // B3.2: Tạo ra 2 loại token: accessToken và refreshToken để trả về cho phía FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // 5 giây
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 15 // 15 giây
      env.REFRESH_TOKEN_LIFE
    )

    // B3.3: Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    // Sử dụng pickUser của file formatters.js để lấy một vài dữ liệu cụ thể trong User
    // để tránh việc trả về các dữ liệu nhạy cảm như hash password
    return { accessToken, refreshToken, ...pickUser(existUser) }

  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify: giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    // Đoạn này ta chỉ lưu những thông tin unique và cố định của user trong token rồi,
    // vì vậy có thể lấy luôn từ decoded ra, tiết kiếm query vào DB để lấy data mới
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // giây
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) {throw error}
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Query User và kiếm tra cho chắc chắn
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    // Khởi tạo kết quả updated User ban đâu là empty
    let updatedUser = {}

    // Trường hợp change password
    if (reqBody.current_password && reqBody.new_password) {
      // Kiểm tra xe current_password có đúng hay không
      if (!bcrypt.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Current Password is incorrect!')
      }
      // Nếu như current_password đúng thì chúng ta sẽ hash một mật khẩu mới và update lại vào DB
      updatedUser = await userModel.update(existUser._id, {
        password: bcrypt.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      //  Trường hợp upload file lên Clound Storage, cụ thể là Cloudinary
      // Chỉ truyền lên buffer
      // console.log(userAvatarFile)
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      console.log('uploadResult: ', uploadResult)

      // Lưu lại url của file ảnh vào trong DB
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })
    } else {
      // Trường hợp update các thông tin chung, ví dụ: displayName
      updatedUser = await userModel.update(existUser._id, reqBody)
    }

    // Sử dụng pickUser của file formatters.js để lấy một vài dữ liệu cụ thể trong User
    // để tránh việc trả về các dữ liệu nhạy cảm như hash password
    return pickUser(updatedUser)

  } catch (error) {
    throw error
  }
}


export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}