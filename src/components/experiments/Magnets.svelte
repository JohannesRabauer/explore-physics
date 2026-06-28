<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let magnetX = $state(200);
  let magnetY = $state(200);
  let dragging = $state(false);
  let polarity = $state<'attract' | 'repel'>('attract');

  const fixedMagnet = { x: 400, y: 200 };
  const particleCount = 80;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
  }

  let particles: Particle[] = [];
  let animFrame: number;

  function initParticles() {
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * 600,
      y: Math.random() * 400,
      vx: 0,
      vy: 0,
    }));
  }

  function getForce(px: number, py: number, mx: number, my: number, sign: number) {
    const dx = mx - px;
    const dy = my - py;
    const dist = Math.sqrt(dx * dx + dy * dy) + 10;
    const strength = (sign * 500) / (dist * dist);
    return { fx: strength * (dx / dist), fy: strength * (dy / dist) };
  }

  function step() {
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 600, 400);

    const sign = polarity === 'attract' ? 1 : -1;

    // Update particles (field lines)
    particles.forEach((p) => {
      const f1 = getForce(p.x, p.y, magnetX, magnetY, 1);
      const f2 = getForce(p.x, p.y, fixedMagnet.x, fixedMagnet.y, sign);
      p.vx = (f1.fx + f2.fx) * 2;
      p.vy = (f1.fy + f2.fy) * 2;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > 600 || p.y < 0 || p.y > 400) {
        p.x = Math.random() * 600;
        p.y = Math.random() * 400;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${Math.min(1, 1 / (Math.abs(p.vx) + Math.abs(p.vy) + 0.5))})`;
      ctx.fill();
    });

    // Draw magnets
    drawMagnet(ctx, magnetX, magnetY, 'N', '#ef4444');
    drawMagnet(ctx, fixedMagnet.x, fixedMagnet.y, polarity === 'attract' ? 'S' : 'N', polarity === 'attract' ? '#3b82f6' : '#ef4444');

    // Force indicator
    const dx = fixedMagnet.x - magnetX;
    const dy = fixedMagnet.y - magnetY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const force = (1000 / (dist * dist)) * 100;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Kraft: ${force.toFixed(1)} N (relativ)`, 20, 380);
    ctx.fillText(`Abstand: ${(dist / 2).toFixed(0)} cm`, 20, 360);

    animFrame = requestAnimationFrame(step);
  }

  function drawMagnet(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color: string) {
    ctx.beginPath();
    ctx.roundRect(x - 30, y - 15, 60, 30, 8);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 6);
    ctx.textAlign = 'start';
  }

  function handleMouseDown(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    if (Math.abs(x - magnetX) < 35 && Math.abs(y - magnetY) < 20) {
      dragging = true;
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    magnetX = Math.max(30, Math.min(570, (e.clientX - rect.left) * (600 / rect.width)));
    magnetY = Math.max(15, Math.min(385, (e.clientY - rect.top) * (400 / rect.height)));
  }

  function handleMouseUp() {
    dragging = false;
  }

  onMount(() => {
    canvas.width = 600;
    canvas.height = 400;
    initParticles();
    step();
    return () => cancelAnimationFrame(animFrame);
  });
</script>

<div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
  <canvas
    bind:this={canvas}
    class="w-full max-w-[600px] mx-auto block rounded-lg bg-slate-900 mb-4 cursor-grab"
    style="aspect-ratio: 3/2;"
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
  ></canvas>

  <div class="flex gap-4 justify-center">
    <button
      onclick={() => polarity = 'attract'}
      class={`px-4 py-2 rounded-lg font-medium transition-colors ${polarity === 'attract' ? 'bg-indigo-600' : 'bg-slate-600 hover:bg-slate-500'}`}
    >
      Anziehung (N↔S)
    </button>
    <button
      onclick={() => polarity = 'repel'}
      class={`px-4 py-2 rounded-lg font-medium transition-colors ${polarity === 'repel' ? 'bg-indigo-600' : 'bg-slate-600 hover:bg-slate-500'}`}
    >
      Abstoßung (N↔N)
    </button>
  </div>
  <p class="text-center text-sm text-slate-400 mt-3">Ziehe den roten Magneten mit der Maus!</p>
</div>
