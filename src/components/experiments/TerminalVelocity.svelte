<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let dragCoeff = $state(0.5);
  let area = $state(0.5);
  let mass = $state(5);
  let running = $state(false);
  let vel = $state(0);
  let pos = $state(0);
  let t = $state(0);
  let trail: { t: number; v: number }[] = $state([]);
  let animFrame: number;

  const g = 9.81;
  const rho = 1.225;
  const dt = 0.016;

  function terminalVelocity() {
    return Math.sqrt((2 * mass * g) / (rho * dragCoeff * area));
  }

  function step() {
    if (!running) return;
    t += dt;

    const drag = 0.5 * rho * dragCoeff * area * vel * vel;
    const accel = g - drag / mass;
    vel += accel * dt;
    pos += vel * dt;
    trail.push({ t, v: vel });

    if (pos > 500) { running = false; }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 400);
    grad.addColorStop(0, '#1e3a5f');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 400);

    // Falling object
    const objY = 50 + Math.min(pos * 0.5, 280);
    const objSize = 10 + area * 20;
    ctx.beginPath();
    ctx.arc(150, objY, objSize, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, 150, objY + 4);
    ctx.textAlign = 'start';

    // Wind lines (drag visualization)
    const dragIntensity = Math.min(vel / terminalVelocity(), 1);
    for (let i = 0; i < 8; i++) {
      const lx = 150 + (Math.random() - 0.5) * objSize * 2;
      const ly = objY - objSize - Math.random() * 30 * dragIntensity;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx, ly - 10 - dragIntensity * 15);
      ctx.strokeStyle = `rgba(148, 163, 184, ${dragIntensity * 0.6})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Force arrows
    // Gravity
    const gArrow = 40;
    ctx.beginPath();
    ctx.moveTo(150, objY + objSize + 5);
    ctx.lineTo(150, objY + objSize + 5 + gArrow);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Fg=${(mass * g).toFixed(0)}N`, 165, objY + objSize + 30);

    // Drag
    const dragForce = 0.5 * rho * dragCoeff * area * vel * vel;
    const dArrow = Math.min((dragForce / (mass * g)) * gArrow, gArrow);
    ctx.beginPath();
    ctx.moveTo(150, objY - objSize - 5);
    ctx.lineTo(150, objY - objSize - 5 - dArrow);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(`Fd=${dragForce.toFixed(1)}N`, 165, objY - objSize - 10);

    // Velocity graph
    const graphX = 280, graphY = 30, graphW = 290, graphH = 340;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    const vTerm = terminalVelocity();
    // Terminal velocity line
    const tvY = graphY + graphH - (vTerm / (vTerm * 1.2)) * graphH;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(graphX, tvY);
    ctx.lineTo(graphX + graphW, tvY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ef4444';
    ctx.font = '11px sans-serif';
    ctx.fillText(`v_term = ${vTerm.toFixed(1)} m/s`, graphX + graphW - 110, tvY - 5);

    // Plot
    if (trail.length > 1) {
      ctx.beginPath();
      const maxT = Math.max(10, t);
      trail.forEach((p, i) => {
        const px = graphX + (p.t / maxT) * graphW;
        const py = graphY + graphH - (p.v / (vTerm * 1.2)) * graphH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('v (m/s)', graphX + 5, graphY + 15);
    ctx.fillText('t (s)', graphX + graphW - 30, graphY + graphH - 5);

    // Current values
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`v = ${vel.toFixed(1)} m/s`, 20, 380);
    ctx.fillText(`${(vel / vTerm * 100).toFixed(0)}% von v_term`, 20, 395);
  }

  function start() { running = true; step(); }
  function reset() { running = false; cancelAnimationFrame(animFrame); vel = 0; pos = 0; t = 0; trail = []; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={start} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">▶ Fallenlassen</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-yellow-400">Masse: {mass} kg</span>
      <input type="range" min="0.5" max="50" step="0.5" bind:value={mass} oninput={reset} class="accent-yellow-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-blue-400">Fläche: {area.toFixed(2)} m²</span>
      <input type="range" min="0.01" max="2" step="0.01" bind:value={area} oninput={reset} class="accent-blue-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">cW-Wert: {dragCoeff.toFixed(2)}</span>
      <input type="range" min="0.1" max="2" step="0.05" bind:value={dragCoeff} oninput={reset} class="accent-slate-500" />
    </label>
  </div>
</div>
