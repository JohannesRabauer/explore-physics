<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let v0 = $state(30);
  let angleDeg = $state(45);
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let t = $state(0);
  let trail: { x: number; y: number }[] = $state([]);
  let animFrame: number;

  const g = 9.81;
  const baseDt = 0.016;

  function rad() { return angleDeg * Math.PI / 180; }
  function range() { return v0 * v0 * Math.sin(2 * rad()) / g; }
  function maxH() { return v0 * v0 * Math.sin(rad()) ** 2 / (2 * g); }
  function flightT() { return 2 * v0 * Math.sin(rad()) / g; }
  function posX() { return v0 * Math.cos(rad()) * t; }
  function posY() { return v0 * Math.sin(rad()) * t - 0.5 * g * t * t; }

  function step() {
    if (!running) return;
    const dt = baseDt * simSpeed;
    if (!paused) {
      t += dt;
      const px = posX(), py = posY();
      trail.push({ x: px, y: py });
      if (py < 0 && t > 0.1) { running = false; }
    }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const W = 600, H = 400;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);

    const groundY = H - 80;
    const R = range(), mH = maxH();
    const scaleX = (W - 80) / Math.max(R, 1);
    const scaleY = (groundY - 40) / Math.max(mH * 1.2, 1);
    const oX = 40;

    // Ground
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

    // Range marker
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#22c55e';
    ctx.beginPath(); ctx.moveTo(oX + R * scaleX, groundY); ctx.lineTo(oX + R * scaleX, groundY - 20); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#22c55e'; ctx.font = '10px sans-serif';
    ctx.fillText(`R=${R.toFixed(1)}m`, oX + R * scaleX - 20, groundY + 15);

    // Max height marker
    ctx.setLineDash([3, 3]); ctx.strokeStyle = '#f59e0b';
    ctx.beginPath(); ctx.moveTo(oX, groundY - mH * scaleY); ctx.lineTo(oX + 20, groundY - mH * scaleY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f59e0b'; ctx.font = '10px sans-serif';
    ctx.fillText(`H=${mH.toFixed(1)}m`, 5, groundY - mH * scaleY - 5);

    // Trail
    if (trail.length > 1) {
      ctx.beginPath();
      trail.forEach((p, i) => {
        const px = oX + p.x * scaleX;
        const py = groundY - p.y * scaleY;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.stroke();
    }

    // Current position
    const cx = posX(), cy = posY();
    const dx = oX + cx * scaleX;
    const dy = groundY - Math.max(cy, 0) * scaleY;
    ctx.beginPath(); ctx.arc(dx, dy, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b'; ctx.fill();

    // Launch angle indicator
    ctx.beginPath(); ctx.moveTo(oX, groundY);
    ctx.lineTo(oX + 50 * Math.cos(rad()), groundY - 50 * Math.sin(rad()));
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
    ctx.fillText(`${angleDeg}°`, oX + 55, groundY - 10);

    // Measurements
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px monospace';
    ctx.fillText(`R = ${R.toFixed(2)} m`, 400, 25);
    ctx.fillText(`H_max = ${mH.toFixed(2)} m`, 400, 42);
    ctx.fillText(`T = ${flightT().toFixed(2)} s`, 400, 59);
    ctx.fillText(`x = ${cx.toFixed(1)} m, y = ${Math.max(cy, 0).toFixed(1)} m`, 400, 76);
    ctx.fillText(`t = ${t.toFixed(2)} s`, 400, 93);

    // Formula panel
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.fillRect(0, H - 50, W, 50);
    ctx.fillStyle = '#e2e8f0'; ctx.font = '12px monospace';
    ctx.fillText(`R = v²·sin(2α)/g = ${v0}²·sin(${2*angleDeg}°)/${g} = ${R.toFixed(2)} m`, 10, H - 32);
    ctx.fillText(`H = v²·sin²(α)/(2g) = ${mH.toFixed(2)} m   T = 2v·sin(α)/g = ${flightT().toFixed(2)} s`, 10, H - 12);

    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, W, H - 50);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⏸ PAUSIERT', W / 2, H / 2); ctx.textAlign = 'start';
    }
  }

  function start() { t = 0; trail = []; running = true; step(); }
  function reset() { running = false; paused = false; cancelAnimationFrame(animFrame); t = 0; trail = []; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={start} disabled={running&&!paused} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-50">▶ Start</button>
    <button onclick={()=>paused=!paused} disabled={!running} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors disabled:opacity-50">{paused?'▶ Weiter':'⏸ Pause'}</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1"><span class="text-sm text-yellow-400">v₀: {v0} m/s</span><input type="range" min="5" max="80" step="1" bind:value={v0} oninput={reset} class="accent-yellow-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-blue-400">Winkel: {angleDeg}°</span><input type="range" min="5" max="85" step="1" bind:value={angleDeg} oninput={reset} class="accent-blue-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
