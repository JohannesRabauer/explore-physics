<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let pushForce = $state(20);
  let mass = $state(5);
  let surface = $state<'ice' | 'wood' | 'rubber' | 'sandpaper'>('wood');
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let pos = $state(0);
  let vel = $state(0);
  let t = $state(0);
  let animFrame: number;

  const surfaces: Record<string, { mu: number; color: string; label: string }> = {
    ice: { mu: 0.03, color: '#a5f3fc', label: 'Eis (μ=0.03)' },
    wood: { mu: 0.3, color: '#d97706', label: 'Holz (μ=0.30)' },
    rubber: { mu: 0.7, color: '#374151', label: 'Gummi (μ=0.70)' },
    sandpaper: { mu: 1.0, color: '#92400e', label: 'Sandpapier (μ=1.0)' },
  };
  const g = 9.81;
  const dt = 0.016;
  const pushDuration = 2;

  function step() {
    if (!running) return;
    if (!paused) {
      t += dt * simSpeed;
      const mu = surfaces[surface].mu;
      const frictionForce = mu * mass * g;
      const applied = t < pushDuration ? pushForce : 0;
      let accel = (applied - (vel > 0.01 ? frictionForce : 0)) / mass;
      vel += accel * dt * simSpeed;
      if (vel < 0) vel = 0;
      if (t >= pushDuration && vel < 0.01) { vel = 0; running = false; }
      pos += vel * dt * simSpeed;
      if (pos > 12) { pos = 12; vel = 0; running = false; }
    }
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
    ctx.fillRect(50, 180, 500, 20);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(50, 200, 500, 10);

    // Distance markers
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    for (let d = 0; d <= 12; d += 2) {
      const x = 50 + d * 40;
      ctx.fillRect(x, 175, 1, 25);
      ctx.fillText(`${d}m`, x - 5, 220);
    }

    // Block
    const bx = 50 + pos * 40;
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(bx, 145, 40, 35);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, bx + 20, 167);
    ctx.textAlign = 'start';

    // Push arrow
    if (t < pushDuration && running && !paused) {
      ctx.beginPath();
      ctx.moveTo(bx - 30, 162);
      ctx.lineTo(bx - 5, 162);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`F=${pushForce}N →`, bx - 65, 150);
    }

    // Friction arrow
    const mu = surfaces[surface].mu;
    const fFric = mu * mass * g;
    if (vel > 0.01) {
      ctx.beginPath();
      ctx.moveTo(bx + 40, 180);
      ctx.lineTo(bx + 40 - Math.min(fFric * 1.5, 50), 180);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.font = '10px sans-serif';
      ctx.fillText(`← F_R`, bx + 42, 177);
    }

    // Formula + values panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(10, 240, 580, 150);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(10, 240, 580, 150);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Reibungskraft: F_R = μ · m · g', 20, 262);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px sans-serif';
    ctx.fillText(`F_R = ${mu} × ${mass} kg × 9.81 m/s² = ${fFric.toFixed(1)} N`, 20, 282);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Beschleunigung: a = (F - F_R) / m', 20, 310);

    const netForce = (t < pushDuration ? pushForce : 0) - (vel > 0.01 ? fFric : 0);
    const accel = netForce / mass;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px sans-serif';
    ctx.fillText(`a = (${t < pushDuration ? pushForce : 0} - ${vel > 0.01 ? fFric.toFixed(1) : '0'}) / ${mass} = ${accel.toFixed(2)} m/s²`, 20, 330);

    // Current values
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`t = ${t.toFixed(2)} s`, 20, 358);
    ctx.fillText(`v = ${vel.toFixed(2)} m/s`, 150, 358);
    ctx.fillText(`s = ${pos.toFixed(2)} m`, 300, 358);
    ctx.fillText(`Oberfläche: ${surfData.label}`, 20, 378);

    if (paused) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('⏸ PAUSIERT', 490, 30);
    }
    if (t >= pushDuration && running) {
      ctx.fillStyle = '#eab308';
      ctx.font = '11px sans-serif';
      ctx.fillText('Schub beendet – nur Reibung bremst!', 200, 135);
    }
  }

  function start() { running = true; step(); }
  function reset() { running = false; paused = false; cancelAnimationFrame(animFrame); pos = 0; vel = 0; t = 0; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={start} disabled={running && !paused} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-50">▶ Schieben (2s)</button>
    <button onclick={() => paused = !paused} disabled={!running} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors disabled:opacity-50">{paused ? '▶ Weiter' : '⏸ Pause'}</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-red-400">Kraft: {pushForce}N</span>
      <input type="range" min="5" max="100" bind:value={pushForce} oninput={reset} class="accent-red-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Masse: {mass}kg</span>
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
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Tempo: {simSpeed === 0.25 ? '¼×' : simSpeed === 0.5 ? '½×' : simSpeed === 1 ? '1×' : '2×'}</span>
      <input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" />
    </label>
  </div>
</div>
