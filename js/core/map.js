// Carla — les cartes. Carte interactive : Leaflet (copié dans vendor/leaflet/, licence BSD 2 clauses) sur le fond
// Plan IGN de la Géoplateforme, sans clé. Leaflet n'est chargé qu'à la première carte affichée,
// après le rendu : l'écran n'attend pas ses 43 Ko compressés pour montrer le compte à rebours.

const VENDOR = new URL("../../vendor/leaflet/", import.meta.url);

const IGN_TILES =
  "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2" +
  "&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/png&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
const IGN_ATTRIBUTION = `<a href="https://www.ign.fr/" target="_blank" rel="noopener">IGN</a>, Plan IGN`;

let loading = null;

// Leaflet est un script classique (UMD) qui définit window.L. Sa feuille de style passe avant
// css/style.css, pour que nos règles l'emportent à spécificité égale.
function loadLeaflet() {
  loading ??= new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = new URL("leaflet.css", VENDOR).href;
    const ours = document.head.querySelector('link[rel="stylesheet"]');
    if (ours) ours.before(css);
    else document.head.append(css);

    const script = document.createElement("script");
    script.src = new URL("leaflet.js", VENDOR).href;
    script.onload = () => resolve(window.L);
    script.onerror = () => {
      loading = null; // un nouvel essai à la prochaine ouverture
      css.remove();
      script.remove();
      reject(new Error("La carte n'a pas pu être chargée."));
    };
    document.head.append(script);
  });
  return loading;
}

// Carte vide sur le fond IGN dans `el`. Renvoie { L, map }, ou null si `el` a quitté la page
// pendant le chargement. L'appelant la retire (map.remove) quand il n'en a plus besoin.
// `interactive: false` : aperçu figé, qui ne capte aucun geste (la page défile, un toucher passe
// à l'élément du dessus), avec une mention de source courte (« © IGN ») qui tient dans un petit
// carré. Interactive : déplacement au doigt, zoom à deux doigts ou double toucher.
export async function createMap(el, { interactive = true } = {}) {
  const L = await loadLeaflet();
  if (!el.isConnected) return null;
  const gestures = interactive
    ? { scrollWheelZoom: false }
    : { dragging: false, touchZoom: false, doubleClickZoom: false, scrollWheelZoom: false, boxZoom: false, keyboard: false };
  const map = L.map(el, { zoomControl: false, attributionControl: true, zoomSnap: 0.25, ...gestures });
  map.attributionControl.setPrefix(interactive ? `<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>` : false);
  const attribution = interactive ? IGN_ATTRIBUTION : "© IGN";
  L.tileLayer(IGN_TILES, { minZoom: 6, maxZoom: 19, tileSize: 256, attribution }).addTo(map);
  return { L, map };
}
