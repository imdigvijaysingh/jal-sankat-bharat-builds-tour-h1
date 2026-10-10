import { useEffect, useRef } from "react";

/**
 * AIBrain — a golden holographic "thinking" orb.
 *
 * Zero dependencies (React + <canvas>). Fills its parent element, so give the
 * parent a width/height. Place it on a dark background.
 *
 * Props
 *  - thinking     boolean  true = fast, pulsing, intense. false = calm idle.   (default true)
 *  - hue          number   HSL hue. 42 = gold, 190 = cyan, 280 = purple.       (default 42)
 *  - density      number   0.4 – 2. Particle multiplier (lower on weak GPUs).  (default 1)
 *  - interactive  boolean  Orb tilts toward the pointer.                       (default true)
 *  - className / style     Applied to the wrapper div.
 *
 * Usage
 *   <div style={{ width: 600, height: 400, background: "#03070d" }}>
 *     <AIBrain thinking={isLoading} />
 *   </div>
 */

const TAU = Math.PI * 2;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

function buildScene(density) {
  const d = Math.max(0.3, density);

  // Outer shell of particles (the fragmented sphere skin)
  const shell = Array.from({ length: Math.round(1100 * d) }, () => {
    const th = rand(0, TAU);
    const ph = Math.acos(rand(-1, 1));
    const rr = 0.9 + Math.pow(Math.random(), 3) * 0.16;
    return {
      x: Math.sin(ph) * Math.cos(th),
      y: Math.sin(ph) * Math.sin(th) * 0.92,
      z: Math.cos(ph),
      rr,
      size: rand(2.5, 9),
      ph: rand(0, TAU),
    };
  });

  // Neural links between nearby shell nodes
  const nodeCount = Math.min(shell.length, Math.round(220 * d));
  const links = [];
  const seen = new Set();
  for (let i = 0; i < nodeCount; i++) {
    const a = shell[i];
    const near = [];
    for (let j = 0; j < nodeCount; j++) {
      if (i === j) continue;
      const b = shell[j];
      const dd = (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
      near.push([dd, j]);
    }
    near.sort((p, q) => p[0] - q[0]);
    for (let k = 0; k < 2; k++) {
      const j = near[k][1];
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const b = shell[j];
      links.push({
        pts: [
          { x: a.x * a.rr, y: a.y * a.rr, z: a.z * a.rr },
          { x: b.x * b.rr, y: b.y * b.rr, z: b.z * b.rr },
        ],
      });
    }
  }

  // Orbit rings — tilted, with gaps, like the broken arcs in the reference
  const rings = Array.from({ length: 6 }, (_, i) => {
    const len = Math.round(150 * d);
    return {
      r: 0.5 + i * 0.1 + rand(0, 0.05),
      tx: rand(0, TAU),
      tz: rand(0, TAU),
      speed: rand(-0.5, 0.5),
      gapStart: rand(0, TAU),
      gapLen: rand(0.8, 2.4),
      pts: Array.from({ length: len }, (_, k) => ({
        a: (k / len) * TAU + rand(0, 0.03),
        s: rand(3, 8),
        j: rand(-0.03, 0.03),
      })),
    };
  });

  // Spokes: jagged filaments from the core out to the shell
  const spokes = Array.from({ length: 34 }, () => {
    const th = rand(0, TAU);
    const ph = Math.acos(rand(-1, 1));
    const dx = Math.sin(ph) * Math.cos(th);
    const dy = Math.sin(ph) * Math.sin(th) * 0.92;
    const dz = Math.cos(ph);
    const pts = [];
    const segs = 7;
    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const r = 0.12 + t * 0.9;
      const jit = s === 0 || s === segs ? 0 : 0.035;
      pts.push({
        x: dx * r + rand(-jit, jit),
        y: dy * r + rand(-jit, jit),
        z: dz * r + rand(-jit, jit),
      });
    }
    return { pts, phase: rand(0, TAU) };
  });

  // Core vortex particles
  const coreCount = Math.round(320 * d);
  const core = Array.from({ length: coreCount }, (_, i) => ({
    t: i / coreCount,
    jitter: rand(-0.012, 0.012),
    size: rand(0.7, 1.2),
  }));

  return { shell, links, rings, spokes, core };
}

