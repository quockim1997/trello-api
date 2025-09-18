/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

/* Local */
import { env } from '~/config/environment'

/* Library */
import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo'

// Doc cấu hình dành cho Nodejs: https://www.npmjs.com/package/@getbrevo/brevo
let emailAPI = new TransactionalEmailsApi()
emailAPI.authentications.apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => { // recipientEmail là người nhận email
  // Khởi tạo một cái SendSmtpEmail với những thông tin cần thiết
  let message = new SendSmtpEmail()

  // Tài khoản gửi email: lưu ý địa chỉ admin email phải là cái email tạo tài khoản Brevo
  message.sender = { name: env.ADMIN_EMAIL_NAME, email: env.ADMIN_EMAIL_ADDRESS }

  // Những tài khoản nhận email. Lấy từ file userService
  // 'to' phải là một Array để sau này có thể tùy biến gửi 1 email tới nhiều user, tùy tính năng dự án
  message.to = [{ email: recipientEmail }]

  // Tiêu đề email. Lấy từ file userService
  message.subject = customSubject

  // Nội dung email dạng HTML. Lấy từ file userService
  message.textContent = htmlContent

  // Gọi hành động gửi email
  // sendTransacEmail sẽ trả về một promise
  return emailAPI.sendTransacEmail(message)
}

export const BrevoProvider = {
  sendEmail
}
