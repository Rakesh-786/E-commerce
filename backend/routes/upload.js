const express = require('express');
const Product = require('../models/Product');
const { authenticateToken, requireMerchant, requireProductOwnership, requireAdmin } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, deleteFile } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/upload/product/:id/images
// @desc    Upload multiple images for a product
// @access  Private (Product Owner/Admin)
router.post('/product/:id/images', 
  authenticateToken, 
  requireProductOwnership,
  uploadMultiple('images', 'products', 5, { width: 800, height: 600, quality: 85 }),
  async (req, res) => {
    try {
      const product = req.product;
      const uploadedImages = req.uploadedFiles;

      // Convert uploaded files to image objects
      const newImages = uploadedImages.map((file, index) => ({
        url: file.url,
        alt: req.body.alt || product.name,
        isPrimary: index === 0 && product.images.length === 0 // First image is primary if no existing images
      }));

      // Add new images to product
      product.images.push(...newImages);
      await product.save();

      res.json({
        message: 'Images uploaded successfully',
        images: newImages,
        totalImages: product.images.length
      });
    } catch (error) {
      console.error('Product image upload error:', error);
      res.status(500).json({ message: 'Error uploading images' });
    }
  }
);

// @route   PUT /api/upload/product/:id/images/:imageIndex/primary
// @desc    Set an image as primary
// @access  Private (Product Owner/Admin)
router.put('/product/:id/images/:imageIndex/primary', 
  authenticateToken, 
  requireProductOwnership,
  async (req, res) => {
    try {
      const product = req.product;
      const imageIndex = parseInt(req.params.imageIndex);

      if (imageIndex < 0 || imageIndex >= product.images.length) {
        return res.status(400).json({ message: 'Invalid image index' });
      }

      // Set all images to not primary
      product.images.forEach(img => img.isPrimary = false);
      
      // Set selected image as primary
      product.images[imageIndex].isPrimary = true;
      
      await product.save();

      res.json({
        message: 'Primary image updated successfully',
        primaryImage: product.images[imageIndex]
      });
    } catch (error) {
      console.error('Set primary image error:', error);
      res.status(500).json({ message: 'Error setting primary image' });
    }
  }
);

// @route   DELETE /api/upload/product/:id/images/:imageIndex
// @desc    Delete a product image
// @access  Private (Product Owner/Admin)
router.delete('/product/:id/images/:imageIndex', 
  authenticateToken, 
  requireProductOwnership,
  async (req, res) => {
    try {
      const product = req.product;
      const imageIndex = parseInt(req.params.imageIndex);

      if (imageIndex < 0 || imageIndex >= product.images.length) {
        return res.status(400).json({ message: 'Invalid image index' });
      }

      // Get the image to delete
      const imageToDelete = product.images[imageIndex];
      const wasPrimary = imageToDelete.isPrimary;

      // Delete the file from filesystem
      const filePath = imageToDelete.url.replace('/uploads/', 'uploads/');
      await deleteFile(filePath);

      // Remove image from array
      product.images.splice(imageIndex, 1);

      // If deleted image was primary and there are remaining images, set first as primary
      if (wasPrimary && product.images.length > 0) {
        product.images[0].isPrimary = true;
      }

      await product.save();

      res.json({
        message: 'Image deleted successfully',
        remainingImages: product.images.length
      });
    } catch (error) {
      console.error('Delete product image error:', error);
      res.status(500).json({ message: 'Error deleting image' });
    }
  }
);

// @route   POST /api/upload/banner
// @desc    Upload banner image for admin
// @access  Private (Admin only)
router.post('/banner', 
  authenticateToken, 
  requireAdmin,
  uploadSingle('banner', 'banners', { width: 1200, height: 400, quality: 90 }),
  async (req, res) => {
    try {
      const uploadedFile = req.uploadedFile;

      res.json({
        message: 'Banner uploaded successfully',
        banner: {
          url: uploadedFile.url,
          filename: uploadedFile.filename
        }
      });
    } catch (error) {
      console.error('Banner upload error:', error);
      res.status(500).json({ message: 'Error uploading banner' });
    }
  }
);

// @route   POST /api/upload/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', 
  authenticateToken,
  uploadSingle('avatar', 'avatars', { width: 200, height: 200, quality: 80 }),
  async (req, res) => {
    try {
      const User = require('../models/User');
      const uploadedFile = req.uploadedFile;

      // Update user avatar
      await User.findByIdAndUpdate(req.user._id, {
        avatar: uploadedFile.url
      });

      res.json({
        message: 'Avatar uploaded successfully',
        avatar: {
          url: uploadedFile.url,
          filename: uploadedFile.filename
        }
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ message: 'Error uploading avatar' });
    }
  }
);

// @route   GET /api/upload/test
// @desc    Test upload endpoint
// @access  Public
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Upload service is working',
    maxFileSize: process.env.MAX_FILE_SIZE || '5MB',
    allowedTypes: process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp'
  });
});

module.exports = router;
