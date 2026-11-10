import { useEffect, useRef, useState } from "react";

type Pt = [number, number];

interface State {
  type: string;
  points?: Pt[];
  line?: number;
  delta?: number | null;
  strip?: Pt[];
  a?: Pt;
  b?: Pt;
  d?: number;
  best?: (Pt | null)[];
}

export interface RunResult {
  answer: { points: Pt[]; distance: number };
  steps: { stepNo: number; state: State }[];
}

interface Props {
  rows: unknown[];
  result: RunResult;
  onMoveToResult?: () => void; 
}

const H = 480;
const PAD = 40;

const note = (s: State) => {
  const f = (n?: number | null) => (typeof n === "number" && isFinite(n) ? n.toFixed(2) : "—");
  switch (s.type) {
    case "base":
      return `Base case: brute force on ${s.points?.length ?? 0} points`;
    case "divide":
      return `Divide: split ${s.points?.length ?? 0} points at x = ${s.line}`;
    case "merge":
      return `Merge: both halves solved, δ = ${f(s.delta)}`;
    case "strip":
      return `Strip: ${s.strip?.length ?? 0} points within δ = ${f(s.delta)} of x = ${s.line}`;
    case "compare":
      return `Compare: distance ${f(s.d)} (best δ = ${f(s.delta)})`;
    case "done":
      return `Done: closest distance ${f(s.delta)}`;
    default:
      return s.type;
  }
};

export default function Visualizer({ rows, result, onMoveToResult }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [w, setW] = useState(800);
  const [i, setI] = useState(0);

  const steps = result.steps;
  const last = steps.length - 1;
  const next = () => setI((p) => Math.min(p + 1, last));
  const back = () => setI((p) => Math.max(p - 1, 0));

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((p) => Math.min(p + 1, last));
      if (e.key === "ArrowLeft") setI((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [last]);

  useEffect(() => {
    const c = canvas.current;
    const st = steps[i]?.state;
    if (!c || !st) return;

    const dpr = window.devicePixelRatio || 1;
    c.width = w * dpr;
    c.height = H * dpr;
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);

    const css = getComputedStyle(document.documentElement);
    const col = (name: string, fallback: string) =>
      css.getPropertyValue(name).trim() || fallback;
    const ink = col("--color-ink", "#1b1b1b");
    const forest = col("--color-forest", "#1f6b4a");
    const clay = col("--color-clay", "#b5573a");
    const mute = col("--color-mute", "#9a9a9a");
    const rule = col("--color-rule", "#d6d6d6");

    const pts: Pt[] = rows.map((r) => {
      const [x, y] = r as (string | number)[];
      return [Number(x), Number(y)];
    });
    const minX = Math.min(...pts.map((p) => p[0]));
    const maxX = Math.max(...pts.map((p) => p[0]));
    const minY = Math.min(...pts.map((p) => p[1]));
    const maxY = Math.max(...pts.map((p) => p[1]));
    const sc = Math.min(
      (w - 2 * PAD) / (maxX - minX || 1),
      (H - 2 * PAD) / (maxY - minY || 1)
    );
    const ox = (w - (maxX - minX) * sc) / 2;
    const oy = (H - (maxY - minY) * sc) / 2;
    const X = (x: number) => ox + (x - minX) * sc;
    const Y = (y: number) => H - oy - (y - minY) * sc; 

    const dot = (p: Pt, r: number, color: string) => {
      g.beginPath();
      g.arc(X(p[0]), Y(p[1]), r, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
    };
    const seg = (a: Pt, b: Pt, color: string, width: number) => {
      g.beginPath();
      g.moveTo(X(a[0]), Y(a[1]));
      g.lineTo(X(b[0]), Y(b[1]));
      g.strokeStyle = color;
      g.lineWidth = width;
      g.stroke();
    };

    g.clearRect(0, 0, w, H);

    g.strokeStyle = rule;
    g.lineWidth = 1;
    g.strokeRect(X(minX), Y(maxY), (maxX - minX) * sc, (maxY - minY) * sc);
    g.fillStyle = mute;
    g.font = "11px monospace";
    g.textAlign = "center";
    g.fillText(String(minX), X(minX), Y(minY) + 16);
    g.fillText(String(maxX), X(maxX), Y(minY) + 16);
    g.textAlign = "right";
    g.fillText(String(minY), X(minX) - 6, Y(minY));
    g.fillText(String(maxY), X(minX) - 6, Y(maxY) + 10);

    if (st.points && st.points.length) {
      const x0 = Math.min(...st.points.map((p) => p[0]));
      const x1 = Math.max(...st.points.map((p) => p[0]));
      g.globalAlpha = 0.08;
      g.fillStyle = forest;
      g.fillRect(X(x0), Y(maxY), (x1 - x0) * sc, (maxY - minY) * sc);
      g.globalAlpha = 1;
    }

    if (st.line != null && typeof st.delta === "number" && isFinite(st.delta)) {
      g.globalAlpha = 0.14;
      g.fillStyle = clay;
      g.fillRect(X(st.line - st.delta), Y(maxY), 2 * st.delta * sc, (maxY - minY) * sc);
      g.globalAlpha = 1;
    }

    if (st.line != null) {
      g.setLineDash([6, 4]);
      g.strokeStyle = ink;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(X(st.line), Y(maxY));
      g.lineTo(X(st.line), Y(minY));
      g.stroke();
      g.setLineDash([]);
    }

    pts.forEach((p) => dot(p, 2.5, mute));
    st.points?.forEach((p) => dot(p, 3.5, ink));
    st.strip?.forEach((p) => dot(p, 4.5, clay));

    const [b1, b2] = st.best ?? [];
    if (b1 && b2) {
      seg(b1, b2, forest, 3);
      dot(b1, st.type === "done" ? 7 : 5, forest);
      dot(b2, st.type === "done" ? 7 : 5, forest);
    }

    if (st.a && st.b) {
      seg(st.a, st.b, clay, 2);
      dot(st.a, 5, clay);
      dot(st.b, 5, clay);
    }
  }, [i, w, rows, steps]);

  if (!steps.length) return null;
  const st = steps[i].state;

  const btn =
    "cursor-pointer rounded-sm border border-ink px-4 py-1.5 font-ui text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-surface disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="overflow-hidden rounded-md border border-rule bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-rule-soft p-5">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-ink-2 uppercase">
          Simulation
        </p>
        <button className={btn} onClick={back} disabled={i === 0}>
          Back
        </button>
        <button className={btn} onClick={next} disabled={i === last}>
          Next
        </button>
        <span className="font-mono text-sm text-ink">
          {i + 1} / {steps.length}
        </span>
        <button
          className="ml-auto cursor-pointer rounded-sm bg-forest px-4 py-1.5 font-ui text-sm font-semibold text-surface transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => {
            setI(last);
            onMoveToResult?.();
          }}
        >
          Move to result
        </button>
      </div>

      <div ref={wrap} className="w-full">
        <canvas ref={canvas} style={{ width: "100%", height: H, display: "block" }} />
      </div>

      <div className="border-t border-rule-soft p-5 font-mono text-[14px] text-ink">
        <p>{note(st)}</p>
        {i === last && (
          <p className="mt-2 text-forest">
            Closest pair: ({result.answer.points[0].join(", ")}) and (
            {result.answer.points[1].join(", ")}) · distance{" "}
            {result.answer.distance.toFixed(3)}
          </p>
        )}
      </div>
    </div>
  );
}
