# Design decisions

On the one hand state of the art should be used, on the other hand as many browsers as possible should be supported.

→ Support browsers that support Flexbox ([98.74%](https://caniuse.com/#feat=flexbox)):
Chrome 21, Internet Explorer 10, Firefox 22, Android Browser 21, etc. and higher

See:
* [Browser support](https://caniuse.com/)
* Tutorial/specification: [CSS](https://www.w3schools.com/csS/default.asp), [JavaScript](https://www.w3schools.com/js/default.asp)
* JavaScript minifiers:
  * https://javascript-minifier.com/
  * https://javascriptminifier.com/


## General layout (CSS): [`Flexbox`](https://www.w3schools.com/csS/css3_flexbox.asp) ([tutorial](https://css-tricks.com/snippets/css/a-guide-to-flexbox/), [98.74%](https://caniuse.com/#feat=flexbox))

* Instead of `float`, layout via tables (both are deprecated for that) and `gridx` (since it is too new and not yet widely supported)
* TODO Add fallback for IE 6-9 (see [Flexbox Fallbacks](http://maddesigns.de/flexbox-fallbacks-2670.html))


## Navigation and deep linking

Going back in the browser history can cause issues in combination with deep linking, since the navigation is done in
the iframe except for the search page which is not shown in the iframe.
The problem is that when going back to a search page, the search might need to be submitted again and for this the
query must be known.

Ways that don't work:

* Deep link containing query as hash of the top window (`...#q=...`) set via
  [`history.pushState(...)`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState):
  top window hash might not be restored when navigation happens also in the content iframe
* Query as hash or as query of the content iframe set via
  [`history.pushState(...)`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState):
  conflicts with existing hashes/queries of content pages and does not work with external content pages
* [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) used in content iframe
  containing the query: not allowed in Internet Explorer for security reasons

Chosen solution:

* For full search set content iframe instead of doing a remote request and get result from live DOM of the iframe
  when loaded


## Search

* Without [interim results](https://github.com/howlger/Eclipse-Help-Modernized/blob/541481f486008f665244446052d2a7e6d147223c/de.agilantis.help_ui_modernized/index.js#L482-L513) displayed [semi-transparent](https://github.com/howlger/Eclipse-Help-Modernized/blob/541481f486008f665244446052d2a7e6d147223c/de.agilantis.help_ui_modernized/index.js#L607) since this is only helpful in rare cases (very slow responds and previous cached query containing hits of current query)

To simulate a slow response replace `return function(data) {` with

```
                return function(data) {
setTimeout(function(data) { return function() {processData(data)}}(data), 1000);
};
function processData(data) {
```


## Issues caused by `<iframe>`

To catch mouse and click events (for slider and drop-down menues) add an overlay element covering the whole page (see `createOverlay()`).

Debug overlay by adding the following line after the line `overlayStyle.width = '100%';`:

```
overlayStyle.background = 'rgba(200, 100, 100, .2)';
```
