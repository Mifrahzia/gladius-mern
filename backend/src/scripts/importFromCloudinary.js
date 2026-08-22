import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Loaded dynamically, after dotenv.config() above has populated process.env —
// a static import would be hoisted and run before dotenv.config(), leaving
// cloudinary.v2.config() with undefined credentials.
const cloudinary = (await import('../config/cloudinary.js')).default;

const CLOUDINARY_ROOT_FOLDER = 'gladius-knives';

const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function getCategoryId(categoryName, cache) {
  if (!categoryName) return null;
  if (cache.has(categoryName)) return cache.get(categoryName);

  const slug = slugify(categoryName);
  let category = await Category.findOne({ slug });
  if (!category) {
    category = await Category.create({ name: categoryName, slug });
    console.log(`  + created category "${categoryName}" (${slug})`);
  }
  cache.set(categoryName, category._id);
  return category._id;
}

async function getFolderImages(ybCode) {
  const folderPath = `${CLOUDINARY_ROOT_FOLDER}/${ybCode}`;
  const result = await cloudinary.search
    .expression(`folder:"${folderPath}"`)
    .max_results(30)
    .execute();

  return (result.resources || []).map((r) => ({
    url: r.secure_url,
    public_id: r.public_id,
  }));
}

function buildSpecs(entry) {
  const specs = {};
  const map = {
    handle: 'Handle',
    blade: 'Blade',
    spacer: 'Spacer',
    lengthBlade: 'Blade Length (mm)',
    widthBlade: 'Blade Width (mm)',
    lengthHandle: 'Handle Length (mm)',
    casing: 'Casing',
    finishing: 'Finishing',
    tamper: 'Hardness (HRC)',
    combination: 'Combination',
  };
  for (const [key, label] of Object.entries(map)) {
    if (entry[key] !== null && entry[key] !== undefined && entry[key] !== 'Nil') {
      specs[label] = entry[key];
    }
  }
  return specs;
}

function buildDescription(entry) {
  const parts = [];
  if (entry.category) parts.push(entry.category);
  if (entry.blade) parts.push(`featuring a ${entry.blade} blade`);
  if (entry.handle) parts.push(`with a ${entry.handle} handle`);
  if (entry.finishing) parts.push(entry.finishing.toLowerCase());
  if (entry.casing) parts.push(`includes ${entry.casing}`);
  return parts.join(', ') + '.';
}

async function run() {
  const dataPath = path.join(__dirname, 'productImportData.json');
  const entries = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to MongoDB. Importing ${entries.length} entries...\n`);

  const categoryCache = new Map();
  const summary = { created: [], updated: [], skippedNoImages: [], noCategory: [] };

  for (const entry of entries) {
    const images = await getFolderImages(entry.ybCode);
    if (images.length === 0) {
      summary.skippedNoImages.push(entry.ybCode);
      console.log(`- ${entry.ybCode}: no Cloudinary images found, skipping`);
      continue;
    }

    const categoryId = await getCategoryId(entry.category, categoryCache);
    if (!categoryId) summary.noCategory.push(entry.ybCode);

    const name = entry.category ? `${entry.category} (${entry.ybCode})` : `Knife ${entry.ybCode}`;
    const slug = slugify(`${entry.category || 'knife'}-${entry.ybCode}`);

    const result = await Product.findOneAndUpdate(
      { slug },
      {
        name,
        slug,
        description: buildDescription(entry),
        specs: buildSpecs(entry),
        price: entry.price,
        stock: entry.quantity || 0,
        category: categoryId,
        images,
      },
      { upsert: true, new: true, rawResult: true }
    );

    if (result.lastErrorObject?.updatedExisting) {
      summary.updated.push(entry.ybCode);
      console.log(`~ ${entry.ybCode}: updated existing product "${name}" (${images.length} images)`);
    } else {
      summary.created.push(entry.ybCode);
      console.log(`+ ${entry.ybCode}: created "${name}" (${images.length} images)`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Created: ${summary.created.length}`);
  console.log(`Updated: ${summary.updated.length}`);
  console.log(`Skipped (no Cloudinary images found): ${summary.skippedNoImages.join(', ') || 'none'}`);
  console.log(`No category assigned (fix manually in admin panel): ${summary.noCategory.join(', ') || 'none'}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
