import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const uploadToCloudinary = async (filePath) => {
  try {
    const cloudinary = (await import('../config/cloudinary.js')).default;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'travelhub',
      });
      fs.unlinkSync(filePath);
      return result.secure_url;
    }
    return `/uploads/${path.basename(filePath)}`;
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message);
    return `/uploads/${path.basename(filePath)}`;
  }
};
