import { useEffect, useState } from "react";
import Visualizer,{type RunResult} from "./Visualizer";
import Results, { type Entry } from "./Results";interface AlgosProps {
  name: boolean;
}

interface FileInfo {
  name: string;
  size: number;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatAnswer = (a: unknown): string => {
  if (typeof a === "string" || typeof a === "number" || typeof a === "bigint") return String(a);
  if (a && typeof a === "object") {
    const o = a as Record<string, unknown>;
    for (const k of ["product", "result", "answer", "value"]) {
      const v = o[k];
      if (typeof v === "string" || typeof v === "number" || typeof v === "bigint") return String(v);
    }
  }
  return JSON.stringify(a, null, 2) ?? String(a);
};

export default function Algos({ name }: AlgosProps) {
  const algo = name ? "closedPair" : "integerMultiplication";
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadId, setLoadId] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [points, setPoints] = useState<unknown[]>([]);
  const [busy, setBusy] = useState(false);
  const locked = selected !== null;
  const [trace, setTrace] = useState<RunResult | null>(null);
  const [movedToResult, setMovedToResult] = useState(false);



const [entries, setEntries] = useState<Entry[]>(() => {
  try {
    return JSON.parse(localStorage.getItem("algoResults") ?? "[]");
  } catch {
    return [];
  }
});

useEffect(() => {
  try {
    localStorage.setItem("algoResults", JSON.stringify(entries));
  } catch {}
}, [entries]);

  const API = "http://localhost:8000";

