<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let freq1 = $state(2);
  let freq2 = $state(3);
  let amp1 = $state(50);
  let amp2 = $state(30);
  let wavelength1 = $state(100);
  let wavelength2 = $state(80);
  let phaseDiff = $state(0);
  let paused = $state(false);
  let simSpeed = $state(1);
  let t = $state(0);
  let animFrame: number;

  const baseDt = 0.016;

  function step() {
    const dt = baseDt * simSpeed;
    if (!paused) { t += dt; }
    draw();
    animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const W = 600, H = 400;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);

    const midY1 = 80, midY2 = 180, midYS = 290;

    // Labels
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
    ctx.fillText('Welle 1 (rot)', 10, midY1 - 55);
    ctx.fillText('Welle 2 (blau)', 10, midY2 - 55);
    ctx.fillText('Superposition (gelb)', 10, midYS - 55);

    // Draw waves
    function drawWave(midY: number, color: string, f: number, wl: number, a: number, phase: number) {
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = midY + a * Math.sin(2 * Math.PI * (x / wl - f * t) + phase);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    }

    drawWave(midY1, '#ef4444', freq1, wavelength1, amp1, 0);
    drawWave(midY2, '#3b82f6', freq2, wavelength2, amp2, phaseDiff);

    // Superposition
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const y1 = amp1 * Math.sin(2 * Math.PI * (x / wavelength1 - freq1 * t));
      const y2 = amp2 * Math.sin(2 * Math.PI * (x / wavelength2 - freq2 * t) + phaseDiff);
      const y = midYS + y1 + y2;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.stroke();

    // Axis lines
    [midY1, midY2, midYS].forEach(my => {
      ctx.beginPath(); ctx.moveTo(0, my); ctx.lineTo(W, my);
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.stroke();
    });

    // Measurements
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
    const v1 = (freq1 * wavelength1 / 100).toFixed(2);
    const v2 = (freq2 * wavelength2 / 100).toFixed(2);
    ctx.fillText(`v₁ = f₁·λ₁ = ${freq1}·${(wavelength1/100).toFixed(2)} = ${v1} m/s`, 350, midY1 - 55);
    ctx.fillText(`v₂ = f₂·λ₂ = ${freq2}·${(wavelength2/100).toFixed(2)} = ${v2} m/s`, 350, midY2 - 55);

    // Formula panel
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.fillRect(0, H - 50, W, 50);
    ctx.fillStyle = '#e2e8f0'; ctx.font = '13px monospace';
    ctx.fillText(`v = f·λ → v₁=${v1} m/s, v₂=${v2} m/s`, 10, H - 30);
    ctx.fillText(`Superposition: y = y₁ + y₂, Δφ = ${phaseDiff.toFixed(2)} rad`, 10, H - 12);

    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, W, H - 50);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⏸ PAUSIERT', W / 2, H / 2); ctx.textAlign = 'start';
    }
  }

  onMount(() => { canvas.width = 600; canvas.height = 400; step(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={()=>paused=!paused} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">{paused?'▶ Weiter':'⏸ Pause'}</button>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
    <label class="flex flex-col gap-1"><span class="text-sm text-red-400">f₁: {freq1} Hz</span><input type="range" min="0.5" max="10" step="0.5" bind:value={freq1} class="accent-red-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-red-400">λ₁: {wavelength1} px</span><input type="range" min="20" max="300" step="10" bind:value={wavelength1} class="accent-red-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-blue-400">f₂: {freq2} Hz</span><input type="range" min="0.5" max="10" step="0.5" bind:value={freq2} class="accent-blue-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-blue-400">λ₂: {wavelength2} px</span><input type="range" min="20" max="300" step="10" bind:value={wavelength2} class="accent-blue-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-red-400">A₁: {amp1} px</span><input type="range" min="5" max="60" step="5" bind:value={amp1} class="accent-red-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-blue-400">A₂: {amp2} px</span><input type="range" min="5" max="60" step="5" bind:value={amp2} class="accent-blue-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Δφ: {phaseDiff.toFixed(2)} rad</span><input type="range" min="0" max="6.28" step="0.1" bind:value={phaseDiff} class="accent-slate-400" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
