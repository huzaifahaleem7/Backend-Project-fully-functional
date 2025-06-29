import dotenv from 'dotenv'

dotenv.config()
export const DB_NAME = "videotube"
export const port = process.env.PORT || 8000