const windowWidth = window.innerWidth;
if (windowWidth < 610) {
  const nav = document.getElementById("header-nav");
  nav.classList.replace("header-nav", "header-nav-mobile");
  nav.style.display = "none";
  const container = document.getElementById("header-nav-container");
  container.insertAdjacentHTML(
    "afterbegin",
    `<button class="header-button" id="nav-button" collapse=false><svg viewBox="0 0 32 32">
    <path class="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
    <path class="line" d="M7 16 27 16"></path>
  </svg></button>`
  );

  const navButton = document.getElementById("nav-button");
  nav.addEventListener("animationend", () => {
    if (nav.attributes.getNamedItem("nav-status").value == "close") {
      nav.style.display = "none";
    }
  });

  navButton.addEventListener("click", () => {
    if (nav.style.display == "grid") {
      nav.setAttribute("nav-status", "close");
      navButton.setAttribute("header-collapse", false);
    } else {
      nav.setAttribute("nav-status", "open");
      nav.style.display = "grid";
      nav.style.gridTemplateColumns = "repeat(4, 1fr)";
      navButton.setAttribute("header-collapse", true);
    }
  });
}
