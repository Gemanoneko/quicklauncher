# Grid theme-art scrolling: Q18 clarification

Judy, 2026-10-08. EXTEND of Q18 in QuickLaunch_Regions_UXSpec_2026-10-01.md. Scope: the already-authorized Grid art scrolling fix only. Implementation may cite this after Sully commits it.

## Exact adjustment

The pending Grid-only rule in region.css is acceptable with these two substitutions:

```css
body.region.layout-grid #app-grid {
  height: 100%; box-sizing: border-box; padding: var(--grid-pad);
  align-content: start;
  overflow-x: hidden; overflow-y: auto; scrollbar-gutter: stable;
}
```

Keep the pending Grid field clipping and 4px scrollbar rules. Do not change Column/Row rules, base grid columns, 8px gaps, tile padding, icon size, label metrics, focus styles or theme art. Do not add fixed Grid row heights.

## Reason and acceptance

Source inspection: base.css:356 uses var(--grid-pad), default 16px at line 13; base.css:373 leaves Grid rows implicit and content-sized. Column and Row fix their own row sizes in region.css:192 and :266. Giving the Grid a full viewport height otherwise lets its automatic rows stretch into spare space. align-content:start keeps the existing intrinsic row heights and leaves spare space below the final row, preserving predictable scanning and target positions (Jakob law, NN/g consistency).

Verify with an audited isolated renderer harness only: sparse Grid rows keep their intrinsic heights and 8px vertical gaps at two viewport heights; padding follows var(--grid-pad); overflowing tiles scroll in #app-grid and theme art stays clipped in #grid-container; keyboard focus can reveal the final tile; empty, filtered, edit and notice states remain usable. Compare tile heights and gaps with the pre-fix source under identical state and theme.

The stable scrollbar gutter intentionally reserves 4px even before overflow, as in Q18. At column-wrap thresholds it can change column count; test both sides of a threshold and check all tiles remain reachable. Do not report all horizontal rects unchanged. The rule does not authorize any other geometry change. No product app, visible checks, real input or display changes were used for this clarification; runtime acceptance remains QA work.
