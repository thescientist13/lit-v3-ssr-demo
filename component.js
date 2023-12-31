import { render, html } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import './components/greeting-page.js';

const pageTemplate = html`
  <greeting-page></greeting-page>
`;

const ssrResult = render(pageTemplate);
const ssrContent = await collectResult(ssrResult);

console.log({ ssrContent });