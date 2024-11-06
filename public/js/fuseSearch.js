let fuse;
const articlesContainer = document.getElementById("list-articles-container");
const originalArticles = articlesContainer.innerHTML;
async function loadJson() {
  const currentUrl = window.location.href;
  const baseUrl = window.location.protocol + "//" + window.location.host;
  const currentLang = currentUrl.split("/")[3];
  const jsonUrl = baseUrl + "/" + currentLang + "/index.json";
  return await fetch(jsonUrl)
    .then((response) => response.json())
    .then((data) => data.filter((item) => !item.type))
    .catch((error) => console.error("Error:", error));
}
loadJson()
  .then((data) => {
    var options = {
      // fuse.js options; check fuse.js website for details
      shouldSort: true,
      location: 0,
      distance: 100,
      threshold: 0.4,
      minMatchCharLength: 2,
      keys: [
        "permalink",
        "title",
        "tags",
        "contents",
        "categories",
        "series",
        "summary",
      ],
    };
    const fuseIndex = Fuse.createIndex(options.keys, data);
    fuse = new Fuse(data, options, fuseIndex);
  })
  .catch((error) => console.error(error));
function executeSearch(term) {
  const results = fuse.search(term); // the actual query being run using fuse.js
  console.log(results);
  results.length !== 0 && sortResults(results);
}
document.getElementById("list-search-input").onkeyup = (e) => {
  fuse && executeSearch(e.target.value);
  !e.target.value && (articlesContainer.innerHTML = originalArticles);
};
function sortResults(results) {
  articlesContainer.innerHTML = "";
  const links = results.forEach((result) => {
    // 文章标签
    const alink = document.createElement("a");
    alink.href = result.item.permalink;
    alink.className = "list-article-container";
    // 文章信息容器
    const articleMsg = document.createElement("div");
    // 文章标题
    const articleTitle = document.createElement("span");
    articleTitle.className = "list-article-title";
    articleTitle.innerText = result.item.title;
    // 文章创建日期
    const articleTime = document.createElement("p");
    articleTime.className = "list-article-time-container";
    const date = new Date(result.item.date);
    articleTime.innerHTML = `<i class="bi bi-calendar3"></i><span style="margin: 0 2px">${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}</span>`;
    // 添加标题和日期
    articleMsg.appendChild(articleTitle);
    articleMsg.appendChild(articleTime);
    // 文章标签
    if (result.item.tags) {
      const articleTags = document.createElement("p");
      articleTags.className = "list-article-tags-container";
      articleTags.innerHTML = `<i class="iconfont icon-Tags list-article-term"></i>`;
      result.item.tags.forEach((item) => {
        const tag = document.createElement("span");
        tag.className = "list-article-tag-card";
        tag.innerText = item;
        articleTags.appendChild(tag);
      });
      articleMsg.appendChild(articleTags);
    }
    // 文章分类
    if (result.item.categories) {
      const articleCategories = document.createElement("p");
      articleCategories.className = "list-article-terms-container";
      articleCategories.innerHTML = `<i class="iconfont icon-Category list-article-term"></i>`;
      result.item.categories.forEach((item) => {
        const tag = document.createElement("span");
        tag.className = "list-article-tag-card";
        tag.innerText = item;
        articleCategories.appendChild(tag);
      });
      articleMsg.appendChild(articleCategories);
    }

    // 文章系列
    if (result.item.series) {
      const articleSeries = document.createElement("p");
      articleSeries.className = "list-article-terms-container";
      articleSeries.innerHTML = `<i class="iconfont icon-Series list-article-term"></i>`;
      result.item.series.forEach((item) => {
        const tag = document.createElement("span");
        tag.className = "list-article-tag-card";
        tag.innerText = item;
        articleSeries.appendChild(tag);
      });
      articleMsg.appendChild(articleSeries);
    }

    // 文章摘要
    const articleDescription = document.createElement("span");
    articleDescription.className = "list-article-description";
    articleDescription.innerText = result.item.summary;
    // 文章信息容器按顺序添加元素

    articleMsg.appendChild(articleDescription);
    alink.appendChild(articleMsg);
    articlesContainer.appendChild(alink);
  });
}
