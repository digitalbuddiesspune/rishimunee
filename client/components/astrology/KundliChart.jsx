"use client";

import React, { useMemo } from "react";

// Simple North Indian style Kundli chart (equal houses) using SVG.
// Expects `chart` with `ascendantLongitude` and `planetaryLongitudes.degrees` (sidereal degrees).

const PLANET_ABBR = {
  sun: "Su",
  moon: "Mo",
  mars: "Ma",
  mercury: "Me",
  jupiter: "Ju",
  venus: "Ve",
  saturn: "Sa",
  // If future nodes are added, we can show as below:
  rahu: "Ra",
  ketu: "Ke",
};

function normalize(angle) {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
}

function planetHouse(planetLon, ascLon) {
  // Whole-sign houses (North Indian style):
  // 1st house = entire sign of ascendant; subsequent houses progress by signs.
  const ascSign = Math.floor(normalize(ascLon) / 30);
  const pSign = Math.floor(normalize(planetLon) / 30);
  return ((pSign - ascSign + 12) % 12) + 1; // 1..12
}

export default function KundliChart({ chart, size = 320, className = "" }) {
  const ascLon = chart?.ascendantLongitude ?? 0;
  const longs = chart?.planetaryLongitudes?.degrees || {};

  const houses = useMemo(() => {
    // Build mapping house -> [labels]
    const map = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, []]));
    // Add ascendant marker
    map[1].push("As");
    for (const [k, v] of Object.entries(longs)) {
      if (typeof v !== "number") continue;
      const h = planetHouse(v, ascLon);
      const label = PLANET_ABBR[k?.toLowerCase?.()] || k.slice(0, 2);
      map[h].push(label);
    }
    return map;
  }, [ascLon, longs]);

  // Layout
  const w = size;
  const h = size;
  const cx = w / 2;
  const cy = h / 2;
  const pad = 6;

  // Fixed text anchors for 12 houses in North Indian (diamond) scheme
  // House-number anchors (small gray numerals for orientation)
  const numPos = [
    [cx, cy], // index 0 not used
    [cx, cy - h * 0.26], // 1 (top inner)
    [cx + w * 0.26, cy], // 2 (right inner)
    [cx, cy + h * 0.26], // 3 (bottom inner)
    [cx - w * 0.26, cy], // 4 (left inner)
    [cx + w * 0.38, cy - h * 0.14], // 5
    [cx + w * 0.26, cy - h * 0.26], // 6
    [cx + w * 0.14, cy - h * 0.38], // 7
    [cx - w * 0.14, cy - h * 0.38], // 8
    [cx - w * 0.26, cy - h * 0.26], // 9
    [cx - w * 0.38, cy - h * 0.14], // 10
    [cx - w * 0.38, cy + h * 0.14], // 11
    [cx - w * 0.26, cy + h * 0.26], // 12
  ];

  // Planet label anchors tuned to sit inside each triangular/diamond cell
  const labelPos = {
    1: [cx, cy - h * 0.18],
    2: [cx + w * 0.18, cy],
    3: [cx, cy + h * 0.18],
    4: [cx - w * 0.18, cy],
    5: [cx + w * 0.34, cy - h * 0.12],
    6: [cx + w * 0.24, cy - h * 0.28],
    7: [cx + w * 0.10, cy - h * 0.34],
    8: [cx - w * 0.10, cy - h * 0.34],
    9: [cx - w * 0.24, cy - h * 0.28],
    10: [cx - w * 0.34, cy - h * 0.12],
    11: [cx - w * 0.34, cy + h * 0.12],
    12: [cx - w * 0.24, cy + h * 0.28],
  };

  const labelAnchor = (house) => {
    const h = Number(house);
    if ([5, 6, 2].includes(h)) return "start";
    if ([9, 10, 11, 12, 4].includes(h)) return "end";
    return "middle"; // 1,3,7,8
  };

  return (
    <div className={className} style={{ width: w, maxWidth: "100%" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-label="Kundli Chart">
        {/* Outer diamond border */}
        <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Diagonals to make diamond grid */}
        <line x1={pad} y1={cy} x2={cx} y2={pad} stroke="currentColor" strokeWidth="1" />
        <line x1={cx} y1={pad} x2={w - pad} y2={cy} stroke="currentColor" strokeWidth="1" />
        <line x1={w - pad} y1={cy} x2={cx} y2={h - pad} stroke="currentColor" strokeWidth="1" />
        <line x1={cx} y1={h - pad} x2={pad} y2={cy} stroke="currentColor" strokeWidth="1" />

        {/* Inner dashed to hint diamond facets */}
        <line x1={pad} y1={cy} x2={w - pad} y2={cy} stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.8" />
        <line x1={cx} y1={pad} x2={cx} y2={h - pad} stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.8" />

        {/* House numbers (small, gray) for orientation */}
        {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => (
          <text key={`hn-${house}`} x={numPos[house][0]} y={numPos[house][1]} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="currentColor" opacity={0.7}>
            {house}
          </text>
        ))}

        {/* Planet labels per house */}
        {Object.entries(houses).map(([house, labels]) => {
          const [lx, ly] = labelPos[house] || [cx, cy];
          return (
            <text
              key={`h-${house}`}
              x={lx}
              y={ly}
              textAnchor={labelAnchor(house)}
              dominantBaseline="central"
              fontSize={13}
              fill="var(--color-primary)"
              style={{ fontWeight: 600 }}
            >
              {labels.join("  ")}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
