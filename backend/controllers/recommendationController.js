const Product = require('../models/Product');
const Order   = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const cache   = require('../config/cache');

const LIMIT     = 12;
const CACHE_TTL = 120; // 2 minutes — personalised, so keep short

/**
 * GET /api/recommendations
 * Returns 4 sections:
 *   - recommended   (based on purchase + wishlist categories)
 *   - recentlyViewed (from ?viewed= query param — IDs stored client-side)
 *   - trending       (tag: trending, sorted by ratings)
 *   - popularInCategories (top-rated in user's top categories)
 */
const getRecommendations = async (req, res) => {
  try {
    const userId  = req.user.id;
    const cacheKey = `recommendations:${userId}`;
    const cached   = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    // ── 1. Gather user signal: ordered categories + wishlist categories ──────
    const [orders, wishlist] = await Promise.all([
      Order.find({ user: userId })
        .select('items')
        .populate({ path: 'items.product', select: 'category' })
        .lean(),
      Wishlist.findOne({ user: userId })
        .populate({ path: 'products', select: 'category _id' })
        .lean(),
    ]);

    // Collect all categories the user has interacted with
    const categoryFreq = {};
    for (const order of orders) {
      for (const item of order.items) {
        const cat = item.product?.category;
        if (cat) categoryFreq[cat] = (categoryFreq[cat] || 0) + 2; // orders weight more
      }
    }
    for (const p of wishlist?.products ?? []) {
      if (p?.category) categoryFreq[p.category] = (categoryFreq[p.category] || 0) + 1;
    }

    // Top 3 categories by frequency
    const topCategories = Object.entries(categoryFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // IDs already seen — exclude from recommendations
    const orderedProductIds = orders.flatMap((o) => o.items.map((i) => i.product?._id).filter(Boolean));
    const wishlistProductIds = (wishlist?.products ?? []).map((p) => p._id);
    const excludeIds = [...new Set([...orderedProductIds, ...wishlistProductIds])];

    // ── 2. Recently Viewed (IDs sent from client) ────────────────────────────
    const viewedIds = (req.query.viewed || '')
      .split(',')
      .filter(Boolean)
      .slice(0, 10);

    const [recommended, recentlyViewed, trending, popularInCategories] = await Promise.all([

      // Recommended — products in user's top categories, not yet bought/wishlisted
      topCategories.length
        ? Product.find({
            category: { $in: topCategories },
            _id:      { $nin: excludeIds },
            stock:    { $gt: 0 },
          })
            .sort({ 'ratings.average': -1, createdAt: -1 })
            .limit(LIMIT)
            .lean()
        : Product.find({ stock: { $gt: 0 } })
            .sort({ 'ratings.average': -1 })
            .limit(LIMIT)
            .lean(),

      // Recently Viewed — fetch by IDs, preserve order
      viewedIds.length
        ? Product.find({ _id: { $in: viewedIds } }).lean().then((products) => {
            const map = Object.fromEntries(products.map((p) => [p._id.toString(), p]));
            return viewedIds.map((id) => map[id]).filter(Boolean);
          })
        : [],

      // Trending — products tagged 'trending' or 'bestseller', sorted by rating
      Product.find({
        tags:  { $in: ['trending', 'bestseller', 'hot'] },
        stock: { $gt: 0 },
      })
        .sort({ 'ratings.average': -1, 'ratings.count': -1 })
        .limit(LIMIT)
        .lean(),

      // Popular in user's top categories — highest rated per category
      topCategories.length
        ? Product.aggregate([
            { $match: { category: { $in: topCategories }, stock: { $gt: 0 } } },
            { $sort:  { 'ratings.average': -1, 'ratings.count': -1 } },
            { $group: { _id: '$category', products: { $push: '$$ROOT' } } },
            { $project: { products: { $slice: ['$products', 4] } } },
          ]).then((groups) => groups.flatMap((g) => g.products))
        : [],
    ]);

    const response = {
      success: true,
      topCategories,
      sections: {
        recommended,
        recentlyViewed,
        trending,
        popularInCategories,
      },
    };

    await cache.set(cacheKey, response, CACHE_TTL);
    res.json(response);
  } catch (err) {
    console.error('[recommendations]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getRecommendations };
