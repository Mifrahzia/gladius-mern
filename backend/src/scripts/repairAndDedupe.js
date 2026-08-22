import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const APPLY = process.argv.includes('--apply');

const ybOf = (slug) => {
  const m = (slug || '').match(/-yb(\d+)$/i);
  return m ? Number(m[1]) : null;
};

function reconstructUrl(imgObj) {
  const chars = Object.keys(imgObj)
    .filter((k) => k !== '_id')
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => imgObj[k]);
  return chars.join('');
}

function derivePublicId(url) {
  const m = url.match(/\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/);
  return m ? m[1] : undefined;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected. Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY RUN (no writes — pass --apply to execute)'}\n`);

  const col = mongoose.connection.db.collection('products');
  const batch2 = await col.find({ countInStock: { $exists: true } }).toArray();
  console.log(`Found ${batch2.length} legacy-format products (have countInStock) to repair.\n`);

  let repaired = 0;
  let deleted = 0;
  const skippedNoMatch = [];

  for (const doc of batch2) {
    const rawImages = Array.isArray(doc.images) ? doc.images : [];
    const images = rawImages.map((imgObj) => {
      const url = typeof imgObj.url === 'string' ? imgObj.url : reconstructUrl(imgObj);
      const public_id = imgObj.public_id || derivePublicId(url);
      return { url, public_id };
    });

    const specs = doc.specifications && Object.keys(doc.specifications).length > 0
      ? doc.specifications
      : {};

    console.log(`~ ${doc.slug}: stock ${doc.countInStock ?? doc.stock}, ${images.length} image(s) reconstructed`);

    if (APPLY) {
      const clean = {
        _id: doc._id,
        name: doc.name,
        slug: doc.slug,
        description: doc.description || '',
        specs,
        price: doc.price,
        stock: doc.countInStock ?? doc.stock ?? 0,
        category: doc.category,
        images,
        isFeatured: doc.isFeatured || false,
        rating: doc.rating || 0,
        numReviews: doc.numReviews || 0,
        createdAt: doc.createdAt,
        updatedAt: new Date(),
      };
      await col.replaceOne({ _id: doc._id }, clean);
    }
    repaired++;

    // find + remove the plain duplicate created by the earlier import script
    const yb = ybOf(doc.slug);
    if (yb === null) {
      skippedNoMatch.push(doc.slug);
      continue;
    }
    const dup = await col.findOne({
      slug: new RegExp(`-yb${yb}$`, 'i'),
      countInStock: { $exists: false },
      _id: { $ne: doc._id },
    });
    if (dup) {
      console.log(`  - duplicate found: "${dup.name}" (${dup.slug}) -> ${APPLY ? 'deleting' : 'would delete'}`);
      if (APPLY) await col.deleteOne({ _id: dup._id });
      deleted++;
    } else {
      console.log(`  - no plain duplicate found for YB${yb}`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Repaired: ${repaired}`);
  console.log(`Duplicates ${APPLY ? 'deleted' : 'that would be deleted'}: ${deleted}`);
  if (skippedNoMatch.length) console.log(`Could not parse YB code from slug: ${skippedNoMatch.join(', ')}`);
  if (!APPLY) console.log('\nThis was a dry run — re-run with --apply to actually write these changes.');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
