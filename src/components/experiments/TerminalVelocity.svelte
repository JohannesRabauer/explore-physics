<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let dragCoeff = $state(0.5);
  let area = $state(0.5);
  let mass = $state(5);
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let vel = $state(0);
  let pos = $state(0);
  let t = $state(0);
  let trail: { t: number; v: number }[] = $state([]);
  let animFrame: number;

  const g = 9.81;
  const rho = 1.225;
  const baseDt = 0.016;

  function vTerm() { return Math.sqrt((2 * mass * g) / (rho * dragCoeff * area)); }
  function dragForce() { return 0.5 * rho * dragCoeff * area * vel * vel; }

  function step() {
    if (!running) return;
    const dt = baseDt * simSpeed;
    if (!paused) {
      const drag = dragForce();
      const accel = g - drag / mass;
      vel += accel * dt;
      pos += vel * dt;
      t += dt;
      trail.push({ t, v: vel });
      if (pos > 500) { running = false; }
    }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const W = 600, H = 400;
    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1e3a5f');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Falling object
    const objY = 50 + Math.min(pos * 0.5, 200);
    const objSize = 10 + area * 15;
    ctx.beginPath();
    ctx.arc(130, objY, objSize, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, 130, objY + 4);
    ctx.textAlign = 'start';

    // Force arrows
    const Fg = mass * g;
    const Fd = dragForce();
    ctx.beginPath(); ctx.moveTo(130, objY + objSize + 5); ctx.lineTo(130, objY + objSize + 45);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#ef4444'; ctx.font = '11px sans-serif';
    ctx.fillText(`Fg=${Fg.toFixed(1)}N`, 145, objY + objSize + 30);

    const dArrow = Math.min((Fd / Fg) * 40, 40);
    if (dArrow > 1) {
      ctx.beginPath(); ctx.moveTo(130, objY - objSize - 5); ctx.lineTo(130, objY - objSize - 5 - dArrow);
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(`Fd=${Fd.toFixed(1)}N`, 145, objY - objSize - 10);

    // Velocity graph
    const gX = 260, gY = 20, gW = 320, gH = 240;
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
    ctx.strokeRect(gX, gY, gW, gH);
    const vT = vTerm();
    const tvY = gY + gH - (vT / (vT * 1.2)) * gH;
    ctx.setLineDash([5, 5]); ctx.strokeStyle = '#ef4444';
    ctx.beginPath(); ctx.moveTo(gX, tvY); ctx.lineTo(gX + gW, tvY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ef4444'; ctx.font = '11px sans-serif';
    ctx.fillText(`v_term=${vT.toFixed(1)} m/s`, gX + gW - 120, tvY - 5);

    if (trail.length > 1) {
      ctx.beginPath();
      const maxT = Math.max(10, t);
      trail.forEach((p, i) => {
        const px = gX + (p.t / maxT) * gW;
        const py = gY + gH - (p.v / (vT * 1.2)) * gH;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
    ctx.fillText('v (m/s)', gX + 5, gY + 15);
    ctx.fillText('t (s)', gX + gW - 30, gY + gH - 5);

    // Measurements panel
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px monospace';
    const mx = 20, my = 285;
    ctx.fillText(`v = ${vel.toFixed(2)} m/s`, mx, my);
    ctx.fillText(`v_term = ${vT.toFixed(2)} m/s`, mx, my + 16);
    ctx.fillText(`F_drag = ${Fd.toFixed(2)} N`, mx, my + 32);
    ctx.fillText(`F_grav = ${Fg.toFixed(2)} N`, mx, my + 48);
    ctx.fillText(`${(vel / vT * 100).toFixed(1)}% von v_term`, mx, my + 64);

    // Formula panel at bottom
    ctx.fillStyle = 'rgba(15,23,42,0.85)';
    ctx.fillRect(0, H - 50, W, 50);
    ctx.fillStyle = '#e2e8f0'; ctx.font = '13px monospace';
    ctx.fillText(`v_term = √(2·${mass}·${g} / (${rho}·${dragCoeff.toFixed(2)}·${area.toFixed(2)})) = ${vT.toFixed(2)} m/s`, 10, H - 30);
    ctx.fillText(`F_drag = ½·${rho}·${dragCoeff.toFixed(2)}·${area.toFixed(2)}·${vel.toFixed(2)}² = ${Fd.toFixed(2)} N`, 10, H - 12);

    // Paused overlay
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, W, H - 50);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⏸ PAUSIERT', W / 2, H / 2);
      ctx.textAlign = 'start';
    }
  }

  function start() { running = true; step(); }
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
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
    <label class="flex flex-col gap-1"><span class="text-sm text-yellow-400">Masse: {mass} kg</span><input type="range" min="0.5" max="50" step="0.5" bind:value={mass} oninput={reset} class="accent-yellow-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-blue-400">Fläche: {area.toFixed(2)} m²</span><input type="range" min="0.01" max="2" step="0.01" bind:value={area} oninput={reset} class="accent-blue-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">cW: {dragCoeff.toFixed(2)}</span><input type="range" min="0.1" max="2" step="0.05" bind:value={dragCoeff} oninput={reset} class="accent-slate-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
