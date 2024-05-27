const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio"); // 用于解析HTML
const JSON5 = require("json5"); // 用于解析和写入非严格格式的JSON

// 读取HTML文件，假设它位于public目录下
const indexPath = path.join(__dirname, "public/index.html");
const htmlContent = fs.readFileSync(indexPath, "utf8");

// 使用Cheerio解析HTML
const $ = cheerio.load(htmlContent);

// 假设搜索数据在HTML中的一个ID为"data-search-index"的元素中
const searchDataElement = $("#data-search-index");
const rawData = searchDataElement.text().trim();

// 将原始数据转换为JSON5格式，便于解析
const jsonData = JSON5.parse(rawData);

// 为每种语言创建一个单独的Lunr.js索引文件
const languages = ["en", "zh-cn"]; // 你的语言列表
languages.forEach((lang) => {
  const langIndex = jsonData.find((item) => item.language === lang);

  if (langIndex) {
    const langIndexPath = path.join(
      __dirname,
      `public/_index/${lang}/search_index.json`
    );
    fs.writeFileSync(langIndexPath, JSON.stringify(langIndex, null, 2));
  } else {
    console.warn(`No index found for language: ${lang}`);
  }
});

console.log("Lunr.js index files generated successfully.");
