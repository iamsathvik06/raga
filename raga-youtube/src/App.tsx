import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { SongList } from './components/SongList';
import { UploadModal } from './components/UploadModal';
import { Equalizer } from './components/Equalizer';
import { motion } from 'motion/react';
import { usePlayerStore } from './store/usePlayerStore';
import { useAuth } from './hooks/useAuth';
import { useAudio } from './hooks/useAudio';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Play, Upload, Search as SearchIcon, Home, Heart, Plus, Sliders, X, Disc, Music } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { InstallPrompt } from './components/InstallPrompt';
import { cn } from './lib/utils';
import { BackgroundSettings } from './components/BackgroundSettings';
import { MobileNav } from './components/MobileNav';

export default function App() {
  const {
    currentSong,
    setSearchQuery,
    activePlaylistId,
    playlists,
    setActivePlaylist,
    songs,
    setCurrentSong,
    setQueue,
    setIsPlaying,
    likedSongIds,
    toggleLike,
    createPlaylist,
    recentlyPlayed,
    filterArtist,
    setFilterArtist,
    searchQuery
  } = usePlayerStore();
  const { loading, user } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [mobileTab, setMobileTab] = useState<'home' | 'search' | 'library' | 'liked'>('home');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLDivElement>(null);
  useAudio();
  useKeyboardShortcuts();

  const featuredSong = songs.length > 0 ? songs[0] : null;

  const handlePlayFeatured = () => {
    if (featuredSong) {
      setCurrentSong(featuredSong);
      setQueue(songs);
      setIsPlaying(true);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreatingPlaylist(false);
    }
  };

  const getHeading = () => {
    if (activePlaylistId === 'liked' || mobileTab === 'liked') return 'Liked Songs';
    if (activePlaylistId) {
      const playlist = playlists.find(p => p.id === activePlaylistId);
      return playlist?.name || 'Playlist';
    }
    return 'Songs';
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchQuery]);

  const filteredSongs = songs.filter(song =>
    (song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!filterArtist || song.artist === filterArtist)
  );

  const recentlyAdded = [...songs].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 12);
  const topPlayed = [...songs].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 12);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#0f0f0f' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-red-500/40"
        >
          <Disc size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col text-white overflow-hidden" style={{ background: '#0f0f0f', fontFamily: "'Roboto', sans-serif" }}>
      {/* Top Header — YouTube style */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 md:px-6 border-b" style={{ background: '#0f0f0f', borderColor: '#272727', zIndex: 50 }}>
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-5 rounded flex items-center justify-center" style={{ background: '#ff0000' }}>
              <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[9px] border-transparent border-l-white ml-0.5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white hidden sm:block">Raga</span>
            <span className="text-xs font-medium mt-0.5 hidden sm:block" style={{ color: '#aaaaaa' }}>Music</span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-4 md:mx-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: '#aaaaaa' }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search songs, artists..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full py-2 pl-9 pr-4 rounded-full text-sm outline-none focus:ring-1 focus:ring-red-500"
              style={{ background: '#121212', border: '1px solid #303030', color: '#fff' }}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEqualizerOpen(true)}
            className="p-2 rounded-full transition-colors"
            style={{ color: '#aaaaaa' }}
            title="Equalizer"
          >
            <Sliders size={18} />
          </button>
          {isCreatingPlaylist ? (
            <form onSubmit={handleCreatePlaylist}>
              <input
                autoFocus
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onBlur={() => !newPlaylistName && setIsCreatingPlaylist(false)}
                placeholder="Playlist name..."
                className="rounded px-3 py-1.5 text-sm outline-none w-32"
                style={{ background: '#272727', color: '#fff', border: '1px solid #404040' }}
              />
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingPlaylist(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{ background: '#272727', color: '#fff' }}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Playlist</span>
            </button>
          )}
          {user && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
              style={{ background: '#ff0000', color: '#fff' }}
            >
              <Upload size={14} />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            onUploadClick={() => setIsUploadOpen(true)}
            onSearchClick={() => searchInputRef.current?.focus()}
            onLibraryClick={() => libraryRef.current?.scrollIntoView({ behavior: 'smooth' })}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-32 md:pb-24" style={{ scrollbarWidth: 'thin', scrollbarColor: '#404040 transparent' }}>
          <div className="px-4 md:px-6 pt-6">

            {/* Artist Filter */}
            {filterArtist && (
              <div className="mb-5 flex items-center gap-2">
                <span className="text-xs" style={{ color: '#aaaaaa' }}>Filtered by:</span>
                <button
                  onClick={() => setFilterArtist(null)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', border: '1px solid rgba(255,0,0,0.2)' }}
                >
                  {filterArtist}
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Hero / Featured */}
            {mobileTab === 'home' && !activePlaylistId && (
              <section className="mb-8">
                {featuredSong ? (
                  <div
                    className="relative rounded-xl overflow-hidden p-6 md:p-8 flex items-center gap-6"
                    style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)', border: '1px solid #272727' }}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={featuredSong.image_url}
                        alt={featuredSong.title}
                        className="w-20 h-20 md:w-28 md:h-28 rounded-lg object-cover shadow-2xl"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#ff0000' }}>Featured</p>
                      <h2 className="text-2xl md:text-3xl font-bold truncate mb-1">{featuredSong.title}</h2>
                      <p className="text-sm mb-4" style={{ color: '#aaaaaa' }}>{featuredSong.artist}</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePlayFeatured}
                          className="flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                          style={{ background: '#ff0000', color: '#fff' }}
                        >
                          <Play size={15} fill="currentColor" /> Play
                        </button>
                        <button
                          onClick={() => featuredSong && toggleLike(featuredSong.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                          style={{
                            background: likedSongIds.includes(featuredSong.id) ? 'rgba(255,0,0,0.1)' : '#272727',
                            color: likedSongIds.includes(featuredSong.id) ? '#ff4444' : '#fff',
                            border: '1px solid #404040'
                          }}
                        >
                          <Heart size={14} fill={likedSongIds.includes(featuredSong.id) ? 'currentColor' : 'none'} />
                          {likedSongIds.includes(featuredSong.id) ? 'Liked' : 'Like'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-xl flex flex-col items-center justify-center py-16 text-center"
                    style={{ background: '#111', border: '1px solid #272727' }}
                  >
                    <Music size={40} className="mb-3" style={{ color: '#404040' }} />
                    <h2 className="text-xl font-bold mb-1">Welcome to Raga</h2>
                    <p className="text-sm mb-5" style={{ color: '#aaaaaa' }}>Your music library is empty. Upload tracks to get started.</p>
                    {user && (
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm"
                        style={{ background: '#ff0000', color: '#fff' }}
                      >
                        <Upload size={15} /> Upload Song
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Quick Chips (Home) */}
            {mobileTab === 'home' && !activePlaylistId && !filterArtist && songs.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-7 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                {['All', 'Recently Added', 'Top Played', 'Liked'].map((chip) => (
                  <button
                    key={chip}
                    className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    style={{ background: chip === 'All' ? '#ff0000' : '#272727', color: '#fff' }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Recently Played */}
            {mobileTab === 'home' && recentlyPlayed.length > 0 && !activePlaylistId && !filterArtist && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold">Recently Played</h3>
                  <button className="text-xs font-medium hover:underline" style={{ color: '#aaaaaa' }}>See all</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {recentlyPlayed.slice(0, 6).map((song) => (
                    <SongCard
                      key={`recent-${song.id}`}
                      song={song}
                      onClick={() => { setCurrentSong(song); setQueue(recentlyPlayed); setIsPlaying(true); }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Top Played */}
            {mobileTab === 'home' && topPlayed.length > 0 && !activePlaylistId && !filterArtist && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold">Top Played</h3>
                  <button className="text-xs font-medium hover:underline" style={{ color: '#aaaaaa' }}>See all</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {topPlayed.map((song) => (
                    <SongCard
                      key={`top-${song.id}`}
                      song={song}
                      onClick={() => { setCurrentSong(song); setQueue(topPlayed); setIsPlaying(true); }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recently Added */}
            {mobileTab === 'home' && recentlyAdded.length > 0 && !activePlaylistId && !filterArtist && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold">Recently Added</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {recentlyAdded.map((song) => (
                    <SongCard
                      key={`added-${song.id}`}
                      song={song}
                      onClick={() => { setCurrentSong(song); setQueue(recentlyAdded); setIsPlaying(true); }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Song List */}
            <section ref={libraryRef}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold">{getHeading()}</h3>
                <span className="text-xs" style={{ color: '#aaaaaa' }}>{filteredSongs.length} tracks</span>
              </div>
              <SongList />
            </section>
          </div>
        </main>
      </div>

      {/* Player */}
      <Player />

      {/* Mobile Nav */}
      <MobileNav
        activeTab={mobileTab}
        onTabChange={(tab) => {
          setMobileTab(tab);
          if (tab === 'liked') setActivePlaylist('liked');
          else if (tab === 'home' || tab === 'library') setActivePlaylist(null);
          if (tab === 'search') searchInputRef.current?.focus();
          else libraryRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onUploadClick={() => setIsUploadOpen(true)}
        onBackgroundSettingsClick={() => setIsBackgroundSettingsOpen(true)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => (window as any).refreshSongs?.()}
      />
      <Equalizer isOpen={isEqualizerOpen} onClose={() => setIsEqualizerOpen(false)} />
      <BackgroundSettings isOpen={isBackgroundSettingsOpen} onClose={() => setIsBackgroundSettingsOpen(false)} />
      <Toaster position="top-right" theme="dark" richColors />
      <InstallPrompt />
    </div>
  );
}

// Reusable YouTube-style song card
function SongCard({ song, onClick }: { song: any; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        <img src={song.image_url} alt={song.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#ff0000' }}>
            <Play size={18} fill="white" className="ml-0.5" />
          </div>
        </div>
      </div>
      <p className="text-sm font-medium truncate">{song.title}</p>
      <p className="text-xs truncate mt-0.5" style={{ color: '#aaaaaa' }}>{song.artist}</p>
    </motion.div>
  );
}
