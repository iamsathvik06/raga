import React, { useState, useEffect } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2,
  Maximize2, Minimize2, Shuffle, Repeat, Repeat1, Heart,
  Download, Music, ListMusic, Moon, VolumeX, Volume1,
  Activity, Waves, Sparkles, Languages, ThumbsUp, ThumbsDown, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAudio } from '../hooks/useAudio';
import { formatTime, cn } from '../lib/utils';
import { isSongCached } from '../lib/db';
import { downloadSong } from '../lib/utils/downloadUtils';
import { Visualizer } from './Visualizer';
import { QueuePanel } from './QueuePanel';
import { SleepTimerModal } from './SleepTimerModal';
import { BackgroundSlideshow } from './BackgroundSlideshow';

export const Player: React.FC = () => {
  const {
    currentSong, isPlaying, setIsPlaying,
    progress, duration, volume, setVolume,
    nextSong, prevSong, isFullscreen, toggleFullscreen,
    isShuffle, toggleShuffle, repeatMode, setRepeatMode,
    visualMode, setVisualMode, isLoading, likedSongIds, toggleLike,
    sleepTimer, toggleMute, visualizerMode, setVisualizerMode, setFilterArtist
  } = usePlayerStore();

  const { seek } = useAudio();
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentSong) return null;

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
  const isLiked = likedSongIds.includes(currentSong.id);

  return (
    <>
      {/* ── Mini Player Bar (YouTube Music style) ── */}
      <AnimatePresence mode="wait">
        {!isFullscreen && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40"
            style={{ background: '#212121', borderTop: '1px solid #303030' }}
          >
            {/* Progress bar — thin red line at top */}
            <div className="relative h-1 cursor-pointer group" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}>
              <div className="absolute inset-0" style={{ background: '#3f3f3f' }} />
              <div
                className="absolute top-0 left-0 h-full transition-none"
                style={{ width: `${progressPct}%`, background: '#ff0000' }}
              />
              {/* Scrubber dot */}
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              />
            </div>

            <div className="flex items-center h-16 px-3 md:px-4 gap-3">
              {/* Song Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0 cursor-pointer" onClick={toggleFullscreen}>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentSong.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={currentSong.image_url}
                      alt={currentSong.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                  </AnimatePresence>
                </div>
                <div className="flex flex-col min-w-0 cursor-pointer" onClick={toggleFullscreen}>
                  <span className="text-sm font-medium truncate text-white">{currentSong.title}</span>
                  <span
                    className="text-xs truncate transition-colors hover:underline cursor-pointer"
                    style={{ color: '#aaaaaa' }}
                    onClick={(e) => { e.stopPropagation(); setFilterArtist(currentSong.artist); }}
                  >
                    {currentSong.artist}
                  </span>
                </div>
                <button
                  onClick={() => toggleLike(currentSong.id)}
                  className="flex-shrink-0 ml-2 transition-colors"
                  style={{ color: isLiked ? '#ff0000' : '#aaaaaa' }}
                >
                  <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Center Controls (Desktop) */}
              <div className="hidden md:flex flex-col items-center gap-1 w-80">
                <div className="flex items-center gap-5">
                  <button
                    onClick={toggleShuffle}
                    style={{ color: isShuffle ? '#ff0000' : '#aaaaaa' }}
                    className="transition-colors"
                  >
                    <Shuffle size={16} />
                  </button>
                  <button onClick={prevSong} className="transition-colors" style={{ color: '#ccc' }}>
                    <SkipBack size={22} fill="currentColor" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: '#fff', color: '#0f0f0f' }}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full"
                      />
                    ) : isPlaying ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>
                  <button onClick={nextSong} className="transition-colors" style={{ color: '#ccc' }}>
                    <SkipForward size={22} fill="currentColor" />
                  </button>
                  <button
                    onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                    className="relative transition-colors"
                    style={{ color: repeatMode !== 'none' ? '#ff0000' : '#aaaaaa' }}
                  >
                    {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
                    {repeatMode === 'all' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: '#ff0000' }} />}
                  </button>
                </div>
              </div>

              {/* Mobile Play */}
              <div className="flex md:hidden items-center gap-1">
                <button onClick={prevSong} style={{ color: '#aaaaaa' }}>
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#fff', color: '#0f0f0f' }}
                >
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </button>
                <button onClick={nextSong} style={{ color: '#aaaaaa' }}>
                  <SkipForward size={20} fill="currentColor" />
                </button>
              </div>

              {/* Right Controls (Desktop) */}
              <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
                <button onClick={() => setIsQueueOpen(true)} className="transition-colors" style={{ color: '#aaaaaa' }}>
                  <ListMusic size={18} />
                </button>
                <div className="flex items-center gap-1.5">
                  <button onClick={toggleMute} style={{ color: '#aaaaaa' }}>
                    {volume === 0 ? <VolumeX size={16} /> : volume < 0.5 ? <Volume1 size={16} /> : <Volume2 size={16} />}
                  </button>
                  <div className="w-20 h-1 rounded-full relative cursor-pointer" style={{ background: '#3f3f3f' }}>
                    <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${(volume / 2) * 100}%`, background: '#fff' }} />
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                  </div>
                </div>
                <span className="text-xs w-20 text-right" style={{ color: '#aaaaaa' }}>
                  {formatTime(progress)} / {formatTime(duration)}
                </span>
                <button onClick={toggleFullscreen} className="transition-colors" style={{ color: '#aaaaaa' }}>
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fullscreen Player ── */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col overflow-hidden"
            style={{ background: '#0f0f0f' }}
          >
            {/* Blurred BG */}
            <div className="absolute inset-0 pointer-events-none">
              <img
                src={currentSong.image_url}
                alt=""
                className="w-full h-full object-cover opacity-10 blur-3xl scale-110"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,15,15,0.6) 0%, rgba(15,15,15,0.95) 100%)' }} />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-5 py-4">
              <button onClick={toggleFullscreen} className="p-2 rounded-full transition-colors hover:bg-white/10" style={{ color: '#aaaaaa' }}>
                <Minimize2 size={22} />
              </button>
              <div className="flex items-center gap-1 rounded-full p-1" style={{ background: '#272727' }}>
                {['Artwork', 'Cinema'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setVisualMode(mode.toLowerCase() as any)}
                    className="px-5 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: visualMode === mode.toLowerCase() ? '#fff' : 'transparent',
                      color: visualMode === mode.toLowerCase() ? '#0f0f0f' : '#aaaaaa',
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsQueueOpen(true)} className="p-2 rounded-full transition-colors hover:bg-white/10" style={{ color: '#aaaaaa' }}>
                <ListMusic size={22} />
              </button>
            </div>

            {/* Main */}
            <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 px-8 max-w-5xl mx-auto w-full">
              {/* Artwork */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSong.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: visualMode === 'cinema' ? 0.05 : 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  src={currentSong.image_url}
                  alt={currentSong.title}
                  className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl object-cover shadow-2xl"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                />
              </AnimatePresence>

              {/* Info + Controls */}
              <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-md w-full">
                <div className="mb-6">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 text-white">{currentSong.title}</h2>
                  <p
                    className="text-base hover:underline cursor-pointer transition-colors"
                    style={{ color: '#aaaaaa' }}
                    onClick={() => { setFilterArtist(currentSong.artist); toggleFullscreen(); }}
                  >
                    {currentSong.artist}
                  </p>
                </div>

                {/* Like/Dislike */}
                <div className="flex items-center gap-2 mb-8">
                  <button
                    onClick={() => toggleLike(currentSong.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    style={{
                      background: isLiked ? 'rgba(255,0,0,0.15)' : '#272727',
                      color: isLiked ? '#ff4444' : '#ccc',
                    }}
                  >
                    <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    Like
                  </button>
                  <button
                    className="p-2 rounded-full transition-colors"
                    style={{ background: '#272727', color: '#aaaaaa' }}
                  >
                    <ThumbsDown size={16} />
                  </button>
                  <button
                    onClick={() => downloadSong(currentSong)}
                    className="p-2 rounded-full transition-colors"
                    style={{ background: '#272727', color: '#aaaaaa' }}
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => setIsSleepTimerOpen(true)}
                    className="p-2 rounded-full transition-colors"
                    style={{ background: sleepTimer ? 'rgba(255,0,0,0.15)' : '#272727', color: sleepTimer ? '#ff4444' : '#aaaaaa' }}
                  >
                    <Moon size={16} />
                  </button>
                </div>

                {/* Progress */}
                <div className="w-full mb-4">
                  <div className="w-full h-1 rounded-full relative cursor-pointer group mb-2" style={{ background: '#3f3f3f' }}>
                    <div
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{ width: `${progressPct}%`, background: '#ff0000' }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${progressPct}%`, background: '#fff', transform: 'translate(-50%, -50%)' }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      value={progress}
                      onChange={(e) => seek(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: '#606060' }}>
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 md:gap-10 mb-8">
                  <button onClick={toggleShuffle} style={{ color: isShuffle ? '#ff0000' : '#aaaaaa' }}>
                    <Shuffle size={22} />
                  </button>
                  <button onClick={prevSong} style={{ color: '#ccc' }}>
                    <SkipBack size={36} fill="currentColor" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-xl"
                    style={{ background: '#fff', color: '#0f0f0f' }}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-4 border-gray-300 border-t-gray-800 rounded-full"
                      />
                    ) : isPlaying ? (
                      <Pause size={28} fill="currentColor" />
                    ) : (
                      <Play size={28} fill="currentColor" className="ml-1" />
                    )}
                  </button>
                  <button onClick={nextSong} style={{ color: '#ccc' }}>
                    <SkipForward size={36} fill="currentColor" />
                  </button>
                  <button
                    onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                    className="relative"
                    style={{ color: repeatMode !== 'none' ? '#ff0000' : '#aaaaaa' }}
                  >
                    {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
                    {repeatMode === 'all' && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: '#ff0000' }} />}
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <button onClick={toggleMute} style={{ color: '#aaaaaa' }}>
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="flex-1 h-1 rounded-full relative" style={{ background: '#3f3f3f' }}>
                    <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${(volume / 2) * 100}%`, background: '#fff' }} />
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visualizer */}
            <div className="relative z-10 h-20 mx-8 mb-4 opacity-30 pointer-events-none">
              <Visualizer className="w-full h-full" color="#ff0000" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
      <SleepTimerModal isOpen={isSleepTimerOpen} onClose={() => setIsSleepTimerOpen(false)} />
    </>
  );
};
