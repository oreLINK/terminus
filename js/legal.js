// Page Confidentialité : efface tout ce que Terminus a enregistré dans ce navigateur (clés « dt. »).

const PREFIX = "dt.";

document.getElementById("erase")?.addEventListener("click", () => {
  const status = document.getElementById("erase-status");
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
    status.textContent = keys.length
      ? "Vos données ont été effacées de ce navigateur."
      : "Ce navigateur ne contenait aucune donnée de Terminus.";
  } catch {
    status.textContent = "Le stockage de ce navigateur est inaccessible : rien n'y est enregistré.";
  }
});
