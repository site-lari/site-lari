

let currentPage = 0;
const totalPages = 4;

function updateBookPages() {
  for (let i = 0; i < totalPages; i++) {
    const page = document.getElementById(`book-page-${i}`);
    page.classList.remove('active');
    page.classList.add('hidden');
  }
  const current = document.getElementById(`book-page-${currentPage}`);
  current.classList.add('active');
  current.classList.remove('hidden');


  for (let i = 0; i < totalPages; i++) {
    const nextBtn = document.getElementById(`next-btn-${i}`);
    const prevBtn = document.getElementById(`prev-btn-${i}`);
    if (nextBtn) nextBtn.disabled = (currentPage === totalPages - 1);
    if (prevBtn) prevBtn.disabled = (currentPage === 0);
  }
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) restartBtn.disabled = (currentPage === 0);
}

function nextPage() {
  if (currentPage < totalPages - 1) {
    currentPage++;
    updateBookPages();
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    updateBookPages();
  }
}

function restartBook() {
  currentPage = 0;
  updateBookPages();
}

window.onload = function() {
  updateBookPages();
};

// Music player logic
(function() {
  const audio = document.getElementById('mp-audio');
  const playBtn = document.getElementById('mp-play');
  const progress = document.getElementById('mp-progress');
  const progressFilled = document.getElementById('mp-progress-filled');

  if (!audio || !playBtn) return;

  let raf;

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch((e) => {
        // Play may be blocked if not initiated by user gesture
        console.warn('Playback prevented:', e);
      });
    } else {
      audio.pause();
    }
  }

  function updatePlayButton() {
    if (audio.paused) {
      playBtn.classList.remove('playing');
      playBtn.textContent = '▶';
    } else {
      playBtn.classList.add('playing');
      playBtn.textContent = '❚❚';
    }
  }

  function whilePlaying() {
    const percent = (audio.currentTime / audio.duration) * 100 || 0;
    progressFilled.style.width = percent + '%';
    raf = requestAnimationFrame(whilePlaying);
  }

  playBtn.addEventListener('click', () => {
    const initiatedByUser = true; // from click
    togglePlay();
    updatePlayButton();
    if (!audio.paused) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(whilePlaying);
    } else {
      cancelAnimationFrame(raf);
    }
  });

  audio.addEventListener('play', updatePlayButton);
  audio.addEventListener('pause', updatePlayButton);
  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    updatePlayButton();
    progressFilled.style.width = '0%';
    cancelAnimationFrame(raf);
  });

  audio.addEventListener('loadedmetadata', () => {
    // ready
  });

  // Click to seek
  progress.addEventListener('click', (e) => {
    const rect = progress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    if (audio.duration) audio.currentTime = pct * audio.duration;
    progressFilled.style.width = (pct * 100) + '%';
  });

  // Ensure progress updates when user drags or audio time updates
  audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100 || 0;
    progressFilled.style.width = percent + '%';
  });

  // --- additional features: time display, cover animation, keyboard shortcut ---
  const cover = document.querySelector('#music-player .mp-cover');
  const currEl = document.getElementById('mp-current');
  const durEl = document.getElementById('mp-duration');

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  audio.addEventListener('loadedmetadata', () => {
    if (durEl) durEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (currEl) currEl.textContent = formatTime(audio.currentTime);
    const percent = (audio.currentTime / audio.duration) * 100 || 0;
    if (progressFilled) progressFilled.style.width = percent + '%';
  });

  audio.addEventListener('play', () => {
    if (cover) cover.classList.add('playing');
  });
  audio.addEventListener('pause', () => {
    if (cover) cover.classList.remove('playing');
  });
  audio.addEventListener('ended', () => {
    if (cover) cover.classList.remove('playing');
  });

  // Spacebar toggles play/pause (but avoid when typing in inputs)
  window.addEventListener('keydown', (e) => {
    const isSpace = e.code === 'Space' || e.key === ' ';
    if (!isSpace) return;
    const ae = document.activeElement;
    const tag = ae && ae.tagName;
    const editable = ae && (ae.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');
    if (editable) return; // don't intercept when user is typing
    e.preventDefault();
    togglePlay();
    updatePlayButton();
    if (!audio.paused) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(whilePlaying);
    } else {
      cancelAnimationFrame(raf);
    }
  });
})();
