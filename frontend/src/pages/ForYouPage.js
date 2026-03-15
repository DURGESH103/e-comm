import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendations } from '../store/slices/recommendationSlice';
import ProductCard from '../components/product/ProductCard';

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 animate-pulse">
    <div className="h-56 bg-slate-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-slate-200 rounded-full w-1/3" />
      <div className="h-4 bg-slate-200 rounded-full w-3/4" />
      <div className="h-4 bg-slate-200 rounded-full w-1/2" />
      <div className="h-10 bg-slate-200 rounded-2xl mt-2" />
    </div>
  </div>
);

/* ── Section header ── */
const SectionHeader = ({ emoji, title, subtitle, to }) => (
  <div className="flex items-end justify-between mb-6">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-slate-500 ml-9">{subtitle}</p>}
    </div>
    {to && (
      <Link
        to={to}
        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
      >
        See all →
      </Link>
    )}
  </div>
);

/* ── Product grid ── */
const ProductGrid = ({ products, loading, skeletonCount = 4 }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }
  if (!products?.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((p) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
};

/* ── Section wrapper — only renders when it has content ── */
const Section = ({ emoji, title, subtitle, to, products, loading, skeletonCount }) => {
  if (!loading && !products?.length) return null;
  return (
    <section className="mb-14">
      <SectionHeader emoji={emoji} title={title} subtitle={subtitle} to={to} />
      <ProductGrid products={products} loading={loading} skeletonCount={skeletonCount} />
    </section>
  );
};

const ForYouPage = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { sections, topCategories, isLoading, error } = useSelector((s) => s.recommendations);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    dispatch(fetchRecommendations());
  }, [dispatch, isAuthenticated, navigate]);

  const isNewUser = !isLoading &&
    !sections.recommended.length &&
    !sections.recentlyViewed.length &&
    !sections.trending.length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl flex-shrink-0">
              ✨
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black leading-tight">
                For You, {user?.name?.split(' ')[0] ?? 'there'}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {topCategories.length
                  ? `Personalised picks based on your interest in ${topCategories.join(', ')}`
                  : 'Handpicked products just for you'}
              </p>
            </div>
          </div>

          {/* Top category chips */}
          {topCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {topCategories.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${cat.toLowerCase()}`}
                  className="px-4 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full text-sm font-semibold transition-colors duration-200"
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <p className="text-rose-600 font-medium mb-3">{error}</p>
            <button
              onClick={() => dispatch(fetchRecommendations())}
              className="px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── New user empty state ── */}
      {isNewUser && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Start exploring!</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Browse products, add to wishlist, and place orders — we'll personalise this page just for you.
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* ── Sections ── */}
      {!error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <Section
            emoji="🎯"
            title="Recommended for You"
            subtitle="Based on your orders and wishlist"
            to="/products"
            products={sections.recommended}
            loading={isLoading}
            skeletonCount={4}
          />

          <Section
            emoji="🕐"
            title="Recently Viewed"
            subtitle="Pick up where you left off"
            products={sections.recentlyViewed}
            loading={false}
            skeletonCount={4}
          />

          <Section
            emoji="🔥"
            title="Trending Right Now"
            subtitle="What everyone is buying"
            to="/products?tags=trending"
            products={sections.trending}
            loading={isLoading}
            skeletonCount={4}
          />

          <Section
            emoji="⭐"
            title="Popular in Your Categories"
            subtitle={topCategories.length ? `Top picks from ${topCategories.join(', ')}` : undefined}
            products={sections.popularInCategories}
            loading={isLoading}
            skeletonCount={4}
          />

        </div>
      )}
    </div>
  );
};

export default ForYouPage;
