<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let frequency = $state(440);
  let amplitude = $state(0.7);
  let medium = $state<'air' | 'water' | 'steel'>('air');
  let t = $state(0);
  let animFrame: number;

  const speeds = { air: 343, water: 1480, steel: 5960 };

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);

    const speed = speeds[medium];
    const wavelength = speed / frequency;
    const pixelWavelength = Math.max(20, (wavelength / 2) * 3);

    // Draw medium background
    const colors = { air: '#1e293b', water: '#0c4a6e', steel: '#374151' };
    ctx.fillStyle = colors[medium];
    ctx.fillRect(0, 60, w, h - 120);

    // Speaker
    ctx.fillStyle = '#64748b';
    ctx.fillRect(10, 160, 30, 80);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(40, 200, 25, -Math.PI / 3, Math.PI / 3);
    ctx.fill();

    // Pressure waves (concentric circles)
    const numWaves = 8;
    for (let i = 0; i < numWaves; i++) {
      const radius = ((t * speed * 0.01 + i * pixelWavelength) % (w + 100));
      const alpha = Math.max(0, amplitude * (1 - radius / w));
      ctx.beginPath();
      ctx.arc(40, 200, radius, -Math.PI / 3, Math.PI / 3);
      ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Particles vibrating
    for (let x = 80; x < w - 20; x += 30) {
      for (let y = 100; y < 320; y += 30) {
        const dist = x - 40;
        const displacement = amplitude * 8 * Math.sin((2 * Math.PI * dist) / pixelWavelength - t * frequency * 0.01);
        ctx.beginPath();
        ctx.arc(x + displacement, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${0.3 + amplitude * 0.5})`;
        ctx.fill();
      }
    }

    // Info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Schallgeschwindigkeit: ${speed} m/s`, 380, 30);
    ctx.fillText(`Wellenlänge: ${wavelength.toFixed(2)} m`, 380, 50);

    t += 1;
    animFrame = requestAnimationFrame(draw);
  }

  onMount(() => {
    canvas.width = 600;
    canvas.height = 400;
    draw();
    return () => cancelAnimationFrame(animFrame);
  });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Frequenz: {frequency} Hz</span>
      <input type="range" min="100" max="2000" step="10" bind:value={frequency} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Lautstärke: {(amplitude * 100).toFixed(0)}%</span>
      <input type="range" min="0.1" max="1" step="0.05" bind:value={amplitude} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Medium</span>
      <select bind:value={medium} class="bg-slate-700 rounded px-2 py-1 text-sm text-slate-200">
        <option value="air">Luft</option>
        <option value="water">Wasser</option>
        <option value="steel">Stahl</option>
      </select>
    </label>
  </div>
</div>
