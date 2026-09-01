import { Link } from "@tanstack/react-router";
import { ProgressStepper } from "./ProgressStepper";

export function AppHeader({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <header className="bg-brand-black text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/templates" className="flex items-baseline gap-3">
          <span className="text-xl font-extrabold tracking-tight text-white">
       <span className="text-brand-yellow">Veryon's</span>{" "}
            <span className="text-gray-300">DataBridge</span>
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-white/60">
               Tracking +
          </span>
        </Link>
      </div>
      <div className="border-t border-white/10">
        <ProgressStepper current={step} />
      </div>
    </header>
  );
}

export function WizardLayout({
  step,
  children,
}: {
  step: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AppHeader step={step} />
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
