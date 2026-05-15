import React, { useEffect, useRef } from 'react';
import './Waveform.css';

interface WaveformProps {
  volume: number;
  active: boolean;
}

export const Waveform: React.FC<WaveformProps> = ({ volume, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef(0);
  const volumeRef = useRef(volume);
  const activeRef = useRef(active);

  // Update refs when props change
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    // In case of resize, though orb is fixed size
    window.addEventListener('resize', updateSize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Animation parameters
      timeRef.current += 0.05;
      const t = timeRef.current;
      const currentVolume = volumeRef.current;
      const isActive = activeRef.current;
      
      // Amplitude driven by volume, with a minimum subtle movement if active
      const baseAmplitude = isActive ? 2 + currentVolume * (height * 0.4) : 0;
      
      // Draw 3 overlapping sine waves
      const waves = [
        { freq: 0.1, amp: 1.0, opacity: 0.8, phase: t },
        { freq: 0.15, amp: 0.7, opacity: 0.5, phase: t * 0.8 },
        { freq: 0.08, amp: 0.4, opacity: 0.3, phase: t * 1.2 },
      ];

      waves.forEach(wave => {
        ctx.beginPath();
        ctx.strokeStyle = '#7c5cff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = isActive ? wave.opacity : wave.opacity * 0.2;
        
        for (let x = 0; x < width; x += 1) {
          const y = centerY + Math.sin(x * wave.freq + wave.phase) * baseAmplitude * wave.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', updateSize);
    };
  }, []); // Run once on mount

  return <canvas ref={canvasRef} className="waveform-canvas" />;
};

Waveform.displayName = 'Waveform';
