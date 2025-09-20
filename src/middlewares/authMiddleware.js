/** Local */
import { JwtProvider } from '~/providers/JwtProvider.js'
import { env } from '~/config/environment.js'
import ApiError from '~/utils/ApiError'

/** Library */
import { StatusCodes } from 'http-status-codes'

// Middleware này sẽ đảm nhiệm việc quan trọng:
// Xác thực cái JWT accessToken nhận được từ phía FE có hợp lệ hay không.
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookies phìa client - withCredentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken

  // Nếu như clientAccessToken không tồn tại thì trả về lỗi
  if (!clientAccessToken) {
    // Khi sử dụng next thì sẽ đưa về Middleware để xử lý lỗi tập chung
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }

  try {
    // B1: Thực hiện giải mã token xem nó có hợp lệ hay không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    // console.log('accessTokenDecoded: ', accessTokenDecoded)

    // B2: Quan trọng: Nếu như token hợp lệ, thì sẽ cần phải lưu thông tin giả mã được vào req.jwtDecoded,
    // để sử dụng cho các tầng xử lý phía sau.
    req.jwtDecoded = accessTokenDecoded

    // B3: Cho phép request đi tiếp
    next()
  } catch (error) {
    // console.log('authMiddleware: ', error)
    // Nếu accessToken bị hết hạn (expired) thì cần trả về một cái mã lỗi GONE - 410
    // cho phía FE biết để gọi api refreshToken.
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token!'))
      return
    }

    // Nếu như cái accessToken không hợp lệ do bất kì điều gì khác vụ hết hạn
    // thì chúng ta trả về lỗi 401 cho phía FE gọi api sign_up luôn.
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}
