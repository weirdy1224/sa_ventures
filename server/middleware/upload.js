const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

const storage = (subfolder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', subfolder);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const productUpload = multer({
  storage: storage('products'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
});

const deliveryUpload = multer({
  storage: storage('delivery'),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

const bannerUpload = multer({
  storage: storage('banners'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

module.exports = { productUpload, deliveryUpload, bannerUpload };
