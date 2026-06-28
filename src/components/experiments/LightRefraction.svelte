<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let incidentAngle = $state(30);
  let n1 = $state(1.0);
  let n2 = $state(1.5);

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);
    const midY = h / 2 - 30;
    const midX = w / 2;

    // Media
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, midY);
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, midY, w, h - midY);

    // Interface & normal
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#64748b';
    ctx.beginPath(); ctx.moveTo(midX, 0); ctx.lineTo(midX, h - 100); ctx.stroke();
    ctx.setLineDash([]);

    const radI = (incidentAngle * Math.PI) / 180;
    const sinR = (n1 / n2) * Math.sin(radI);
    const tir = Math.abs(sinR) > 1;
    const radR = tir ? 0 : Math.asin(sinR);

    const rayLen = 150;

    // Incident ray
    const ix = midX - rayLen * Math.sin(radI);
    const iy = midY - rayLen * Math.cos(radI);
    ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(midX, midY);
    ctx.strokeStyle = '#eab308'; ctx.lineWidth = 3; ctx.stroke();
    drawArrow(ctx, ix, iy, midX, midY, '#eab308');

    // Refracted ray
    if (!tir) {
      const rx = midX + rayLen * Math.sin(radR);
      const ry = midY + rayLen * Math.cos(radR);
      ctx.beginPath(); ctx.moveTo(midX, midY); ctx.lineTo(rx, ry);
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3; ctx.stroke();
      drawArrow(ctx, midX, midY, rx, ry, '#f97316');
    }

    // Reflected ray
    const reflX = midX + rayLen * Math.sin(radI);
    const reflY = midY - rayLen * Math.cos(radI);
    ctx.beginPath(); ctx.moveTo(midX, midY); ctx.lineTo(reflX, reflY);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);

    // Angle arcs
    ctx.beginPath(); ctx.arc(midX, midY, 35, -Math.PI / 2, -Math.PI / 2 + radI);
    ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2; ctx.stroke();
    if (!tir) {
      ctx.beginPath(); ctx.arc(midX, midY, 35, Math.PI / 2 - radR, Math.PI / 2);
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2; ctx.stroke();
    }

    // Angle labels
    ctx.fillStyle = '#eab308'; ctx.font = '12px sans-serif';
    ctx.fillText(`θ₁=${incidentAngle}°`, midX + 45, midY - 40);
    if (!tir) {
      ctx.fillStyle = '#f97316';
      ctx.fillText(`θ₂=${(radR * 180 / Math.PI).toFixed(1)}°`, midX + 45, midY + 50);
    }

    // Medium labels
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';
    ctx.fillText(`n₁ = ${n1.toFixed(2)}`, 20, 25);
    ctx.fillText(`n₂ = ${n2.toFixed(2)}`, 20, midY + 25);

    // Formula panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(10, h - 100, 580, 90);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(10, h - 100, 580, 90);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Snellius-Gesetz: n₁ · sin(θ₁) = n₂ · sin(θ₂)', 20, h - 78);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${n1.toFixed(2)} × sin(${incidentAngle}°) = ${n2.toFixed(2)} × sin(θ₂)`, 20, h - 58);
    ctx.fillText(`${(n1 * Math.sin(radI)).toFixed(4)} = ${n2.toFixed(2)} × sin(θ₂)`, 20, h - 40);

    if (tir) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`⚠ Totalreflexion! sin(θ₂) = ${sinR.toFixed(3)} > 1 → nicht möglich`, 20, h - 20);
      const critAngle = Math.asin(n2 / n1) * 180 / Math.PI;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Grenzwinkel: θ_c = arcsin(n₂/n₁) = ${critAngle.toFixed(1)}°`, 320, h - 58);
    } else {
      ctx.fillStyle = '#10b981';
      ctx.fillText(`θ₂ = arcsin(${sinR.toFixed(4)}) = ${(radR * 180 / Math.PI).toFixed(1)}°`, 20, h - 20);
    }

    // Critical angle info
    if (n1 > n2) {
      const critAngle = Math.asin(n2 / n1) * 180 / Math.PI;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Grenzwinkel für Totalreflexion: ${critAngle.toFixed(1)}°`, 320, h - 20);
    }
  }

  function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
    const dx = x2 - x1, dy = y2 - y1;
    const mx = x1 + dx * 0.6, my = y1 + dy * 0.6;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx - 10 * Math.cos(angle - 0.4), my - 10 * Math.sin(angle - 0.4));
    ctx.lineTo(mx - 10 * Math.cos(angle + 0.4), my - 10 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); });
  $effect(() => { incidentAngle; n1; n2; draw(); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <p class="text-center text-xs text-slate-500 mb-3">Kein Pause nötig – Werte werden sofort bei Änderung angezeigt</p>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-yellow-400">Einfallswinkel θ₁: {incidentAngle}°</span>
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
