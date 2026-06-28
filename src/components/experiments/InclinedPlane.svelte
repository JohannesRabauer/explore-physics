<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let angleDeg = $state(30);
  let friction = $state(0.2);
  let mass = $state(5);
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let pos = $state(0);
  let vel = $state(0);
  let t = $state(0);
  let animFrame: number;

  const g = 9.81;
  const dt = 0.016;
  const rampLen = 350;

  function step() {
    if (!running) return;
    if (!paused) {
      t += dt * simSpeed;
      const rad = (angleDeg * Math.PI) / 180;
      const accel = g * Math.sin(rad) - friction * g * Math.cos(rad);
      if (accel <= 0 && vel <= 0) { running = false; draw(); return; }
      vel += accel * dt * simSpeed;
      if (vel < 0) vel = 0;
      pos += vel * dt * simSpeed;
      if (pos * 35 >= rampLen) { pos = rampLen / 35; running = false; }
    }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);
    const rad = (angleDeg * Math.PI) / 180;
    const rSX = 80, rSY = 60;
    const rEX = rSX + rampLen * Math.cos(rad);
    const rEY = rSY + rampLen * Math.sin(rad);

    // Ramp
    ctx.beginPath(); ctx.moveTo(rSX, rSY); ctx.lineTo(rEX, rEY); ctx.lineTo(rEX, rSY); ctx.closePath();
    ctx.fillStyle = '#374151'; ctx.fill();
    ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 2; ctx.stroke();

    // Angle arc
    ctx.beginPath(); ctx.arc(rEX, rEY, 35, Math.PI + rad, 2 * Math.PI, true);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
    ctx.fillText(`${angleDeg}°`, rEX - 50, rEY - 8);

    // Block
    const progress = (pos * 35) / rampLen;
    const bx = rSX + progress * (rEX - rSX);
    const by = rSY + progress * (rEY - rSY);
    ctx.save(); ctx.translate(bx, by); ctx.rotate(rad);
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(-15, -28, 30, 28);
    ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, 0, -12); ctx.restore();

    // Force arrows on block
    const fPar = mass * g * Math.sin(rad);
    const fFric = friction * mass * g * Math.cos(rad);
    const arrowScale = 2;
    // Parallel (red, downhill)
    ctx.save(); ctx.translate(bx, by);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(fPar * arrowScale * Math.cos(rad), fPar * arrowScale * Math.sin(rad));
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    // Friction (green, uphill)
    ctx.save(); ctx.translate(bx, by);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(-fFric * arrowScale * Math.cos(rad), -fFric * arrowScale * Math.sin(rad));
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();

    ctx.textAlign = 'start';

    // Formula panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(10, 250, 580, 140);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(10, 250, 580, 140);

    ctx.fillStyle = '#eab308'; ctx.font = 'bold 13px sans-serif';
    ctx.fillText('a = g·sin(α) - μ·g·cos(α)', 20, 272);

    ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif';
    ctx.fillText(`a = 9.81·sin(${angleDeg}°) - ${friction}·9.81·cos(${angleDeg}°)`, 20, 292);

    const accel = g * Math.sin(rad) - friction * g * Math.cos(rad);
    ctx.fillText(`a = ${(g * Math.sin(rad)).toFixed(2)} - ${(friction * g * Math.cos(rad)).toFixed(2)} = ${accel.toFixed(2)} m/s²`, 20, 312);

    ctx.fillStyle = '#ef4444'; ctx.fillText(`F_parallel = mg·sin(α) = ${fPar.toFixed(1)} N  (→ rot)`, 20, 338);
    ctx.fillStyle = '#10b981'; ctx.fillText(`F_Reibung = μ·mg·cos(α) = ${fFric.toFixed(1)} N  (→ grün)`, 20, 356);
    ctx.fillStyle = accel > 0 ? '#eab308' : '#ef4444';
    ctx.fillText(`F_netto = ${(fPar - fFric).toFixed(1)} N ${accel <= 0 ? '→ Block bleibt stehen!' : ''}`, 20, 374);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`t=${t.toFixed(2)}s  v=${vel.toFixed(2)}m/s  s=${pos.toFixed(2)}m`, 350, 374);

    if (paused) { ctx.fillStyle = 'rgba(239,68,68,0.8)'; ctx.font = 'bold 14px sans-serif'; ctx.fillText('⏸ PAUSIERT', 490, 30); }
  }

  function start() { running = true; step(); }
  function reset() { running = false; paused = false; cancelAnimationFrame(animFrame); pos = 0; vel = 0; t = 0; draw(); }
  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={start} disabled={running&&!paused} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-50">▶ Loslassen</button>
    <button onclick={()=>paused=!paused} disabled={!running} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors disabled:opacity-50">{paused?'▶ Weiter':'⏸ Pause'}</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Neigung: {angleDeg}°</span><input type="range" min="5" max="80" bind:value={angleDeg} oninput={reset} class="accent-indigo-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-green-400">Reibung μ: {friction.toFixed(2)}</span><input type="range" min="0" max="1" step="0.02" bind:value={friction} oninput={reset} class="accent-green-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-yellow-400">Masse: {mass}kg</span><input type="range" min="1" max="20" bind:value={mass} oninput={reset} class="accent-yellow-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
