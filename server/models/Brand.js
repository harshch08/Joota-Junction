const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  bgColor: {
    type: String,
    default: '#f3f4f6' // fallback gray
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
brandSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate slug from name
brandSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Generate slug for insertMany operations
brandSchema.pre('insertMany', function(next, docs) {
  docs.forEach(doc => {
    if (!doc.slug) {
      doc.slug = doc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
  });
  next();
});

module.exports = mongoose.model('Brand', brandSchema); 