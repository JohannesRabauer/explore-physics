<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let force = $state(10);
  let mass = $state(5);
  let friction = $state(0.1);
  let running = $state(false);
  let vel = $state(0);
  let pos = $state(0);
  let t = $state(0);
  let trail: { t: number; v: number; a: number }[] = $state([]);
  let animFrame: number;

  const g = 9.81;
  const dt = 0.016;

  function step() {
    if (!running) return;
    t += dt;
    const frictionForce = friction * mass * g * (vel > 0 ? 1 : 0);
    const netForce = force - frictionForce;
    const accel = netForce / mass;
    vel += accel * dt;
    if (vel < 0) vel = 0;
    pos += vel * dt;
    trail.push({ t, v: vel, a: accel });
    if (pos > 30) { running = false; }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    // Track
    ctx.fillStyle = '#374151';
    ctx.fillRect(30, 130, 540, 30);

    // Object
    const ox = 30 + Math.min(pos * 16, 500);
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(ox, 105, 40, 25);
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, ox + 20, 121);
    ctx.textAlign = 'start';

    // Force arrow
    const fScale = force / 5;
    ctx.beginPath();
    ctx.moveTo(ox + 40, 117);
    ctx.lineTo(ox + 40 + fScale * 8, 117);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = '11px sans-serif';
    ctx.fillText(`F=${force}N`, ox + 45 + fScale * 8, 115);

    // Friction arrow
    if (vel > 0) {
      const fFric = friction * mass * g;
      const frScale = fFric / 5;
      ctx.beginPath();
      ctx.moveTo(ox, 117);
      ctx.lineTo(ox - frScale * 8, 117);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.fillText(`f=${fFric.toFixed(1)}N`, ox - frScale * 8 - 45, 115);
    }

    // Velocity-time graph
    const graphX = 30, graphY = 190, graphW = 260, graphH = 180;
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(graphX, graphY, graphW, graphH);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('v (m/s)', graphX + 5, graphY + 12);
    ctx.fillText('t', graphX + graphW - 10, graphY + graphH - 5);

    if (trail.length > 1) {
      ctx.beginPath();
      const maxT = Math.max(5, t);
      const maxV = Math.max(10, vel * 1.2);
      trail.forEach((p, i) => {
        const px = graphX + (p.t / maxT) * graphW;
        const py = graphY + graphH - (p.v / maxV) * graphH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Acceleration-time graph
    const g2X = 320, g2Y = 190, g2W = 260, g2H = 180;
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(g2X, g2Y, g2W, g2H);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('a (m/s²)', g2X + 5, g2Y + 12);
    ctx.fillText('t', g2X + g2W - 10, g2Y + g2H - 5);

    if (trail.length > 1) {
      ctx.beginPath();
      const maxT = Math.max(5, t);
      const maxA = Math.max(5, force / mass * 1.2);
      trail.forEach((p, i) => {
        const px = g2X + (p.t / maxT) * g2W;
        const py = g2Y + g2H - (Math.max(0, p.a) / maxA) * g2H;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Formula
    const accel = (force - friction * mass * g) / mass;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`a = (F - μmg) / m = (${force} - ${(friction*mass*g).toFixed(1)}) / ${mass} = ${accel.toFixed(2)} m/s²`, 30, 385);
  }

  function start() { running = true; step(); }
  function reset() { running = false; cancelAnimationFrame(animFrame); vel = 0; pos = 0; t = 0; trail = []; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={start} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">▶ Kraft anwenden</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-red-400">Kraft: {force} N</span>
      <input type="range" min="1" max="100" bind:value={force} oninput={reset} class="accent-red-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-indigo-400">Masse: {mass} kg</span>
      <input type="range" min="1" max="30" bind:value={mass} oninput={reset} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-green-400">Reibung μ: {friction.toFixed(2)}</span>
      <input type="range" min="0" max="0.8" step="0.02" bind:value={friction} oninput={reset} class="accent-green-500" />
    </label>
  </div>
</div>
