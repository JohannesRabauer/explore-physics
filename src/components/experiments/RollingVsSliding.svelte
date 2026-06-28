<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
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
  const baseDt = 0.016;
  const trackLen = 8;

  function step() {
    if (!running) return;
    const dt = baseDt * simSpeed;
    if (!paused) {
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
      if (allDone) { running = false; }
    }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);

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
    objects.forEach((o) => {
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

    // Measurements (always visible)
    let ly = 220;
    ctx.font = '12px sans-serif';
    objects.forEach(o => {
      ctx.fillStyle = o.color;
      ctx.fillRect(50, ly, 12, 12);
      ctx.fillStyle = '#e2e8f0';
      const accel = g * Math.sin(rad) - o.mu * g * Math.cos(rad);
      ctx.fillText(`${o.name}: μ=${o.mu} | v=${o.vel.toFixed(2)} m/s | s=${o.pos.toFixed(2)} m | a=${accel.toFixed(2)} m/s²`, 70, ly + 10);
      ly += 22;
    });

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Neigung: ${angleDeg}° | t = ${t.toFixed(2)} s`, 50, ly + 15);

    // Paused overlay
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(200, 5, 200, 35);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⏸ PAUSIERT', 300, 28);
      ctx.textAlign = 'start';
    }

    // Formula panel at bottom
    ctx.fillStyle = 'rgba(15,23,42,0.9)';
    ctx.fillRect(0, h - 60, w, 60);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    const sinA = Math.sin(rad).toFixed(3);
    const cosA = Math.cos(rad).toFixed(3);
    ctx.fillText(`Rollen:  a = g·sin(α) − μ_roll·g·cos(α) = 9.81·${sinA} − 0.015·9.81·${cosA} = ${(g*Math.sin(rad) - 0.015*g*Math.cos(rad)).toFixed(3)} m/s²`, 15, h - 40);
    ctx.fillText(`Gleiten: a = g·sin(α) − μ_gleit·g·cos(α) = 9.81·${sinA} − 0.25·9.81·${cosA} = ${(g*Math.sin(rad) - 0.25*g*Math.cos(rad)).toFixed(3)} m/s²`, 15, h - 20);
  }

  function start() { running = true; paused = false; step(); }
  function reset() {
    running = false; paused = false; cancelAnimationFrame(animFrame); t = 0;
    objects = objects.map(o => ({ ...o, pos: 0, vel: 0, angle: 0 }));
    draw();
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
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Neigung: {angleDeg}°</span>
      <input type="range" min="5" max="45" bind:value={angleDeg} oninput={reset} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
