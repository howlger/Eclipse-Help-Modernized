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
