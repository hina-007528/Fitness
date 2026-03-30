import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import UserRoutes from "./routes/User.js";
import TutorialRoutes from "./routes/Tutorial.js";
import BlogRoutes from "./routes/Blog.js";
import ContactRoutes from "./routes/Contact.js";
import UploadRoutes from "./routes/upload.js";
import CommentRoutes from "./routes/Comment.js";
import { errorHandler } from "./error.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true })); // for form data

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Vercel Serverless Function middleware MUST run before routes
if (process.env.VERCEL === "1") {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      next(err);
    }
  });
}

app.use("/api/user/", UserRoutes);
app.use("/api/tutorials/", TutorialRoutes);
app.use("/api/blogs/", BlogRoutes);
app.use("/api/contact/", ContactRoutes);
app.use("/api/upload/", UploadRoutes);
app.use("/api/comments/", CommentRoutes);

// Error handler
app.use(errorHandler);

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Hello developers from GFG",
  });
});

app.get("/api", async (req, res) => {
  res.status(200).json({
    message: "API root is alive",
  });
});

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  mongoose.set("strictQuery", true);
  const mongoUrl = process.env.MONGODB_URL;

  if (mongoUrl) {
    try {
      await mongoose.connect(mongoUrl);
      console.log("Connected to Mongo DB");
      return;
    } catch (error) {
      console.error(
        "Failed to connect to Mongo DB using MONGODB_URL. Falling back to in-memory Mongo DB.",
        error?.message || error
      );
    }
  }

  if (process.env.VERCEL === "1") {
    throw new Error("MONGODB_URL is required on Vercel. mongodb-memory-server is not supported in serverless functions.");
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server");

  const downloadDir = process.env.LOCALAPPDATA
    ? path.resolve(process.env.LOCALAPPDATA, "fitnesstrack-mongodb-binaries")
    : path.resolve(__dirname, ".mongodb-binaries");
  process.env.MONGOMS_DOWNLOAD_DIR = downloadDir;

  const mongoServer = await MongoMemoryServer.create({
    binary: { downloadDir },
    instance: { launchTimeout: 10 * 60 * 1000 },
  });
  const inMemoryUri = mongoServer.getUri();
  await mongoose.connect(inMemoryUri);
  console.log("Connected to in-memory Mongo DB");
};

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.VERCEL !== "1") {
      const port = process.env.PORT ? Number(process.env.PORT) : 8080;
      app.listen(port, () => console.log(`Server started on port ${port}`));
    }
  } catch (error) {
    console.error(error?.message || error);
    if (process.env.VERCEL !== "1") {
      process.exit(1);
    }
  }
};

if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
