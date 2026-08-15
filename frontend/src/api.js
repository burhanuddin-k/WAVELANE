export async function fetchSongs(query = '') {
  const url = query ? `/api/songs?q=${encodeURIComponent(query)}` : '/api/songs';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load songs');
  return res.json();
}

export async function fetchSong(id) {
  const res = await fetch(`/api/songs/${id}`);
  if (!res.ok) throw new Error('Failed to load song');
  return res.json();
}