function makeSprite(hue) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `hsla(${hue}, 100%, 88%, 1)`);
  grad.addColorStop(0.2, `hsla(${hue}, 100%, 62%, 0.85)`);
  grad.addColorStop(0.55, `hsla(${hue}, 100%, 48%, 0.25)`);
  grad.addColorStop(1, `hsla(${hue}, 100%, 40%, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

export default function AIBrain({
  thinking = true,
  hue = 42,
  density = 1,
  interactive = true,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);
  const thinkingRef = useRef(thinking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scene = buildScene(density);
    const sprite = makeSprite(hue);
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const speedScale = reduced ? 0.25 : 1;

    let w = 0, h = 0, dpr = 1, R = 0, cx = 0, cy = 0;
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let th = 0.25; // smoothed "thinking" intensity 0..1
    let rotY = rand(0, TAU);
    let mx = 0, my = 0, tmx = 0, tmy = 0; // pointer (smoothed / target)
    const pulses = [];
    const paths = [...scene.spokes.map((s) => s.pts), ...scene.links.map((l) => l.pts)];

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
      R = Math.min(w, h) * 0.36;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      tmx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      tmy = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    };
    if (interactive) window.addEventListener("pointermove", onMove);

    // --- projection helpers (reuse vars to avoid per-frame allocations) ---
    let X = 0, Y = 0, Z = 0;
    const rot = (x, y, z, cyw, syw, cxw, sxw) => {
      const x1 = x * cyw + z * syw;
      const z1 = -x * syw + z * cyw;
      X = x1;
      Y = y * cxw - z1 * sxw;
      Z = y * sxw + z1 * cxw;
    };
    const CAM = 3.2;
    const scale = (z) => CAM / (CAM - z);
    const depthAlpha = (z) => Math.max(0.12, Math.min(1, 0.55 + z * 0.5));

    const dot = (sx, sy, size, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, sx - size / 2, sy - size / 2, size, size);
    };

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05) * speedScale;
      last = now;
      time += dt;

      th += ((thinkingRef.current ? 1 : 0.25) - th) * Math.min(1, dt * 2.2);
      mx += (tmx - mx) * Math.min(1, dt * 3);
      my += (tmy - my) * Math.min(1, dt * 3);

      rotY += dt * (0.1 + 0.32 * th);
      const ay = rotY + mx * 0.5;
      const ax = 0.28 + my * 0.35;
      const cyw = Math.cos(ay), syw = Math.sin(ay);
      const cxw = Math.cos(ax), sxw = Math.sin(ax);

      // fade previous frame → motion trails (works on transparent bg too)
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // halo
      const breathe = 1 + Math.sin(time * 2.2) * 0.04 * th;
      const halo = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.5 * breathe);
      halo.addColorStop(0, `hsla(${hue},100%,55%,${0.1 + 0.14 * th})`);
      halo.addColorStop(0.6, `hsla(${hue},100%,45%,${0.03 + 0.04 * th})`);
      halo.addColorStop(1, `hsla(${hue},100%,40%,0)`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // ---- neural links (batched, faint) ----
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = `hsla(${hue},100%,60%,${0.1 + 0.1 * th})`;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      for (const l of scene.links) {
        rot(l.pts[0].x, l.pts[0].y, l.pts[0].z, cyw, syw, cxw, sxw);
        let s = scale(Z);
        const x0 = cx + X * R * s, y0 = cy + Y * R * s;
        rot(l.pts[1].x, l.pts[1].y, l.pts[1].z, cyw, syw, cxw, sxw);
        s = scale(Z);
        ctx.moveTo(x0, y0);
        ctx.lineTo(cx + X * R * s, cy + Y * R * s);
      }
      ctx.stroke();

      // ---- spokes (flickering filaments) ----
      ctx.lineWidth = 1;
      for (const sp of scene.spokes) {
        const flick = 0.45 + 0.55 * Math.sin(time * (1.5 + th * 2) + sp.phase);
        ctx.strokeStyle = `hsla(${hue},100%,62%,${(0.12 + 0.2 * th) * Math.max(0.15, flick)})`;
        ctx.beginPath();
        sp.pts.forEach((p, i) => {
          rot(p.x, p.y, p.z, cyw, syw, cxw, sxw);
          const s = scale(Z);
          const sx = cx + X * R * s, sy = cy + Y * R * s;
          i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        });
        ctx.stroke();
      }

      // ---- shell particles ----
      for (const p of scene.shell) {
        const k = p.rr * (1 + 0.03 * th * Math.sin(time * 2 + p.ph));
        rot(p.x * k, p.y * k, p.z * k, cyw, syw, cxw, sxw);
        const s = scale(Z);
        const tw = 0.6 + 0.4 * Math.sin(time * 3 + p.ph * 3);
        dot(cx + X * R * s, cy + Y * R * s, p.size * s * (R / 220) * (0.8 + 0.3 * th), depthAlpha(Z) * tw);
      }

      // ---- orbit rings ----
      for (const ring of scene.rings) {
        const ctz = Math.cos(ring.tz), stz = Math.sin(ring.tz);
        const ctx2 = Math.cos(ring.tx), stx = Math.sin(ring.tx);
        const spin = time * ring.speed * (0.6 + th);
        ctx.strokeStyle = `hsla(${hue},100%,60%,${0.1 + 0.1 * th})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        let pen = false;
        for (const pt of ring.pts) {
          const a = pt.a + spin;
          const gap = (((a - ring.gapStart) % TAU) + TAU) % TAU;
          if (gap < ring.gapLen) { pen = false; continue; }
          // local → tilted
          let x = Math.cos(a) * ring.r, y = Math.sin(a) * ring.r, z = pt.j;
          let y1 = y * ctx2 - z * stx, z1 = y * stx + z * ctx2;
          let x2 = x * ctz - y1 * stz, y2 = x * stz + y1 * ctz;
          rot(x2, y2, z1, cyw, syw, cxw, sxw);
          const s = scale(Z);
          const sx = cx + X * R * s, sy = cy + Y * R * s;
          pen ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
          pen = true;
          dot(sx, sy, pt.s * s * (R / 220), depthAlpha(Z) * 0.8);
        }
        ctx.stroke();
      }

      // ---- thought pulses travelling along filaments ----
      if (Math.random() < dt * (3 + 22 * th)) {
        pulses.push({ path: paths[(Math.random() * paths.length) | 0], t: 0, v: rand(0.5, 1.4) * (0.7 + th) });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += dt * p.v;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const segs = p.path.length - 1;
        const f = p.t * segs;
        const si = Math.min(segs - 1, Math.floor(f));
        const u = f - si;
        const A = p.path[si], B = p.path[si + 1];
        rot(A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u, A.z + (B.z - A.z) * u, cyw, syw, cxw, sxw);
        const s = scale(Z);
        const fade = Math.sin(p.t * Math.PI);
        dot(cx + X * R * s, cy + Y * R * s, 26 * s * (R / 220), fade * depthAlpha(Z) * 1.2);
      }

      // ---- core: glow + vortex + rings ----
      const ccy = Math.cos(mx * 0.3), csy = Math.sin(mx * 0.3);
      const ccx = Math.cos(my * 0.25), csx = Math.sin(my * 0.25);
      const pulse = 1 + Math.sin(time * 3.2) * 0.12 * th;
      dot(cx, cy, R * 0.75 * pulse, 0.45 + 0.4 * th);
      dot(cx, cy, R * 0.28 * pulse, 0.9);

      const spinCore = time * (1 + 2.4 * th);
      for (const c of scene.core) {
        const a = c.t * TAU * 5 + spinCore;
        const r = 0.015 + Math.pow(c.t, 1.1) * 0.26 + c.jitter;
        rot(Math.cos(a) * r, Math.sin(a) * r * 0.92, -(1 - c.t) * 0.3, ccy, csy, ccx, csx);
        const s = scale(Z);
        const size = (3 + (1 - c.t) * 11) * c.size * (0.85 + 0.35 * th) * (R / 220);
        dot(cx + X * R * s, cy + Y * R * s, size, 0.35 + (1 - c.t) * 0.6);
      }

      ctx.globalAlpha = 1;
      for (let k = 0; k < 3; k++) {
        const rr = R * (0.15 + k * 0.075) * pulse;
        ctx.strokeStyle = `hsla(${hue},100%,${70 - k * 6}%,${0.4 + 0.3 * th})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5 + k * 9, 4 + k * 7]);
        ctx.lineDashOffset = -time * (24 + k * 16) * (k % 2 ? 1 : -1);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr, rr * 0.92, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [hue, density, interactive]);

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
