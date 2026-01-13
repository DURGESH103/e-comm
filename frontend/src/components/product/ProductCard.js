import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product._id}`}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-2">
          {product.brand}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ₹{product.finalPrice}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ₹{product.price}
              </span>
            )}
          </div>
          {product.discount > 0 && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600 ml-1">
              {product.ratings.average} ({product.ratings.count})
            </span>
          </div>
          <span className={`text-sm ${
            product.stock > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium ${
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