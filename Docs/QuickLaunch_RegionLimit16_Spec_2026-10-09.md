# Region limit16

Sergei explicitly chose16 regions as the new maximum, replacing8.

Judy's bounded addendum: raise the shared limit to16. Keep Add Region, Manager New Region and tray creation available below16 subject to existing layout and free-space rules, and disabled at16. Update displayed limits/count/help and creation-refusal copy consistently to16 regions. Keep disabled actions visible and preserve existing menu behavior. No new UI or layout redesign is requested.

Apply the limit consistently to creation and all persistence/validation/recovery consumers, preserving existing region data. Retain the existing refusal when a requested region cannot fit in available desktop space. The committed region drag/drop spec remains unchanged; both changes ship together in v1.98.0.

Sergei handles manual QA; no automated tests, agent QA, app launches or native-test work. Manual checks: create region9 and later16 if space permits; creation actions disable at16; delete one and verify creation becomes available again; restart and confirm regions beyond8 remain.
