"use client";

export type HeaderNavigationItem = {
  label: string;
  href?: string;
  icon: string;
  panel?: boolean;
};

const DEFAULT_ITEMS: HeaderNavigationItem[] = [
  { label: "Home", href: "/lobby", icon: "⌂" },
  { label: "Rooms", href: "/rooms", icon: "▦" },
  { label: "Friends", href: "/friends", icon: "◌" },
  { label: "Stats", icon: "◷", panel: true }
];

export function HeaderNavigation({
  items = DEFAULT_ITEMS,
  activeLabel = "Home",
  onPanelOpen
}: {
  items?: HeaderNavigationItem[];
  activeLabel?: string;
  onPanelOpen?: (label: string) => void;
}) {
  return (
    <nav className="lobby-nav" aria-label="Main navigation">
      {items.map((item) => {
        const active = item.label === activeLabel;
        const className = `lobby-nav-item ${active ? "lobby-nav-item-active" : ""}`;

        if (item.panel || !item.href) {
          return (
            <button
              className={className}
              key={item.label}
              onClick={() => onPanelOpen?.(item.label)}
              type="button"
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          );
        }

        return (
          <a className={className} href={item.href} key={item.label}>
            <span>{item.icon}</span>
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
