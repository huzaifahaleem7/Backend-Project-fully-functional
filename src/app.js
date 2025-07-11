import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static("public"));

//import userRoutes
import userRouter from "./routes/user.route.js";
app.use("/api/v1/users", userRouter);

//import video route
import videoRouter from "./routes/video.route.js"
app.use("/api/v1/videos", videoRouter)

export { app };
