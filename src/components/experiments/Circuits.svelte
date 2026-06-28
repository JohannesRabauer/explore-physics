<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let running = $state(false);
  let paused = $state(false);
  let simSpeed = $state(1);
  let voltage = $state(9);
  let resistance = $state(100);
  let switchClosed = $state(true);
  let t = $state(0);
  let animFrame: number;

  function getPointOnPath(path: { x: number; y: number }[], progress: number) {
    const totalLen = path.reduce((sum, p, i) => {
      if (i === 0) return 0;
      const dx = p.x - path[i - 1].x, dy = p.y - path[i - 1].y;
      return sum + Math.sqrt(dx * dx + dy * dy);
    }, 0);
    let target = progress * totalLen;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x, dy = path[i].y - path[i - 1].y;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (target <= segLen) { const r = target / segLen; return { x: path[i-1].x + dx*r, y: path[i-1].y + dy*r }; }
      target -= segLen;
    }
    return path[path.length - 1];
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);

    const current = switchClosed ? voltage / resistance : 0;
    const power = voltage * current;
    const brightness = Math.min(1, current / 0.1);

    const path = [
      { x: 100, y: 280 }, { x: 100, y: 80 }, { x: 500, y: 80 },
      { x: 500, y: 280 }, { x: 350, y: 280 }, { x: 250, y: 280 }, { x: 100, y: 280 },
    ];

    // Wires
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Electrons
    if (switchClosed && current > 0) {
      for (let i = 0; i < 12; i++) {
        const progress = ((t * current * 20 + i / 12) % 1);
        const pos = getPointOnPath(path, progress);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      }
    }

    // Battery
    ctx.fillStyle = '#64748b';
    ctx.fillRect(80, 250, 40, 60);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(90, 240, 8, 15);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(102, 245, 8, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${voltage}V`, 85, 290);

    // Resistor
    ctx.beginPath();
    ctx.moveTo(200, 80);
    for (let i = 0; i < 6; i++) ctx.lineTo(220 + i * 20, 80 + (i % 2 === 0 ? -15 : 15));
    ctx.lineTo(360, 80);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${resistance}Ω`, 265, 60);

    // Bulb
    ctx.beginPath();
    ctx.arc(500, 180, 25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(234, 179, 8, ${brightness})`;
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Switch
    const sx = 300, sy = 280;
    ctx.beginPath(); ctx.arc(sx - 25, sy, 5, 0, Math.PI * 2); ctx.fillStyle = '#94a3b8'; ctx.fill();
    ctx.beginPath(); ctx.arc(sx + 25, sy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    if (switchClosed) { ctx.moveTo(sx - 25, sy); ctx.lineTo(sx + 25, sy); ctx.strokeStyle = '#10b981'; }
    else { ctx.moveTo(sx - 25, sy); ctx.lineTo(sx + 10, sy - 20); ctx.strokeStyle = '#ef4444'; }
    ctx.lineWidth = 3; ctx.stroke();

    // Measurements always visible
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Spannung U = ${voltage} V`, 20, 25);
    ctx.fillText(`Widerstand R = ${resistance} Ω`, 20, 45);
    ctx.fillText(`Strom I = ${(current * 1000).toFixed(1)} mA`, 250, 25);
    ctx.fillText(`Leistung P = ${(power * 1000).toFixed(1)} mW`, 250, 45);

    // Paused
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(200, 55, 200, 35);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⏸ PAUSIERT', 300, 78);
      ctx.textAlign = 'start';
    }

    // Formula panel
    ctx.fillStyle = 'rgba(15,23,42,0.9)';
    ctx.fillRect(0, h - 55, w, 55);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(`I = U / R = ${voltage} / ${resistance} = ${current.toFixed(4)} A  (${(current*1000).toFixed(1)} mA)`, 15, h - 35);
    ctx.fillText(`P = U · I = ${voltage} · ${current.toFixed(4)} = ${power.toFixed(4)} W  (${(power*1000).toFixed(1)} mW)`, 15, h - 15);
  }

  function step() {
    if (!running) return;
    if (!paused) t += 0.016 * simSpeed;
    draw();
    animFrame = requestAnimationFrame(step);
  }

  function start() { running = true; paused = false; step(); }
  function reset() { running = false; paused = false; cancelAnimationFrame(animFrame); t = 0; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; running = true; step(); return () => cancelAnimationFrame(animFrame); });
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
      <span class="text-sm text-red-400">Spannung: {voltage}V</span>
      <input type="range" min="1" max="24" bind:value={voltage} class="accent-red-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-yellow-400">Widerstand: {resistance}Ω</span>
      <input type="range" min="10" max="1000" step="10" bind:value={resistance} class="accent-yellow-500" />
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={switchClosed} class="accent-green-500" />
      <span class="text-sm text-slate-400">Schalter {switchClosed ? 'AN' : 'AUS'}</span>
    </label>
    <label class="flex flex-col gap-1"><span class="text-sm text-slate-400">Tempo: {simSpeed===0.25?'¼×':simSpeed===0.5?'½×':simSpeed===1?'1×':'2×'}</span><input type="range" min="0.25" max="2" step="0.25" bind:value={simSpeed} class="accent-indigo-500" /></label>
  </div>
</div>
