import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchProductsByTag } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import {
  ProductCardSkeleton,
  SliderCardSkeleton,
  BannerSkeleton,
} from '../components/ui/feedback/Skeleton';

/* ─────────────────────────────────────────────────────────────
   STATIC CONFIG  (no hardcoded products — only UI metadata)
───────────────────────────────────────────────────────────── */

const BANNER_SLIDES = [
  {
    tag: 'Limited Time',
    headline: 'Summer Sale',
    sub: 'Up to 60% off on top brands',
    cta: 'Shop Deals',
    href: '/products?tags=offer',
    gradient: 'from-indigo-600 via-violet-600 to-purple-700',
    accent: '#a78bfa',
    emoji: '🛍️',
  },
  {
    tag: 'Just Arrived',
    headline: 'New Arrivals',
    sub: 'Fresh styles added every week',
    cta: 'Explore Now',
    href: '/products?tags=new',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    accent: '#6ee7b7',
    emoji: '✨',
  },
  {
    tag: 'Trending Now',
    headline: 'Hot Picks',
    sub: 'What everyone is buying right now',
    cta: 'See Trends',
    href: '/products?tags=trending',
    gradient: 'from-orange-500 via-red-500 to-rose-600',
    accent: '#fca5a5',
    emoji: '🔥',
  },
  {
    tag: 'Top Rated',
    headline: 'Best Sellers',
    sub: 'Loved by thousands of customers',
    cta: 'View All',
    href: '/products?tags=bestseller',
    gradient: 'from-amber-400 via-orange-500 to-yellow-500',
    accent: '#fde68a',
    emoji: '⭐',
  },
];

/* Matches Product.js schema enum exactly */
const CATEGORY_META = {
  Electronics: { emoji: '📱', bg: 'from-blue-500 to-indigo-600',    href: '/category/electronics' },
  Clothing:    { emoji: '👗', bg: 'from-pink-500 to-rose-500',      href: '/clothing'             },
  Books:       { emoji: '📚', bg: 'from-cyan-500 to-blue-500',      href: '/category/books'       },
  Home:        { emoji: '🏠', bg: 'from-amber-400 to-orange-500',   href: '/category/home'        },
  Sports:      { emoji: '⚽', bg: 'from-emerald-500 to-teal-600',   href: '/category/sports'      },
  Beauty:      { emoji: '💄', bg: 'from-purple-500 to-pink-500',    href: '/category/beauty'      },
  Toys:        { emoji: '🧸', bg: 'from-yellow-400 to-amber-500',   href: '/category/toys'        },
};

/* Matches Product.js tags enum exactly */
const TAG_SECTIONS = [
  { tag: 'trending',   label: 'Trending Now',   desc: 'What everyone is buying',           icon: '🔥' },
  { tag: 'new',        label: 'New Arrivals',    desc: "Fresh drops you'll love",           icon: '✨' },
  { tag: 'bestseller', label: 'Best Sellers',    desc: 'Top-rated by our customers',        icon: '⭐' },
  { tag: 'hot',        label: 'Hot Deals',       desc: 'Limited-time steals',               icon: '⚡' },
  { tag: 'offer',      label: 'Special Offers',  desc: 'Exclusive discounts just for you',  icon: '🎁' },
];

const TRUST_ITEMS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: 'Free Shipping',
    desc: 'On orders above ₹499',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Easy Returns',
    desc: '30-day hassle-free returns',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Payments',
    desc: '100% safe & encrypted',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '24/7 Support',
    desc: 'Always here to help',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

