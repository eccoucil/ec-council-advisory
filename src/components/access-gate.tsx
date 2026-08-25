import type { ReactNode } from "react";
import { EcCouncilLogo } from "@/components/ec-council-logo";

type AccessGateProps = {
  figure: string;
  section: string;
  title: ReactNode;
  lede: string;
  kicker: string;
  step: string;
  stats?: ReactNode;
  children: ReactNode;
};

export function AccessGate({
  figure,
  section,
  title,
  lede,
  kicker,
  step,
  stats,
  children,
}: AccessGateProps) {
  return (
    <main className="gate">
      <section className="gate-brief">
        <div className="gate-deco-ring" aria-hidden />
        <div className="gate-deco-arc" aria-hidden />
        <div className="gate-deco-guide" aria-hidden />

        <header className="gate-brand">
          <div className="gate-logo">
            <EcCouncilLogo height={42} priority />
            <span className="gate-logo-rule" aria-hidden />
            <span className="gate-unit">AI Advisory Board</span>
          </div>
          <div className="gate-restricted">
            <span className="gate-restricted-dot" aria-hidden />
            Restricted access
          </div>
        </header>

        <div className="gate-statement">
          <p className="gate-eyebrow">
            <span>{figure}</span>
            <span className="gate-hairline" aria-hidden />
            <span>{section}</span>
          </p>
          <h1>{title}</h1>
          <p className="gate-lede">{lede}</p>
        </div>

        <footer className="gate-brief-footer">
          <div className="gate-ruler" aria-hidden>
            {Array.from({ length: 41 }, (_, index) => (
              <span
                key={index}
                className={index % 5 === 0 ? "gate-tick is-major" : "gate-tick"}
              />
            ))}
          </div>
          {stats}
        </footer>
      </section>

      <section className="gate-access">
        <div className="access-header">
          <p className="kicker">{kicker}</p>
          <p className="access-step">Step {step}</p>
        </div>
        {children}
        <footer className="access-footer">
          <p>Not listed on the roster?</p>
          <a href="mailto:?subject=AI%20Advisory%20Board%20roster">
            Contact the secretariat
          </a>
        </footer>
      </section>
    </main>
  );
}

export function GateStats({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <dl className="gate-stats">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
