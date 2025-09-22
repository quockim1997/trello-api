/* Local */
import { LIMIT_COMMON_FILE_SIZE, ALLOW_COMMON_FILE_TYPES } from '~/utils/validators.js'
import ApiError from '~/utils/ApiError.js'

/* Library */
import multer from 'multer'
import { StatusCodes } from 'http-status-codes'

/**
 * Hầu hết những thứ bên dưới đều có ở docs của multer, chỉ là tổ chức lại sao cho khoa học và gọn gàng nhất có thể
 * Doc: https://www.npmjs.com/package/multer
 */

// Hàm kiểm tra các loại file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
  console.log('Multer file: ', file)

  // Đối với Multer kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }

  // Nếu như kiểu file hợp lệ:
  return callback(null, true)
}

// Khởi tạo function upload được bọc bởi thằng nulter
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = {
  upload
}