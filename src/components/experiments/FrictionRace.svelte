<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
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
  const trackLen = 10;

  function step() {
    if (!running) return;
    if (!paused) {
      t += dt * simSpeed;
      const rad = (slopeAngle * Math.PI) / 180;
      let allDone = true;
      racers = racers.map(r => {
        if (r.finished) return r;
        allDone = false;
        const accel = g * Math.sin(rad) - r.mu * g * Math.cos(rad);
        if (accel <= 0) return { ...r, finished: true, time: -1 };
        const newVel = r.vel + accel * dt * simSpeed;
        const newPos = r.pos + newVel * dt * simSpeed;
        if (newPos >= trackLen) return { ...r, pos: trackLen, vel: newVel, finished: true, time: t };
        return { ...r, pos: newPos, vel: newVel };
      });
      if (allDone) running = false;
    }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    const laneH = 35;
    const startX = 60, trackW = 420, startY = 15;

    racers.forEach((r, i) => {
      const y = startY + i * (laneH + 8);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(startX, y, trackW, laneH);
      ctx.strokeStyle = '#374151';
      ctx.strokeRect(startX, y, trackW, laneH);
      ctx.fillStyle = '#475569';
      ctx.fillRect(startX + trackW - 2, y, 2, laneH);

      ctx.fillStyle = r.color;
      ctx.font = '10px sans-serif';
      ctx.fillText(`${r.name} μ=${r.mu}`, 2, y + 14);

      const bx = startX + (r.pos / trackLen) * trackW;
      ctx.fillStyle = r.color;
      ctx.fillRect(bx, y + 5, 20, laneH - 10);

      if (r.finished) {
        ctx.fillStyle = r.time > 0 ? '#10b981' : '#ef4444';
        ctx.font = '10px sans-serif';
        ctx.fillText(r.time > 0 ? `✓ ${r.time.toFixed(2)}s` : 'Bleibt!', startX + trackW + 8, y + 20);
      } else if (running) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${r.vel.toFixed(1)}m/s`, startX + trackW + 8, y + 20);
      }
    });

    // Formula panel
    const panelY = startY + 4 * (laneH + 8) + 15;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(10, panelY, 580, 120);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(10, panelY, 580, 120);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('a = g·sin(α) - μ·g·cos(α)', 20, panelY + 20);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px sans-serif';
    const rad = (slopeAngle * Math.PI) / 180;
    ctx.fillText(`g·sin(${slopeAngle}°) = ${(g * Math.sin(rad)).toFixed(2)} m/s²`, 20, panelY + 42);
    ctx.fillText(`g·cos(${slopeAngle}°) = ${(g * Math.cos(rad)).toFixed(2)} m/s²`, 20, panelY + 60);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Bedingung: tan(α) > μ', 320, panelY + 20);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`tan(${slopeAngle}°) = ${Math.tan(rad).toFixed(3)}`, 320, panelY + 42);

    ctx.fillText(`t = ${t.toFixed(2)} s | Strecke: ${trackLen} m | Winkel: ${slopeAngle}°`, 20, panelY + 85);

    // Show which materials move
    racers.forEach((r, i) => {
      const moves = Math.tan(rad) > r.mu;
      ctx.fillStyle = moves ? '#10b981' : '#ef4444';
      ctx.fillText(`${r.name}: ${moves ? '✓ bewegt sich' : '✗ bleibt stehen'}`, 320, panelY + 60 + i * 16);
    });

    if (paused) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('⏸ PAUSIERT', 500, 12);
    }
  }

  function start() { running = true; step(); }
  function reset() { running = false; paused = false; cancelAnimationFrame(animFrame); t = 0; racers = racers.map(r => ({ ...r, pos: 0, vel: 0, finished: false, time: 0 })); draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={start} disabled={running && !paused} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-50">🏁 Rennen!</button>
    <button onclick={() => paused = !paused} disabled={!running} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors disabled:opacity-50">{paused ? '▶ Weiter' : '⏸ Pause'}</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Neigungswinkel: {slopeAngle}°</span>
      <input type="range" min="5" max="60" bind:value={slopeAngle} oninput={reset} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Tempo: {simSpeed === 0.25 ? '¼×' : simSpeed === 0.5 ? '½×' : simSpeed === 1 ? '1×' : '2×'}</span>
      <input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" />
    </label>
  </div>
</div>
