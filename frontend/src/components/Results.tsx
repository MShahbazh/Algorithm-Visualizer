export interface Entry {
  id: number;
  time: string;
  algo: string; 
  file: string;
  fields: [string, string][];
}

interface Props {
  entries: Entry[];
  onClear: () => void;
}

const download = (text: string, filename: string, type: string) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const q = (s: string) => `"${s.replace(/"/g, '""')}"`;

export default function Results({ entries, onClear }: Props) {
  const saveTxt = () =>
    download(
      entries
        .map((e) =>
          [`${e.algo} | ${e.file} | ${e.time}`, ...e.fields.map(([k, v]) => `  ${k}: ${v}`)].join("\n")
        )
        .join("\n\n"),
      "results.txt",
      "text/plain"
    );

  const saveCsv = () =>
    download(
      [
        "time,algo,file,field,value",
        ...entries.flatMap((e) =>
          e.fields.map(([k, v]) => [e.time, e.algo, e.file, k, v].map(q).join(","))
        ),
      ].join("\n"),
      "results.csv",
      "text/csv"
    );

  const outline =
    "cursor-pointer rounded-sm border border-ink px-4 py-1.5 font-ui text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-surface disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mx-auto mb-20 w-[calc(100%-3rem)] max-w-5xl overflow-hidden rounded-md border border-rule bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-rule-soft p-5">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-ink-2 uppercase">
          Results
        </p>
        <div className="ml-auto flex flex-wrap gap-2">
          <button className={outline} onClick={saveCsv} disabled={!entries.length}>
            Save CSV
          </button>
          <button className={outline} onClick={saveTxt} disabled={!entries.length}>
            Save TXT
          </button>
          <button
            onClick={onClear}
            disabled={!entries.length}
            className="cursor-pointer rounded-sm border border-ink px-4 py-1.5 font-ui text-sm font-semibold text-ink transition-colors hover:border-clay hover:bg-clay hover:text-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="p-5 font-ui text-sm text-mute">
          No results yet. Run an algorithm and press “Move to result”.
        </p>
      ) : (
        <ul className="divide-y divide-rule-soft">
          {[...entries].reverse().map((e) => (
            <li key={e.id} className="p-5 font-mono text-[14px] text-ink">
              <p className="font-semibold">
                {e.file}
              </p>
              <p className="text-[12px] text-mute">{e.time}</p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                {e.fields.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-ink-2">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}