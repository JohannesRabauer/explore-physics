<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let running = $state(false);
  let t = $state(0);
  let animFrame: number;

  interface Racer { name: string; color: string; mu: number; pos: number; vel: number; finished: boolean; time: number }

  let racers: Racer[] = $state([
    { name: 'Eis-Kufe', color: '#a5f3fc', mu: 0.02, pos: 0, vel: 0, finished: false, time: 0 },
    { name: 'Rad (Rollr.)', color: '#10b981', mu: 0.05, pos: 0, vel: 0, finished: false, time: 0 },
    { name: 'Holzklotz', color: '#d97706', mu: 0.3, pos: 0, vel: 0, finished: false, time: 0 },
    { name: 'Gummiblock', color: '#ef4444', mu: 0.7, pos: 0, vel: 0, finished: false, time: 0 },
  ]);

  let slopeAngle = $state(15);
  const g = 9.81;
  const dt = 0.016;
  const trackLen = 10; // meters

  function step() {
    if (!running) return;
    t += dt;
    const rad = (slopeAngle * Math.PI) / 180;
    let allDone = true;

    racers = racers.map(r => {
      if (r.finished) return r;
      allDone = false;
      const accel = g * Math.sin(rad) - r.mu * g * Math.cos(rad);
      if (accel <= 0) { return { ...r, finished: true, time: -1 }; }
      const newVel = r.vel + accel * dt;
      const newPos = r.pos + newVel * dt;
      if (newPos >= trackLen) { return { ...r, pos: trackLen, vel: newVel, finished: true, time: t }; }
      return { ...r, pos: newPos, vel: newVel };
    });

    if (allDone) running = false;
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    const laneH = 45;
    const startX = 60;
    const trackW = 480;
    const startY = 60;

    // Track lanes
    racers.forEach((r, i) => {
      const y = startY + i * (laneH + 10);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(startX, y, trackW, laneH);
      ctx.strokeStyle = '#374151';
      ctx.strokeRect(startX, y, trackW, laneH);

      // Finish line
      ctx.fillStyle = '#475569';
      ctx.fillRect(startX + trackW - 3, y, 3, laneH);

      // Label
      ctx.fillStyle = r.color;
      ctx.font = '11px sans-serif';
      ctx.fillText(r.name, 5, y + 18);
      ctx.fillStyle = '#64748b';
      ctx.fillText(`μ=${r.mu}`, 5, y + 33);

      // Racer block
      const bx = startX + (r.pos / trackLen) * trackW;
      ctx.fillStyle = r.color;
      ctx.fillRect(bx, y + 8, 25, laneH - 16);

      // Time/status
      if (r.finished) {
        ctx.fillStyle = r.time > 0 ? '#10b981' : '#ef4444';
        ctx.font = '11px sans-serif';
        ctx.fillText(r.time > 0 ? `✓ ${r.time.toFixed(2)}s` : 'Bleibt stehen!', startX + trackW + 10, y + 28);
      } else if (running) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(`${r.vel.toFixed(1)} m/s`, startX + trackW + 10, y + 28);
      }
    });

    // Info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    const y = startY + 4 * (laneH + 10) + 20;
    ctx.fillText(`Neigungswinkel: ${slopeAngle}°`, 60, y);
    ctx.fillText(`Strecke: ${trackLen} m`, 60, y + 20);
    ctx.fillText(`Zeit: ${t.toFixed(2)} s`, 300, y);

    // Explanation
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText('Bedingung für Bewegung: tan(α) > μ', 60, y + 50);
    ctx.fillText(`tan(${slopeAngle}°) = ${Math.tan(slopeAngle * Math.PI / 180).toFixed(3)}`, 60, y + 68);
  }

  function start() { running = true; step(); }
  function reset() {
    running = false; cancelAnimationFrame(animFrame); t = 0;
    racers = racers.map(r => ({ ...r, pos: 0, vel: 0, finished: false, time: 0 }));
    draw();
  }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={start} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">🏁 Rennen starten!</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="max-w-sm mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Neigungswinkel: {slopeAngle}°</span>
      <input type="range" min="5" max="60" bind:value={slopeAngle} oninput={reset} class="accent-indigo-500" />
    </label>
  </div>
</div>