  const post = (path: string, body: object) =>
    fetch(`${API}/api/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());

  const refresh = () =>
    fetch(`${API}/api/files?algo=${algo}`)
      .then((r) => r.json())
      .then((d) => setFiles(d.files ?? []));

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const clearLoad = () => {
    setSelected(null);
    setLoadId(null);
    setSummary("");
    setPoints([]);
    setTrace(null);       
      setMovedToResult(false);  
  };

 useEffect(() => {
  clearLoad();
  refresh();
}, [algo]);

  const onRefresh = () =>
    run(async () => {
      clearLoad();
      await refresh();
    });

  const generate = () =>
    run(async () => {
      const d = await post("generate", { algo });
      setFiles(d.files);
    });

  const load = () =>
    run(async () => {
      const d = await post("load", { algo, file: selected });
      setLoadId(d.loadId);
      setSummary(d.summary);
      setPoints(d.points ?? []);
    });

    const start = () =>
    run(async () => {
      try {
        const stepsArray=await post("start", { algo, loadId});
        setTrace(stepsArray); 
      } catch (err) {
        console.log(err)
      }
    });

  const remove = () => clearLoad();

  const loadedFile = loadId ? files.find((f) => f.name === selected) : undefined;
  const content = points
    .map((p) => (typeof p === "string" ? p : JSON.stringify(p)))
    .join("\n");


    const title = name ? "closedPair" : "integerMultiplication";

const buildFields = (t: RunResult): [string, string][] => {
  if (algo === "closedPair") {
    const [p, q] = t.answer.points;
    return [
      ["Result", `(${p.join(", ")}) and (${q.join(", ")})`],
      ["Min distance", t.answer.distance.toFixed(3)],
      ["Points", summary],
      ["Steps", String(t.steps.length)],
    ];
  }
  else if(algo=="integerMultiplication"){
    return[
        ["Answer", formatAnswer(t.answer)]
    ]
  }
  return [["Results","Done"]]
};

const moveToResult = () => {
  if (movedToResult || !trace || !selected) return;
  setEntries((e) => [
    ...e,
    {
      id: Date.now(),
      time: new Date().toLocaleString(),
      algo: title,
      file: selected,
      fields: buildFields(trace),
    },
  ]);
  setMovedToResult(true);
};

const algoEntries = entries.filter((e) => e.algo === title);
const clearEntries = () => setEntries((all) => all.filter((e) => e.algo !== title));

  return (
    <div className="min-h-screen bg-paper p-10 font-ui text-ink sm:p-20">
      <h2 className="mx-auto w-[calc(100%-3rem)] max-w-5xl text-center font-display text-[length:clamp(2rem,4vw,3rem)] leading-[1.05] font-bold tracking-tight text-ink after:mt-14 after:block after:border-t after:border-ink after:content-['']">
        {name ? "Closest Pair of Points" : "Integer Multiplication"}
      </h2>

      <div className="mx-auto mt-12 mb-10 grid w-[calc(100%-3rem)] max-w-5xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-4 overflow-hidden rounded-md border border-rule bg-surface p-5 before:font-mono before:text-xs before:font-medium before:tracking-[0.14em] before:text-ink-2 before:uppercase before:content-['Files']">
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={busy}
            className="cursor-pointer rounded-sm border border-ink px-5 py-2.5 font-ui text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={generate}
            disabled={locked || busy}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-sm bg-forest px-5 py-2.5 font-ui text-sm font-semibold text-surface shadow-sm transition-all hover:-translate-y-0.5 hover:bg-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-rule disabled:text-mute disabled:shadow-none"
          >
            Generate
          </button>
        </div>

        <ul className="col-span-2 -mx-5 -mb-5 max-h-[26rem] min-h-56 divide-y divide-rule-soft overflow-y-auto border-t border-rule-soft font-ui empty:flex empty:items-center empty:justify-center empty:before:text-sm empty:before:text-mute empty:before:content-['No_files_yet._Press_Generate_to_create_one.']">
          {files.map((f) => {
            const isSelected = selected === f.name;
            return (
              <li
                key={f.name}
                className={`flex items-center gap-3 px-5 py-4 font-mono text-[15px] transition-colors [&>button:first-of-type]:ml-auto ${
                  isSelected ? "bg-forest-soft text-ink" : locked ? "text-mute" : "text-ink"
                }`}
              >
                {f.name}
                {!isSelected ? (
                  <button
                    onClick={() => setSelected(f.name)}
                    disabled={locked}
                    className="cursor-pointer font-ui text-sm font-semibold text-forest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest disabled:cursor-not-allowed disabled:text-mute disabled:no-underline"
                  >
                    Select
                  </button>
                ) : loadId ? (
                  <button
                    disabled
                    className="cursor-default rounded-sm bg-surface px-4 py-1.5 font-ui text-sm font-semibold text-forest before:content-['✓_']"
                  >
                    Loaded
                  </button>
                ) : (
                  <>
                    <button
                      onClick={load}
                      disabled={busy}
                      className="cursor-pointer rounded-sm bg-forest px-4 py-1.5 font-ui text-sm font-semibold text-surface transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      disabled={busy}
                      className="cursor-pointer font-ui text-sm font-semibold text-ink-2 underline-offset-4 hover:text-clay hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {loadId && selected && (
        <div className="mx-auto mb-20 w-[calc(100%-3rem)] max-w-5xl overflow-hidden rounded-md border border-rule bg-surface">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-rule-soft p-5">
            <p className="font-mono text-xs font-medium tracking-[0.14em] text-ink-2 uppercase">
              Status
            </p>

            <div className="flex min-w-0 flex-col">
              <span className="font-mono text-[11px] tracking-[0.12em] text-mute uppercase">
                Loaded file
              </span>
              <span className="truncate font-mono text-[15px] text-ink">{selected}</span>
            </div>

            <div className="flex flex-col">
              <span className="font-mono text-[11px] tracking-[0.12em] text-mute uppercase">
                Size
              </span>
              <span className="font-mono text-[15px] text-ink">
                {loadedFile ? formatSize(loadedFile.size) : "—"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-mono text-[11px] tracking-[0.12em] text-mute uppercase">
                Points
              </span>
              <span className="font-mono text-[15px] text-ink">{summary}</span>
            </div>

            <div className="ml-auto flex gap-2">
              <button
                onClick={start}
                className="cursor-pointer rounded-sm bg-forest px-5 py-2 font-ui text-sm font-semibold text-surface transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                Start
              </button>
              <button
                onClick={remove}
                className="cursor-pointer rounded-sm border border-ink px-5 py-2 font-ui text-sm font-semibold text-ink transition-colors hover:border-clay hover:bg-clay hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="p-5">
            <p className="font-mono text-[11px] tracking-[0.12em] text-mute uppercase">
              Content
            </p>
            <pre className="mt-2 max-h-64 overflow-auto rounded-sm border border-rule-soft bg-paper p-3 font-mono text-[13px] leading-relaxed text-ink">
              {content || "(empty)"}
            </pre>
          </div>
        </div>
      )}
   {trace && algo === "closedPair" && (
  <div data-moved={movedToResult} className="mx-auto mb-10 w-[calc(100%-3rem)] max-w-5xl">
    <Visualizer key={loadId} rows={points} result={trace} onMoveToResult={moveToResult} />
  </div>
)}

      {trace && algo === "integerMultiplication" && (
        <div className="mx-auto mb-10 w-[calc(100%-3rem)] max-w-5xl overflow-hidden rounded-md border border-rule bg-surface">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-rule-soft p-5">
            <p className="font-mono text-xs font-medium tracking-[0.14em] text-ink-2 uppercase">
              Answer
            </p>
            <button
              onClick={moveToResult}
              disabled={movedToResult}
              className="ml-auto cursor-pointer rounded-sm bg-forest px-5 py-2 font-ui text-sm font-semibold text-surface transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:bg-rule disabled:text-mute"
            >
              {movedToResult ? "Moved to Result" : "Move to Result"}
            </button>
          </div>
          <pre className="max-h-64 overflow-auto p-5 font-mono text-[13px] leading-relaxed break-all whitespace-pre-wrap text-ink">
            {formatAnswer(trace.answer)}
          </pre>
        </div>
      )}

    <Results entries={algoEntries} onClear={clearEntries} />
    </div>
  );
}
