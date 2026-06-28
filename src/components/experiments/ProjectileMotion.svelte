<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let velocity = $state(50);
  let angleDeg = $state(45);
  let running = $state(false);
  let trail: { x: number; y: number }[] = $state([]);
  let t = $state(0);

  const g = 9.81;
  const scale = 3;
  const groundY = 360;
  const startX = 50;
  let animFrame: number;

  function getPosition(time: number) {
    const rad = (angleDeg * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    const x = startX + vx * time * scale;
    const y = groundY - (vy * time - 0.5 * g * time * time) * scale;
    return { x, y };
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    // Ground
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, groundY, 600, 40);

    // Trail
    ctx.beginPath();
    trail.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ball
    const pos = trail.length > 0 ? trail[trail.length - 1] : { x: startX, y: groundY };
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Launch angle indicator
    const rad = (angleDeg * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(startX, groundY);
    ctx.lineTo(startX + 60 * Math.cos(rad), groundY - 60 * Math.sin(rad));
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Stats
    const maxH = (velocity * Math.sin(rad)) ** 2 / (2 * g);
    const range = (velocity ** 2 * Math.sin(2 * rad)) / g;
    const flightTime = (2 * velocity * Math.sin(rad)) / g;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Max. Höhe: ${maxH.toFixed(1)} m`, 420, 30);
    ctx.fillText(`Reichweite: ${range.toFixed(1)} m`, 420, 50);
    ctx.fillText(`Flugzeit: ${flightTime.toFixed(2)} s`, 420, 70);
  }

  function step() {
    if (!running) return;
    t += 0.02;
    const pos = getPosition(t);
    if (pos.y >= groundY) {
      pos.y = groundY;
      trail.push(pos);
      running = false;
      draw();
      return;
    }
    trail.push(pos);
    draw();
    animFrame = requestAnimationFrame(step);
  }

  function start() {
    trail = [];
    t = 0;
    running = true;
    step();
  }

  function reset() {
    running = false;
    cancelAnimationFrame(animFrame);
    trail = [];
    t = 0;
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
      🚀 Abschuss
    </button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">
      ↺ Reset
    </button>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Geschwindigkeit: {velocity} m/s</span>
      <input type="range" min="10" max="100" bind:value={velocity} oninput={reset} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Winkel: {angleDeg}°</span>
      <input type="range" min="5" max="85" bind:value={angleDeg} oninput={reset} class="accent-indigo-500" />
    </label>
  </div>
</div>
