<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let incidentAngle = $state(30);
  let n1 = $state(1.0);
  let n2 = $state(1.5);
  let animFrame: number;

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);

    const midY = h / 2;
    const midX = w / 2;

    // Media
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, midY);
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, midY, w, midY);

    // Interface line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    // Normal (dashed)
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, h);
    ctx.stroke();
    ctx.setLineDash([]);

    const radIncident = (incidentAngle * Math.PI) / 180;
    const sinRefracted = (n1 / n2) * Math.sin(radIncident);
    const totalInternalReflection = Math.abs(sinRefracted) > 1;
    const radRefracted = totalInternalReflection ? 0 : Math.asin(sinRefracted);

    // Incident ray
    const rayLen = 180;
    const ix = midX - rayLen * Math.sin(radIncident);
    const iy = midY - rayLen * Math.cos(radIncident);
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(midX, midY);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Arrow on incident
    drawArrow(ctx, ix, iy, midX, midY, '#eab308');

    // Refracted ray
    if (!totalInternalReflection) {
      const rx = midX + rayLen * Math.sin(radRefracted);
      const ry = midY + rayLen * Math.cos(radRefracted);
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(rx, ry);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.stroke();
      drawArrow(ctx, midX, midY, rx, ry, '#f97316');
    }

    // Reflected ray
    const reflX = midX + rayLen * Math.sin(radIncident);
    const reflY = midY - rayLen * Math.cos(radIncident);
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(reflX, reflY);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Angle arcs
    ctx.beginPath();
    ctx.arc(midX, midY, 40, -Math.PI / 2, -Math.PI / 2 + radIncident);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (!totalInternalReflection) {
      ctx.beginPath();
      ctx.arc(midX, midY, 40, Math.PI / 2 - radRefracted, Math.PI / 2);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`n₁ = ${n1.toFixed(2)} (${n1 === 1 ? 'Luft' : 'Medium 1'})`, 20, 30);
    ctx.fillText(`n₂ = ${n2.toFixed(2)} (${n2 === 1.5 ? 'Glas' : 'Medium 2'})`, 20, midY + 30);
    ctx.fillText(`θ₁ = ${incidentAngle}°`, midX + 50, midY - 50);
    if (!totalInternalReflection) {
      ctx.fillText(`θ₂ = ${(radRefracted * 180 / Math.PI).toFixed(1)}°`, midX + 50, midY + 60);
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('Totalreflexion!', midX + 50, midY + 60);
    }
  }

  function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const mx = x1 + dx * 0.6;
    const my = y1 + dy * 0.6;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx - 10 * Math.cos(angle - 0.4), my - 10 * Math.sin(angle - 0.4));
    ctx.lineTo(mx - 10 * Math.cos(angle + 0.4), my - 10 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  onMount(() => {
    canvas.width = 600;
    canvas.height = 400;
    draw();
  });

  $effect(() => {
    incidentAngle; n1; n2;
    draw();
  });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>

  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Einfallswinkel: {incidentAngle}°</span>
      <input type="range" min="0" max="89" bind:value={incidentAngle} class="accent-yellow-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">n₁: {n1.toFixed(2)}</span>
      <input type="range" min="1.0" max="2.5" step="0.05" bind:value={n1} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">n₂: {n2.toFixed(2)}</span>
      <input type="range" min="1.0" max="2.5" step="0.05" bind:value={n2} class="accent-indigo-500" />
    </label>
  </div>
</div>
