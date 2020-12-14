const fs = require('fs');

const globby = require('globby');
const prettier = require('prettier');
const packageJson = require('../package.json');

(async () => {
  const prettierConfig = packageJson.prettier;

  // Ignore Next.js specific files (e.g., _app.js) and API routes.
  const pages = await globby([
    'pages/**/*{.js,.mdx,.md}',
    'posts/**/*{.js,.mdx,.md}',
    '!pages/**/[*.js',
    '!pages/_*.js',
    '!pages/api',
  ]);
  const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${pages
              .map((page) => {
                const path = page
                  .replace('pages', '')
                  .replace('.js', '')
                  .replace('.mdx', '')
                  .replace('.md', '');
                const route =
                  path === '/index' ? '' : path[0] === '/' ? path : `/${path}`;

                return `
                        <url>
                            <loc>${`https://derekndavis.com${route}`}</loc>
                        </url>
                    `;
              })
              .join('')}
        </urlset>
    `;

  // If you're not using Prettier, you can remove this.
  const formatted = prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  });

  fs.writeFileSync('public/sitemap.xml', formatted);
})();
