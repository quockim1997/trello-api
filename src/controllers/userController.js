/* Local */
import { userService } from '~/services/userService.js'
import ApiError from '~/utils/ApiError'

/* Library */
import { StatusCodes } from 'http-status-codes'
import ms from 'ms' // https://www.npmjs.com/package/ms


const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    /**
     * Xử lý trả về http only cookie cho phía trình duyệt.
     * Về cái maxAge và thư viện ms: https://expressjs.com/en/api.html.
     * Đối với maxAge - thời gian sống của Cookie thì chúng ta sẽ để tối đa 14 ngày, tùy dự án.
     * Lưu ý: thời gian sống của Cookie khác với thời gian sống của token.
    */
    res.cookie('accessToken', result.accessToken, {
      // Cookie này bên BE sẽ quản lý, bên FE chỉ đính kèm và gửi lên thôi. Nền httpOnly: true
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      // Cookie này bên BE sẽ quản lý, bên FE chỉ đính kèm và gửi lên thôi. Nền httpOnly: true
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    // Xóa cookie - đơn giản là làm ngược lại so với việc gán cookie ở hàm login
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)

    // Tạo lại Cookie mới
    res.cookie('accessToken', result.accessToken, {
      // Cookie này bên BE sẽ quản lý, bên FE chỉ đính kèm và gửi lên thôi. Nền httpOnly: true
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(result)

  } catch (error) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In! (Error from refresh Token)'))
  }
}

const update = async (req, res, next) => {
  try {
    // Do hàm update này phải đi qua tầng Middleware nên nó đã có được accessToken
    // thông qua jwtDecoded (tự định nghĩa bên file authMiddleware),
    // từ đó ta lấy được _id gán vào biến userId.
    const userId = req.jwtDecoded._id
    const updatedUser = await userService.update(userId, req.body)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update
}