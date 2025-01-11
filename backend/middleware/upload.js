const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Ensure upload directories exist
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files per request
  }
});

// Process and save image
const processImage = async (buffer, filename, folder, options = {}) => {
  // Get file extension from original filename or use jpg as default
  const originalExt = path.extname(filename).toLowerCase().substring(1) || 'jpg';

  // Ensure upload directory exists
  const uploadDir = path.join('uploads', folder);
  await ensureDirectoryExists(uploadDir);

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const processedFilename = `${timestamp}-${randomString}-${filename}.${originalExt}`;
  const filePath = path.join(uploadDir, processedFilename);

  // Save the original image without processing
  await fs.writeFile(filePath, buffer);

  return {
    filename: processedFilename,
    path: filePath,
    url: `/uploads/${folder}/${processedFilename}`
  };
};

// Middleware for single image upload
const uploadSingle = (fieldName, folder, options = {}) => {
  return async (req, res, next) => {
    try {
      // Use multer to handle the upload
      upload.single(fieldName)(req, res, async (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({ message: 'File too large' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
              return res.status(400).json({ message: 'Too many files' });
            }
          }
          return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
          const originalName = path.parse(req.file.originalname).name;
          const processedImage = await processImage(
            req.file.buffer,
            originalName,
            folder,
            options
          );

          req.uploadedFile = processedImage;
          next();
        } catch (processError) {
          console.error('Image processing error:', processError);
          res.status(500).json({ message: 'Error processing image' });
        }
      });
    } catch (error) {
      console.error('Upload middleware error:', error);
      res.status(500).json({ message: 'Upload error' });
    }
  };
};

// Middleware for multiple image upload
const uploadMultiple = (fieldName, folder, maxCount = 5, options = {}) => {
  return async (req, res, next) => {
    try {
      upload.array(fieldName, maxCount)(req, res, async (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({ message: 'File too large' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
              return res.status(400).json({ message: 'Too many files' });
            }
          }
          return res.status(400).json({ message: err.message });
        }

        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: 'No files uploaded' });
        }

        try {
          const processedImages = [];

          for (const file of req.files) {
            const originalName = path.parse(file.originalname).name;
            const processedImage = await processImage(
              file.buffer,
              originalName,
              folder,
              options
            );
            processedImages.push(processedImage);
          }

          req.uploadedFiles = processedImages;
          next();
        } catch (processError) {
          console.error('Image processing error:', processError);
          res.status(500).json({ message: 'Error processing images' });
        }
      });
    } catch (error) {
      console.error('Upload middleware error:', error);
      res.status(500).json({ message: 'Upload error' });
    }
  };
};

// Delete file helper
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  processImage,
  deleteFile,
  ensureDirectoryExists
};
