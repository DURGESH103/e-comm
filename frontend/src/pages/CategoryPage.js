import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../components/product/ProductCard';

const CategoryPage = () => {
  const { category } = useParams();
  const { products } = useSelector((state) => state.products);

  const displayName = category
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : '';

  const filtered = products.filter(
    (p) => p.category?.toLowerCase() === category?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
          <p className="text-gray-500 mt-1">{filtered.length} products found</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-6">No products found in {displayName}.</p>
            <Link
              to="/"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;