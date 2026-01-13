import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../../store/slices/wishlistSlice';
import Card from '../../ui/cards/Card';
import Button from '../../ui/buttons/Button';
import Badge from '../../ui/feedback/Badge';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  const isInWishlist = wishlistItems.some(item => item._id === product._id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product._id));
      toast.success('Added to wishlist');
    }
  };

  return (
    <Link to={`/products/${product._id}`}>
      <Card 
        className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
        padding="none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden bg-slate-100 aspect-square">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
          )}
          
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3">
              <Badge variant="danger" size="sm" className="bg-red-500 text-white shadow-md">
                {discount}% OFF
              </Badge>
            </div>
          )}
          
          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute top-3 right-3">
              <Badge variant="default" size="sm" className="bg-slate-800 text-white">
                Out of Stock
              </Badge>
            </div>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
              product.stock === 0 ? 'hidden' : ''
            } ${
              isInWishlist 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/80 text-slate-600 hover:bg-white hover:text-red-500 shadow-md'
            } ${isHovered ? 'scale-110' : 'scale-100'}`}
          >
            <svg className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          {/* Quick Add to Cart - Shows on Hover */}
          <div className={`absolute inset-x-3 bottom-3 transition-all duration-300 ${
            isHovered && product.stock > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="w-full bg-white/90 text-slate-900 hover:bg-white shadow-lg backdrop-blur-sm"
            >
              Quick Add
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-3">
          {/* Brand */}
          <p className="text-sm text-slate-500 font-medium">{product.brand}</p>
          
          {/* Product Name */}
          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.ratings.average) 
                      ? 'text-amber-400 fill-current' 
                      : 'text-slate-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {product.ratings.average.toFixed(1)} ({product.ratings.count})
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-slate-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-slate-500 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              product.stock > 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
            
            {product.stock > 0 && (
              <div className="flex items-center text-emerald-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium">Available</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;