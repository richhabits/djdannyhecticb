import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

interface AudioWaveformProps {
  audioUrl: string;
  className?: string;
}

export function AudioWaveform({ audioUrl, className }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!audioUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvas.width = canvas.offsetWidth;
    canvas.height = 100;

    const draw = () => {
      if (!ctx || !canvas) return;

      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, "rgb(139, 92, 246)"); // purple
        gradient.addColorStop(1, "rgb(236, 72, 153)"); // pink

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    audio.addEventListener("loadeddata", () => {
      setIsLoaded(true);
      draw();
    });

    return () => {
      audio.pause();
      audioContext.close();
    };
  }, [audioUrl]);

  return (
    <Card className={`p-4 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-24 rounded"
        style={{ background: "rgba(0, 0, 0, 0.1)" }}
      />
      {!isLoaded && (
        <div className="text-center text-sm text-muted-foreground mt-2">
          Loading waveform...
        </div>
      )}
    </Card>
  );
}
