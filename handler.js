import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js'
import { html } from 'lit';
import './components/simple-greeting.js';

const template = (name) => html`
  <simple-greeting .name="${name}"></simple-greeting>
`;

export async function handler(data) {
  const { name } = data;
  const ssrResult = render(template(name));
  const contents = await collectResult(ssrResult);

  console.log({ contents });

  return new Response(contents, {
    headers: new Headers({
      'Content-Type': 'text/html'
    })
  });
}

(async () => {
  await handler({ 'name': 'handler' });
})();