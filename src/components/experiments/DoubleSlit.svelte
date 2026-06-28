<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let slitDistance = $state(40);
  let wavelength = $state(20);
  let showParticles = $state(false);
  let particleCount = $state(0);
  let particles: { x: number; intensity: number }[] = $state([]);
  let animFrame: number;
  let t = $state(0);

  function intensityAt(x: number, screenDist: number): number {
    const d = slitDistance;
    const lambda = wavelength;
    const theta = Math.atan2(x, screenDist);
    const delta = (Math.PI * d * Math.sin(theta)) / lambda;
    return Math.cos(delta) ** 2;
  }

  function draw() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const w = 600, h = 400;
    ctx.clearRect(0, 0, w, h);

    const slitX = 150;
    const screenX = 500;
    const screenDist = screenX - slitX;

    // Source
    ctx.beginPath();
    ctx.arc(30, 200, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#6366f1';
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Quelle', 15, 230);

    // Barrier with slits
    ctx.fillStyle = '#374151';
    ctx.fillRect(slitX - 5, 0, 10, 200 - slitDistance / 2 - 5);
    ctx.fillRect(slitX - 5, 200 - slitDistance / 2 + 5, 10, slitDistance - 10);
    ctx.fillRect(slitX - 5, 200 + slitDistance / 2 + 5, 10, 200 - slitDistance / 2 - 5);

    // Wave animation from source to slits
    if (!showParticles) {
      for (let r = 20; r < slitX - 10; r += wavelength) {
        const phase = (r + t * 2) % (wavelength * 3);
        if (phase < wavelength) {
          ctx.beginPath();
          ctx.arc(30, 200, r, -Math.PI / 4, Math.PI / 4);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.5 * (1 - r / slitX)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Interference pattern (waves from two slits)
      for (let x = slitX + 10; x < screenX; x += 4) {
        for (let y = 50; y < 350; y += 4) {
          const d1 = Math.sqrt((x - slitX) ** 2 + (y - (200 - slitDistance / 2)) ** 2);
          const d2 = Math.sqrt((x - slitX) ** 2 + (y - (200 + slitDistance / 2)) ** 2);
          const phase1 = Math.sin((2 * Math.PI * d1) / wavelength - t * 3);
          const phase2 = Math.sin((2 * Math.PI * d2) / wavelength - t * 3);
          const amp = (phase1 + phase2) / 2;
          const alpha = Math.abs(amp) * 0.4;
          ctx.fillStyle = amp > 0 ? `rgba(99, 102, 241, ${alpha})` : `rgba(239, 68, 68, ${alpha * 0.5})`;
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    // Screen
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenX, 20, 30, 360);

    // Intensity pattern on screen
    for (let y = 20; y < 380; y++) {
      const yOffset = y - 200;
      const intensity = intensityAt(yOffset, screenDist);
      if (showParticles) {
        // Particle dots
      } else {
        ctx.fillStyle = `rgba(99, 102, 241, ${intensity})`;
        ctx.fillRect(screenX, y, 30, 1);
      }
    }

    // Particle hits
    if (showParticles) {
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(screenX + 15, 200 + p.x, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, 0.8)`;
        ctx.fill();
      });

      // Fire new particle randomly
      if (Math.random() < 0.1) {
        const yOff = (Math.random() - 0.5) * 300;
        const prob = intensityAt(yOff, screenDist);
        if (Math.random() < prob) {
          particles = [...particles.slice(-500), { x: yOff, intensity: prob }];
          particleCount++;
        }
      }
    }

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('Spalt 1', slitX - 30, 200 - slitDistance / 2 - 10);
    ctx.fillText('Spalt 2', slitX - 30, 200 + slitDistance / 2 + 20);
    ctx.fillText('Schirm', screenX + 5, 15);
    if (showParticles) ctx.fillText(`Teilchen: ${particleCount}`, 20, 380);

    t += 0.5;
    animFrame = requestAnimationFrame(draw);
  }

  function reset() {
    particles = [];
    particleCount = 0;
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

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Spaltabstand: {slitDistance}px</span>
      <input type="range" min="10" max="100" bind:value={slitDistance} class="accent-indigo-500" />
    </label>
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-400">Wellenlänge: {wavelength}px</span>
      <input type="range" min="5" max="50" bind:value={wavelength} class="accent-indigo-500" />
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" bind:checked={showParticles} onchange={reset} class="accent-indigo-500" />
      <span class="text-sm text-slate-400">Teilchen-Modus</span>
    </label>
    {#if showParticles}
      <button onclick={reset} class="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors text-sm">
        ↺ Reset Teilchen
      </button>
    {/if}
  </div>
</div>
