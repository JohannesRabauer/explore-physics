<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let initialSpeed = $state(50);
  let friction = $state(0.7);
  let reactionTime = $state(1.0);
  let running = $state(false);
  let phase = $state<'driving' | 'reacting' | 'braking' | 'stopped'>('driving');
  let pos = $state(0);
  let vel = $state(0);
  let t = $state(0);
  let brakeStart = $state(0);
  let animFrame: number;

  const g = 9.81;
  const dt = 0.016;
  const scale = 3;

  function step() {
    if (!running) return;
    t += dt;
    const speedMs = initialSpeed / 3.6;

    if (phase === 'driving') {
      vel = speedMs;
      pos += vel * dt;
      if (t >= 0.5) { phase = 'reacting'; }
    } else if (phase === 'reacting') {
      vel = speedMs;
      pos += vel * dt;
      if (t >= 0.5 + reactionTime) { phase = 'braking'; brakeStart = pos; }
    } else if (phase === 'braking') {
      const decel = friction * g;
      vel -= decel * dt;
      if (vel <= 0) { vel = 0; phase = 'stopped'; running = false; }
      pos += vel * dt;
    }

    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    // Road
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 180, 600, 60);
    ctx.setLineDash([20, 15]);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 210);
    ctx.lineTo(600, 210);
    ctx.stroke();
    ctx.setLineDash([]);

    // Car
    const carX = 50 + pos * scale;
    const displayX = Math.min(carX, 560);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(displayX - 30, 190, 50, 20);
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(displayX - 20, 183, 30, 12);
    // Wheels
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(displayX - 15, 212, 6, 0, Math.PI * 2);
    ctx.arc(displayX + 10, 212, 6, 0, Math.PI * 2);
    ctx.fill();

    // Brake lights
    if (phase === 'braking') {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(displayX - 30, 193, 4, 10);
    }

    // Distance markers
    const speedMs = initialSpeed / 3.6;
    const reactDist = speedMs * reactionTime;
    const brakeDist = (speedMs * speedMs) / (2 * friction * g);
    const totalDist = reactDist + brakeDist;

    // Bar chart at bottom
    const barY = 280;
    const barH = 30;
    const barScale = 400 / Math.max(totalDist, 50);

    // Reaction distance
    ctx.fillStyle = '#eab308';
    ctx.fillRect(100, barY, reactDist * barScale, barH);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${reactDist.toFixed(1)}m`, 100 + reactDist * barScale / 2, barY + 20);

    // Braking distance
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(100 + reactDist * barScale, barY, brakeDist * barScale, barH);
    ctx.fillStyle = '#fff';
    ctx.fillText(`${brakeDist.toFixed(1)}m`, 100 + reactDist * barScale + brakeDist * barScale / 2, barY + 20);

    // Labels
    ctx.textAlign = 'start';
    ctx.fillStyle = '#eab308';
    ctx.fillText('Reaktionsweg', 100, barY + 50);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Bremsweg', 250, barY + 50);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Anhalteweg: ${totalDist.toFixed(1)} m`, 100, barY + 70);

    // Formulas
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Reaktionsweg = v × t_R = ${speedMs.toFixed(1)} × ${reactionTime} = ${reactDist.toFixed(1)} m`, 100, barY + 95);
    ctx.fillText(`Bremsweg = v² / (2μg) = ${speedMs.toFixed(1)}² / (2×${friction}×9.81) = ${brakeDist.toFixed(1)} m`, 100, barY + 115);

    // Speed info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Geschwindigkeit: ${initialSpeed} km/h (${speedMs.toFixed(1)} m/s)`, 20, 30);
    ctx.fillText(`Aktuelle v: ${(vel * 3.6).toFixed(0)} km/h`, 20, 50);

    // Phase indicator
    const phaseLabels = { driving: '🚗 Fahrt', reacting: '⚠️ Reaktion...', braking: '🛑 Bremsen!', stopped: '✓ Gestoppt' };
    ctx.fillStyle = phase === 'braking' ? '#ef4444' : phase === 'stopped' ? '#10b981' : '#eab308';
    ctx.fillText(phaseLabels[phase], 400, 30);
  }

  function start() { running = true; phase = 'driving'; step(); }
  function reset() { running = false; cancelAnimationFrame(animFrame); pos = 0; vel = 0; t = 0; phase = 'driving'; brakeStart = 0; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={start} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">🚗 Fahren & Bremsen</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-blue-400">Tempo: {initialSpeed} km/h</span>
      <input type="range" min="10" max="200" step="5" bind:value={initialSpeed} oninput={reset} class="accent-blue-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-green-400">Reibung μ: {friction.toFixed(2)}</span>
      <input type="range" min="0.1" max="1.0" step="0.05" bind:value={friction} oninput={reset} class="accent-green-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-yellow-400">Reaktionszeit: {reactionTime.toFixed(1)}s</span>
      <input type="range" min="0.3" max="3.0" step="0.1" bind:value={reactionTime} oninput={reset} class="accent-yellow-500" />
    </label>
  </div>
</div>
