// theme.js



const THEME_KEY = "motchus_theme"; // global (toutes pages)

function themeLireStorage() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "dark") modeSombre = true;
    else if (v === "light") modeSombre = false;
  } catch(e) {
    // localStorage indisponible → on garde le défaut
  }
}

function themeEcrireStorage() {
  try {
    localStorage.setItem(THEME_KEY, modeSombre ? "dark" : "light");
  } catch(e) {}
}


function themeAppliquer() {
  document.documentElement.setAttribute("data-theme", modeSombre ? "dark" : "light");

  const btn = document.getElementById("btn-theme");
  if (btn) btn.textContent = modeSombre ? "🌙" : "☀️";

}

function themeBasculer() {
  modeSombre = !modeSombre;
  themeEcrireStorage();
  themeAppliquer();
}

function themeInit() {
  themeLireStorage();
  themeAppliquer();

  const btn = document.getElementById("btn-theme");
  if (btn) btn.addEventListener("click", themeBasculer);
}
