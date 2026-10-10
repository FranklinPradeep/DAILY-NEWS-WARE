import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';

type Article = {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  status?: string;
  category?: { name: string; slug?: string };
  author?: { name: string; avatar?: string; bio?: string };
  tags?: string[];
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
};

const fallbackArticles: Article[] = [
  {
    id: '1',
    slug: 'ai-infrastructure-boom-to-reshape-india-digital-economy',
    title: 'AI infrastructure boom expected to reshape India’s digital economy',
    subtitle: 'New data-center and cloud investments are accelerating adoption across sectors.',
    excerpt: 'The surge in semiconductor and cloud spending is redefining enterprise technology investments in India.',
    content: 'India is witnessing a rapid jump in artificial intelligence investments. The country’s data infrastructure is expanding to meet enterprise demand for intelligent applications and cloud services.',
    featuredImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    status: 'PUBLISHED',
    category: { name: 'Technology', slug: 'technology' },
    author: { name: 'Rohan Menon' },
    tags: ['AI', 'Innovation'],
    publishedAt: '2026-10-06T10:00:00Z',
    viewCount: 5620,
    likeCount: 420,
    commentCount: 53,
  },
  {
    id: '2',
    slug: 'budget-roadmaps-faster-public-private-investment-clean-energy',
    title: 'Budget roadmaps signal faster public-private investment in clean energy',
    subtitle: 'Policy levers are pushing utility-scale projects and battery storage',
    excerpt: 'Energy transition projects are seeing fresh commitment from both government and private capital.',
    content: 'Clean-energy project pipelines are expanding with new incentives for transmission, solar and grid modernization.',
    featuredImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9',
    status: 'PUBLISHED',
    category: { name: 'Business', slug: 'business' },
    author: { name: 'Meera Iyer' },
    tags: ['Markets', 'Climate'],
    publishedAt: '2026-10-05T08:30:00Z',
    viewCount: 4890,
    likeCount: 310,
    commentCount: 41,
  },
  {
    id: '3',
    slug: 'tamil-nadu-launches-new-mobility-corridor',
    title: 'Tamil Nadu launches new mobility corridor to ease urban commutes',
    subtitle: 'New rail and road connectivity aims to reduce congestion in major cities.',
    excerpt: 'State authorities say the corridor will improve regional connectivity and reduce travel times.',
    content: 'Officials unveiled a multi-modal transit plan designed to alleviate commuter pressure and improve access.',
    featuredImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
    status: 'APPROVED',
    category: { name: 'Tamil Nadu', slug: 'tamil-nadu' },
    author: { name: 'Rohan Menon' },
    tags: ['India'],
    publishedAt: '2026-10-04T12:00:00Z',
    viewCount: 3120,
    likeCount: 180,
    commentCount: 25,
  },
];

const categories = ['Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health', 'Education', 'World', 'India', 'Tamil Nadu'];

function formatDate(date?: string) {
  if (!date) return 'Today';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function useArticles() {
  const [articles, setArticles] = useState<Article[]>(fallbackArticles);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/articles');
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.articles) && data.articles.length) {
          setArticles(data.articles);
        }
      } catch (error) {
        console.warn('API unavailable, using local sample data.', error);
      }
    };

    fetchArticles();
  }, []);

  return articles;
}

