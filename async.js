import { render, html } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js'
import './components/async-simple-greeting.js';

const greetingResult = html`
  <simple-greeting></simple-greeting>
`;
const greetingHtml = await collectResult(render(greetingResult));

// greeting should say "Hello ASYNC"
console.log({ greetingHtml });