// 获取友链链接
const links = document.getElementsByClassName("footer-social-link");
// 友链链接的a标签的id包括了文件名
const files = Object.entries(links).map((link) => link[1].id.split("-", 3)[2]);
files.map((file, i) => {
  // 获取svg文件
  file !== "rss.svg"
    ? fetch(`/social/${file}`)
        .then((data) => {
          // 根据状态返回404Svg图片或者读取到的svg
          return data.ok
            ? data.text()
            : `<svg t="1715173666020" class="icon" viewBox="0 0 1365 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4373" width="256" height="256"><path d="M792.588969 699.683128c-2.388215 15.20355-3.62497 30.769596-3.624969 46.634169 0 54.374546 14.542526 105.337356 39.938637 149.263459H127.940108V516.920683l198.200551-189.969737 466.44831 372.732182zM1279.40108 517.645677a298.804122 298.804122 0 0 0-63.970054-41.132745V85.293405a21.323351 21.323351 0 0 0-21.323351-21.323351H85.293405a21.323351 21.323351 0 0 0-21.323351 21.323351v852.934054a21.323351 21.323351 0 0 0 21.323351 21.323351h793.271317a298.846769 298.846769 0 0 0 97.916829 63.970054H85.293405a85.293405 85.293405 0 0 1-85.293405-85.293405V85.293405a85.293405 85.293405 0 0 1 85.293405-85.293405h1108.81427a85.293405 85.293405 0 0 1 85.293405 85.293405v432.352272z m-55.760563 500.629643a84.930908 84.930908 0 0 1-24.863028 5.117604c7.036706-2.814682 13.924148-5.906568 20.726297-9.254334l4.136731 4.13673zM895.580756 234.556865a106.616757 106.616757 0 1 1 213.233514 0 106.616757 106.616757 0 0 1-213.233514 0z" fill="#DFDFDF" opacity=".9" p-id="4374"></path><path d="M892.979307 519.863306a298.100452 298.100452 0 0 0-100.603571 181.141869l-202.337281-163.400841 217.754064-141.544406 85.186788 123.803378z" fill="#DCDCDC" opacity=".5" p-id="4375"></path><path d="M1355.312211 969.018378a31.985027 31.985027 0 1 1-45.248151 45.226828l-80.943442-80.943441A233.533344 233.533344 0 0 1 1087.490918 980.874162c-129.539359 0-234.556865-105.017505-234.556864-234.556865s105.017505-234.556865 234.556864-234.556865 234.556865 105.017505 234.556865 234.556865c0 53.265732-17.762352 102.394733-47.679014 141.75764l80.943442 80.943441z m-131.863605-119.624001A169.520643 169.520643 0 0 0 1258.077729 746.317297a170.586811 170.586811 0 1 0-170.586811 170.586811 169.520643 169.520643 0 0 0 102.970464-34.565153l18.743226-14.222675 14.243998-18.743226z" fill="#DBDBDB" p-id="4376"></path></svg>`;
        })
        .then((text) => {
          // a标签中插入读取的svg图片信息并拼接原有的span标签信息
          // links.item(i).innerHTML = text.concat(links.item(i).innerHTML);
          links.item(i).innerHTML = text.concat(links.item(i).innerHTML);
          // 给插入的svg标签设置class方便css生效
          const svg = links.item(i).querySelector("svg");
          svg.setAttribute("class", "footer-social-img");
          // span标签的动画效果
          const span = links.item(i).querySelector("span");
          span.style.display = "none";
          // 当加载完成所有图片并且给svg标签设置好了class生效之后
          // 获得footer的高度并设置进css变量中
          if (i == files.length - 1) {
            const footer = document.getElementById("footer-container");
            document.documentElement.style.setProperty(
              "--footer-container-height",
              `${footer.offsetHeight}px`
            );
          }
          // 设置a标签监听事件,分别为动画结束取消显示,鼠标移入显示块元素
          links.item(i).addEventListener("animationend", () => {
            if (span.attributes.getNamedItem("footer-show").value == "false") {
              span.style.display = "none";
            }
          });
          links.item(i).addEventListener("mouseenter", () => {
            span.style.display = "block";
            span.setAttribute("footer-show", "true");
          });
          links
            .item(i)
            .addEventListener("mouseleave", () =>
              span.setAttribute("footer-show", "false")
            );
        })
        .catch((err) => console.error(err))
    : rsslink(links.item(i));
});
function rsslink(element) {
  // 更新element的innerHTML为新的SVG图标，并保留原有内容
  element.innerHTML =
    `<svg t="1716211461381" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3890" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M724.4 304.4C566.6 144 374.8 66.3 151.4 66.3c-21.9 0-41.2 7.2-58.2 24.2-14.6 17.1-24.4 34.1-21.9 58.4-2.4 21.9 7.2 43.7 21.9 58.2 17 14.5 36.4 24.2 58.2 24.2 179.7 0 330.3 63.1 456.6 189.4 126.2 124 189.3 274.5 189.3 454.2-2.4 21.9 7.2 41.4 21.9 58.4 17 14.6 36.5 24.2 58.2 24.2 24.2 0 43.7-9.7 58.4-24.2 17-17 24.2-36.4 24.2-58.4 0.1-225.7-77.6-415.1-235.6-570.5z m-573 51c145.7 0 267.2 51 369.1 150.6 99.6 102 150.6 223.4 150.6 369.1 0 21.9-7.2 41.4-21.9 58.4-17 14.6-36.5 24.2-58.2 24.2-24.2 0-43.7-9.7-58.2-24.2-17-17-24.2-36.4-24.2-58.4 0-99.6-36.5-182.1-104.5-252.6-70.5-68-153-104.3-252.6-104.3-21.9 0-41.2-7.2-58.2-21.9-14.6-17-24.2-36.5-21.9-58.4-2.5-24.2 7.2-43.7 21.9-58.4 16.8-16.9 36.2-24.1 58.1-24.1z m58.3 308.4c38.9 0 75.2 14.5 102 41.2 26.7 29.1 43.7 63.1 43.7 104.5 0 38.9-17 75.2-43.7 102-26.7 29.1-63.1 43.7-102 43.7-41.2 0-75.4-14.6-104.5-43.7-26.7-26.8-41.2-63.2-41.2-102 0-41.4 14.5-75.4 41.2-104.5 29.1-26.7 60.7-41.2 99.6-41.2h4.9z" p-id="3891"></path></svg>`.concat(
      element.innerHTML
    );
  // 获取SVG元素并设置class
  const svg = element.querySelector("svg");
  svg.setAttribute("class", "footer-social-img");
  // 隐藏span元素并设置动画监听器
  const span = element.querySelector("span");
  span.style.display = "none";
  element.addEventListener("animationend", () => {
    if (span.attributes.getNamedItem("footer-show").value == "false") {
      span.style.display = "none";
    }
  });
  // 显示和隐藏动画效果的处理
  element.addEventListener("mouseenter", () => {
    span.style.display = "block";
    span.setAttribute("footer-show", "true");
  });
  element.addEventListener("mouseleave", () =>
    span.setAttribute("footer-show", "false")
  );
}
