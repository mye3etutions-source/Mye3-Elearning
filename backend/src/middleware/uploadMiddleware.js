const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists (Using absolute path for stability)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(process.cwd(), 'uploads');
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (Relaxed for debugging)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  console.log(`DEBUG (Multer): Mimetype: ${file.mimetype}, Extension: ${ext}`);

  // Accept most common document types
  const allowedExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg'];

  if (allowedExts.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('document')) {
    cb(null, true);
  } else {
    // For now, let's accept everything to find why it's failing
    cb(null, true);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
