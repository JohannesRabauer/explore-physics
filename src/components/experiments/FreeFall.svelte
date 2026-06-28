<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let mass1 = $state(1);
  let mass2 = $state(10);
  let airResistance = $state(false);
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let t = $state(0);
  let y1 = $state(0); let y2 = $state(0);
  let v1 = $state(0); let v2 = $state(0);
  let animFrame: number;

  const g = 9.81;
  const dt = 0.016;
  const groundY = 300;
  const startY = 40;
  const scale = 25;

  function step() {
    if (!running) return;
    if (!paused) {
      t += dt * simSpeed;
      const drag1 = airResistance ? 0.5 * 0.47 * 1.225 * (0.02 / mass1) * v1 * Math.abs(v1) : 0;
      const drag2 = airResistance ? 0.5 * 0.47 * 1.225 * (0.02 / mass2) * v2 * Math.abs(v2) : 0;
      v1 += (g - drag1) * dt * simSpeed;
      v2 += (g - drag2) * dt * simSpeed;
      y1 += v1 * dt * simSpeed;
      y2 += v2 * dt * simSpeed;
      const py1 = startY + y1 * scale;
      const py2 = startY + y2 * scale;
      if (py1 >= groundY || py2 >= groundY) {
        if (py1 >= groundY) { y1 = (groundY - startY) / scale; v1 = 0; }
        if (py2 >= groundY) { y2 = (groundY - startY) / scale; v2 = 0; }
        if (py1 >= groundY && py2 >= groundY) running = false;
      }
    }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    // Ground
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, groundY + 20, 600, 30);

    // Height markers
    ctx.fillStyle = '#475569';
    ctx.font = '10px sans-serif';
    for (let h = 0; h <= 10; h += 2) {
      const py = startY + h * scale;
      ctx.fillRect(140, py, 320, 1);
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${h}m`, 125, py + 4);
    }

    // Ball 1
    const py1 = Math.min(startY + y1 * scale, groundY);
    const r1 = 15;
    ctx.beginPath();
    ctx.arc(220, py1 + r1, r1, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass1}kg`, 220, py1 + r1 + 4);

    // Ball 2
    const py2 = Math.min(startY + y2 * scale, groundY);
    const r2 = 15;
    ctx.beginPath();
    ctx.arc(380, py2 + r2, r2, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(`${mass2}kg`, 380, py2 + r2 + 4);
    ctx.textAlign = 'start';

    // Formula + values panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(10, 330, 580, 65);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(10, 330, 580, 65);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(airResistance ? 'Mit Luftwiderstand: F = mg - ½ρCₐAv²' : 'Ohne Luftwiderstand: v = g · t', 20, 350);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px sans-serif';
    ctx.fillText(`g = 9.81 m/s²    t = ${t.toFixed(2)} s`, 20, 370);

    ctx.fillStyle = '#ef4444';
    ctx.fillText(`Kugel 1: v₁ = ${v1.toFixed(2)} m/s, s₁ = ${y1.toFixed(2)} m`, 20, 388);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(`Kugel 2: v₂ = ${v2.toFixed(2)} m/s, s₂ = ${y2.toFixed(2)} m`, 320, 388);

    if (!airResistance) {
      ctx.fillStyle = '#10b981';
      ctx.font = '11px sans-serif';
      ctx.fillText('→ Beide fallen gleich schnell! (Galileo)', 320, 370);
    }

    if (paused) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('⏸ PAUSIERT', 490, 30);
    }
  }

  function start() { running = true; step(); }
  function reset() { running = false; paused = false; cancelAnimationFrame(animFrame); t = 0; y1 = 0; y2 = 0; v1 = 0; v2 = 0; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={start} disabled={running && !paused} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-50">▶ Fallenlassen</button>
    <button onclick={() => paused = !paused} disabled={!running} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors disabled:opacity-50">{paused ? '▶ Weiter' : '⏸ Pause'}</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-red-400">Masse 1: {mass1}kg</span>
      <input type="range" min="0.5" max="20" step="0.5" bind:value={mass1} oninput={reset} class="accent-red-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-blue-400">Masse 2: {mass2}kg</span>
      <input type="range" min="0.5" max="20" step="0.5" bind:value={mass2} oninput={reset} class="accent-blue-500" />
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={airResistance} onchange={reset} class="accent-indigo-500" />
      <span class="text-sm text-slate-400">Luftwiderstand</span>
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Tempo: {simSpeed === 0.25 ? '¼×' : simSpeed === 0.5 ? '½×' : simSpeed === 1 ? '1×' : '2×'}</span>
      <input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" />
    </label>
  </div>
</div>
