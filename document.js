import { render, html } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js'

const template = ({ title, lang }) => html`
  <!DOCTYPE html>
  <html lang="${lang}">
    <head>
      <!-- Works within a server only template -->
      <title>${title}</title>
    </head>
    <body>
      <p>${title}</p>
    </body>
  </html>
`;

const ssrResult = render(template({ title: 'My Website', lang: 'en'}));
const ssrContent = await collectResult(ssrResult);

console.log({ ssrContent });