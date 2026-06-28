<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let running = $state(false);
  let t = $state(0);
  let angleDeg = $state(20);
  let animFrame: number;

  interface Obj { name: string; color: string; mu: number; isRolling: boolean; pos: number; vel: number; radius: number; angle: number }
  let objects: Obj[] = $state([
    { name: 'Kugel (rollend)', color: '#3b82f6', mu: 0.015, isRolling: true, pos: 0, vel: 0, radius: 15, angle: 0 },
    { name: 'Zylinder (rollend)', color: '#10b981', mu: 0.02, isRolling: true, pos: 0, vel: 0, radius: 15, angle: 0 },
    { name: 'Klotz (gleitend)', color: '#f59e0b', mu: 0.25, isRolling: false, pos: 0, vel: 0, radius: 12, angle: 0 },
  ]);

  const g = 9.81;
  const dt = 0.016;
  const trackLen = 8;

  function step() {
    if (!running) return;
    t += dt;
    const rad = (angleDeg * Math.PI) / 180;
    let allDone = true;

    objects = objects.map(o => {
      if (o.pos >= trackLen) return o;
      allDone = false;
      const accel = g * Math.sin(rad) - o.mu * g * Math.cos(rad);
      if (accel <= 0) return { ...o, pos: trackLen };
      const newVel = o.vel + accel * dt;
      const newPos = o.pos + newVel * dt;
      const newAngle = o.isRolling ? o.angle + (newVel * dt / (o.radius / 100)) : 0;
      return { ...o, vel: newVel, pos: Math.min(newPos, trackLen), angle: newAngle };
    });

    if (allDone) running = false;
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    const rad = (angleDeg * Math.PI) / 180;
    const rampSX = 50, rampSY = 60;
    const rampEX = 550, rampEY = rampSY + (rampEX - rampSX) * Math.sin(rad);

    // Ramp
    ctx.beginPath();
    ctx.moveTo(rampSX, rampSY);
    ctx.lineTo(rampEX, rampEY);
    ctx.lineTo(rampEX, rampSY);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Objects on ramp
    const rampW = rampEX - rampSX;
    objects.forEach((o, i) => {
      const progress = o.pos / trackLen;
      const ox = rampSX + progress * rampW * Math.cos(rad);
      const oy = rampSY + progress * rampW * Math.sin(rad) - o.radius - 2;

      ctx.save();
      ctx.translate(ox, oy);

      if (o.isRolling) {
        ctx.beginPath();
        ctx.arc(0, 0, o.radius, 0, Math.PI * 2);
        ctx.fillStyle = o.color;
        ctx.fill();
        // Rolling indicator
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(o.radius * Math.cos(o.angle), o.radius * Math.sin(o.angle));
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.rotate(rad);
        ctx.fillStyle = o.color;
        ctx.fillRect(-o.radius, -o.radius, o.radius * 2, o.radius * 2);
        ctx.rotate(-rad);
      }
      ctx.restore();
    });

    // Legend and results
    let ly = 250;
    ctx.font = '12px sans-serif';
    objects.forEach(o => {
      ctx.fillStyle = o.color;
      ctx.fillRect(50, ly, 12, 12);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${o.name} (μ=${o.mu}) – v=${o.vel.toFixed(2)} m/s, s=${o.pos.toFixed(2)} m`, 70, ly + 10);
      ly += 25;
    });

    // Physics info
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Rollreibung << Gleitreibung`, 50, ly + 20);
    ctx.fillText(`Neigung: ${angleDeg}° | t = ${t.toFixed(2)} s`, 50, ly + 40);
  }

  function start() { running = true; step(); }
  function reset() {
    running = false; cancelAnimationFrame(animFrame); t = 0;
    objects = objects.map(o => ({ ...o, pos: 0, vel: 0, angle: 0 }));
    draw();
  }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={start} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">▶ Loslassen</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="max-w-sm mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Neigung: {angleDeg}°</span>
      <input type="range" min="5" max="45" bind:value={angleDeg} oninput={reset} class="accent-indigo-500" />
    </label>
  </div>
</div>