function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 font-black text-white">N</div>
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Daily</div>
              <div className="text-xl font-black tracking-tight text-slate-900">NewsWire</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            {categories.slice(0, 7).map((item) => (
              <NavLink key={item} to="/news" className="transition hover:text-red-600">{item}</NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <input className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm md:block" placeholder="Search stories" />
            <Link to="/login" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Login</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function BreakingTicker() {
  return (
    <div className="border-y border-red-100 bg-red-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-sm font-medium">
        <span className="rounded bg-white/15 px-2 py-1 text-xs font-bold uppercase">Breaking</span>
        <span>Major technology announcement released today as AI and infrastructure spending surge across the region.</span>
      </div>
    </div>
  );
}

function HomePage() {
  const articles = useArticles();
  const featured = articles[0];
  const latest = articles.slice(1, 5);

  return (
    <div className="space-y-10 pb-12">
      <BreakingTicker />

      <section className="mx-auto max-w-7xl px-4 pt-8">
        {featured && (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
            <Link to={`/article/${featured.slug}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <img src={featured.featuredImage} alt={featured.title} className="h-80 w-full object-cover" />
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
                  <span>{featured.category?.name}</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">{featured.title}</h1>
                <p className="text-base text-slate-600">{featured.excerpt}</p>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>{featured.author?.name}</span>
                  <span>•</span>
                  <span>{formatDate(featured.publishedAt)}</span>
                </div>
              </div>
            </Link>

            <div className="space-y-4">
              {latest.map((article) => (
                <Link key={article.slug} to={`/article/${article.slug}`} className="card flex gap-4 p-3">
                  <img src={article.featuredImage} alt={article.title} className="h-24 w-28 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-red-600">{article.category?.name}</div>
                    <h3 className="text-base font-bold text-slate-900">{article.title}</h3>
                    <div className="mt-2 text-xs text-slate-500">{formatDate(article.publishedAt)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Latest News</h2>
          <Link to="/news" className="text-sm font-semibold text-red-600">View all</Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {articles.map((article) => (
            <Link key={article.slug} to={`/article/${article.slug}`} className="card overflow-hidden">
              <img src={article.featuredImage} alt={article.title} className="h-44 w-full object-cover" />
              <div className="space-y-3 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">{article.category?.name}</div>
                <h3 className="text-lg font-bold leading-snug text-slate-900">{article.title}</h3>
                <p className="text-sm text-slate-600">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{article.author?.name}</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="card p-5">
            <h3 className="mb-5 text-xl font-black text-slate-900">Trending Now</h3>
            <div className="space-y-4">
              {articles.slice(0, 4).map((article, index) => (
                <div key={article.slug} className="flex items-start gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 font-black text-red-600">{index + 1}</div>
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-500">{article.category?.name}</div>
                    <div className="font-semibold text-slate-800">{article.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-5 text-xl font-black text-slate-900">Newsletter</h3>
            <div className="space-y-3">
              <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Email address" />
              <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function NewsPage() {
  const articles = useArticles();
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black text-slate-900">Latest Stories</h1>
        <div className="flex gap-3 text-sm">
          <select className="rounded-full border border-slate-200 bg-white px-3 py-2">
            <option>All categories</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <select className="rounded-full border border-slate-200 bg-white px-3 py-2">
            <option>Newest</option>
            <option>Popular</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <Link to={`/article/${article.slug}`} key={article.slug} className="card overflow-hidden">
            <img src={article.featuredImage} alt={article.title} className="h-52 w-full object-cover" />
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                <span>{article.category?.name}</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              <h3 className="line-clamp-3 text-xl font-bold leading-tight text-slate-900">{article.title}</h3>
              <p className="text-sm text-slate-600">{article.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{article.author?.name}</span>
                <span>{article.viewCount ?? 0} views</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ArticlePage() {
  const articles = useArticles();
  const article = useMemo(() => articles[0], [articles]);

  if (!article) return <div className="p-10 text-center">Article unavailable.</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-red-600">{article.category?.name}</div>
      <h1 className="text-4xl font-black tracking-tight text-slate-900">{article.title}</h1>
      <p className="mt-3 text-xl text-slate-600">{article.subtitle}</p>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <span>{article.author?.name}</span>
        <span>•</span>
        <span>{formatDate(article.publishedAt)}</span>
        <span>•</span>
        <span>{article.viewCount ?? 0} views</span>
      </div>

      <img src={article.featuredImage} alt={article.title} className="mt-8 h-[420px] w-full rounded-3xl object-cover" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <article className="prose max-w-none text-lg leading-8 text-slate-700">
          <p>{article.content}</p>
          <p>{article.content}</p>
          <p>{article.content}</p>
        </article>

        <aside className="space-y-4">
          <div className="card p-4">
            <h3 className="mb-3 text-lg font-black text-slate-900">Share</h3>
            <div className="flex gap-2 text-sm">
              <button className="rounded-full bg-slate-100 px-3 py-2">Like</button>
              <button className="rounded-full bg-slate-100 px-3 py-2">Bookmark</button>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="mb-3 text-lg font-black text-slate-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(article.tags ?? ['AI', 'News']).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">#{tag}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-8">
        <h2 className="mb-6 text-3xl font-black text-slate-900">Welcome back</h2>
        <form className="space-y-4">
          <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Email" defaultValue="admin@newsportal.local" />
          <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Password" type="password" defaultValue="admin123" />
          <button className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white">Login</button>
        </form>
      </div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black text-slate-900">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {['Total Users', 'Total Articles', 'Published Articles'].map((label) => (
          <div key={label} className="card p-5">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{label.includes('Users') ? 126 : label.includes('Articles') ? 58 : 42}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
