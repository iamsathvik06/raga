export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  source: 'youtube';
  youtubeId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  source: 'youtube' | 'syncplay';
}
