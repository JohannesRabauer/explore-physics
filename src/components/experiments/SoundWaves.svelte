<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let frequency = $state(440);
  let amplitude = $state(0.7);
  let medium = $state<'air' | 'water' | 'steel'>('air');
  let paused = $state(false);
  let simSpeed = $state(1);
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

    // Medium background
    const colors = { air: '#1e293b', water: '#0c4a6e', steel: '#374151' };
    ctx.fillStyle = colors[medium];
    ctx.fillRect(0, 40, w, 240);

    // Speaker
    ctx.fillStyle = '#64748b';
    ctx.fillRect(10, 130, 30, 60);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(40, 160, 20, -Math.PI / 3, Math.PI / 3);
    ctx.fill();

    // Pressure waves
    for (let i = 0; i < 8; i++) {
      const radius = ((t * speed * 0.01 + i * pixelWavelength) % (w + 100));
      const alpha = Math.max(0, amplitude * (1 - radius / w));
      ctx.beginPath();
      ctx.arc(40, 160, radius, -Math.PI / 3, Math.PI / 3);
      ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Particles
    for (let x = 80; x < w - 20; x += 30) {
      for (let y = 70; y < 260; y += 25) {
        const dist = x - 40;
        const displacement = amplitude * 8 * Math.sin((2 * Math.PI * dist) / pixelWavelength - t * frequency * 0.01);
        ctx.beginPath();
        ctx.arc(x + displacement, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${0.3 + amplitude * 0.5})`;
        ctx.fill();
      }
    }

    // Formula + values panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(10, 290, 580, 100);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(10, 290, 580, 100);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('λ = v / f', 20, 312);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px sans-serif';
    ctx.fillText(`λ = ${speed} m/s ÷ ${frequency} Hz = ${wavelength.toFixed(3)} m`, 20, 332);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('v = λ · f', 20, 358);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Schallgeschwindigkeit: ${speed} m/s`, 300, 312);
    ctx.fillText(`Frequenz: ${frequency} Hz`, 300, 332);
    ctx.fillText(`Wellenlänge: ${wavelength.toFixed(3)} m = ${(wavelength * 100).toFixed(1)} cm`, 300, 352);
    ctx.fillText(`Medium: ${medium === 'air' ? 'Luft' : medium === 'water' ? 'Wasser' : 'Stahl'}`, 300, 372);

    if (paused) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('⏸ PAUSIERT', 490, 30);
    }

    if (!paused) t += simSpeed;
    animFrame = requestAnimationFrame(draw);
  }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={() => paused = !paused} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">{paused ? '▶ Weiter' : '⏸ Pause'}</button>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
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
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Tempo: {simSpeed === 0.25 ? '¼×' : simSpeed === 0.5 ? '½×' : simSpeed === 1 ? '1×' : '2×'}</span>
      <input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" />
    </label>
  </div>
</div>
