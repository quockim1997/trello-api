/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// Local
import { cardModel } from '~/models/cardModel.js'
import { columnModel } from '~/models/columnModel.js'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider.js'


// Thư viện ngoài

const createNew = async (data) => {
  try {
    const newCard = {
      ...data
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newCard vào trong Database
    const createdCard = await cardModel.createNew(newCard)

    // Vì MongoDB không trả về đầy đủ bản ghi mà chỉ trả về insertedId của mỗi bản ghi
    // Nên ta phải dựa vào insertedId để chọc vào DB một lần nữa để lấy toàn bộ dữ liệu
    // rồi mới trả về tầng Controller
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật lại mảng cardOrderIds trong bảng column
      await columnModel.pushCardOrderIds(getNewCard)
    }

    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án, ...vv
    // Bắn email, notification về cho admin khi có 1 card được tạo, ...vv

    // Trả kết quả về tầng Controller
    // Trong Service luôn phải có return
    return getNewCard
  } catch (error) {
    throw error
  }
}

const updateData = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    // Biến chứa dữ liệu gửi lên để update
    const data = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      //  Trường hợp upload file lên Clound Storage, cụ thể là Cloudinary
      // Chỉ truyền lên buffer
      // console.log(cardCoverFile)
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      console.log('uploadResult: ', uploadResult)

      // Lưu lại url của file ảnh vào trong DB
      updatedCard = await cardModel.updateData(cardId, {
        cover: uploadResult.secure_url
      })
    } else if (reqBody.commentToAdd) {
      // Tạo dữ liệu commnet để thêm vào DB, cần bổ sung thêm những field cần thiết
      const commentData = {
        ...reqBody.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      // Hàm đẩy comment vào đầu mảng
      updatedCard = await cardModel.unshifNewComment(cardId, commentData)
    } else {
      // Gọi tới tầng Model để xử lý lấy bản ghi trong DB ra
      // Các trường hợp update chung như title, description
      updatedCard = await cardModel.updateData(cardId, data)
    }


    // Trả kết quả về tầng Controller
    // Trong Service luôn phải có return
    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  updateData
}
