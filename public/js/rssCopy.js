const rssLinks = document.querySelectorAll(".rss-link");
rssLinks.forEach((link) =>
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navigator.clipboard
      .writeText(link.href)
      .then(() => {
        alert("链接已复制到剪贴板");
      })
      .catch((error) => {
        alert("链接复制失败");
        console.error(error);
      });
  })
);
