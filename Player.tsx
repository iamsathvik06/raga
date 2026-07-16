import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Share2, PlayCircle, ShieldCheck } from "lucide-react";
import { usePlayer } from "../store";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Player() {
  const { currentTrack, isPlaying, togglePlay } = usePlayer();
  const playerRef = useRef<any>(null);
  const [isApiReady, setIsApiReady] = useState(false);

  useEffect(() => {
    // Setup YouTube Iframe API for seamless backend playback
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };
    
    // If it's already loaded
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
    }
  }, []);

  useEffect(() => {
    if (isApiReady && currentTrack?.youtubeId) {
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player('yt-player-invisible', {
          height: '0',
          width: '0',
          videoId: currentTrack.youtubeId,
          playerVars: { 'autoplay': 1, 'controls': 0 },
          events: {
            'onReady': (event: any) => {
              if (isPlaying) event.target.playVideo();
            }
          }
        });
      } else {
        playerRef.current.loadVideoById(currentTrack.youtubeId);
      }
    }
  }, [currentTrack, isApiReady]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.playVideo) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  const shareSong = async () => {
    if (currentTrack && navigator.share) {
      try {
        await navigator.share({
          title: `Listen to ${currentTrack.title}`,
          text: `Check out ${currentTrack.title} by ${currentTrack.artist} on SyncPlay!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    }
  };

  return (
    <div className="h-24 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 relative z-50">
      <div id="yt-player-invisible" className="hidden absolute"></div>
      
      <div className="flex items-center gap-4 w-1/3">
        <AnimatePresence mode="wait">
          {currentTrack ? (
            <motion.div 
              key={currentTrack.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 shadow-md">
                {currentTrack.albumArt ? (
                  <img src={currentTrack.albumArt} alt={currentTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <PlayCircle size={24} />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm line-clamp-1">{currentTrack.title}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{currentTrack.artist}</span>
              </div>
            </motion.div>
          ) : (
            <div className="text-sm text-zinc-500 font-medium">Select a track to play</div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center justify-center w-1/3 gap-2">
        <div className="flex items-center gap-6">
          <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"><Shuffle size={18} /></button>
          <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"><SkipBack size={24} /></button>
          
          <button 
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-10 h-10 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
          </button>
          
          <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"><SkipForward size={24} /></button>
          <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"><Repeat size={18} /></button>
        </div>
        
        <div className="w-full max-w-md flex items-center gap-2 group">
          <span className="text-xs text-zinc-500 w-10 text-right">0:00</span>
          <div className="h-1 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-900 dark:bg-zinc-100 w-0 group-hover:bg-green-500 transition-colors"></div>
          </div>
          <span className="text-xs text-zinc-500 w-10">0:00</span>
        </div>
      </div>

      <div className="flex items-center justify-end w-1/3 gap-4">
        <div className="hidden md:flex items-center gap-1 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-800" title="End-to-End Encrypted Data">
           <ShieldCheck size={14} className="text-green-500" />
           <span>E2E Active</span>
        </div>
        <button onClick={shareSong} disabled={!currentTrack} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition disabled:opacity-50">
          <Share2 size={18} />
        </button>
        <div className="flex items-center gap-2 w-24">
          <Volume2 size={18} className="text-zinc-500" />
          <div className="h-1 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full">
            <div className="h-full bg-zinc-500 w-2/3 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
