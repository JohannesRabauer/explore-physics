<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let mass = $state(70);
  let jumpV = $state(3);
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let selectedPlanet = $state(3);
  let ballY = $state(0);
  let ballVel = $state(0);
  let t = $state(0);
  let animFrame: number;

  const planets = [
    { name: 'Merkur', g: 3.7, color: '#9ca3af' },
    { name: 'Venus', g: 8.87, color: '#fbbf24' },
    { name: 'Erde', g: 9.81, color: '#3b82f6' },
    { name: 'Mars', g: 3.72, color: '#ef4444' },
    { name: 'Jupiter', g: 24.79, color: '#f97316' },
    { name: 'Saturn', g: 10.44, color: '#eab308' },
    { name: 'Uranus', g: 8.87, color: '#06b6d4' },
    { name: 'Neptun', g: 11.15, color: '#6366f1' },
    { name: 'Mond', g: 1.62, color: '#d1d5db' },
  ];

  const baseDt = 0.016;

  function step() {
    if (!running) return;
    const dt = baseDt * simSpeed;
    if (!paused) {
      const gP = planets[selectedPlanet].g;
      ballVel -= gP * dt;
      ballY += ballVel * dt;
      t += dt;
      if (ballY <= 0) { ballY = 0; ballVel = 0; running = false; }
    }
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const W = 600, H = 400;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H);

    const p = planets[selectedPlanet];
    const groundY = H - 80;

    // Ground
    ctx.fillStyle = p.color + '33';
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = p.color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

    // Ball (jump)
    const maxH = jumpV * jumpV / (2 * p.g);
    const drawY = groundY - 15 - (ballY / Math.max(maxH, 1)) * (groundY - 80);
    ctx.beginPath(); ctx.arc(120, Math.max(40, drawY), 15, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b'; ctx.fill();

    // Planet table
    ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 12px monospace';
    ctx.fillText('Planet      g(m/s²) Gewicht(N) Sprungh.(m)', 200, 25);
    ctx.font = '11px monospace';
    planets.forEach((pl, i) => {
      const y = 42 + i * 16;
      const w = (mass * pl.g).toFixed(1);
      const jh = (jumpV * jumpV / (2 * pl.g)).toFixed(2);
      ctx.fillStyle = i === selectedPlanet ? '#fbbf24' : '#94a3b8';
      ctx.fillText(`${pl.name.padEnd(10)} ${pl.g.toFixed(2).padStart(6)}   ${w.padStart(8)}   ${jh.padStart(6)}`, 200, y);
    });

    // Measurements
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px monospace';
    ctx.fillText(`Gewicht: ${(mass * p.g).toFixed(1)} N`, 20, 25);
    ctx.fillText(`Sprunghöhe: ${(jumpV * jumpV / (2 * p.g)).toFixed(2)} m`, 20, 42);
    ctx.fillText(`Höhe: ${ballY.toFixed(2)} m`, 20, 59);
    ctx.fillText(`v: ${ballVel.toFixed(2)} m/s`, 20, 76);

    // Formula panel
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.fillRect(0, H - 50, W, 50);
    ctx.fillStyle = '#e2e8f0'; ctx.font = '13px monospace';
    ctx.fillText(`F = m·g = ${mass}·${p.g.toFixed(2)} = ${(mass * p.g).toFixed(1)} N`, 10, H - 30);
    ctx.fillText(`H_jump = v²/(2g) = ${jumpV}²/(2·${p.g.toFixed(2)}) = ${(jumpV * jumpV / (2 * p.g)).toFixed(2)} m`, 10, H - 12);

    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, W, H - 50);
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⏸ PAUSIERT', W / 2, H / 2); ctx.textAlign = 'start';
    }
  }

  function start() { ballY = 0; ballVel = jumpV; t = 0; running = true; step(); }
  function reset() { running = false; paused = false; cancelAnimationFrame(animFrame); ballY = 0; ballVel = 0; t = 0; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-3 justify-center mb-4">
    <button onclick={start} disabled={running&&!paused} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors disabled:opacity-50">▶ Start</button>
    <button onclick={()=>paused=!paused} disabled={!running} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors disabled:opacity-50">{paused?'▶ Weiter':'⏸ Pause'}</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
    <label class="flex flex-col gap-1"><span class="text-sm text-yellow-400">Masse: {mass} kg</span><input type="range" min="10" max="200" step="5" bind:value={mass} oninput={()=>draw()} class="accent-yellow-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-blue-400">Sprung v₀: {jumpV} m/s</span><input type="range" min="1" max="10" step="0.5" bind:value={jumpV} oninput={reset} class="accent-blue-500" /></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Planet</span><select bind:value={selectedPlanet} onchange={reset} class="bg-slate-700 rounded px-2 py-1 text-sm">{#each planets as p, i}<option value={i}>{p.name}</option>{/each}</select></label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
