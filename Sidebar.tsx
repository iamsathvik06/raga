import { Home, Search, Library, ListMusic, PlusCircle, Settings, Moon, Sun, DownloadCloud } from "lucide-react";
import { cn } from "../lib/utils";
import { usePlayer } from "../store";

export function Sidebar() {
  const { isDarkMode, toggleDarkMode } = usePlayer();

  return (
    <div className="w-64 bg-zinc-100 dark:bg-zinc-950/80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-green-500 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
          SyncPlay
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 text-sm font-medium">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-900 dark:text-zinc-100 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-md transition-colors">
          <Home size={18} /> Home
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <Search size={18} /> Search
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <Library size={18} /> Your Library
        </a>
      </nav>

      <div className="px-4 mt-8">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Playlists</p>
        <div className="space-y-1 text-sm font-medium">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <PlusCircle size={18} /> Create Playlist
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <DownloadCloud size={18} /> Offline Sync
          </button>
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <Settings size={18} /> Settings & Privacy
        </button>
      </div>
    </div>
  );
}
