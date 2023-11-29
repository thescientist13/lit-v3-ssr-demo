import { render, html } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js'
import './simple-greeting.js';

const greetingResult = html`
  <simple-greeting name="World"></simple-greeting>
`;
const greetingHtml = await collectResult(render(greetingResult));

console.log({ greetingHtml });