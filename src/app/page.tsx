"use client";

import { useState } from "react";

// Mock Data representing "Surging Views" videos over the last 15 days
const MOCK_VIDEOS = [
  {
    id: "v1",
    title: "I Built a Secret Room in My House! (Undiscovered)",
    channel: "Creator X",
    publishedAt: "2 days ago",
    views: "2,450,120",
    likes: "150k",
    speed: "51k views/hr",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=280&fit=crop",
    isHot: true
  },
  {
    id: "v2",
    title: "10 AI Tools That Will Change Your Life in 2026",
    channel: "Tech Insiders",
    publishedAt: "5 days ago",
    views: "1,120,000",
    likes: "89k",
    speed: "20k views/hr",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=280&fit=crop",
    isHot: true
  },
  {
    id: "v3",
    title: "Why This Crypto Is Pumping Right Now...",
    channel: "Finance Daily",
    publishedAt: "1 day ago",
    views: "890,000",
    likes: "50k",
    speed: "37k views/hr",
    thumbnail: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&h=280&fit=crop",
    isHot: true
  },
  {
    id: "v4",
    title: "My 30-Day Transformation (Shocking)",
    channel: "Fitness Bro",
    publishedAt: "12 days ago",
    views: "3,500,000",
    likes: "210k",
    speed: "12k views/hr",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=280&fit=crop",
    isHot: false
  },
  {
    id: "v5",
    title: "You've Been Coding Wrong Your Entire Life",
    channel: "Dev Guru",
    publishedAt: "4 hours ago",
    views: "350,000",
    likes: "45k",
    speed: "87k views/hr",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=280&fit=crop",
    isHot: true
  }
];

export default function Dashboard() {
  const [apiKey, setApiKey] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showConfig, setShowConfig] = useState(!apiKey);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      alert("Please configure your API Key first to enable real searches.");
      setShowConfig(true);
      return;
    }
    setIsSearching(true);
    // Simulate network request
    setTimeout(() => setIsSearching(false), 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10 w-full overflow-hidden">

      {/* Configuration & Search Panel */}
      <section className="glass rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 blur-3xl rounded-full -mt-32 -mr-32 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end gap-6 relative z-10">
          <form className="flex-1 space-y-2" onSubmit={handleSearch}>
            <label className="text-sm font-medium text-white/70">Keyword Search</label>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="e.g. 'Tech Reviews', 'Cooking', 'Vlogs'"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? "Searching..." : "Find Virals"}
                {!isSearching && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                )}
              </button>
            </div>
          </form>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            API Setup
          </button>
        </div>

        {/* API Config Panel Area */}
        {showConfig && (
          <div className="pt-6 border-t border-white/10 mt-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  YouTube Data API v3
                  {!apiKey && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">Required</span>}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed max-w-xl">
                  To fetch live data, you need an API key from Google Cloud.
                  Below is the mock data preview mode. Enter your key to unlock real-time viral analytics.
                </p>
                <div className="flex gap-4 max-w-xl">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-brand-pink/50 transition-all text-sm"
                  />
                  <button className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
                    Save Key
                  </button>
                </div>
              </div>
              <div className="w-full md:w-64 glass rounded-xl p-4 flex flex-col justify-center items-center text-center space-y-2 border-brand-purple/20">
                <div className="w-10 h-10 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                </div>
                <h4 className="text-sm font-medium text-white">Need a Key?</h4>
                <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-xs text-brand-purple hover:text-brand-pink transition-colors underline underline-offset-2">
                  Read our step-by-step guide on generating your free YouTube API Key.
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Stats/Filter Bar */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold flex items-center gap-3">
          {isSearching ? "Searching..." : apiKey ? "Live Results" : "Mock Data Preview"}
          <span className="text-sm font-normal text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            &le; 15 days ago
          </span>
        </h2>

        <div className="flex gap-2">
          <select className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-purple glass">
            <option className="bg-slate-900">Sort by Speed (Views/hr)</option>
            <option className="bg-slate-900">Sort by Total Views</option>
            <option className="bg-slate-900">Sort by Engagement</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_VIDEOS.map((video, idx) => (
          <div key={video.id} className="glass-hover rounded-2xl overflow-hidden group flex flex-col" style={{ animationDelay: `${idx * 100}ms` }}>
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

              {video.isHot && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1 backdrop-blur-md">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                  SURGING
                </div>
              )}

              <div className="absolute bottom-3 right-3 font-mono text-xs bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                {video.publishedAt}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white/90 line-clamp-2 leading-tight group-hover:text-brand-purple transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-white/50 mt-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0">
                    {video.channel.charAt(0)}
                  </span>
                  {video.channel}
                </p>
              </div>

              {/* Metrics */}
              <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                <div>
                  <div className="text-white/40 text-xs">Total Views</div>
                  <div className="font-medium text-white/90">{video.views}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs">Likes</div>
                  <div className="font-medium text-white/90">{video.likes}</div>
                </div>
                <div className="col-span-2 bg-brand-purple/10 border border-brand-purple/20 rounded-lg p-2.5 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-purple"></div>
                  <div>
                    <div className="text-brand-purple/70 text-xs font-medium">Growth Speed</div>
                    <div className="font-bold text-brand-purple tracking-tight">{video.speed}</div>
                  </div>
                  <svg className="w-5 h-5 text-brand-purple/50 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
