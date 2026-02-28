"use client";

import { useState, useEffect } from "react";
import axios from 'axios';

interface Video {
  id: string;
  title: string;
  channel: string;
  publishedAt: string;
  views: string;
  likes: string;
  speed: string;
  speedRaw: number;
  viewsRaw: number;
  engagementRaw: number;
  thumbnail: string;
  isHot: boolean;
}

// Mock Data for fallback or initial preview
const MOCK_VIDEOS: Video[] = [
  {
    id: "v1",
    title: "I Built a Secret Room in My House! (Undiscovered)",
    channel: "Creator X",
    publishedAt: "2天前",
    views: "2.4M",
    likes: "150K",
    speed: "5.1万播放/小时",
    speedRaw: 51000,
    viewsRaw: 2400000,
    engagementRaw: 0.0625,
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&h=280&fit=crop",
    isHot: true
  },
  {
    id: "v2",
    title: "10 AI Tools That Will Change Your Life in 2026",
    channel: "Tech Insiders",
    publishedAt: "5天前",
    views: "1.1M",
    likes: "89K",
    speed: "2.0万播放/小时",
    speedRaw: 20000,
    viewsRaw: 1100000,
    engagementRaw: 0.08,
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=280&fit=crop",
    isHot: true
  }
];

export default function Dashboard() {
  const [apiKey, setApiKey] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("speed");
  const [isUsingMock, setIsUsingMock] = useState(true);

  // New Search Filters
  const [publishedAfter, setPublishedAfter] = useState("15");
  const [searchOrder, setSearchOrder] = useState("viewCount");
  const [videoDuration, setVideoDuration] = useState("any");

  // Load API Key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem("yt_viral_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      setShowConfig(false);
    } else {
      setShowConfig(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      alert("请输入有效的 API Key");
      return;
    }
    localStorage.setItem("yt_viral_api_key", apiKey.trim());
    alert("API Key 保存成功！");
    setShowConfig(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim()) {
      alert("请输入搜索关键词");
      return;
    }

    setIsSearching(true);
    setError("");
    setIsUsingMock(false);

    try {
      const response = await axios.get('/api/youtube', {
        params: {
          keyword,
          apiKey,
          publishedAfter,
          order: searchOrder,
          videoDuration
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setVideos(response.data.videos);
      if (response.data.videos.length === 0) {
        setError(`在最近 ${publishedAfter} 天内未找到与该关键词相关的视频。`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "数据获取失败，请检查您的 API Key。");
      setIsUsingMock(true);
      setVideos(MOCK_VIDEOS);
    } finally {
      setIsSearching(false);
    }
  };

  // Sorting logic
  const sortedVideos = [...(videos.length > 0 ? videos : (isUsingMock ? MOCK_VIDEOS : []))].sort((a, b) => {
    if (sortBy === "speed") return b.speedRaw - a.speedRaw;
    if (sortBy === "views") return b.viewsRaw - a.viewsRaw;
    if (sortBy === "engagement") return b.engagementRaw - a.engagementRaw;
    return 0;
  });

  return (
    <div className="space-y-8 animate-fade-in relative z-10 w-full overflow-hidden">

      {/* Configuration & Search Panel */}
      <section className="glass rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 blur-3xl rounded-full -mt-32 -mr-32 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end gap-6 relative z-10">
          <form className="flex-1 space-y-4" onSubmit={handleSearch}>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-white/70">关键词搜索</label>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="例如：科技评测、美食、Vlog"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isSearching ? "搜索中..." : "搜索爆款"}
                  {!isSearching && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50">时间范围</label>
                <select
                  value={publishedAfter}
                  onChange={(e) => setPublishedAfter(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
                >
                  <option value="1" className="bg-slate-900">最近24小时</option>
                  <option value="7" className="bg-slate-900">最近7天</option>
                  <option value="15" className="bg-slate-900">最近15天</option>
                  <option value="30" className="bg-slate-900">最近30天</option>
                  <option value="365" className="bg-slate-900">最近一年</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50">YouTube 排序方式</label>
                <select
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
                >
                  <option value="relevance" className="bg-slate-900">相关性</option>
                  <option value="date" className="bg-slate-900">上传日期</option>
                  <option value="viewCount" className="bg-slate-900">播放量</option>
                  <option value="rating" className="bg-slate-900">评分</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50">视频时长</label>
                <select
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50 transition-all"
                >
                  <option value="any" className="bg-slate-900">不限</option>
                  <option value="short" className="bg-slate-900">短视频（&lt; 4分钟）</option>
                  <option value="medium" className="bg-slate-900">中等（4 - 20分钟）</option>
                  <option value="long" className="bg-slate-900">长视频（&gt; 20分钟）</option>
                </select>
              </div>
            </div>
          </form>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            API 配置
          </button>
        </div>

        {/* API Config Panel Area */}
        {showConfig && (
          <div className="pt-6 border-t border-white/10 mt-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  YouTube Data API v3
                  {!apiKey && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">必填</span>}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed max-w-xl">
                  要获取实时数据，您需要一个来自 Google Cloud 的 API Key。
                  当前为模拟数据预览模式，输入您的 Key 以解锁实时爆款分析。
                </p>
                <div className="flex gap-4 max-w-xl">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-brand-pink/50 transition-all text-sm"
                  />
                  <button
                    onClick={handleSaveKey}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 text-white text-sm font-medium transition-colors"
                  >
                    保存 Key
                  </button>
                </div>
              </div>
              <div className="w-full md:w-64 glass rounded-xl p-4 flex flex-col justify-center items-center text-center space-y-2 border-brand-purple/20">
                <div className="w-10 h-10 rounded-full bg-brand-purple/20 text-brand-purple flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                </div>
                <h4 className="text-sm font-medium text-white">需要 Key？</h4>
                <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-xs text-brand-purple hover:text-brand-pink transition-colors underline underline-offset-2">
                  免费获取 YouTube API Key
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-sm animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      {/* Stats/Filter Bar */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold flex items-center gap-3">
          {isSearching ? "搜索中..." : isUsingMock ? "模拟数据预览" : "实时结果"}
          <span className="text-sm font-normal text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            最近 {publishedAfter} {parseInt(publishedAfter) === 1 ? '天' : '天'}内
          </span>
        </h2>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-purple glass cursor-pointer"
          >
            <option className="bg-slate-900" value="speed">按增速排序（播放/小时）</option>
            <option className="bg-slate-900" value="views">按总播放量排序</option>
            <option className="bg-slate-900" value="engagement">按互动率排序</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
        {sortedVideos.map((video, idx) => (
          <div key={video.id + idx} className="glass-hover rounded-2xl overflow-hidden group flex flex-col animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
            {/* Thumbnail */}
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-video overflow-hidden block"
            >
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
                  爆款
                </div>
              )}

              <div className="absolute bottom-3 right-3 font-mono text-xs bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                {video.publishedAt}
              </div>
            </a>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="font-semibold text-white/90 line-clamp-2 leading-tight group-hover:text-brand-purple transition-colors h-10">
                    {video.title}
                  </h3>
                </a>
                <p className="text-sm text-white/50 mt-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0">
                    {video.channel.charAt(0)}
                  </span>
                  <span className="truncate">{video.channel}</span>
                </p>
              </div>

              {/* Metrics */}
              <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                <div>
                  <div className="text-white/40 text-xs text-nowrap">总播放量</div>
                  <div className="font-medium text-white/90">{video.views}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs">点赞数</div>
                  <div className="font-medium text-white/90">{video.likes}</div>
                </div>
                <div className="col-span-2 bg-brand-purple/10 border border-brand-purple/20 rounded-lg p-2.5 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-purple"></div>
                  <div>
                    <div className="text-brand-purple/70 text-xs font-medium">增速</div>
                    <div className="font-bold text-brand-purple tracking-tight">{video.speed}</div>
                  </div>
                  <svg className="w-5 h-5 text-brand-purple/50 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!isSearching && sortedVideos.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="text-4xl">🔍</div>
            <p className="text-white/40 font-medium">请在上方输入关键词，搜索爆款视频。</p>
          </div>
        )}
      </div>

    </div>
  );
}
