import React, { useEffect, useState } from 'react';
import { Play, Heart, MoreHorizontal, Download, Music, Plus, X, Edit2, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Song } from '../types';
import { getSupabase } from '../lib/supabase';
import { isSongCached } from '../lib/db';
import { formatTime } from '../lib/utils';
import { songService } from '../services/songService';
import { downloadSong } from '../lib/utils/downloadUtils';
import { toast } from 'sonner';
import { EditMetadataModal } from './EditMetadataModal';

export const SongList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const {
    currentSong,
    setCurrentSong,
    setQueue,
    setIsPlaying,
    searchQuery,
    likedSongIds,
    toggleLike,
    playlists,
    addToPlaylist,
    removeFromPlaylist,
    activePlaylistId,
    songs,
    setSongs,
    filterArtist,
    setFilterArtist
  } = usePlayerStore();

  const fetchSongs = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    const data = await songService.fetchSongs();
    if (data && data.length > 0) {
      const songsWithCache = await Promise.all(data.map(async (song) => ({
        ...song,
        isCached: await isSongCached(song.id)
      })));
      setSongs(songsWithCache);
    } else {
      setSongs([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSongs(); }, []);
  useEffect(() => { (window as any).refreshSongs = fetchSongs; }, []);

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
    setQueue(filteredSongs);
    setIsPlaying(true);
  };

  const handleAddToPlaylist = (playlistId: string, songId: string) => {
    addToPlaylist(playlistId, songId);
    setShowPlaylistMenu(null);
    toast.success('Added to playlist');
  };

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArtist = !filterArtist || song.artist === filterArtist;
    if (!matchesSearch || !matchesArtist) return false;
    if (activePlaylistId === 'liked') return likedSongIds.includes(song.id);
    if (activePlaylistId) {
      const playlist = playlists.find(p => p.id === activePlaylistId);
      return playlist?.songIds.includes(song.id);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg animate-pulse" style={{ background: '#161616' }}>
            <div className="w-6 h-4 rounded" style={{ background: '#272727' }} />
            <div className="w-10 h-10 rounded flex-shrink-0" style={{ background: '#272727' }} />
            <div className="flex-1">
              <div className="w-40 h-3 rounded mb-1.5" style={{ background: '#272727' }} />
              <div className="w-24 h-3 rounded" style={{ background: '#1f1f1f' }} />
            </div>
            <div className="w-10 h-3 rounded" style={{ background: '#272727' }} />
          </div>
        ))}
      </div>
    );
  }

  if (filteredSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Music size={36} className="mb-3" style={{ color: '#404040' }} />
        <p className="text-base font-medium text-white">
          {activePlaylistId === 'liked' ? 'No liked songs yet' :
            activePlaylistId ? 'This playlist is empty' : 'No songs found'}
        </p>
        <p className="text-sm mt-1" style={{ color: '#606060' }}>
          {activePlaylistId === 'liked' ? 'Like songs to see them here' :
            activePlaylistId ? 'Add some tracks to get started' : 'Try a different search'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Table Header */}
      <div
        className="grid gap-3 px-3 py-2 mb-1 text-xs font-medium uppercase tracking-wider"
        style={{
          color: '#606060',
          borderBottom: '1px solid #272727',
          gridTemplateColumns: '40px 1fr 1fr 60px 60px',
        }}
      >
        <span className="text-center">#</span>
        <span>Title</span>
        <span className="hidden md:block">Artist</span>
        <span className="text-center">Time</span>
        <span />
      </div>

      {filteredSongs.map((song, index) => {
        const isActive = currentSong?.id === song.id;
        const isLiked = likedSongIds.includes(song.id);

        return (
          <motion.div
            key={song.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.015 }}
            onClick={() => handlePlay(song)}
            className="grid gap-3 px-3 py-2.5 rounded-lg items-center cursor-pointer group transition-colors"
            style={{
              gridTemplateColumns: '40px 1fr 1fr 60px 60px',
              background: isActive ? 'rgba(255,0,0,0.06)' : 'transparent',
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#161616'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Index / Now Playing */}
            <div className="flex items-center justify-center w-8">
              {isActive ? (
                <div className="flex items-end gap-0.5 h-3">
                  <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 rounded-full" style={{ background: '#ff0000' }} />
                  <motion.div animate={{ height: [10, 4, 10] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 rounded-full" style={{ background: '#ff0000' }} />
                  <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 rounded-full" style={{ background: '#ff0000' }} />
                </div>
              ) : (
                <>
                  <span className="text-xs group-hover:hidden" style={{ color: '#606060' }}>{index + 1}</span>
                  <Play size={14} className="hidden group-hover:block" fill="white" style={{ color: '#fff' }} />
                </>
              )}
            </div>

            {/* Title + Thumbnail */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0 w-10 h-10">
                <img src={song.image_url} alt={song.title} className="w-full h-full rounded object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                  <Play size={12} fill="white" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: isActive ? '#ff4444' : '#fff' }}>
                  {song.title}
                </p>
                <p className="text-xs truncate md:hidden transition-colors hover:underline" style={{ color: '#aaaaaa' }}
                  onClick={(e) => { e.stopPropagation(); setFilterArtist(song.artist); }}>
                  {song.artist}
                </p>
              </div>
            </div>

            {/* Artist (Desktop) */}
            <span
              className="hidden md:block text-sm truncate hover:underline cursor-pointer transition-colors"
              style={{ color: '#aaaaaa' }}
              onClick={(e) => { e.stopPropagation(); setFilterArtist(song.artist); }}
            >
              {song.artist}
            </span>

            {/* Duration */}
            <span className="text-xs text-center" style={{ color: '#606060' }}>{formatTime(song.duration)}</span>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1 relative">
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                className="p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                style={{ color: isLiked ? '#ff0000' : '#aaaaaa' }}
              >
                <ThumbsUp size={15} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(showPlaylistMenu === song.id ? null : song.id); }}
                className="p-1.5 rounded transition-colors"
                style={{ color: '#606060' }}
              >
                <MoreHorizontal size={16} />
              </button>

              <AnimatePresence>
                {showPlaylistMenu === song.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(null); }} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      className="absolute right-0 top-full mt-1 w-52 rounded-xl py-1.5 z-50 shadow-2xl"
                      style={{ background: '#212121', border: '1px solid #303030' }}
                    >
                      {[
                        {
                          icon: <ThumbsUp size={15} fill={isLiked ? 'currentColor' : 'none'} />,
                          label: isLiked ? 'Unlike' : 'Like',
                          onClick: () => { toggleLike(song.id); setShowPlaylistMenu(null); },
                          color: isLiked ? '#ff4444' : '#ccc',
                        },
                        {
                          icon: <Download size={15} />,
                          label: 'Download',
                          onClick: () => { downloadSong(song); setShowPlaylistMenu(null); },
                          color: '#ccc',
                        },
                        {
                          icon: <Edit2 size={15} />,
                          label: 'Edit Info',
                          onClick: () => { setEditingSong(song); setShowPlaylistMenu(null); },
                          color: '#ccc',
                        },
                        ...(activePlaylistId && activePlaylistId !== 'liked' ? [{
                          icon: <X size={15} />,
                          label: 'Remove from playlist',
                          onClick: () => { removeFromPlaylist(activePlaylistId, song.id); setShowPlaylistMenu(null); toast.success('Removed'); },
                          color: '#ff4444',
                        }] : []),
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); item.onClick(); }}
                          className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors hover:bg-white/5"
                          style={{ color: item.color }}
                        >
                          {item.icon} {item.label}
                        </button>
                      ))}

                      {playlists.length > 0 && (
                        <>
                          <div className="mx-3 my-1.5" style={{ borderTop: '1px solid #303030' }} />
                          <p className="px-4 py-1 text-xs font-medium uppercase tracking-wider" style={{ color: '#606060' }}>Add to playlist</p>
                          <div className="max-h-32 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                            {playlists.map(p => (
                              <button
                                key={p.id}
                                onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(p.id, song.id); }}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-white/5 truncate"
                                style={{ color: '#ccc' }}
                              >
                                <Plus size={13} style={{ color: '#606060', flexShrink: 0 }} />
                                {p.name}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      <EditMetadataModal
        song={editingSong}
        isOpen={!!editingSong}
        onClose={() => setEditingSong(null)}
        onSuccess={fetchSongs}
      />
    </div>
  );
};
