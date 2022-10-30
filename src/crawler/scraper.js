//@ts-check
const { webkit } = require("playwright");

const scrapeProducts = async (url) => {
  let links = [];
  const browser = await webkit.launch();
  const page = await browser.newPage();
  await page.goto(url);
  //Select all page links
  const elements = await page.$$("div.todos-os-departamentos h4 a");
  const baseUrl = url.replace(new RegExp(`\/loja.*`), "");
  for (const el of elements) {
    let link = await el.getAttribute("href");
    links.push(baseUrl + link);
  }

  // await page.(screenshot({ path: `example.png` });
  await browser.close();
  const products = await collectProducts(links);
  return products;
};

async function collectProducts(links) {
  let products = [];

  const browser = await webkit.launch();
  const page = await browser.newPage();

  //Only select 3 categories
  links = links.filter((link) => {
    return link.indexOf("acougue") !== -1 || link.indexOf("hortifruti") !== -1 || link.indexOf("padaria") !== -1;
  });
  for (const link of links) {
    let sectionCount = 0;
    let pageNotFound = false;
    let tags = [];

    let tagsUrl = link.match(new RegExp(`[a-z]*-([a-z]*-*)*`))[0].split("-");
    for (let i = 0; i < tagsUrl.length - 1; i++) {
      tags[i] = tagsUrl[i][0].toUpperCase() + tagsUrl[i].substr(1);
    }

    //Access each subsection of products
    while (!pageNotFound) {
      sectionCount++;
      await page.goto(link + "?page=" + sectionCount);
      pageNotFound = await page.isVisible(".box-no-result-sad");
      //Get all elements
      const namesElement = await page.$$(".box-produto .caption .nome");
      const pricesInt = await page.$$(".box-produto.box-produto .prices .inteiro");
      const pricesFloat = await page.$$(".box-produto.box-produto .prices .decimal");
      const linksElement = await page.$$(".box-produto.box-produto .media a");
      const images = await page.$$(".box-produto .media img");

      for (let i = 0; i < namesElement.length; i++) {
        const name = await namesElement[i].innerText();
        const priceInt = await pricesInt[i].innerText();
        const priceFloat = await pricesFloat[i].innerText();
        const price = priceInt + priceFloat.replace(new RegExp(","), ".");
        const id = await linksElement[i].getAttribute("href");
        const image = await images[i].getAttribute("data-src");
        // await images[i].screenshot({ path: `example.png` });
        products.push({
          name: name,
          price: Number(price),
          tags: tags,
          id: id,
          img: image,
        });
      }
    }
  }
  await browser.close();
  return products;
}

module.exports = { scrapeProducts };
