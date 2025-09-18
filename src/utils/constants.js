/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

/* Local */
import { env } from '~/config/environment'

/* Library */

// Danh sách các Domanin được truy cập vào tài nguyên của server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173' // Không cần localhost nữa vì
  // ở file config/cors đã luôn luôn cho phép môi trường dev env.BUILD_MODE === 'dev'
  // Ví dụ sau này sẽ deploy lên domain chính thức ...vv
  'https://trello-web-peach-six.vercel.app'
]

export const BOARD_TYPE = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT
