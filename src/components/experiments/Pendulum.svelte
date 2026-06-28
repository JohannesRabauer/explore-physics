<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let lengthCm = $state(200);
  let startAngleDeg = $state(45);
  let angle = $state(Math.PI / 4);
  let angularVelocity = $state(0);
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let damping = $state(0.999);
  let animFrame: number;

  const g = 9.81;
  const baseDt = 0.016;
  const pivotX = 300, pivotY = 50;
  const massBob = 1;

  function step() {
    if (!running) return;
    const dt = baseDt * simSpeed;
    if (!paused) {
      const L = lengthCm / 100;
      const angularAccel = -(g / L) * Math.sin(angle);
      angularVelocity += angularAccel * dt;
      angularVelocity *= damping;
      angle += angularVelocity * dt;
    }
    draw();
    animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);

    const L = lengthCm / 100;
    const period = 2 * Math.PI * Math.sqrt(L / g);
    const pixelLen = Math.min(lengthCm, 280);

    // Energy calculations
    const hMax = L * (1 - Math.cos(startAngleDeg * Math.PI / 180));
    const hCurrent = L * (1 - Math.cos(angle));
    const vBob = angularVelocity * L;
    const eKin = 0.5 * massBob * vBob * vBob;
    const ePot = massBob * g * hCurrent;
    const eTotal = massBob * g * hMax;

    // Pivot
    ctx.fillStyle = '#64748b'; ctx.fillRect(pivotX - 40, pivotY - 5, 80, 10);

    // String + bob
    const bobX = pivotX + pixelLen * Math.sin(angle);
    const bobY = pivotY + pixelLen * Math.cos(angle);
    ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(bobX, bobY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#6366f1'; ctx.fill();
    ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 2; ctx.stroke();

    // Velocity arrow
    const vScale = angularVelocity * pixelLen * 0.3;
    ctx.beginPath(); ctx.moveTo(bobX, bobY);
    ctx.lineTo(bobX + vScale * Math.cos(angle), bobY - vScale * Math.sin(angle));
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3; ctx.stroke();

    // Energy bar
    const barX = 30, barW = 20, barH = 180, barY = 70;
    ctx.fillStyle = '#1e293b'; ctx.fillRect(barX, barY, barW, barH);
    const keRatio = eTotal > 0 ? eKin / eTotal : 0;
    const peRatio = eTotal > 0 ? ePot / eTotal : 0;
    ctx.fillStyle = '#eab308'; ctx.fillRect(barX, barY + barH * (1 - peRatio), barW, barH * peRatio);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(barX, barY, barW, barH * keRatio);
    ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';
    ctx.fillText('Ekin', barX, barY - 5);
    ctx.fillText('Epot', barX, barY + barH + 12);

    // Measurements always visible
    ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif';
    const angleDegCurrent = (angle * 180 / Math.PI).toFixed(1);
    ctx.fillText(`θ = ${angleDegCurrent}°  |  T = ${period.toFixed(3)} s  |  L = ${L.toFixed(2)} m`, 200, 25);
    ctx.fillText(`E_kin = ${eKin.toFixed(3)} J  |  E_pot = ${ePot.toFixed(3)} J  |  E_ges = ${(eKin+ePot).toFixed(3)} J`, 200, 45);
    ctx.fillText(`ω = ${angularVelocity.toFixed(3)} rad/s  |  v = ${Math.abs(vBob).toFixed(3)} m/s`, 200, 65);

    // Paused
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(200, 75, 200, 35);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⏸ PAUSIERT', 300, 98); ctx.textAlign = 'start';
    }

    // Formula panel
    ctx.fillStyle = 'rgba(15,23,42,0.9)'; ctx.fillRect(0, h - 55, w, 55);
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
    ctx.fillText(`T = 2π·√(L/g) = 2π·√(${L.toFixed(2)}/9.81) = ${period.toFixed(3)} s`, 15, h - 35);
    ctx.fillText(`E_kin + E_pot = ${eKin.toFixed(3)} + ${ePot.toFixed(3)} = ${(eKin+ePot).toFixed(3)} J ≈ const`, 15, h - 15);
  }

  function start() { running = true; paused = false; step(); }
  function reset() {
    running = false; paused = false; cancelAnimationFrame(animFrame);
    angle = startAngleDeg * Math.PI / 180; angularVelocity = 0; draw();
  }

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
      <span class="text-sm text-slate-400">Länge: {lengthCm} cm</span>
      <input type="range" min="50" max="300" bind:value={lengthCm} oninput={reset} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Startwinkel: {startAngleDeg}°</span>
      <input type="range" min="5" max="85" bind:value={startAngleDeg} oninput={reset} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Dämpfung: {((1-damping)*1000).toFixed(1)}‰</span>
      <input type="range" min="0.990" max="1.000" step="0.001" bind:value={damping} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
