# Video Sharing Backend Project (Node.js + MongoDB)

This is a fully functional backend for a video-sharing platform built using Node.js, Express, and MongoDB. It includes core features like user authentication, video uploads (via Cloudinary), likes, comments, playlists, subscriptions, tweets, and views.

## Features

- User registration and login using JWT (access + refresh tokens stored in cookies)
- Upload videos and thumbnails to Cloudinary using multer
- View videos and update view counts
- Like videos or comments
- Comment on videos
- Create and manage playlists
- Follow/subscribe to other users
- Tweet and like tweets
- Update video details (title, description, publish/unpublish)
- Delete uploaded videos from Cloudinary and MongoDB
- Pagination support for large data sets

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- Cloudinary (for media storage)
- Multer (for file handling)
- JWT (authentication)
- dotenv
- bcrypt
- Mongoose Aggregate Pagination
- Postman (for testing)


## How to Use

1. Clone the repository:

git clone https://github.com/huzaifahaleem7/Backend-Project-fully-functional.git

2. Install dependencies:

npm install


3. Configure your `.env` file:

PORT=8000
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

4. Run the server:

npm run dev

5. Test using Postman or connect to frontend.

## Database Model Reference

You can view the full ERD of this backend project here:

https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj

## Notes

- Large file uploads like videos are stored on Cloudinary to avoid GitHub's size limits.
- The `/public/temp` folder is ignored from Git using `.gitignore`.
- JWT access and refresh tokens are stored securely using cookies.
- Error handling is done with custom `ApiError` and `asyncHandler` utilities.

## Author

Huzaifa Bin Haleem