/* ─────────────────────────────────────────────────────────────
   PROMO BANNER  — two-column layout, auto-advance, arrows, dots
───────────────────────────────────────────────────────────── */
const PromoBanner = () => {
  const [active, setActive] = useState(0);
  const timerRef  = useRef(null);
  const navigate  = useNavigate();

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setActive((p) => (p + 1) % BANNER_SLIDES.length),
      4800,
    );
  }, []);

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, [resetTimer]);

  const go   = (i)  => { setActive(i); resetTimer(); };
  const prev = ()   => go((active - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  const next = ()   => go((active + 1) % BANNER_SLIDES.length);
  const s    = BANNER_SLIDES[active];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient}`}
      style={{ minHeight: 260 }}>

      {/* Left — text content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 py-10 sm:px-12 sm:py-14 max-w-md">
        <span className="inline-block text-[11px] font-bold uppercase tracking-widest
          bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full mb-4 w-fit border border-white/20">
          {s.tag}
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white leading-[1.1] mb-3 animate-fadeInUp">
          {s.headline}
        </h2>
        <p className="text-white/75 text-sm sm:text-base mb-7 leading-relaxed animate-fadeInUp">
          {s.sub}
        </p>
        <button
          onClick={() => navigate(s.href)}
          className="w-fit px-7 py-3 bg-white text-gray-900 font-bold rounded-xl text-sm
            hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-xl
            hover:shadow-2xl flex items-center gap-2 group/btn"
        >
          {s.cta}
          <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Right — decorative panel (hidden on small screens) */}
      <div className="hidden sm:flex absolute right-0 top-0 bottom-0 w-2/5 items-center justify-center">
        <div className="text-[120px] lg:text-[160px] select-none opacity-25 leading-none">
          {s.emoji}
        </div>
        {/* subtle radial glow */}
        <div className="absolute inset-0 bg-white/5 rounded-l-full" />
      </div>

      {/* Prev / Next arrows */}
      {[
        { fn: prev, side: 'left-3',  icon: '‹' },
        { fn: next, side: 'right-3', icon: '›' },
      ].map(({ fn, side, icon }) => (
        <button key={side} onClick={fn}
          className={`absolute ${side} top-1/2 -translate-y-1/2 z-20
            w-9 h-9 rounded-full bg-white/15 hover:bg-white/35 backdrop-blur-sm
            text-white text-xl font-bold flex items-center justify-center
            transition-all duration-200 border border-white/20`}>
          {icon}
        </button>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {BANNER_SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            className={`rounded-full transition-all duration-300
              ${i === active ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TRUST STRIP
───────────────────────────────────────────────────────────── */
const TrustStrip = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {TRUST_ITEMS.map(({ icon, title, desc, color, bg }) => (
      <div key={title}
        className={`flex items-center gap-3 p-3.5 rounded-xl ${bg} border border-white`}>
        <div className={`flex-shrink-0 ${color}`}>{icon}</div>
        <div>
          <p className={`text-xs font-bold ${color} leading-tight`}>{title}</p>
          <p className="text-xs text-gray-500 leading-tight mt-0.5">{desc}</p>
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   CATEGORY PILLS  — driven by real Redux categories state
───────────────────────────────────────────────────────────── */
const CategoryPills = () => {
  const { categories } = useSelector((s) => s.products);

  if (!categories.length) return null;

  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900">Shop by Category</h2>
          <p className="text-xs text-gray-500 mt-0.5">Find exactly what you're looking for</p>
        </div>
        <Link to="/products"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          All →
        </Link>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat] ?? { emoji: '📦', bg: 'from-gray-400 to-gray-500', href: `/category/${cat.toLowerCase()}` };
          return (
            <Link key={cat} to={meta.href}
              className="group flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl
                border border-gray-100 hover:border-indigo-200 hover:shadow-md
                transition-all duration-200 hover:-translate-y-0.5">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.bg}
                flex items-center justify-center shadow-sm
                group-hover:scale-110 transition-transform duration-200`}>
                <span className="text-xl leading-none">{meta.emoji}</span>
              </div>
              <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">
                {cat}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   PRODUCT SLIDER  — horizontal scroll with fade arrows
───────────────────────────────────────────────────────────── */
const ProductSlider = ({ products = [], loading = false }) => {
  const ref = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  const sync = useCallback(() => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
    setTimeout(sync, 320);
  };

  const ArrowBtn = ({ dir, visible }) => (
    <button
      onClick={() => scroll(dir)}
      className={`absolute ${dir === -1 ? 'left-0 -translate-x-4' : 'right-0 translate-x-4'}
        top-1/2 -translate-y-1/2 z-10
        w-9 h-9 bg-white shadow-lg rounded-full
        flex items-center justify-center text-lg font-bold
        text-gray-500 hover:text-indigo-600 hover:shadow-xl
        transition-all duration-200
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
    >
      {dir === -1 ? '‹' : '›'}
    </button>
  );

  return (
    <div className="relative">
      <ArrowBtn dir={-1} visible={canLeft} />
      <div ref={ref} onScroll={sync} className="product-slider scrollbar-hide">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SliderCardSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p._id} product={p} compact />)
        }
      </div>
      <ArrowBtn dir={1} visible={canRight} />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────── */
const SectionHeader = ({ icon, label, desc, viewAllHref }) => (
  <div className="flex items-end justify-between mb-5">
    <div className="flex items-start gap-3">
      {/* accent line */}
      <div className="w-1 h-10 bg-indigo-600 rounded-full mt-0.5 flex-shrink-0" />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{icon}</span>
          <h2 className="text-lg sm:text-xl font-black text-gray-900">{label}</h2>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
    <Link to={viewAllHref}
      className="flex items-center gap-1 text-xs font-semibold text-indigo-600
        hover:text-indigo-800 whitespace-nowrap transition-colors group/va">
      View All
      <svg className="w-3.5 h-3.5 group-hover/va:translate-x-0.5 transition-transform"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   TAG SECTION  — reads from Redux taggedProducts / tagLoading
───────────────────────────────────────────────────────────── */
const TagSection = ({ tag, label, desc, icon }) => {
  const { taggedProducts, tagLoading } = useSelector((s) => s.products);
  const products = taggedProducts[tag] ?? [];
  const loading  = tagLoading[tag]     ?? false;

  /* hide section entirely if API returned 0 products and not loading */
  if (!loading && products.length === 0) return null;

  return (
    <section className="py-6 border-t border-gray-100 first:border-t-0">
      <SectionHeader
        icon={icon}
        label={label}
        desc={desc}
        viewAllHref={`/products?tags=${tag}`}
      />
      <ProductSlider products={products} loading={loading} />
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   FEATURED PRODUCTS GRID  — isFeatured=true or fallback to all
───────────────────────────────────────────────────────────── */
const FeaturedGrid = ({ products, loading }) => (
  <section className="py-6 border-t border-gray-100">
    <SectionHeader
      icon="🏆"
      label="All Products"
      desc="Explore our complete collection"
      viewAllHref="/products"
    />
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {loading
        ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((p) => <ProductCard key={p._id} product={p} />)
      }
    </div>
    <div className="text-center mt-8">
      <Link to="/products"
        className="inline-flex items-center gap-2 px-8 py-3
          bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl
          shadow-sm hover:shadow-lg active:scale-95 transition-all duration-200 text-sm">
        Explore All Products
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────
   PROMO STRIP  — sign-up CTA
───────────────────────────────────────────────────────────── */
const PromoStrip = () => (
  <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 sm:p-10 text-center text-white">
    <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-2">
      Limited Time Offer
    </p>
    <h2 className="text-2xl sm:text-3xl font-black mb-2">Get 50% Off Your First Order</h2>
    <p className="text-white/70 text-sm mb-7 max-w-sm mx-auto leading-relaxed">
      Join thousands of happy customers and discover amazing products at unbeatable prices.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link to="/register"
        className="px-7 py-3 bg-white text-indigo-700 font-bold rounded-xl
          hover:bg-gray-50 active:scale-95 transition-all duration-200 text-sm shadow-lg">
        Sign Up Free
      </Link>
      <Link to="/products"
        className="px-7 py-3 border border-white/30 text-white font-bold rounded-xl
          hover:bg-white/10 active:scale-95 transition-all duration-200 text-sm">
        Browse Products
      </Link>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────
   HOME  — orchestrates all sections, fires all API calls
───────────────────────────────────────────────────────────── */
const Home = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((s) => s.products);

  useEffect(() => {
    /* General product grid */
    dispatch(fetchProducts({ limit: 10 }));
    /* One request per tag — all fire in parallel */
    TAG_SECTIONS.forEach(({ tag }) => dispatch(fetchProductsByTag(tag)));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* 1. Hero Banner */}
        <PromoBanner />

        {/* 2. Trust Strip */}
        <div className="mt-4">
          <TrustStrip />
        </div>

        {/* 3. Category Pills — live from Redux (fetched by Header) */}
        <div className="mt-8">
          <CategoryPills />
        </div>

        {/* 4–8. Tag-driven product sections (hidden if 0 results) */}
        <div className="mt-6">
          {TAG_SECTIONS.map(({ tag, label, desc, icon }) => (
            <TagSection key={tag} tag={tag} label={label} desc={desc} icon={icon} />
          ))}
        </div>

        {/* 9. All Products grid */}
        <FeaturedGrid products={products} loading={loading} />

        {/* 10. Sign-up promo */}
        <div className="mt-6 mb-2">
          <PromoStrip />
        </div>

      </div>
    </div>
  );
};

export default Home;
