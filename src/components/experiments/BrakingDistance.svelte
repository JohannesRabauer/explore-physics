<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let initialSpeed = $state(50);
  let friction = $state(0.7);
  let reactionTime = $state(1.0);
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let phase = $state<'driving' | 'reacting' | 'braking' | 'stopped'>('driving');
  let pos = $state(0);
  let vel = $state(0);
  let t = $state(0);
  let brakeStart = $state(0);
  let animFrame: number;

  const g = 9.81;
  const baseDt = 0.016;
  const scale = 3;

  function step() {
    if (!running) return;
    const dt = baseDt * simSpeed;
    if (!paused) {
      t += dt;
      const speedMs = initialSpeed / 3.6;
      if (phase === 'driving') {
        vel = speedMs; pos += vel * dt;
        if (t >= 0.5) phase = 'reacting';
      } else if (phase === 'reacting') {
        vel = speedMs; pos += vel * dt;
        if (t >= 0.5 + reactionTime) { phase = 'braking'; brakeStart = pos; }
      } else if (phase === 'braking') {
        const decel = friction * g;
        vel -= decel * dt;
        if (vel <= 0) { vel = 0; phase = 'stopped'; running = false; }
        pos += vel * dt;
      }
    }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);

    const speedMs = initialSpeed / 3.6;
    const reactDist = speedMs * reactionTime;
    const brakeDist = (speedMs * speedMs) / (2 * friction * g);
    const totalDist = reactDist + brakeDist;

    // Road
    ctx.fillStyle = '#374151'; ctx.fillRect(0, 160, 600, 60);
    ctx.setLineDash([20, 15]); ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 190); ctx.lineTo(600, 190); ctx.stroke(); ctx.setLineDash([]);

    // Car
    const carX = Math.min(50 + pos * scale, 560);
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(carX - 30, 170, 50, 20);
    ctx.fillStyle = '#1e3a5f'; ctx.fillRect(carX - 20, 163, 30, 12);
    ctx.fillStyle = '#1f2937';
    ctx.beginPath(); ctx.arc(carX - 15, 192, 6, 0, Math.PI * 2); ctx.arc(carX + 10, 192, 6, 0, Math.PI * 2); ctx.fill();
    if (phase === 'braking') { ctx.fillStyle = '#ef4444'; ctx.fillRect(carX - 30, 173, 4, 10); }

    // Measurements always visible
    ctx.fillStyle = '#e2e8f0'; ctx.font = '12px sans-serif';
    ctx.fillText(`Geschwindigkeit: ${initialSpeed} km/h (${speedMs.toFixed(1)} m/s)  |  v aktuell: ${(vel * 3.6).toFixed(0)} km/h`, 20, 25);
    ctx.fillText(`Reaktionsweg: ${reactDist.toFixed(1)} m  |  Bremsweg: ${brakeDist.toFixed(1)} m  |  Anhalteweg: ${totalDist.toFixed(1)} m`, 20, 45);

    // Phase
    const phaseLabels = { driving: '🚗 Fahrt', reacting: '⚠️ Reaktion...', braking: '🛑 Bremsen!', stopped: '✓ Gestoppt' };
    ctx.fillStyle = phase === 'braking' ? '#ef4444' : phase === 'stopped' ? '#10b981' : '#eab308';
    ctx.fillText(phaseLabels[phase], 480, 25);

    // Bar chart
    const barY = 250, barH = 30, barScale = 400 / Math.max(totalDist, 50);
    ctx.fillStyle = '#eab308'; ctx.fillRect(100, barY, reactDist * barScale, barH);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(100 + reactDist * barScale, barY, brakeDist * barScale, barH);
    ctx.fillStyle = '#fff'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${reactDist.toFixed(1)}m`, 100 + reactDist * barScale / 2, barY + 20);
    ctx.fillText(`${brakeDist.toFixed(1)}m`, 100 + reactDist * barScale + brakeDist * barScale / 2, barY + 20);
    ctx.textAlign = 'start';

    ctx.fillStyle = '#eab308'; ctx.fillText('Reaktionsweg', 100, barY + 50);
    ctx.fillStyle = '#ef4444'; ctx.fillText('Bremsweg', 250, barY + 50);
    ctx.fillStyle = '#94a3b8'; ctx.fillText(`Anhalteweg: ${totalDist.toFixed(1)} m`, 400, barY + 50);

    // Paused
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(200, 60, 200, 35);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⏸ PAUSIERT', 300, 83); ctx.textAlign = 'start';
    }

    // Formula panel
    ctx.fillStyle = 'rgba(15,23,42,0.9)'; ctx.fillRect(0, h - 55, w, 55);
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';
    ctx.fillText(`s_reakt = v · t_R = ${speedMs.toFixed(1)} · ${reactionTime.toFixed(1)} = ${reactDist.toFixed(1)} m`, 15, h - 35);
    ctx.fillText(`s_brems = v² / (2·μ·g) = ${speedMs.toFixed(1)}² / (2·${friction}·9.81) = ${brakeDist.toFixed(1)} m    Gesamt: ${totalDist.toFixed(1)} m`, 15, h - 15);
  }

  function start() { running = true; paused = false; step(); }
  function reset() { running = false; paused = false; cancelAnimationFrame(animFrame); pos = 0; vel = 0; t = 0; phase = 'driving'; brakeStart = 0; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={start} disabled={running&&!paused} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-50">▶ Start</button>
    <button onclick={()=>paused=!paused} disabled={!running} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors disabled:opacity-50">{paused?'▶ Weiter':'⏸ Pause'}</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
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
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
