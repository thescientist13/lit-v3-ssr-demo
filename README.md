# lit-v3-ssr-demo

A repo for running Lit+SSR demos using v3.

## Setup

1. Clone the repo
1. Run `npm ci`

## Demos

### Greeting ✅

This is the Greeting example taken from the [Lit playground](https://lit.dev/playground/) and following [this section of the docs](https://lit.dev/docs/ssr/server-usage/#rendering-templates).

The code is in _greeting.js_ and you can run it with `npm run demo:greeting`.  The output is as expected with the attribute value being reflected in the output.
```sh
{
  greetingHtml: '\n' +
    '  <simple-greeting  name="World"><template shadowroot="open" shadowrootmode="open"><style>p { color: blue }</style><!--lit-part EvGichL14uw=--><p>Hello, <!--lit-part-->World<!--/lit-part-->!</p><!--/lit-part--></template></simple-greeting>\n'
}
```

### Document 🚫

This is the "document" example taken from this [GitHub issue](https://github.com/lit/lit/issues/2441#issuecomment-1816903951) and following [this section of the docs](https://lit.dev/docs/ssr/server-usage/#collectresult()).

The code is in _document.js_ and you can run it with `npm run demo:document`.

Getting an error about invalid locations though?
```sh
file:///Users/owenbuckley/Workspace/github/lit-v3-ssr-demo/node_modules/@lit-labs/ssr/lib/render-value.js:605
    throw new Error(errorMsg);
          ^

Error:
    Unexpected final partIndex: 2 !== 3 while processing the following template:


  <!DOCTYPE html>
  <html lang="${...}">
    <head>
      <!-- Works within a server only template -->
      <title>${...}</title>
    </head>
    <body>
      <p>${...}</p>
    </body>
  </html>


    This could be because you're attempting to render an expression in an invalid location. See
    https://lit.dev/docs/templates/expressions/#invalid-locations for more information about invalid expression
    locations.
```