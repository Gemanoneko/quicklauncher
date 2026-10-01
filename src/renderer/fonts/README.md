# Bundled fonts

Eight font files from the `google/fonts` repository, bundled for the QuickLaunch themes (theme spec, foundation 2026-09-30, Part B). Sergei approved exactly these eight files: the first seven with the foundation spec, the eighth (Cormorant Garamond italic) with the batch 4 theme spec, Addendum A.2 (`Docs/QuickLaunch_ThemeSpec_Batch04_2026-10-01.md`, 2026-10-01). Any other font needs a new approval. The declarations are in `fonts.css`, which `index.html` links before `base.css`.

All eight are licensed under the **SIL Open Font License 1.1**. Each family's `OFL.txt` sits next to its font file and ships with it. The font files are unmodified (same bytes and SHA-256 as the source). Three files were renamed when copied, because their upstream names contain brackets: `Jost[wght].ttf` is `jost/Jost-VF.ttf`, `Cinzel[wght].ttf` is `cinzel/Cinzel-VF.ttf` and `CormorantGaramond-Italic[wght].ttf` is `cormorantgaramond/CormorantGaramond-Italic-VF.ttf`. Renaming a file does not change the font, so the OFL is unaffected.

Downloaded 2026-09-30 from `https://raw.githubusercontent.com/google/fonts/main/ofl/<family>/<file>`. Every size matched the table in `Team/Research/QuickLaunch_ThemeReferences_2026-09-29.md`, "Bundling candidates, exact files". Cormorant Garamond was downloaded 2026-10-01 from the same place; its size matched the batch 4 spec, Addendum A.2, and both of its files match the upstream git blob SHA-1 (`0d914e7663b7a1429d06ec60a5c5bb026031a2ef` for the font, `507d70f4565352dbfcf2dfc9b42eb092b57c0be8` for `OFL.txt`).

| CSS family | File here | Source URL | Bytes | SHA-256 |
|---|---|---|---|---|
| `'Dela Gothic One'` (400) | `delagothicone/DelaGothicOne-Regular.ttf` | https://raw.githubusercontent.com/google/fonts/main/ofl/delagothicone/DelaGothicOne-Regular.ttf | 2,508,848 | `4ff87a0965f1b0505e5a2c58424bc6ad3cff27e56a82f21c2fc9d6b0e3857ee2` |
| `'Jost'` (variable, 100 to 900) | `jost/Jost-VF.ttf` | https://raw.githubusercontent.com/google/fonts/main/ofl/jost/Jost%5Bwght%5D.ttf | 134,996 | `6343b70971000b04c5d401c96ae08ce371086135e999d5e1e1413039c0213076` |
| `'Cinzel'` (variable, 400 to 900) | `cinzel/Cinzel-VF.ttf` | https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/Cinzel%5Bwght%5D.ttf | 125,468 | `f4d83d34d1f6c741193e4acf4b3dff9531e5a67b6aa65228d00a7db72a4e0f34` |
| `'Pirata One'` (400) | `pirataone/PirataOne-Regular.ttf` | https://raw.githubusercontent.com/google/fonts/main/ofl/pirataone/PirataOne-Regular.ttf | 56,316 | `5347a2e155589ecf667d4b766613c8ee003edde9f83717fd24c09599a4b1ecc0` |
| `'UnifrakturCook'` (700) | `unifrakturcook/UnifrakturCook-Bold.ttf` | https://raw.githubusercontent.com/google/fonts/main/ofl/unifrakturcook/UnifrakturCook-Bold.ttf | 42,688 | `ea002fa9c65f1a612af100e00d87ab65f16381f450020ec3d021f3dbf79a6dcd` |
| `'IM Fell English'` (400, roman only) | `imfellenglish/IMFeENrm28P.ttf` | https://raw.githubusercontent.com/google/fonts/main/ofl/imfellenglish/IMFeENrm28P.ttf | 194,992 | `fe9705bbde51af802719246d4608d08d37bde956ab99d9a590da996a5221a24c` |
| `'Metamorphous'` (400) | `metamorphous/Metamorphous-Regular.ttf` | https://raw.githubusercontent.com/google/fonts/main/ofl/metamorphous/Metamorphous-Regular.ttf | 135,740 | `55939a5664e06807e87fa4af64f52039ead12f002dda8317393fdce2f7ff57fe` |
| `'Cormorant Garamond'` (variable, 300 to 700, italic only) | `cormorantgaramond/CormorantGaramond-Italic-VF.ttf` | https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf | 715,644 | `0f48ea6abb2084537854f7174c470991a463b13036309e3b50a81511611c530d` |

Total: 3,914,692 bytes (3.73 MiB).

Licence files (`https://raw.githubusercontent.com/google/fonts/main/ofl/<family>/OFL.txt`):

| File here | Bytes | SHA-256 |
|---|---|---|
| `delagothicone/OFL.txt` | 4,392 | `c0014792d4f4abc0508c295b277f2b17ae44465c8dc88d12af9cea48279b5fda` |
| `jost/OFL.txt` | 4,384 | `1af3438a4d5f0ed2bdbc5751a5a67ebf6d537334161184b7fbb68503ef0ea0c5` |
| `cinzel/OFL.txt` | 4,383 | `f2b3029aba64c378bf0963b62945eee15e564fe4330b934c8f2eb058282b5e83` |
| `pirataone/OFL.txt` | 4,427 | `e8ad3f3de5baeff6bac6e711d8c406e0a6b8a61d2944741532d8965d893a2681` |
| `unifrakturcook/OFL.txt` | 4,413 | `99d2f30e282d6174af8ff68597f58bb53c0dcb2b104a4c1b8d19da49021d00d3` |
| `imfellenglish/OFL.txt` | 4,359 | `8548dead93b1e3272e6f107452f8f3698627b21172b91f7b0fbd505c394bd6d2` |
| `metamorphous/OFL.txt` | 4,407 | `4fece81b541808b40293b0cd3f5b1990274e1100e1c20455dc2987cd96639d3f` |
| `cormorantgaramond/OFL.txt` | 4,387 | `60700d351cac4650c51f3f9db318d2a420f8b45052dba2715eb5fec41f0f6956` |

The upstream `imfellenglish/OFL.txt` has CRLF line endings (4,452 bytes, SHA-256 `2a3ca501fc4d5efcad9798531e3e06962b1e20c60e464f6cbd6c17630112c773`). It is stored here with LF endings, like every other text file in the repo. The text is unchanged. The other seven are byte-identical to the source.

## Rules for themes

- Use only the eight family strings above, followed by the stock fallback stack the theme spec names.
- Set `font-synthesis: none` and a declared weight on every rule that uses a bundled family. There is no faux bold and no faux italic.
- IM Fell English is roman only. Any element set in it also sets `font-style: normal`.
- Cormorant Garamond is italic only. Any element set in it is italic (`font-style: italic`, or `--tile-label-style: italic` for the labels).
