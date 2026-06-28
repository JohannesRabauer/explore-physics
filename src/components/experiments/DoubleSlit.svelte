<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let slitDist = $state(0.1);
  let wavelength = $state(500);
  let screenDist = $state(2);
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

    const lambda = wavelength * 1e-9; // nm to m
    const d = slitDist * 1e-3; // mm to m
    const barrierX = 150;
    const screenX = 480;
    const midY = 180;
    const slitGap = 30;

    // Barrier with slits
    ctx.fillStyle = '#475569';
    ctx.fillRect(barrierX, 0, 8, midY - slitGap / 2 - 3);
    ctx.fillRect(barrierX, midY - slitGap / 2 + 3, 8, slitGap - 6);
    ctx.fillRect(barrierX, midY + slitGap / 2 - 3, 8, H - midY - slitGap / 2 + 3);

    // Wave animation from slits
    const waveColor = `hsl(${(700 - wavelength) / 300 * 270}, 80%, 60%)`;
    ctx.globalAlpha = 0.3;
    for (let slit = -1; slit <= 1; slit += 2) {
      const sy = midY + slit * slitGap / 2;
      for (let r = 10; r < 350; r += 15) {
        const phase = r - t * 100 * simSpeed;
        if (Math.sin(phase * 0.2) > 0) {
          ctx.beginPath(); ctx.arc(barrierX + 8, sy, r, -Math.PI / 3, Math.PI / 3);
          ctx.strokeStyle = waveColor; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // Interference pattern on screen
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenX, 0, 100, H);
    for (let py = 0; py < H; py++) {
      const y = (py - midY) * 0.001; // position on screen in m (scaled)
      const theta = Math.atan2(y, screenDist);
      const pathDiff = d * Math.sin(theta);
      const phase = 2 * Math.PI * pathDiff / lambda;
      const intensity = Math.cos(phase / 2) ** 2;
      const hue = (700 - wavelength) / 300 * 270;
      ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${intensity})`;
      ctx.fillRect(screenX, py, 100, 1);
    }

    // Labels
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
    ctx.fillText('Quelle', 20, midY + 4);
    ctx.fillText('Spalt', barrierX - 5, 15);
    ctx.fillText('Schirm', screenX + 30, 15);

    // Source
    ctx.beginPath(); ctx.arc(50, midY, 5, 0, Math.PI * 2);
    ctx.fillStyle = waveColor; ctx.fill();

    // Incoming waves
    ctx.globalAlpha = 0.2;
    for (let x = 60; x < barrierX; x += 20) {
      const phase = x - t * 80;
      if (Math.sin(phase * 0.15) > 0) {
        ctx.beginPath(); ctx.moveTo(x, midY - 60); ctx.lineTo(x, midY + 60);
        ctx.strokeStyle = waveColor; ctx.lineWidth = 1; ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Maxima labels
    ctx.fillStyle = '#e2e8f0'; ctx.font = '10px monospace';
    for (let n = -3; n <= 3; n++) {
      const thetaN = Math.asin(n * lambda / d);
      if (isNaN(thetaN)) continue;
      const yScreen = midY + Math.tan(thetaN) * (screenX - barrierX) * 3;
      if (yScreen > 10 && yScreen < H - 60) {
        ctx.fillText(`n=${n}`, screenX + 105, yScreen + 3);
      }
    }

    // Measurements
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px monospace';
    ctx.fillText(`d = ${slitDist.toFixed(2)} mm`, 20, 25);
    ctx.fillText(`λ = ${wavelength} nm`, 20, 42);
    ctx.fillText(`L = ${screenDist.toFixed(1)} m`, 20, 59);
    const theta1 = Math.asin(lambda / d);
    ctx.fillText(`θ₁ = ${(theta1 * 180 / Math.PI).toFixed(2)}°`, 20, 76);

    // Formula panel
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.fillRect(0, H - 50, W, 50);
    ctx.fillStyle = '#e2e8f0'; ctx.font = '13px monospace';
    ctx.fillText(`d·sin(θ) = n·λ → ${slitDist.toFixed(2)}mm · sin(θ) = n · ${wavelength}nm`, 10, H - 30);
    ctx.fillText(`Maxima bei θ₁ = ${(theta1 * 180 / Math.PI).toFixed(2)}°`, 10, H - 12);

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
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
    <label class="flex flex-col gap-1"><span class="text-sm text-blue-400">Spaltabstand: {slitDist.toFixed(2)} mm</span><input type="range" min="0.01" max="0.5" step="0.01" bind:value={slitDist} class="accent-blue-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-yellow-400">λ: {wavelength} nm</span><input type="range" min="380" max="750" step="10" bind:value={wavelength} class="accent-yellow-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Schirmabstand: {screenDist.toFixed(1)} m</span><input type="range" min="0.5" max="5" step="0.1" bind:value={screenDist} class="accent-slate-400" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
