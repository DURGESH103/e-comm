import React from 'react';
import { Link } from 'react-router-dom';

const CategoryPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Category Page
          </h1>
          <p className="text-gray-600 mb-6">
            This page is for other categories. Clothing has its own dedicated pages.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;