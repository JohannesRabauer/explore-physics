<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let frequency = $state(2);
  let amplitude = $state(50);
  let wavelength = $state(100);
  let showSecondWave = $state(false);
  let phase2 = $state(0);
  let t = $state(0);
  let animFrame: number;

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);

    const midY = h / 2;

    // Axis
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Wave 1
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = midY + amplitude * Math.sin((2 * Math.PI * x) / wavelength - frequency * t);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Wave 2 (if enabled)
    if (showSecondWave) {
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = midY + amplitude * Math.sin((2 * Math.PI * x) / wavelength - frequency * t + phase2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Superposition
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y1 = amplitude * Math.sin((2 * Math.PI * x) / wavelength - frequency * t);
        const y2 = amplitude * Math.sin((2 * Math.PI * x) / wavelength - frequency * t + phase2);
        const y = midY + y1 + y2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Welle 1', 10, 20);
    if (showSecondWave) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('Welle 2', 10, 38);
      ctx.fillStyle = '#10b981';
      ctx.fillText('Überlagerung', 10, 56);
    }

    t += 0.05;
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

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Frequenz: {frequency.toFixed(1)} Hz</span>
      <input type="range" min="0.5" max="5" step="0.1" bind:value={frequency} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Amplitude: {amplitude}px</span>
      <input type="range" min="10" max="100" bind:value={amplitude} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Wellenlänge: {wavelength}px</span>
      <input type="range" min="30" max="200" bind:value={wavelength} class="accent-indigo-500" />
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={showSecondWave} class="accent-indigo-500" />
      <span class="text-sm text-slate-400">Zweite Welle (Interferenz)</span>
    </label>
    {#if showSecondWave}
      <label class="flex flex-col gap-1 sm:col-span-2">
        <span class="text-sm text-slate-400">Phasenverschiebung: {(phase2 * 180 / Math.PI).toFixed(0)}°</span>
        <input type="range" min="0" max={2 * Math.PI} step="0.1" bind:value={phase2} class="accent-indigo-500" />
      </label>
    {/if}
  </div>
</div>
