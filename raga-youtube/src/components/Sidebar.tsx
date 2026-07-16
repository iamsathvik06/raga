import React, { useState } from 'react';
import { Home, Search, Library, Heart, PlusSquare, LogOut, User, Upload, ListMusic, MoreVertical, Edit2, Trash2, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';

interface SidebarProps {
  onUploadClick?: () => void;
  onSearchClick?: () => void;
  onLibraryClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onUploadClick, onSearchClick, onLibraryClick }) => {
  const { user, login, logout } = useAuth();
  const { playlists, createPlaylist, renamePlaylist, deletePlaylist, activePlaylistId, setActivePlaylist } = usePlayerStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const navItems = [
    { icon: Home, label: 'Home', active: !activePlaylistId, onClick: () => { setActivePlaylist(null); onLibraryClick?.(); } },
    { icon: Search, label: 'Explore', onClick: onSearchClick },
    { icon: Library, label: 'Library', onClick: onLibraryClick },
  ];

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renamePlaylist(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div
      className="w-56 h-full flex flex-col py-4 overflow-y-auto"
      style={{ background: '#0f0f0f', borderRight: '1px solid #272727', scrollbarWidth: 'none' }}
    >
      {/* Nav Items */}
      <nav className="px-2 mb-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="flex items-center gap-4 w-full px-3 py-2.5 rounded-lg transition-colors text-sm"
            style={{
              color: item.active ? '#fff' : '#aaaaaa',
              background: item.active ? '#272727' : 'transparent',
              fontWeight: item.active ? 600 : 400,
            }}
          >
            <item.icon size={20} strokeWidth={item.active ? 2.5 : 1.5} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 mb-4" style={{ borderTop: '1px solid #272727' }} />

      {/* Library Section */}
      <div className="px-2 flex-1">
        <p className="px-3 text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#606060' }}>Library</p>

        <button
          onClick={() => setActivePlaylist('liked')}
          className="flex items-center gap-4 w-full px-3 py-2.5 rounded-lg transition-colors text-sm"
          style={{
            color: activePlaylistId === 'liked' ? '#fff' : '#aaaaaa',
            background: activePlaylistId === 'liked' ? '#272727' : 'transparent',
            fontWeight: activePlaylistId === 'liked' ? 600 : 400,
          }}
        >
          <Heart size={20} strokeWidth={1.5} fill={activePlaylistId === 'liked' ? '#ff0000' : 'none'} style={{ color: activePlaylistId === 'liked' ? '#ff0000' : '#aaaaaa' }} />
          <span>Liked Songs</span>
        </button>

        {isCreating ? (
          <form onSubmit={handleCreatePlaylist} className="px-3 py-1.5">
            <input
              autoFocus
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onBlur={() => !newPlaylistName && setIsCreating(false)}
              placeholder="Playlist name..."
              className="w-full rounded px-2 py-1 text-xs outline-none"
              style={{ background: '#272727', color: '#fff', border: '1px solid #404040' }}
            />
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-4 w-full px-3 py-2.5 rounded-lg transition-colors text-sm"
            style={{ color: '#aaaaaa' }}
          >
            <PlusSquare size={20} strokeWidth={1.5} />
            <span>New Playlist</span>
          </button>
        )}

        {user && (
          <button
            onClick={onUploadClick}
            className="flex items-center gap-4 w-full px-3 py-2.5 rounded-lg transition-colors text-sm"
            style={{ color: '#aaaaaa' }}
          >
            <Upload size={20} strokeWidth={1.5} />
            <span>Upload Song</span>
          </button>
        )}

        {/* Playlists */}
        {playlists.length > 0 && (
          <div className="mt-4">
            <p className="px-3 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#606060' }}>Playlists</p>
            {playlists.map((playlist) => (
              <div key={playlist.id} className="relative group">
                {editingId === playlist.id ? (
                  <div className="px-3 py-1">
                    <div className="flex items-center gap-1 rounded px-2 py-1" style={{ background: '#272727', border: '1px solid #404040' }}>
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(playlist.id)}
                        className="w-full bg-transparent text-xs outline-none text-white"
                      />
                      <button onClick={() => handleRename(playlist.id)} style={{ color: '#ff0000' }}>
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <button
                      onClick={() => setActivePlaylist(playlist.id)}
                      className="flex items-center gap-4 flex-1 px-3 py-2.5 rounded-lg transition-colors text-sm text-left min-w-0"
                      style={{
                        color: activePlaylistId === playlist.id ? '#fff' : '#aaaaaa',
                        background: activePlaylistId === playlist.id ? '#272727' : 'transparent',
                        fontWeight: activePlaylistId === playlist.id ? 600 : 400,
                      }}
                    >
                      <ListMusic size={20} strokeWidth={1.5} className="flex-shrink-0" />
                      <span className="truncate">{playlist.name}</span>
                    </button>
                    <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowMenuId(showMenuId === playlist.id ? null : playlist.id); }}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: '#aaaaaa' }}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {showMenuId === playlist.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowMenuId(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute left-full ml-2 top-0 w-36 rounded-xl py-1.5 z-50 shadow-2xl"
                            style={{ background: '#212121', border: '1px solid #303030' }}
                          >
                            <button
                              onClick={() => { setEditingId(playlist.id); setEditName(playlist.name); setShowMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors hover:bg-white/5"
                              style={{ color: '#ccc' }}
                            >
                              <Edit2 size={12} /> Rename
                            </button>
                            <button
                              onClick={() => { deletePlaylist(playlist.id); setShowMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors hover:bg-white/5"
                              style={{ color: '#ff4444' }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <div className="mt-auto px-3 pt-4" style={{ borderTop: '1px solid #272727' }}>
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={user.photoURL} alt={user.displayName} className="w-7 h-7 rounded-full" />
              <div>
                <p className="text-xs font-semibold truncate w-24 text-white">{user.displayName}</p>
                <p className="text-xs" style={{ color: '#606060' }}>Member</p>
              </div>
            </div>
            <button onClick={logout} className="p-1.5 transition-colors" style={{ color: '#606060' }}>
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="flex items-center gap-2.5 w-full p-2.5 rounded-lg text-sm font-bold justify-center transition-opacity hover:opacity-90"
            style={{ background: '#ff0000', color: '#fff' }}
          >
            <User size={16} /> Sign In
          </button>
        )}
      </div>
    </div>
  );
};
