import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  const isInWishlist = wishlistItems.some(item => item._id === product._id);
  const discount = product.discount || 0;

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {discount}% OFF
            </span>
          )}
          
          {product.stock === 0 && (
            <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
          
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              product.stock === 0 ? 'hidden' : ''
            } ${
              isInWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:text-red-500'
            }`}
          >
            <svg className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600 ml-1">
                {product.ratings.average.toFixed(1)} ({product.ratings.count})
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-gray-900">
                ₹{product.finalPrice || product.price}
              </span>
              {discount > 0 && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ₹{product.price}
                </span>
              )}
            </div>
            <span className={`text-sm ${
              product.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </Link>
      
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            product.stock > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;