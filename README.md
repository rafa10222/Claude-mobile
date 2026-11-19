# Motion Feijoada — Fornaria (Meta Ads Stories/Reels)

Remotion 4 · 1080x1920 · 30fps · 12s (360 frames)

## Compositions
- `FeijoadaStories`: base segura 20% (384px)
- `FeijoadaReels`: base segura 35% (672px)
- Prop `showSafeZone` (default `false`) desenha a área segura por cima.

## Rodar no PC
```bash
npm install
npm run studio                 # preview interativo
npm run render                 # gera out/feijoada-stories.mp4 e out/feijoada-reels.mp4 (H.264, crf 18)
# still com área segura:
npx remotion still FeijoadaStories out/previews/teste.png --frame=200 --props='{"showSafeZone":true}'
```
No PC o Remotion baixa o Chrome headless e as fontes do Google Fonts sozinho.
Sem internet ou atrás de proxy: `REMOTION_LOCAL_FONTS=1 npm run render` (usa as fontes OFL em `public/fonts/`).

## Assets
`python3 scripts/prepare_assets.py` regenera `public/feijoada/{bg,tigela,logo,ifood-tag}.png`
a partir de `original.png`, `cena-sem-texto.png` e `fundo.png` (requer `rembg`, `scipy`, `pillow`).
Conferência: `out/previews/assets-check.png`.

## Estrutura
`src/feijoada/components/`: Background, Bowl, Steam, LightDrift, Logo, Headline, Tape, IfoodTag, SafeZoneOverlay.
Layout por versão e margens seguras: `src/feijoada/layout.ts`.
