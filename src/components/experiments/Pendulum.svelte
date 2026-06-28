<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let length = $state(200);
  let angle = $state(Math.PI / 4);
  let angularVelocity = $state(0);
  let running = $state(false);
  let damping = $state(0.999);
  let showEnergy = $state(true);

  const g = 9.81;
  const dt = 0.016;
  const pivotX = 300;
  const pivotY = 50;

  let animFrame: number;

  function getBobPosition() {
    return {
      x: pivotX + length * Math.sin(angle),
      y: pivotY + length * Math.cos(angle),
    };
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Pivot
    ctx.fillStyle = '#64748b';
    ctx.fillRect(pivotX - 40, pivotY - 5, 80, 10);

    // String
    const bob = getBobPosition();
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bob.x, bob.y);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bob
    ctx.beginPath();
    ctx.arc(bob.x, bob.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#6366f1';
    ctx.fill();
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Velocity arrow
    const vScale = angularVelocity * length * 0.3;
    const vx = bob.x + vScale * Math.cos(angle);
    const vy = bob.y - vScale * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(bob.x, bob.y);
    ctx.lineTo(vx, vy);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Energy bar
    if (showEnergy) {
      const maxH = length * (1 - Math.cos(Math.PI / 2));
      const h_current = length * (1 - Math.cos(angle));
      const pe = h_current / maxH;
      const ke = 1 - pe;
      const barX = 30;
      const barW = 20;
      const barH = 200;
      const barY = 80;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(barX, barY + barH * (1 - pe), barW, barH * pe);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(barX, barY, barW, barH * ke);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('KE', barX + 3, barY - 5);
      ctx.fillText('PE', barX + 3, barY + barH + 15);
    }
  }

  function step() {
    if (!running) return;
    const angularAccel = -(g / (length / 100)) * Math.sin(angle);
    angularVelocity += angularAccel * dt;
    angularVelocity *= damping;
    angle += angularVelocity * dt;
    draw();
    animFrame = requestAnimationFrame(step);
  }

  function start() {
    running = true;
    step();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(animFrame);
  }

  function reset() {
    stop();
    angle = Math.PI / 4;
    angularVelocity = 0;
    draw();
  }

  onMount(() => {
    canvas.width = 600;
    canvas.height = 400;
    draw();
    return () => cancelAnimationFrame(animFrame);
  });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>

  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={start} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">
      ▶ Start
    </button>
    <button onclick={stop} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">
      ⏸ Pause
    </button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">
      ↺ Reset
    </button>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Pendellänge: {length}px</span>
      <input type="range" min="80" max="300" bind:value={length} oninput={() => { if (!running) draw(); }} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Startwinkel: {(angle * 180 / Math.PI).toFixed(0)}°</span>
      <input type="range" min="5" max="85" value={angle * 180 / Math.PI} oninput={(e) => { if (!running) { angle = Number(e.currentTarget.value) * Math.PI / 180; draw(); }}} class="accent-indigo-500" />
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={showEnergy} onchange={() => draw()} class="accent-indigo-500" />
      <span class="text-sm text-slate-400">Energiebalken anzeigen</span>
    </label>
  </div>
</div>
