import clsx from "clsx";

export const Skeleton = ({ className }) => (
  <div className={clsx("animate-pulse rounded-2xl bg-[color:var(--color-border)]/70", className)} />
);



