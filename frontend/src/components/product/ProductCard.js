import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'react-toastify';

/* ── Tag colour map matches Product schema enum ── */
const TAG_STYLES = {
  hot:        'bg-red-500 text-white',
  trending:   'bg-orange-500 text-white',
  new:        'bg-emerald-500 text-white',
  offer:      'bg-yellow-400 text-gray-900',
  bestseller: 'bg-indigo-600 text-white',
};

/* ── Half-star aware rating display ── */
const StarRating = ({ average = 0, count = 0, compact = false }) => {
  const full  = Math.floor(average);
  const half  = average - full >= 0.4;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((s) => {
          const filled = s <= full;
          const isHalf = !filled && s === full + 1 && half;
          return (
            <svg key={s}
              className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} flex-shrink-0 ${filled || isHalf ? 'text-amber-400' : 'text-gray-200'}`}
              fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        })}
      </div>
      {!compact && <span className="text-xs text-gray-400 leading-none">({count})</span>}
    </div>
  );
};

const ProductCard = ({ product, compact = false }) => {
  const dispatch = useDispatch();
  const { isAuthenticated }      = useSelector((s) => s.auth);
  const { items: wishlistItems } = useSelector((s) => s.wishlist);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [adding,    setAdding]    = useState(false);
  const [added,     setAdded]     = useState(false);

  const isInWishlist = wishlistItems.some((i) => i._id === product._id);
  const discount     = product.discount || 0;
  const primaryTag   = product.tags?.[0];
  const outOfStock   = product.stock === 0;
  const price        = product.finalPrice ?? product.price;

  /* ── handlers ── */
  const handleCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return; }
    if (outOfStock)       { toast.error('Product is out of stock'); return; }
    setAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    setAdding(false); setAdded(true);
    toast.success('Added to cart!');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to use wishlist'); return; }
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product._id));
      toast.success('Added to wishlist!');
    }
  };

  /* ── cart button shared render ── */
  const CartBtn = ({ full = false }) => (
    <button
      onClick={handleCart}
      disabled={outOfStock || adding}
      className={`flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 active:scale-95
        ${full ? 'w-full py-2.5 rounded-xl text-sm' : 'px-3 py-2 rounded-lg text-xs'}
        ${outOfStock
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : added
            ? 'bg-emerald-500 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'
        }`}
    >
      {adding ? (
        <span className="loading-spinner" />
      ) : added ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {full && 'Added!'}
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {full ? 'Add to Cart' : ''}
        </>
      )}
    </button>
  );

  return (
    <div className={`group relative bg-white rounded-2xl border border-gray-100
      hover:border-indigo-200 shadow-sm hover:shadow-xl
      transition-all duration-300 overflow-hidden
      ${compact ? 'w-44 sm:w-52 flex-shrink-0' : 'w-full'}`}
    >
      <Link to={`/products/${product._id}`} className="block">

        {/* ── Image ── */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          {/* shimmer placeholder */}
          {!imgLoaded && <div className="skeleton absolute inset-0 rounded-none" />}

          <img
            src={product.images?.[0]}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500
              group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Discount badge — top-left */}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm leading-tight">
              -{discount}%
            </span>
          )}

          {/* Tag badge — below discount or top-left if no discount */}
          {primaryTag && (
            <span className={`absolute left-2 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize leading-tight
              ${discount > 0 ? 'top-7' : 'top-2'}
              ${TAG_STYLES[primaryTag] ?? 'bg-gray-700 text-white'}`}>
              {primaryTag}
            </span>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/95 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist — always visible on mobile, hover-reveal on desktop */}
          <button
            onClick={handleWishlist}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-md
              transition-all duration-200
              sm:opacity-0 sm:scale-90 sm:group-hover:opacity-100 sm:group-hover:scale-100
              ${isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/95 text-gray-400 hover:text-red-500 hover:bg-white'
              }`}
          >
            <svg className="w-3.5 h-3.5" fill={isInWishlist ? 'currentColor' : 'none'}
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* ── Info ── */}
        <div className={compact ? 'p-3' : 'p-4 pb-3'}>
          {/* Brand */}
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide mb-0.5 truncate">
            {product.brand}
          </p>

          {/* Name */}
          <h3 className={`font-semibold text-gray-800 line-clamp-2 leading-snug
            group-hover:text-indigo-600 transition-colors duration-200
            ${compact ? 'text-xs' : 'text-sm'}`}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mt-1.5">
            <StarRating
              average={product.ratings?.average}
              count={product.ratings?.count}
              compact={compact}
            />
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className={`font-black text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
                ₹{price?.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Compact quick-add (icon only) */}
            {compact && !outOfStock && (
              <CartBtn full={false} />
            )}
          </div>
        </div>
      </Link>

      {/* Full-width cart button — grid cards only */}
      {!compact && (
        <div className="px-4 pb-4">
          <CartBtn full />
        </div>
      )}
    </div>
  );
};

export default ProductCard;
