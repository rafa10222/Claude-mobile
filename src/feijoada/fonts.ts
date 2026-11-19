import { continueRender, delayRender, staticFile } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadCaveatBrush } from "@remotion/google-fonts/CaveatBrush";
import { loadFont as loadBaloo2 } from "@remotion/google-fonts/Baloo2";

/**
 * Padrão: @remotion/google-fonts (baixa do Google Fonts na hora do render).
 * Fallback: REMOTION_LOCAL_FONTS=1 usa as mesmas fontes (OFL) salvas em public/fonts/,
 * pra renderizar sem internet ou atrás de proxy que o Chrome headless não atravessa.
 */
const useLocal = process.env.REMOTION_LOCAL_FONTS === "1";

const loadLocal = (family: string, file: string, weight: string) => {
  const handle = delayRender(`Carregando fonte local ${family}`);
  const face = new FontFace(family.replace(/'/g, ""), `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { weight });
  face
    .load()
    .then(() => {
      document.fonts.add(face);
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
  return family;
};

export const anton = useLocal
  ? loadLocal("Anton", "Anton-400.woff2", "400")
  : loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

export const caveatBrush = useLocal
  ? loadLocal("'Caveat Brush'", "CaveatBrush-400.woff2", "400")
  : loadCaveatBrush("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

export const baloo2 = useLocal
  ? loadLocal("'Baloo 2'", "Baloo2-800.woff2", "800")
  : loadBaloo2("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily;
