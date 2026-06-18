"use client";

import clsx from "clsx";

export const AppShell = ({ sidebar, children, className }) => {
  return (
    <div className={clsx("mx-auto flex w-full max-w-7xl gap-8 px-4 py-8", className)}>
      {sidebar && <aside className="hidden w-64 shrink-0 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 lg:block">{sidebar}</aside>}
      <section className="flex-1 space-y-6">{children}</section>
    </div>
  );
};



