import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import Loading from '../../components/common/Loading';
import VariantSelector from '../../components/product/VariantSelector';
import { toast } from 'react-toastify';

/** Normalize Mongoose Map → plain object on every variant */
const normalizeVariants = (variants = []) =>
  variants.map((v) => ({
    ...v,
    attributes:
      v.attributes instanceof Map
        ? Object.fromEntries(v.attributes)
        : typeof v.attributes?.toObject === 'function'
        ? v.attributes.toObject()
        : { ...v.attributes },
  }));

const findMatchingVariant = (variants, attrKeys, selectedAttrs) => {
  if (!attrKeys.every((k) => selectedAttrs[k])) return null;
  return variants.find((v) => attrKeys.every((k) => v.attributes[k] === selectedAttrs[k])) ?? null;
};

const StarRating = ({ average }) =>
  [...Array(5)].map((_, i) => (
    <svg
      key={i}
      className={`h-4 w-4 ${i < Math.floor(average) ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ));

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttrs, setSelectedAttrs] = useState({});

  const { currentProduct: product, isLoading } = useSelector((s) => s.products);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { items: wishlistItems } = useSelector((s) => s.wishlist);

  const isInWishlist = product && wishlistItems.some((item) => item._id === product._id);

  useEffect(() => { dispatch(fetchProduct(id)); }, [dispatch, id]);

  // ── Variant logic ─────────────────────────────────────────────────────────
  // Both memos are declared before the reset useEffect so the dep array below
  // can reference attrKeys without a lint "used before declaration" issue.
  const normalizedVariants = useMemo(
    () => normalizeVariants(product?.variants ?? []),
    [product?.variants]
  );

  // Stable array reference — prevents the useMemo for activeVariant from
  // re-running on every render when product.attributes is undefined.
  const attrKeys = useMemo(
    () => product?.attributes ?? [],
    [product?.attributes]
  );

  // Reset selections whenever the product (or its attribute list) changes.
  useEffect(() => {
    setSelectedAttrs(
      attrKeys.length
        ? Object.fromEntries(attrKeys.map((a) => [a, '']))
        : {}
    );
    setSelectedImage(0);
    setQuantity(1);
  }, [product?._id, attrKeys]);

  const hasVariants = normalizedVariants.length > 0;

  const activeVariant = useMemo(
    () => findMatchingVariant(normalizedVariants, attrKeys, selectedAttrs),
    [normalizedVariants, attrKeys, selectedAttrs]
  );

  const allAttrsSelected = hasVariants && attrKeys.every((k) => selectedAttrs[k]);

  // ── Derived display values ────────────────────────────────────────────────
  const displayPrice         = activeVariant?.price          ?? product?.finalPrice ?? product?.price;
  const displayOriginalPrice = activeVariant?.originalPrice  ?? product?.price;
  const displayStock         = allAttrsSelected ? (activeVariant?.stock ?? 0) : (hasVariants ? null : product?.stock);
  const displayImages        = activeVariant?.images?.length ? activeVariant.images : (product?.images ?? []);

  const discount =
    displayOriginalPrice > displayPrice
      ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
      : 0;

  const canAddToCart = displayStock > 0 && (!hasVariants || allAttrsSelected);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAttrChange = (attr, val) => {
    setSelectedAttrs((prev) => ({ ...prev, [attr]: val }));
    setSelectedImage(0);
    setQuantity(1);
  };

  const dispatchAddToCart = () =>
    dispatch(addToCart({ productId: product._id, variantId: activeVariant?._id ?? null, quantity }));

  const handleAddToCart = () => {
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return; }
    if (hasVariants && !allAttrsSelected) { toast.error('Please select all options'); return; }
    if (displayStock === 0) { toast.error('Product is out of stock'); return; }
    dispatchAddToCart();
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { toast.error('Please login to continue'); return; }
    if (hasVariants && !allAttrsSelected) { toast.error('Please select all options'); return; }
    if (displayStock === 0) { toast.error('Product is out of stock'); return; }
    dispatchAddToCart();
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) { toast.error('Please login to add items to wishlist'); return; }
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product._id));
      toast.success('Added to wishlist');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading || !product) return <Loading text="Loading product..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white shadow-sm rounded-sm">

        {/* ── Left: Image Gallery ──────────────────────────────────────────── */}
        <div className="flex gap-3 p-6 border-r border-gray-100 sticky top-4 self-start">
          {/* Thumbnail strip */}
          {displayImages.length > 1 && (
            <div className="flex flex-col gap-2">
              {displayImages.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  onClick={() => setSelectedImage(i)}
                  className={`w-14 h-14 rounded border-2 bg-white overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === i ? 'border-primary-500' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt="" loading="lazy" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center bg-white" style={{ minHeight: '400px' }}>
            <img
              src={displayImages[selectedImage] ?? displayImages[0]}
              alt={product.name}
              loading="lazy"
              className="max-h-96 w-full object-contain"
            />
          </div>
        </div>

        {/* ── Right: Product Info ──────────────────────────────────────────── */}
        <div className="p-6 flex flex-col gap-0">

          {/* 1. Title + Brand */}
          <div className="pb-3 border-b border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
            <h1 className="text-xl font-medium text-gray-900 leading-snug">{product.name}</h1>
          </div>

          {/* 2. Rating */}
          <div className="py-3 border-b border-gray-100 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
              {product.ratings.average.toFixed(1)}
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </span>
            <span className="text-sm text-gray-500">{product.ratings.count.toLocaleString()} Ratings</span>
            <span className="text-gray-300">|</span>
            <div className="flex">
              <StarRating average={product.ratings.average} />
            </div>
          </div>

          {/* 3. Price */}
          <div className="py-4 border-b border-gray-100">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-medium text-gray-900">
                ₹{displayPrice?.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{displayOriginalPrice?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-green-600 font-semibold text-base">{discount}% off</span>
                </>
              )}
            </div>
            <p className="text-green-600 text-xs mt-1">Inclusive of all taxes</p>
          </div>

          {/* 4. Variant Selector */}
          {hasVariants && (
            <div className="py-4 border-b border-gray-100">
              <VariantSelector
                attributes={attrKeys}
                variants={normalizedVariants}
                selectedAttrs={selectedAttrs}
                onChange={handleAttrChange}
              />
              {/* Stock status inline */}
              {allAttrsSelected && displayStock !== null && (
                <p className={`text-sm font-medium mt-2 ${displayStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {displayStock > 0 ? `In Stock (${displayStock} left)` : 'Out of Stock'}
                </p>
              )}
              {!allAttrsSelected && (
                <p className="text-xs text-gray-400 italic mt-1">Select all options to see availability</p>
              )}
            </div>
          )}

          {/* Stock status for non-variant products */}
          {!hasVariants && (
            <div className="py-2 border-b border-gray-100">
              <span className={`text-sm font-medium ${displayStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {displayStock > 0 ? `In Stock (${displayStock} available)` : 'Out of Stock'}
              </span>
            </div>
          )}

          {/* 5. Delivery Details */}
          <div className="py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Delivery</p>
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="font-medium">Free Delivery</p>
                <p className="text-gray-500 text-xs mt-0.5">Estimated delivery in 3–5 business days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-700 mt-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div>
                <p className="font-medium">7 Days Return Policy</p>
                <p className="text-gray-500 text-xs mt-0.5">Easy returns &amp; exchange available</p>
              </div>
            </div>
          </div>

          {/* 6. Seller Information */}
          <div className="py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Seller</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary-600">{product.brand} Official Store</span>
              <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                {product.ratings.average.toFixed(1)} ★
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">GST invoice available · Trusted seller</p>
          </div>

          {/* 7. Quantity Selector */}
          {canAddToCart && (
            <div className="py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-lg font-medium leading-none"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(displayStock, q + 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-lg font-medium leading-none"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* 8. Add to Cart + Buy Now */}
          <div className="py-5 border-b border-gray-100 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`flex-1 py-3.5 px-6 rounded font-semibold text-sm transition-colors ${
                canAddToCart
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {displayStock === 0
                ? 'Out of Stock'
                : hasVariants && !allAttrsSelected
                ? 'Select Options'
                : '🛒 Add to Cart'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!canAddToCart}
              className={`flex-1 py-3.5 px-6 rounded font-semibold text-sm transition-colors ${
                canAddToCart
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              ⚡ Buy Now
            </button>

            <button
              onClick={handleWishlistToggle}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`px-4 py-3.5 rounded border transition-colors ${
                isInWishlist
                  ? 'border-red-400 text-red-500 hover:bg-red-50'
                  : 'border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <svg className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* 9. Product Highlights */}
          <div className="py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Highlights</p>
            <ul className="space-y-1.5 text-sm text-gray-700">
              {product.description && (
                <li className="flex gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{product.description}</span>
                </li>
              )}
              {product.specifications &&
                Object.entries(product.specifications).slice(0, 5).map(([key, val]) => (
                  <li key={key} className="flex gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span><span className="font-medium">{key}:</span> {val}</span>
                  </li>
                ))}
              {product.tags?.length > 0 && (
                <li className="flex gap-2 flex-wrap mt-1">
                  {product.tags.map((tag) => (
                    <span key={tag} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full capitalize">
                      {tag}
                    </span>
                  ))}
                </li>
              )}
            </ul>
          </div>

          {/* 10. Reviews Section */}
          <div className="py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Ratings &amp; Reviews
            </p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{product.ratings.average.toFixed(1)}</p>
                <div className="flex justify-center my-1">
                  <StarRating average={product.ratings.average} />
                </div>
                <p className="text-xs text-gray-400">{product.ratings.count.toLocaleString()} ratings</p>
              </div>
              {/* Rating bar breakdown — visual only, proportional to average */}
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = star <= Math.round(product.ratings.average) ? Math.max(10, 100 - (5 - star) * 18) : Math.max(2, (star - 1) * 5);
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-3 text-right">{star}</span>
                      <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual reviews from product.reviews if populated */}
            {Array.isArray(product.reviews) && product.reviews.length > 0 &&
              product.reviews[0]?.comment && (
                <div className="mt-4 space-y-3">
                  {product.reviews.slice(0, 3).map((review, i) => (
                    <div key={review._id ?? i} className="border border-gray-100 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          {review.rating} ★
                        </span>
                        <span className="text-sm font-medium text-gray-800">{review.title ?? 'Review'}</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                      {review.user?.name && (
                        <p className="text-xs text-gray-400 mt-1">{review.user.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
