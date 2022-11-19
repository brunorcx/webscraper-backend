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
        const rating = Math.floor(Math.random() * 5) + 1;
        products.push({
          name: name.toLocaleUpperCase(),
          price: Number(price),
          tags: tags.toString() === "Acougue" ? "Carnes" : tags,
          id: id,
          img: image,
          rating: rating < 5 ? rating + Math.floor(Math.random() * 2) * 0.5 : rating,
          mall: "goiana",
        });
      }
    }
  }
  await browser.close();
  return products;
}

const scrapeProductsGaviao = async (url) => {
  let links = [];
  const browser = await webkit.launch();
  const page = await browser.newPage();
  await page.goto(url);
  //Select all page links
  const elements = await page.$$("div.department a");
  const baseUrl = url.replace(new RegExp(`\/supermercadogaviao.*`), "");
  for (const el of elements) {
    let link = await el.getAttribute("href");
    links.push(baseUrl + link);
  }

  await browser.close();
  const products = await collectProductsGaviao(links);
  return products;
};

async function collectProductsGaviao(links) {
  let products = [];

  const browser = await webkit.launch();
  const page = await browser.newPage();

  //Only select 3 categories
  links = links.filter((link) => {
    return link.indexOf("carnes") !== -1 || link.indexOf("feira") !== -1 || link.indexOf("padaria") !== -1;
  });
  for (const link of links) {
    let sectionCount = 0;
    let tag = "";
    let subSections = [];

    const [url, tagUrl] = link.split("produtos/");
    tag = tagUrl === "feira" ? "Hortifruti" : tagUrl === "padaria" ? "Padaria" : "Carnes";

    await page.goto(link);
    await page.waitForSelector(".spinner-area", {
      state: "hidden",
    });

    //Access each subsection page of current tag
    const elements = await page.$$(".title-link-department");
    const baseUrl = url.replace(new RegExp(`\/supermercadogaviao.*`), "");
    for (const el of elements) {
      let subLink = await el.getAttribute("href");
      subSections.push(baseUrl + subLink);
    }

    while (sectionCount < subSections.length) {
      await page.goto(subSections[sectionCount]);
      let currentHeight = 0;
      let productsArea = page.locator(".products-view-body");
      while (true) {
        await productsArea.press("End");
        let height = await productsArea.boundingBox().then((size) => size?.height);
        if (height && height > currentHeight) {
          currentHeight = height;
        } else break;
      }
      const namesElement = await page.$$(".list-product-item .txt-desc-product-item a");
      const prices = await page.$$(".list-product-item .area-bloco-preco");
      const images = await page.$$(".list-product-item img");

      for (let i = 0; i < namesElement.length; i++) {
        const name = await namesElement[i].innerText();
        const price = (await prices[i].innerText()).replace(",", ".").match(new RegExp(`[0-9]+\.?[0-9]*`)) || "null";
        const id = await namesElement[i].getAttribute("href");
        const image = await images[i].getAttribute("src");
        const rating = Math.floor(Math.random() * 5) + 1;
        products.push({
          name: name.toLocaleUpperCase(),
          price: Number(price[0]),
          tags: tag,
          id: id,
          img: image,
          rating: rating < 5 ? rating + Math.floor(Math.random() * 2) * 0.5 : rating,
          mall: "gaviao",
        });
      }
      sectionCount++;
    }
  }
  await browser.close();
  return products;
}

const scrapeProductsAtacadao = async (url) => {
  let links = [];
  const browser = await webkit.launch();
  const page = await browser.newPage();
  await page.goto(url);

  //State
  await page.click("#select2-input-state-container");
  await page.fill(".select2-search__field", "RR");
  await page.press(".select2-search__field", "Enter");
  //City
  await page.click("#select2-input-city-container");
  await page.fill(".select2-search__field", "Boa Vista");
  await page.press(".select2-search__field", "Enter");
  //Confirm
  await page.click(".js-btn-change-city");

  //Select all page links
  await page.waitForSelector(".js-change-city-form", {
    state: "hidden",
  });
  await page.waitForSelector("ul.js-highlight-categories-footer", {
    state: "visible",
  });
  const elements = await page.$$("ul.js-highlight-categories-footer a");
  const baseUrl = "https://www.atacadao.com.br";
  for (const el of elements) {
    let link = await el.getAttribute("href");
    links.push(baseUrl + link);
  }

  const products = await collectProductsAtacadao(links, page);
  await browser.close();
  return products;
};

async function collectProductsAtacadao(links, page) {
  let products = [];

  //Only select 2 categories
  links = links.filter((link) => {
    return link.indexOf("hortifruti") !== -1 || link.indexOf("carnes") !== -1;
  });
  //Select state
  for (const link of links) {
    let tag = "";

    const [url, tagUrl] = link.split("br/");
    tag = tagUrl === "hortifruti/" ? "Hortifruti" : "Carnes";

    await page.goto(link);
    await page.waitForSelector(".js-simplex-text", {
      state: "visible",
    });

    let currentHeight = 0;
    let productsArea = page.locator(".product-results");
    while (true) {
      await productsArea.press("End");
      await productsArea.press("PageUp");
      await productsArea.press("PageUp");
      await productsArea.press("PageDown");
      let height = await productsArea.boundingBox().then((size) => size?.height);
      if (height && height > currentHeight) {
        currentHeight = height;
      } else break;
    }
    const namesElement = await page.$$(".product-box .product-box__name");
    const prices = await page.$$(".product-box .product-box__price--number");
    const images = await page.$$(".product-box .product-box__img img");
    const linksElement = await page.$$(".product-box a");

    for (let i = 0; i < namesElement.length; i++) {
      const name = await namesElement[i].innerText();
      const price = (await prices[i].innerText()).replace(",", ".");
      const id = await linksElement[i].getAttribute("href");
      const image = await images[i].getAttribute("src");
      const rating = Math.floor(Math.random() * 5) + 1;
      products.push({
        name: name.toLocaleUpperCase(),
        price: Number(price),
        tags: tag,
        id: id,
        img: image,
        rating: rating < 5 ? rating + Math.floor(Math.random() * 2) * 0.5 : rating,
        mall: "atacadao",
      });
    }
  }
  return products;
}

module.exports = { scrapeProducts, scrapeProductsGaviao, scrapeProductsAtacadao };
