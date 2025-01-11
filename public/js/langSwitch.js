const langSwitch = document.getElementById("lang-switch");
const langContainer = document.getElementById("header-language-container");
const fullUrl = window.location.href;
langContainer.setAttribute("header-lang-expand", "false");
langContainer.style.display = "none";
langContainer.addEventListener("animationend", () => {
  if (
    langContainer.attributes.getNamedItem("header-lang-expand").value == "false"
  ) {
    langContainer.style.display = "none";
  }
});

langSwitch.addEventListener("click", () => {
  if (
    langContainer.attributes.getNamedItem("header-lang-expand").value == "false"
  ) {
    langContainer.setAttribute("header-lang-expand", "true");
    langContainer.style.display = "flex";
    langContainer.style.flexDirection = "column";
  } else {
    langContainer.setAttribute("header-lang-expand", "false");
  }
});
document.addEventListener(
  "click",
  (e) =>
    e.target != langSwitch &&
    e.target != langSwitch.children[0] &&
    langContainer.setAttribute("header-lang-expand", "false")
);
Object.entries(langContainer.children).forEach((value, i) => {
  value[1].addEventListener("click", () => {
    const urlWithoutOrigin = fullUrl.replace(window.location.origin, "");
    const pathSegments = urlWithoutOrigin.split("/");
    pathSegments[1] = value[1].id;
    const newPath = pathSegments.join("/");
    const newUrl = window.location.origin + newPath;
    window.location.href = newUrl;
  });
});
