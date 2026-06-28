<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let speed = $state(5);
  let running = $state(false);
  let t = $state(0);
  let distance = $state(0);
  let trail: { t: number; d: number }[] = $state([]);
  let animFrame: number;

  const dt = 0.016;
  const trackLen = 500;

  function step() {
    if (!running) return;
    t += dt;
    distance = speed * t;
    trail.push({ t, d: distance });
    if (distance * 10 >= trackLen) { running = false; }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    // Track
    ctx.fillStyle = '#374151';
    ctx.fillRect(50, 100, trackLen, 40);
    // Distance markers
    for (let d = 0; d <= 50; d += 10) {
      const x = 50 + d * 10;
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(x, 100, 1, 40);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${d}m`, x - 5, 95);
    }

    // Runner
    const rx = 50 + Math.min(distance * 10, trackLen);
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(rx, 120, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏃', rx, 124);
    ctx.textAlign = 'start';

    // Graph: distance vs time
    const graphX = 50, graphY = 180, graphW = 500, graphH = 180;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    // Axes labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Strecke (m)', graphX + graphW / 2 - 30, graphY + graphH + 20);
    ctx.save();
    ctx.translate(graphX - 15, graphY + graphH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Zeit (s)', -20, 0);
    ctx.restore();

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

    // Plot trail
    if (trail.length > 1) {
      ctx.beginPath();
      const maxT = Math.max(10, t);
      const maxD = Math.max(50, distance);
      trail.forEach((p, i) => {
        const px = graphX + (p.d / maxD) * graphW;
        const py = graphY + graphH - (p.t / maxT) * graphH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`v = ${speed} m/s`, 50, 30);
    ctx.fillText(`t = ${t.toFixed(2)} s`, 50, 50);
    ctx.fillText(`s = ${distance.toFixed(1)} m`, 50, 70);
    ctx.fillStyle = '#6366f1';
    ctx.fillText(`s = v · t = ${speed} · ${t.toFixed(2)} = ${distance.toFixed(1)} m`, 250, 50);
  }

  function start() { running = true; step(); }
  function reset() { running = false; cancelAnimationFrame(animFrame); t = 0; distance = 0; trail = []; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={start} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">▶ Los!</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="max-w-sm mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Geschwindigkeit: {speed} m/s</span>
      <input type="range" min="1" max="20" bind:value={speed} oninput={reset} class="accent-indigo-500" />
    </label>
  </div>
</div>
