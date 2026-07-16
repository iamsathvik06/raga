import { PlayerProvider } from './store';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { MainContent } from './components/MainContent';

export default function App() {
  return (
    <PlayerProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-green-500/30">
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />
          <MainContent />
        </div>
        <Player />
      </div>
    </PlayerProvider>
  );
}
