import Link from "next/link";
import clsx from "clsx";
import { Avatar } from "../ui/Avatar.jsx";

export const ChatSidebar = ({ astrologers = [], activeAstrologerId }) => {
  return (
    <aside className="space-y-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 h-[600px] overflow-y-auto no-scrollbar">
      <p className="text-sm font-semibold text-[color:var(--color-text)]">AI Astrologers</p>
      <div className="space-y-3">
        {astrologers.map((item) => (
          <Link
            key={item._id}
            href={`/chat/${item._id}`}
            className={clsx(
              "flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-colors",
              activeAstrologerId === item._id
                ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 text-[color:var(--color-text)]"
                : "hover:border-[color:var(--color-border)]"
            )}
          >
            <Avatar src={item.avatar} name={item.name} className="h-10 w-10" />
            <div className="text-sm">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-[color:var(--color-text-soft)]">{item.specialty?.join(", ")}</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
};

