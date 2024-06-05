const themeToggle = document.getElementById("theme-toggle");
const icon = document.getElementById("header-theme-button-icon");
const tag = sessionStorage.getItem("theme");

if (!sessionStorage.getItem("themecolor")) {
  fetch("/theme.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      sessionStorage.setItem("themecolor", JSON.stringify(data));
      if (tag == "light" && document.body.classList.contains("dark-mode")) {
        document.body.classList.replace("dark-mode", "light-mode");
        sessionStorage.setItem("theme", "light");
      } else if (
        tag == "dark" &&
        document.body.classList.contains("light-mode")
      ) {
        document.body.classList.replace("light-mode", "dark-mode");
        sessionStorage.setItem("theme", "dark");
      }
      // 在这里处理数据
      if (document.body.classList.contains("light-mode")) {
        Object.keys(data.light).map((key) => {
          document.documentElement.style.setProperty(key, data.light[key]);
        });
        icon.classList.contains("icon-Moon") &&
          icon.classList.replace("icon-Moon", "icon-Sun");
      } else {
        Object.keys(data.dark).map((key) => {
          document.documentElement.style.setProperty(key, data.dark[key]);
        });
        icon.classList.contains("icon-Sun") &&
          icon.classList.replace("icon-Sun", "icon-Moon");
      }
    })
    .catch((error) => {
      console.error("获取主题颜色配置文件失败", error);
    });
} else {
  if (tag == "light" && document.body.classList.contains("dark-mode")) {
    document.body.classList.replace("dark-mode", "light-mode");
    sessionStorage.setItem("theme", "light");
  } else if (tag == "dark" && document.body.classList.contains("light-mode")) {
    document.body.classList.replace("light-mode", "dark-mode");
    sessionStorage.setItem("theme", "dark");
  }
  const themeColors = JSON.parse(sessionStorage.getItem("themecolor"));
  if (document.body.classList.contains("dark-mode")) {
    Object.keys(themeColors.dark).map((key) =>
      document.documentElement.style.setProperty(key, themeColors.dark[key])
    );
    icon.classList.contains("icon-Sun") &&
      icon.classList.replace("icon-Sun", "icon-Moon");
  } else {
    Object.keys(themeColors.light).map((key) =>
      document.documentElement.style.setProperty(key, themeColors.light[key])
    );
    icon.classList.contains("icon-Moon") &&
      icon.classList.replace("icon-Moon", "icon-Sun");
  }
}
themeToggle.addEventListener("click", () => {
  // 切换 body 的 class
  if (document.body.classList.contains("light-mode")) {
    sessionStorage.setItem("theme", "dark");
    // 如果当前是明亮模式，将其切换到暗黑模式
    document.body.classList.replace("light-mode", "dark-mode");
    icon.classList.contains("icon-Sun") &&
      icon.classList.replace("icon-Sun", "icon-Moon");
  } else {
    // 如果当前是暗黑模式，将其切换到明亮模式
    document.body.classList.replace("dark-mode", "light-mode");
    sessionStorage.setItem("theme", "light");
    icon.classList.contains("icon-Moon") &&
      icon.classList.replace("icon-Moon", "icon-Sun");
  }
  // 在 CSS 中设置不同的变量
  const themeColors = JSON.parse(sessionStorage.getItem("themecolor"));
  document.body.classList.contains("dark-mode")
    ? Object.keys(themeColors.dark).map((key) =>
        document.documentElement.style.setProperty(key, themeColors.dark[key])
      )
    : Object.keys(themeColors.light).map((key) =>
        document.documentElement.style.setProperty(key, themeColors.light[key])
      );
});
