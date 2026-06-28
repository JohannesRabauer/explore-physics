<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let angleDeg = $state(30);
  let friction = $state(0.2);
  let mass = $state(5);
  let running = $state(false);
  let pos = $state(0);
  let vel = $state(0);
  let t = $state(0);
  let animFrame: number;

  const g = 9.81;
  const dt = 0.016;
  const rampLen = 400;

  function step() {
    if (!running) return;
    t += dt;
    const rad = (angleDeg * Math.PI) / 180;
    const gParallel = g * Math.sin(rad);
    const gNormal = g * Math.cos(rad);
    const frictionForce = friction * gNormal;
    const accel = gParallel - frictionForce;

    if (accel <= 0 && vel <= 0) { running = false; draw(); return; }

    vel += accel * dt;
    if (vel < 0) vel = 0;
    pos += vel * dt;

    if (pos * 40 >= rampLen) { pos = rampLen / 40; running = false; }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    const rad = (angleDeg * Math.PI) / 180;
    const rampStartX = 80;
    const rampStartY = 80;
    const rampEndX = rampStartX + rampLen * Math.cos(rad);
    const rampEndY = rampStartY + rampLen * Math.sin(rad);

    // Ramp
    ctx.beginPath();
    ctx.moveTo(rampStartX, rampStartY);
    ctx.lineTo(rampEndX, rampEndY);
    ctx.lineTo(rampEndX, rampStartY);
    ctx.closePath();
    ctx.fillStyle = '#374151';
    ctx.fill();
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Angle arc
    ctx.beginPath();
    ctx.arc(rampEndX, rampEndY, 40, Math.PI + rad, 2 * Math.PI, true);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${angleDeg}°`, rampEndX - 55, rampEndY - 10);

    // Block on ramp
    const blockProgress = (pos * 40) / rampLen;
    const bx = rampStartX + blockProgress * (rampEndX - rampStartX);
    const by = rampStartY + blockProgress * (rampEndY - rampStartY);

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rad);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-15, -30, 30, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, 0, -12);
    ctx.restore();

    // Force arrows
    const arrowScale = 15;
    // Gravity component parallel
    const fPar = mass * g * Math.sin(rad);
    ctx.save();
    ctx.translate(bx, by);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(fPar * arrowScale / mass * Math.cos(rad), fPar * arrowScale / mass * Math.sin(rad));
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Friction arrow (opposite direction)
    const fFric = friction * mass * g * Math.cos(rad);
    ctx.save();
    ctx.translate(bx, by);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-fFric * arrowScale / mass * Math.cos(rad), -fFric * arrowScale / mass * Math.sin(rad));
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Info
    ctx.textAlign = 'start';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`t = ${t.toFixed(2)} s`, 20, 360);
    ctx.fillText(`v = ${vel.toFixed(2)} m/s`, 20, 380);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`F_parallel = ${fPar.toFixed(1)} N`, 300, 360);
    ctx.fillStyle = '#10b981';
    ctx.fillText(`F_Reibung = ${fFric.toFixed(1)} N`, 300, 380);

    const netForce = fPar - fFric;
    ctx.fillStyle = netForce > 0 ? '#eab308' : '#94a3b8';
    ctx.fillText(`F_netto = ${netForce.toFixed(1)} N`, 300, 340);
  }

  function start() { running = true; step(); }
  function reset() { running = false; cancelAnimationFrame(animFrame); pos = 0; vel = 0; t = 0; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={start} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">▶ Loslassen</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Neigung: {angleDeg}°</span>
      <input type="range" min="5" max="80" bind:value={angleDeg} oninput={reset} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-green-400">Reibung μ: {friction.toFixed(2)}</span>
      <input type="range" min="0" max="1" step="0.02" bind:value={friction} oninput={reset} class="accent-green-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-yellow-400">Masse: {mass} kg</span>
      <input type="range" min="1" max="20" bind:value={mass} oninput={reset} class="accent-yellow-500" />
    </label>
  </div>
</div>
