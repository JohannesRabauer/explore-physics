<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let pushForce = $state(20);
  let mass = $state(5);
  let surface = $state<'ice' | 'wood' | 'rubber' | 'sandpaper'>('wood');
  let running = $state(false);
  let pos = $state(0);
  let vel = $state(0);
  let t = $state(0);
  let pushing = $state(true);
  let animFrame: number;

  const surfaces: Record<string, { mu: number; color: string; label: string }> = {
    ice: { mu: 0.03, color: '#a5f3fc', label: 'Eis (μ=0.03)' },
    wood: { mu: 0.3, color: '#d97706', label: 'Holz (μ=0.30)' },
    rubber: { mu: 0.7, color: '#374151', label: 'Gummi (μ=0.70)' },
    sandpaper: { mu: 1.0, color: '#92400e', label: 'Sandpapier (μ=1.0)' },
  };

  const g = 9.81;
  const dt = 0.016;

  function step() {
    if (!running) return;
    t += dt;

    const mu = surfaces[surface].mu;
    const frictionForce = mu * mass * g;
    const applied = pushing && t < 2 ? pushForce : 0;
    const netForce = applied - (vel > 0 ? frictionForce : vel < 0 ? -frictionForce : Math.min(frictionForce, Math.abs(applied)) * Math.sign(applied));
    const accel = netForce / mass;

    vel += accel * dt;
    if (!pushing || t >= 2) {
      if (Math.abs(vel) < 0.01) { vel = 0; running = false; }
      if (vel > 0) vel = Math.max(0, vel - (frictionForce / mass) * dt);
    }
    pos += vel * dt;

    if (pos > 12) { pos = 12; vel = 0; running = false; }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    const surfData = surfaces[surface];

    // Surface
    ctx.fillStyle = surfData.color;
    ctx.fillRect(50, 220, 500, 20);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(50, 240, 500, 10);

    // Distance markers
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    for (let d = 0; d <= 12; d += 2) {
      const x = 50 + d * 40;
      ctx.fillRect(x, 215, 1, 25);
      ctx.fillText(`${d}m`, x - 5, 260);
    }

    // Block
    const bx = 50 + pos * 40;
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(bx, 185, 40, 35);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, bx + 20, 207);
    ctx.textAlign = 'start';

    // Push arrow
    if (pushing && t < 2 && running) {
      ctx.beginPath();
      ctx.moveTo(bx - 5, 202);
      ctx.lineTo(bx - 30, 202);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(bx - 5, 195);
      ctx.lineTo(bx - 5, 210);
      ctx.lineTo(bx + 5, 202);
      ctx.fill();
      ctx.fillText(`F=${pushForce}N`, bx - 60, 195);
    }

    // Friction arrow
    if (vel > 0.01) {
      const fric = surfaces[surface].mu * mass * g;
      const arrowLen = Math.min(fric * 2, 60);
      ctx.beginPath();
      ctx.moveTo(bx + 40, 220);
      ctx.lineTo(bx + 40 - arrowLen, 220);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.font = '10px sans-serif';
      ctx.fillText(`F_R=${fric.toFixed(1)}N`, bx + 45, 218);
    }

    // Graph - velocity over time
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 280, 500, 100);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('v (m/s)', 10, 330);
    ctx.fillText('t (s)', 290, 395);

    // Velocity indicator
    const barH = Math.min(Math.abs(vel) * 10, 100);
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(50 + Math.min(t * 50, 490), 380 - barH, 3, barH);

    // Info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Oberfläche: ${surfData.label}`, 50, 30);
    ctx.fillText(`v = ${vel.toFixed(2)} m/s`, 50, 50);
    ctx.fillText(`s = ${pos.toFixed(2)} m`, 50, 70);
    ctx.fillText(`t = ${t.toFixed(2)} s`, 350, 30);

    if (t >= 2 && pushing) {
      ctx.fillStyle = '#eab308';
      ctx.fillText('Schub beendet – Reibung bremst!', 200, 170);
    }
  }

  function start() { running = true; pushing = true; step(); }
  function reset() { running = false; cancelAnimationFrame(animFrame); pos = 0; vel = 0; t = 0; pushing = true; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={start} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">▶ Schieben (2s)</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-red-400">Schubkraft: {pushForce} N</span>
      <input type="range" min="5" max="100" bind:value={pushForce} oninput={reset} class="accent-red-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Masse: {mass} kg</span>
      <input type="range" min="1" max="20" bind:value={mass} oninput={reset} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Oberfläche</span>
      <select bind:value={surface} onchange={reset} class="bg-slate-700 rounded px-2 py-1 text-sm text-slate-200">
        <option value="ice">Eis</option>
        <option value="wood">Holz</option>
        <option value="rubber">Gummi</option>
        <option value="sandpaper">Sandpapier</option>
      </select>
    </label>
  </div>
</div>
