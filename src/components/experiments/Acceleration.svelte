<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let force = $state(10);
  let mass = $state(5);
  let friction = $state(0.1);
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let vel = $state(0);
  let pos = $state(0);
  let t = $state(0);
  let trail: { t: number; v: number; a: number }[] = $state([]);
  let animFrame: number;

  const g = 9.81;
  const baseDt = 0.016;

  function step() {
    if (!running) return;
    const dt = baseDt * simSpeed;
    if (!paused) {
      t += dt;
      const frictionForce = friction * mass * g * (vel > 0 ? 1 : vel === 0 && force > friction * mass * g ? 0 : 1);
      const netForce = force - (vel > 0 ? friction * mass * g : 0);
      const accel = Math.max(0, netForce / mass);
      vel += accel * dt;
      pos += vel * dt;
      trail.push({ t, v: vel, a: accel });
      if (pos > 30) { running = false; }
    }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);

    const frictionForce = friction * mass * g;
    const netForce = Math.max(0, force - frictionForce);
    const accel = netForce / mass;

    // Track
    ctx.fillStyle = '#374151';
    ctx.fillRect(30, 110, 540, 30);

    // Object
    const ox = 30 + Math.min(pos * 16, 500);
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(ox, 85, 40, 25);
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, ox + 20, 101);
    ctx.textAlign = 'start';

    // Force arrow
    const fScale = force / 5;
    ctx.beginPath(); ctx.moveTo(ox + 40, 97); ctx.lineTo(ox + 40 + fScale * 8, 97);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#ef4444'; ctx.font = '11px sans-serif';
    ctx.fillText(`F=${force}N`, ox + 45 + fScale * 8, 95);

    // Friction arrow
    if (vel > 0) {
      const frScale = frictionForce / 5;
      ctx.beginPath(); ctx.moveTo(ox, 97); ctx.lineTo(ox - frScale * 8, 97);
      ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.fillText(`f=${frictionForce.toFixed(1)}N`, ox - frScale * 8 - 50, 95);
    }

    // Measurements always visible
    ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif';
    ctx.fillText(`F = ${force} N | f = μmg = ${frictionForce.toFixed(2)} N | F_net = ${netForce.toFixed(2)} N | a = ${accel.toFixed(2)} m/s²`, 30, 25);
    ctx.fillText(`v = ${vel.toFixed(2)} m/s | s = ${pos.toFixed(2)} m | t = ${t.toFixed(2)} s`, 30, 45);

    // v-t graph
    const gx = 30, gy = 160, gw = 260, gh = 150;
    ctx.strokeStyle = '#475569'; ctx.strokeRect(gx, gy, gw, gh);
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
    ctx.fillText('v (m/s)', gx + 5, gy + 12); ctx.fillText('t', gx + gw - 10, gy + gh - 5);
    if (trail.length > 1) {
      ctx.beginPath();
      const maxT = Math.max(5, t), maxV = Math.max(10, vel * 1.2);
      trail.forEach((p, i) => {
        const px = gx + (p.t / maxT) * gw, py = gy + gh - (p.v / maxV) * gh;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.stroke();
    }

    // a-t graph
    const g2x = 320, g2y = 160, g2w = 260, g2h = 150;
    ctx.strokeStyle = '#475569'; ctx.strokeRect(g2x, g2y, g2w, g2h);
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
    ctx.fillText('a (m/s²)', g2x + 5, g2y + 12); ctx.fillText('t', g2x + g2w - 10, g2y + g2h - 5);
    if (trail.length > 1) {
      ctx.beginPath();
      const maxT = Math.max(5, t), maxA = Math.max(5, force / mass * 1.2);
      trail.forEach((p, i) => {
        const px = g2x + (p.t / maxT) * g2w, py = g2y + g2h - (Math.max(0, p.a) / maxA) * g2h;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.stroke();
    }

    // Paused
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(200, 55, 200, 35);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⏸ PAUSIERT', 300, 78); ctx.textAlign = 'start';
    }

    // Formula panel
    ctx.fillStyle = 'rgba(15,23,42,0.9)'; ctx.fillRect(0, h - 55, w, 55);
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
    ctx.fillText(`F = m·a  →  a = F_net / m = ${netForce.toFixed(2)} / ${mass} = ${accel.toFixed(2)} m/s²`, 15, h - 35);
    ctx.fillText(`a = (F − μmg) / m = (${force} − ${friction}·${mass}·9.81) / ${mass} = (${force} − ${frictionForce.toFixed(2)}) / ${mass} = ${accel.toFixed(2)} m/s²`, 15, h - 15);
  }

  function start() { running = true; paused = false; step(); }
  function reset() { running = false; paused = false; cancelAnimationFrame(animFrame); vel = 0; pos = 0; t = 0; trail = []; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={start} disabled={running&&!paused} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-50">▶ Start</button>
    <button onclick={()=>paused=!paused} disabled={!running} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors disabled:opacity-50">{paused?'▶ Weiter':'⏸ Pause'}</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
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
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
