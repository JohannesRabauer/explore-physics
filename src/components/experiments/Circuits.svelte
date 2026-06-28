<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let voltage = $state(9);
  let resistance = $state(100);
  let switchClosed = $state(true);
  let t = $state(0);
  let animFrame: number;

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);

    const current = switchClosed ? voltage / resistance : 0;
    const brightness = Math.min(1, current / 0.1);

    // Circuit path
    const path = [
      { x: 100, y: 300 }, { x: 100, y: 100 }, { x: 500, y: 100 },
      { x: 500, y: 300 }, { x: 350, y: 300 }, { x: 250, y: 300 }, { x: 100, y: 300 },
    ];

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Electron flow animation
    if (switchClosed && current > 0) {
      const numElectrons = 12;
      for (let i = 0; i < numElectrons; i++) {
        const progress = ((t * current * 20 + i * (1 / numElectrons)) % 1);
        const pos = getPointOnPath(path, progress);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      }
    }

    // Battery
    ctx.fillStyle = '#64748b';
    ctx.fillRect(80, 270, 40, 60);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(90, 260, 8, 15);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(102, 265, 8, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${voltage}V`, 85, 310);

    // Resistor (zigzag)
    ctx.beginPath();
    ctx.moveTo(200, 100);
    for (let i = 0; i < 6; i++) {
      const x = 220 + i * 20;
      const y = 100 + (i % 2 === 0 ? -15 : 15);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(360, 100);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${resistance}Ω`, 265, 80);

    // Light bulb
    ctx.beginPath();
    ctx.arc(500, 200, 25, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(234, 179, 8, ${brightness})`;
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (brightness > 0.1) {
      ctx.shadowBlur = 20 * brightness;
      ctx.shadowColor = '#eab308';
      ctx.beginPath();
      ctx.arc(500, 200, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Switch
    const switchX = 300, switchY = 300;
    ctx.beginPath();
    ctx.arc(switchX - 25, switchY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
    if (switchClosed) {
      ctx.beginPath();
      ctx.moveTo(switchX - 25, switchY);
      ctx.lineTo(switchX + 25, switchY);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(switchX - 25, switchY);
      ctx.lineTo(switchX + 10, switchY - 20);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(switchX + 25, switchY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();

    // Info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Strom: ${(current * 1000).toFixed(1)} mA`, 20, 30);
    ctx.fillText(`Leistung: ${(voltage * current * 1000).toFixed(1)} mW`, 20, 50);

    t += 0.016;
    animFrame = requestAnimationFrame(draw);
  }

  function getPointOnPath(path: { x: number; y: number }[], progress: number) {
    const totalLen = path.reduce((sum, p, i) => {
      if (i === 0) return 0;
      const dx = p.x - path[i - 1].x;
      const dy = p.y - path[i - 1].y;
      return sum + Math.sqrt(dx * dx + dy * dy);
    }, 0);
    let target = progress * totalLen;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (target <= segLen) {
        const ratio = target / segLen;
        return { x: path[i - 1].x + dx * ratio, y: path[i - 1].y + dy * ratio };
      }
      target -= segLen;
    }
    return path[path.length - 1];
  }

  onMount(() => {
    canvas.width = 600;
    canvas.height = 400;
    draw();
    return () => cancelAnimationFrame(animFrame);
  });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Spannung: {voltage}V</span>
      <input type="range" min="1" max="24" bind:value={voltage} class="accent-red-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Widerstand: {resistance}Ω</span>
      <input type="range" min="10" max="1000" step="10" bind:value={resistance} class="accent-yellow-500" />
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={switchClosed} class="accent-green-500" />
      <span class="text-sm text-slate-400">Schalter {switchClosed ? 'AN' : 'AUS'}</span>
    </label>
  </div>
</div>
