/**
 * Audio Waveform Visualization Component
 * Displays audio waveform for audio players
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioWaveformProps {
  audioUrl: string;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  className?: string;
  height?: number;
  color?: string;
  progressColor?: string;
}

export function AudioWaveform({
  audioUrl,
  currentTime = 0,
  duration = 0,
  onSeek,
  className = "",
  height = 60,
  color = "rgb(147, 51, 234)", // purple-600
  progressColor = "rgb(192, 132, 252)", // purple-400
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!audioUrl) return;

    // Generate waveform data from audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const audio = new Audio(audioUrl);
    const source = audioContext.createMediaElementSource(audio);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const generateWaveform = () => {
      analyser.getByteFrequencyData(dataArray);
      const normalized = Array.from(dataArray).map((value) => value / 255);
      setWaveformData(normalized);
      setLoading(false);
    };

    audio.addEventListener("loadeddata", generateWaveform);
    audio.load();

    // Generate simple mock waveform if Web Audio API fails
    setTimeout(() => {
      if (waveformData.length === 0) {
        const mockData = Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2);
        setWaveformData(mockData);
        setLoading(false);
      }
    }, 1000);

    return () => {
      audio.removeEventListener("loadeddata", generateWaveform);
      audioContext.close();
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barCount = waveformData.length;
    const barWidth = width / barCount;
    const progress = duration > 0 ? currentTime / duration : 0;
    const progressX = width * progress;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height * 0.8;
      const y = (height - barHeight) / 2;

      // Use progress color for played portion, normal color for unplayed
      ctx.fillStyle = x < progressX ? progressColor : color;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw progress line
    ctx.strokeStyle = progressColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();
  }, [waveformData, currentTime, duration, color, progressColor]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || duration === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    const seekTime = progress * duration;

    onSeek(Math.max(0, Math.min(seekTime, duration)));
  };

  if (loading) {
    return (
      <div
        className={cn("bg-muted rounded-lg animate-pulse", className)}
        style={{ height }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className={cn("cursor-pointer w-full rounded-lg", className)}
      style={{ height }}
      width={800}
      height={height}
    />
  );
}
