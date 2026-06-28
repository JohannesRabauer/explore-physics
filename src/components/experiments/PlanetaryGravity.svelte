<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let mass = $state(70);
  let planet = $state<string>('earth');
  let running = $state(false);
  let jumpVel = $state(0);
  let jumpY = $state(0);
  let t = $state(0);
  let maxHeight = $state(0);
  let animFrame: number;

  const planets: Record<string, { g: number; color: string; name: string; radius: number }> = {
    moon: { g: 1.62, color: '#9ca3af', name: 'Mond', radius: 30 },
    mars: { g: 3.72, color: '#dc2626', name: 'Mars', radius: 35 },
    earth: { g: 9.81, color: '#3b82f6', name: 'Erde', radius: 40 },
    jupiter: { g: 24.79, color: '#d97706', name: 'Jupiter', radius: 60 },
    sun: { g: 274, color: '#fbbf24', name: 'Sonne', radius: 70 },
  };

  const dt = 0.016;
  const jumpSpeed = 4.5; // typical human jump speed

  function step() {
    if (!running) return;
    t += dt;
    const pg = planets[planet].g;
    jumpVel -= pg * dt;
    jumpY += jumpVel * dt;
    if (jumpY <= 0) { jumpY = 0; jumpVel = 0; running = false; }
    if (jumpY > maxHeight) maxHeight = jumpY;
    draw();
    if (running) animFrame = requestAnimationFrame(step);
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    const p = planets[planet];
    const groundY = 320;

    // Planet surface
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(0, groundY, 600, 80);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(600, groundY);
    ctx.stroke();

    // Planet icon
    ctx.beginPath();
    ctx.arc(500, 100, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.4;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, 500, 105);
    ctx.textAlign = 'start';

    // Person (stick figure)
    const personY = groundY - jumpY * 80 - 60;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    // Head
    ctx.beginPath();
    ctx.arc(150, personY, 10, 0, Math.PI * 2);
    ctx.stroke();
    // Body
    ctx.beginPath();
    ctx.moveTo(150, personY + 10);
    ctx.lineTo(150, personY + 40);
    ctx.stroke();
    // Arms
    ctx.beginPath();
    ctx.moveTo(150, personY + 20);
    ctx.lineTo(135, personY + 35);
    ctx.moveTo(150, personY + 20);
    ctx.lineTo(165, personY + 35);
    ctx.stroke();
    // Legs
    ctx.beginPath();
    ctx.moveTo(150, personY + 40);
    ctx.lineTo(140, personY + 60);
    ctx.moveTo(150, personY + 40);
    ctx.lineTo(160, personY + 60);
    ctx.stroke();

    // Height indicator
    if (jumpY > 0 || maxHeight > 0) {
      const dispH = Math.max(jumpY, maxHeight);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(200, groundY);
      ctx.lineTo(200, groundY - dispH * 80);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#eab308';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${(maxHeight * 100).toFixed(0)} cm`, 210, groundY - dispH * 40);
    }

    // Weight comparison table
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Gewichtskraft auf verschiedenen Himmelskörpern:', 20, 30);
    let y = 50;
    Object.entries(planets).forEach(([key, pl]) => {
      const weight = mass * pl.g;
      const jumpH = (jumpSpeed * jumpSpeed) / (2 * pl.g);
      ctx.fillStyle = key === planet ? '#fff' : '#64748b';
      ctx.fillText(`${pl.name}: ${weight.toFixed(0)} N (Sprunghöhe: ${(jumpH * 100).toFixed(0)} cm)`, 30, y);
      y += 18;
    });

    // Current info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`g = ${p.g} m/s²`, 300, 360);
    ctx.fillText(`Gewicht: ${(mass * p.g).toFixed(0)} N`, 300, 380);
  }

  function jump() { running = true; jumpVel = jumpSpeed; maxHeight = 0; step(); }
  function reset() { running = false; cancelAnimationFrame(animFrame); jumpY = 0; jumpVel = 0; t = 0; maxHeight = 0; draw(); }

  onMount(() => { canvas.width = 600; canvas.height = 400; draw(); return () => cancelAnimationFrame(animFrame); });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas bind:this={canvas} class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4" style="aspect-ratio: 3/2;"></canvas>
  <div class="flex flex-wrap gap-4 justify-center mb-4">
    <button onclick={jump} class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">🦘 Springen!</button>
    <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">↺ Reset</button>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Körpermasse: {mass} kg</span>
      <input type="range" min="20" max="150" bind:value={mass} oninput={reset} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Planet</span>
      <select bind:value={planet} onchange={reset} class="bg-slate-700 rounded px-2 py-1 text-sm text-slate-200">
        <option value="moon">Mond</option>
        <option value="mars">Mars</option>
        <option value="earth">Erde</option>
        <option value="jupiter">Jupiter</option>
        <option value="sun">Sonne</option>
      </select>
    </label>
  </div>
</div>
