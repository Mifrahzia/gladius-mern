import Product from '../models/Product.js';
import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';

// @desc    Get products (with optional filters + pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword ? {
    name: { $regex: req.query.keyword, $options: 'i' }
  } : {};

  let categoryFilter = {};
  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category });
    categoryFilter = category ? { category: category._id } : { category: null };
  }

  const filter = { ...keyword, ...categoryFilter };
  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get single product by id
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (product) return res.json(product);
  res.status(404).json({ message: 'Product not found' });
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category');
  if (product) return res.json(product);
  res.status(404).json({ message: 'Product not found' });
});

// @desc    Create product (Admin)
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { name, slug, price = 0, description = '', specs = {}, stock = 0, category } = req.body;
  const product = new Product({ name, slug, price, description, specs, stock, category });
  const created = await product.save();
  res.status(201).json(created);
});

// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const updates = req.body;
  Object.assign(product, updates);
  const updated = await product.save();
  res.json(updated);
});

// @desc    Delete product (Admin)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await product.remove();
  res.json({ message: 'Product removed' });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeatured = asyncHandler(async (req, res) => {
  const featured = await Product.find({ isFeatured: true }).limit(10);
  res.json(featured);
});

// @desc    Get categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});
