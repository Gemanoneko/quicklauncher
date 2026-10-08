# Theme08/09 and inherited readability implementation

Sergei requested lean theme completion and will perform QA himself. This note records source implementation, not visual/runtime acceptance. No tests, QA harnesses, app launches, builds, Git operations or version changes were performed for this work.

The stopped checkpoint matched all twenty recorded file hashes before implementation. The eight existing Batch08 CSS drafts were carried unchanged: broken-sword, indiana-jones, life-is-strange, the-sandman, tomb-raider, twin-peaks, uncharted, x-files. They are ready for Sergei's manual visual assessment, including the final Life is Strange paper variants.

Batch09 implements ten exact existing CSS files: wow-scourge, wow-alliance, wow-horde, wow-legion, wow-nightelf, diablo, dragon-age, the-witcher, game-of-thrones, mortal-kombat. Palettes and font roles follow the committed Batch09 spec; each theme has its own original header/banner motif and bounded scrolling frame treatment. Old rosters, ghost text, central scenery and ambient animations were removed. App glyphs remain complete on separately drawn plates. All ten are static. The optional Diablo blue mana globe has a separate flex slot on banners at least 560px wide and disappears on narrower banners; existing quote arrays and behavior remain unchanged.

Seven exact completed-theme readability corrections follow the committed inherited-contrast and hover addenda: FF8's three region header buttons get the specified rest-only blue plate; Persona4's same three controls retain yellow glyphs when active; FF6, FF9 and Rebel shortcut links preserve transparent active backgrounds; Republic and Separatist also preserve their readable link ink/background on hover. No shared tokens, art, font or geometry changed in these seven.

Count method: eight preserved Batch08 membership keys + ten implemented Batch09 membership keys = eighteen theme-fidelity files; seven disjoint earlier-theme readability files bring this handoff to twenty-five CSS paths. This is only this developer's scope; other developers own Batch10–14. Use explicit file staging rather than including the dirty checkout wholesale. All source paths below are relative to the integration repository and have `.css` suffix under `src/renderer/styles/themes/`:

```
broken-sword indiana-jones life-is-strange the-sandman tomb-raider twin-peaks uncharted x-files
wow-scourge wow-alliance wow-horde wow-legion wow-nightelf diablo dragon-age the-witcher game-of-thrones mortal-kombat
ff8 persona-4 ff6 ff9 star-wars-rebel star-wars-republic star-wars-separatist
```

Manual priorities: check each theme's identity in Grid/Fan/Ring, titles and Cyrillic names at preferred sizes; hover/pressed/focus/rename/filter/scroll states; complete icons and safe decorative edges; narrow banner quotes and Diablo globe; the three FF8/Persona4 header controls and five Manager KEYBOARD SHORTCUTS links. Life is Strange paper paint and font/contrast/icon behavior remain visual checks for Sergei. No rendered contrast ratios, fit measurements or performance result is claimed from source review.

Parked native-isolation main/test files and studio launcher drafts were untouched and excluded. Product building must use committed product code plus intended theme changes, excluding those parked drafts.
