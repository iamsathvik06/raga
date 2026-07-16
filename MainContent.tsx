import { useState, useEffect } from "react";
import { Search, Music, Link as LinkIcon, Loader2, Sparkles, Import } from "lucide-react";
import { usePlayer } from "../store";
import { Track } from "../types";
import { motion } from "motion/react";

export function MainContent() {
  const { playTrack } = usePlayer();
  const [query, setQuery] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    // Fetch initial recommendations
    fetchRecommendations("Acoustic chill");
  }, []);

  const fetchRecommendations = async (prompt: string) => {
    setLoadingRecs(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      if (res.ok) {
        const data = await res.json();
        // Map raw data to our Track type
        const mappedData: Track[] = data.map((d: any, i: number) => ({
          id: `rec-${i}`,
          title: d.title,
          artist: d.artist,
          source: d.source || 'youtube',
          youtubeId: 'dQw4w9WgXcQ', // Placeholder until real search is implemented per-track
          albumArt: `https://images.unsplash.com/photo-${1600000000000 + i}?q=80&w=300&auto=format&fit=crop` // Dummy images
        }));
        setRecommendations(mappedData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    alert("In a full production environment, this would parse the YouTube URL and import the playlist metadata securely.");
    setImportUrl("");
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-900 p-8">
      
      {/* Top Navigation / Search */}
      <div className="flex items-center justify-between mb-12 gap-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-md group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Search across YouTube..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-500/40 transition-all text-zinc-900 dark:text-zinc-100"
          />
        </form>

        <form onSubmit={handleImport} className="flex items-center gap-2">
          <div className="relative w-64 hidden md:block">
            <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="url" 
              placeholder="Paste playlist URL..." 
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button type="submit" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full px-4 py-2 text-xs font-semibold hover:opacity-90 transition flex items-center gap-2">
            <Import size={14} /> Import
          </button>
        </form>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            Search Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((track) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={track.id} 
                onClick={() => playTrack(track)}
                className="bg-white dark:bg-zinc-950/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 hover:border-green-500/50 cursor-pointer transition-colors group"
              >
                <div className="w-16 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                  {track.albumArt && <img src={track.albumArt} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                </div>
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{track.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{track.artist}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* AI Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Sparkles size={20} className="text-blue-500" />
            AI Tailored For You
          </h2>
          <button onClick={() => fetchRecommendations("Upbeat focus music")} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition">
            Refresh
          </button>
        </div>
        
        {loadingRecs ? (
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="animate-spin text-zinc-400" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recommendations.map((track, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={track.id}
                onClick={() => playTrack(track)}
                className="bg-white dark:bg-zinc-950/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-green-500/50 cursor-pointer transition-all group"
              >
                <div className="aspect-square w-full rounded-lg bg-zinc-200 dark:bg-zinc-800 mb-4 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                  {track.albumArt ? (
                    <img src={track.albumArt} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400"><Music size={32} /></div>
                  )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-1 text-zinc-900 dark:text-zinc-100">{track.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{track.artist}</p>
                <div className="mt-3 inline-flex items-center text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                  {track.source}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
      
    </div>
  );
}
