<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let mass1 = $state(1);
  let mass2 = $state(10);
  let airResistance = $state(false);
  let running = $state(false);
  let t = $state(0);
  let y1 = $state(0);
  let y2 = $state(0);
  let v1 = $state(0);
  let v2 = $state(0);
  let animFrame: number;

  const g = 9.81;
  const dt = 0.016;
  const groundY = 350;
  const startY = 40;
  const scale = 30;

  function step() {
    if (!running) return;
    t += dt;

    const drag1 = airResistance ? 0.5 * 0.47 * 1.225 * (0.02 / mass1) * v1 * Math.abs(v1) : 0;
    const drag2 = airResistance ? 0.5 * 0.47 * 1.225 * (0.02 / mass2) * v2 * Math.abs(v2) : 0;

    v1 += (g - drag1) * dt;
    v2 += (g - drag2) * dt;
    y1 += v1 * dt;
    y2 += v2 * dt;

    const py1 = startY + y1 * scale;
    const py2 = startY + y2 * scale;

    if (py1 >= groundY || py2 >= groundY) {
      if (py1 >= groundY) y1 = (groundY - startY) / scale;
      if (py2 >= groundY) y2 = (groundY - startY) / scale;
      running = false;
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
    ctx.strokeStyle = '#4b5563';
    ctx.beginPath();
    ctx.moveTo(0, groundY + 20);
    ctx.lineTo(600, groundY + 20);
    ctx.stroke();

    // Height markers
    ctx.fillStyle = '#475569';
    ctx.font = '10px sans-serif';
    for (let h = 0; h <= 10; h += 2) {
      const py = startY + h * scale;
      ctx.fillRect(140, py, 320, 1);
      ctx.fillText(`${h}m`, 125, py + 4);
    }

    // Ball 1
    const py1 = Math.min(startY + y1 * scale, groundY);
    const r1 = 15 + mass1 * 2;
    ctx.beginPath();
    ctx.arc(220, py1 + r1, r1, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass1}kg`, 220, py1 + r1 + 4);

    // Ball 2
    const py2 = Math.min(startY + y2 * scale, groundY);
    const r2 = 15 + mass2 * 0.5;
    ctx.beginPath();
    ctx.arc(380, py2 + r2, r2, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(`${mass2}kg`, 380, py2 + r2 + 4);
    ctx.textAlign = 'start';

    // Info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Zeit: ${t.toFixed(2)} s`, 20, 30);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`v₁ = ${v1.toFixed(1)} m/s`, 20, 50);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(`v₂ = ${v2.toFixed(1)} m/s`, 20, 70);
    if (airResistance) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('🌬️ Luftwiderstand aktiv', 420, 30);
    }
  }

  function start() { running = true; step(); }
  function reset() {
    running = false;
    cancelAnimationFrame(animFrame);
    t = 0; y1 = 0; y2 = 0; v1 = 0; v2 = 0;
    draw();
  }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={start} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">▶ Fallenlassen</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-red-400">Masse 1: {mass1} kg</span>
      <input type="range" min="0.5" max="20" step="0.5" bind:value={mass1} oninput={reset} class="accent-red-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-blue-400">Masse 2: {mass2} kg</span>
      <input type="range" min="0.5" max="20" step="0.5" bind:value={mass2} oninput={reset} class="accent-blue-500" />
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={airResistance} onchange={reset} class="accent-indigo-500" />
      <span class="text-sm text-slate-400">Luftwiderstand</span>
    </label>
  </div>
</div>
