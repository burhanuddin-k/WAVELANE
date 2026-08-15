import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceNodeRef = useRef(null);

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const current = currentIndex >= 0 ? queue[currentIndex] : null;

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const onTime = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => next();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function ensureAnalyser() {
    if (audioCtxRef.current) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceNodeRef.current = source;
  }

  const playAt = useCallback((newQueue, index) => {
    setQueue(newQueue);
    setCurrentIndex(index);
    const song = newQueue[index];
    if (!song) return;
    ensureAnalyser();
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    audioRef.current.src = song.streamUrl;
    audioRef.current.play().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current || !current) return;
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
  }, [isPlaying, current]);

  const next = useCallback(() => {
    setCurrentIndex((idx) => {
      setQueue((q) => {
        if (q.length === 0) return q;
        const nextIdx = (idx + 1) % q.length;
        const song = q[nextIdx];
        ensureAnalyser();
        audioRef.current.src = song.streamUrl;
        audioRef.current.play().catch(() => {});
        setTimeout(() => setCurrentIndex(nextIdx), 0);
        return q;
      });
      return idx;
    });
  }, []);

  const prev = useCallback(() => {
    setQueue((q) => {
      if (q.length === 0) return q;
      setCurrentIndex((idx) => {
        const prevIdx = (idx - 1 + q.length) % q.length;
        const song = q[prevIdx];
        ensureAnalyser();
        audioRef.current.src = song.streamUrl;
        audioRef.current.play().catch(() => {});
        return prevIdx;
      });
      return q;
    });
  }, []);

  const seek = useCallback((time) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const changeVolume = useCallback((v) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const value = {
    queue,
    current,
    currentIndex,
    isPlaying,
    progress,
    duration,
    volume,
    playAt,
    toggle,
    next,
    prev,
    seek,
    changeVolume,
    getAnalyser: () => analyserRef.current,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
