<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let orbitRadius = $state(200);
  let planetMass = $state(5.97e24);
  let satMass = $state(1000);
  let paused = $state(false);
  let simSpeed = $state(1);
  let angle = $state(0);
  let animFrame: number;

  const G = 6.674e-11;
  const baseDt = 0.016;
  const scale = 1e6; // 1px = 1e6 m

  function vOrbit() { return Math.sqrt(G * planetMass / (orbitRadius * scale)); }
  function fGrav() { return G * planetMass * satMass / ((orbitRadius * scale) ** 2); }

  function step() {
    const dt = baseDt * simSpeed;
    if (!paused) {
      const v = vOrbit();
      const omega = v / (orbitRadius * scale);
      angle += omega * dt * 5e5; // speed up for visual
    }
    draw();
    animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const W = 600, H = 400;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);

    const cx = 250, cy = 180;

    // Stars
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = '#475569';
      ctx.fillRect((i * 97) % W, (i * 53) % H, 1, 1);
    }

    // Orbit path
    ctx.beginPath(); ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);

    // Planet
    ctx.beginPath(); ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('M', cx, cy + 3); ctx.textAlign = 'start';

    // Satellite
    const sx = cx + orbitRadius * Math.cos(angle);
    const sy = cy + orbitRadius * Math.sin(angle);
    ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b'; ctx.fill();

    // Velocity vector (tangent)
    const vLen = 30;
    const vx = sx - vLen * Math.sin(angle);
    const vy = sy + vLen * Math.cos(angle);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(vx, vy);
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#22c55e'; ctx.font = '10px sans-serif'; ctx.fillText('v', vx + 3, vy);

    // Gravity vector (toward center)
    const gLen = 25;
    const gx = sx + gLen * (cx - sx) / orbitRadius;
    const gy = sy + gLen * (cy - sy) / orbitRadius;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(gx, gy);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ef4444'; ctx.fillText('F', gx + 3, gy);

    // Measurements
    const v = vOrbit();
    const F = fGrav();
    const r = orbitRadius * scale;
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px monospace';
    ctx.fillText(`v_orbit = ${v.toFixed(0)} m/s`, 420, 30);
    ctx.fillText(`r = ${(r / 1e6).toFixed(1)} × 10⁶ m`, 420, 48);
    ctx.fillText(`F_grav = ${F.toExponential(2)} N`, 420, 66);
    ctx.fillText(`M = ${planetMass.toExponential(2)} kg`, 420, 84);
    ctx.fillText(`m = ${satMass} kg`, 420, 102);

    // Formula panel
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.fillRect(0, H - 50, W, 50);
    ctx.fillStyle = '#e2e8f0'; ctx.font = '13px monospace';
    ctx.fillText(`v_orbit = √(GM/r) = √(${G}·${planetMass.toExponential(1)}/${(r).toExponential(1)}) = ${v.toFixed(0)} m/s`, 10, H - 30);
    ctx.fillText(`F_grav = GMm/r² = ${F.toExponential(2)} N`, 10, H - 12);

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
    <label class="flex flex-col gap-1"><span class="text-sm text-blue-400">Orbit r: {orbitRadius} px</span><input type="range" min="60" max="250" step="10" bind:value={orbitRadius} class="accent-blue-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-yellow-400">M: {(planetMass/1e24).toFixed(1)}×10²⁴ kg</span><input type="range" min="1e24" max="2e25" step="1e24" bind:value={planetMass} class="accent-yellow-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">m: {satMass} kg</span><input type="range" min="100" max="10000" step="100" bind:value={satMass} class="accent-slate-400" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
