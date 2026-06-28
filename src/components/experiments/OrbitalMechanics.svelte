<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let orbitalSpeed = $state(5);
  let planetMass = $state(50);
  let running = $state(true);
  let trail: { x: number; y: number }[] = $state([]);
  let animFrame: number;

  let px = $state(0);
  let py = $state(-150);
  let vx = $state(5);
  let vy = $state(0);

  const dt = 0.1;
  const cx = 300, cy = 200;
  const G = 1;

  function reset() {
    px = 0; py = -150;
    vx = orbitalSpeed; vy = 0;
    trail = [];
  }

  function step() {
    if (!running) { animFrame = requestAnimationFrame(step); draw(); return; }

    const dx = -px, dy = -py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 20) { reset(); }
    const force = (G * planetMass) / (dist * dist);
    const ax = force * (dx / dist);
    const ay = force * (dy / dist);

    vx += ax * dt;
    vy += ay * dt;
    px += vx * dt;
    py += vy * dt;

    trail.push({ x: px, y: py });
    if (trail.length > 500) trail = trail.slice(-500);

    draw();
    animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    // Stars
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 600, 400);

    // Planet (center)
    const planetR = 15 + planetMass * 0.2;
    ctx.beginPath();
    ctx.arc(cx, cy, planetR, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('M', cx, cy + 4);
    ctx.textAlign = 'start';

    // Trail
    if (trail.length > 1) {
      ctx.beginPath();
      trail.forEach((p, i) => {
        const sx = cx + p.x, sy = cy + p.y;
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      });
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Satellite
    const sx = cx + px, sy = cy + py;
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Velocity vector
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + vx * 5, sy + vy * 5);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gravity vector
    const dist = Math.sqrt(px * px + py * py);
    const gForce = (G * planetMass) / (dist * dist);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (-px / dist) * gForce * 300, sy + (-py / dist) * gForce * 300);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Info
    const speed = Math.sqrt(vx * vx + vy * vy);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Geschwindigkeit: ${speed.toFixed(2)}`, 20, 30);
    ctx.fillText(`Abstand: ${dist.toFixed(0)}`, 20, 50);
    ctx.fillStyle = '#10b981';
    ctx.fillText('→ Geschwindigkeit', 20, 370);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('→ Gravitation', 20, 388);
  }

  function handleSpeedChange() { reset(); }

  onMount(() => {
    canvas.width = 600; canvas.height = 400;
    reset();
    step();
    return () => cancelAnimationFrame(animFrame);
  });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-green-400">Startgeschwindigkeit: {orbitalSpeed.toFixed(1)}</span>
      <input type="range" min="1" max="12" step="0.1" bind:value={orbitalSpeed} oninput={handleSpeedChange} class="accent-green-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-blue-400">Planetenmasse: {planetMass}</span>
      <input type="range" min="10" max="200" bind:value={planetMass} oninput={handleSpeedChange} class="accent-blue-500" />
    </label>
  </div>
  <p class="text-center text-xs text-slate-500 mt-3">Zu langsam → Absturz | Zu schnell → Flucht | Genau richtig → Orbit</p>
</div>
