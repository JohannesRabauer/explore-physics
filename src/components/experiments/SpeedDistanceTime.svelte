<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let speed = $state(5);
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let t = $state(0);
  let distance = $state(0);
  let trail: { t: number; d: number }[] = $state([]);
  let animFrame: number;

  const dt = 0.016;
  const trackLen = 500;

  function step() {
    if (!running) return;
    if (!paused) {
      t += dt * simSpeed;
      distance = speed * t;
      trail.push({ t, d: distance });
      if (distance * 10 >= trackLen) { running = false; }
    }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    // Track
    ctx.fillStyle = '#374151';
    ctx.fillRect(50, 80, trackLen, 40);
    for (let d = 0; d <= 50; d += 10) {
      const x = 50 + d * 10;
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(x, 80, 1, 40);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${d}m`, x - 5, 75);
    }

    // Runner
    const rx = 50 + Math.min(distance * 10, trackLen);
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(rx, 100, 15, 0, Math.PI * 2);
    ctx.fill();

    // Graph: distance vs time
    const graphX = 50, graphY = 160, graphW = 500, graphH = 160;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphW, graphH);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('s (m)', graphX - 5, graphY - 5);
    ctx.fillText('t (s)', graphX + graphW + 5, graphY + graphH);

    // Grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(graphX, graphY + (graphH / 5) * i);
      ctx.lineTo(graphX + graphW, graphY + (graphH / 5) * i);
      ctx.stroke();
      ctx.moveTo(graphX + (graphW / 5) * i, graphY);
      ctx.lineTo(graphX + (graphW / 5) * i, graphY + graphH);
      ctx.stroke();
    }

    // Plot
    if (trail.length > 1) {
      ctx.beginPath();
      const maxT = Math.max(10, t);
      const maxD = Math.max(50, distance);
      trail.forEach((p, i) => {
        const px = graphX + (p.t / maxT) * graphW;
        const py = graphY + graphH - (p.d / maxD) * graphH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Formula + values panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(10, 340, 580, 55);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(10, 340, 580, 55);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('s = v · t', 20, 362);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px sans-serif';
    ctx.fillText(`s = ${speed} m/s × ${t.toFixed(2)} s = ${distance.toFixed(1)} m`, 20, 383);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`v = ${speed} m/s`, 350, 362);
    ctx.fillText(`t = ${t.toFixed(2)} s`, 350, 383);
    ctx.fillText(`s = ${distance.toFixed(1)} m`, 480, 362);

    if (paused) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('⏸ PAUSIERT', 500, 30);
    }
  }

  function start() { running = true; step(); }
  function reset() { running = false; paused = false; cancelAnimationFrame(animFrame); t = 0; distance = 0; trail = []; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={start} disabled={running && !paused} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-50">▶ Los!</button>
    <button onclick={() => paused = !paused} disabled={!running} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors disabled:opacity-50">
      {paused ? '▶ Weiter' : '⏸ Pause'}
    </button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Geschwindigkeit v: {speed} m/s</span>
      <input type="range" min="1" max="20" bind:value={speed} oninput={reset} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Simulations-Tempo: {simSpeed === 0.25 ? '¼×' : simSpeed === 0.5 ? '½×' : simSpeed === 1 ? '1×' : '2×'}</span>
      <input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" />
    </label>
  </div>
</div>
