const grid = document.querySelector("#player-grid");
const player = document.querySelector("#audio-player");
const currentCover = document.querySelector("#current-cover");
const currentTitle = document.querySelector("#current-title");
const currentArtist = document.querySelector("#current-artist");

const esc = x => String(x ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[c]));

async function loadTracks() {
  try {
    const res = await fetch("/api/admin/songs");
    const songs = await res.json();

    if (!songs.length) {
      grid.innerHTML = `<p class="empty">No music published yet. Upload songs from the admin studio.</p>`;
      return;
    }

    grid.innerHTML = songs.map(s => `
      <div class="card" onclick="playSong('${s.id}', '${esc(s.title)}', '${esc(s.artist)}', '${s.cover_url}', '${s.audio_url}')">
        <img src="${s.cover_url || '/assets/default-cover.svg'}" alt="Cover">
        <b>${esc(s.title)}</b>
        <small>${esc(s.artist)}</small>
        <span class="badge">${esc(s.genre)}</span>
      </div>
    `).join("");
  } catch (err) {
    grid.innerHTML = `<p class="empty">Failed to load songs from server.</p>`;
  }
}

async function playSong(id, title, artist, cover, audio) {
  currentTitle.textContent = title;
  currentArtist.textContent = artist;
  currentCover.src = cover;
  player.src = audio;
  player.play();

  // Increment play count on backend
  await fetch(`/api/songs/${id}/play`, { method: "POST" });
}

loadTracks();