/*******************************************************************************
 * Copyright (c) 2020 Holger Voormann and others.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
(function(window, document) {

    var SMALL_SCREEN_WIDTH = 768;
    var TOC_SLIDER_HALF_WIDTH = 12 / 2;
    var TOC_SIDEBAR_DEFAULT_WIDTH = 380;
    var TOC_SIDEBAR_MINIMUM_WIDTH = 64;
    var TOC_SIDEBAR_WIDTH_COOKIE_NAME = 'toc_width';
    var TOC_ICON_DESCRIPTION = 'Toggle table of content';
    var TOC_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill-rule="evenodd" fill="currentColor" d="M19 5H1V3h18v2zm0 10H1v2h18v-2zm-4-6H1v2h14V9z" clip-rule="evenodd"/></svg>';
    var MENU_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill-rule="evenodd" fill="currentColor" d="M 10 1.5 A 2 2 0 0 0 8 3.5 A 2 2 0 0 0 10 5.5 A 2 2 0 0 0 12 3.5 A 2 2 0 0 0 10 1.5 z M 10 8 A 2 2 0 0 0 8 10 A 2 2 0 0 0 10 12 A 2 2 0 0 0 12 10 A 2 2 0 0 0 10 8 z M 10 14.5 A 2 2 0 0 0 8 16.5 A 2 2 0 0 0 10 18.5 A 2 2 0 0 0 12 16.5 A 2 2 0 0 0 10 14.5 z" clip-rule="evenodd"/></svg>';
    var MENU_ICON_DESCRIPTION = 'Show menu';
    var MENU_CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill-rule="evenodd" fill="currentColor" d="M 4.34375 2.9296875 L 2.9296875 4.34375 L 8.5859375 10 L 2.9296875 15.65625 L 4.34375 17.070312 L 10 11.414062 L 15.65625 17.070312 L 17.070312 15.65625 L 11.414062 10 L 17.070312 4.34375 L 15.65625 2.9296875 L 10 8.5859375 L 4.34375 2.9296875 z" clip-rule="evenodd"/></svg>';
    var MENU_CLOSE_ICON_DESCRIPTION = 'Show menu';
    var TREE_HANDLE = '<svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation">-<path d="M10.294 9.698a.988.988 0 0 1 0-1.407 1.01 1.01 0 0 1 1.419 0l2.965 2.94a1.09 1.09 0 0 1 0 1.548l-2.955 2.93a1.01 1.01 0 0 1-1.42 0 .988.988 0 0 1 0-1.407l2.318-2.297-2.327-2.307z" fill="currentColor" fill-rule="evenodd"/></svg>';
    var BOOK_NAME_SHORTENER = function shortenBookName(bookName) { return bookName.replace(/\s+(Documentation\s*)?(\-\s+([0-9,\-]+\s+)?Preview(\s+[0-9,\-]+)?\s*)?$/i, ''); };
    var SEARCH_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g fill="#fff"><path fill-rule="evenodd" fill="currentColor" d="M 7.5 0 C 3.3578644 0 0 3.3578644 0 7.5 C 0 11.642136 3.3578644 15 7.5 15 C 8.8853834 14.997 10.242857 14.610283 11.421875 13.882812 L 17.185547 19.662109 C 17.632478 20.113489 18.36112 20.112183 18.8125 19.660156 L 19.623047 18.845703 C 20.072507 18.398153 20.072507 17.665594 19.623047 17.214844 L 13.871094 11.447266 C 14.607206 10.26212 14.998156 8.8951443 15 7.5 C 15 3.3578644 11.642136 0 7.5 0 z M 7.5 2 A 5.5 5.5 0 0 1 13 7.5 A 5.5 5.5 0 0 1 7.5 13 A 5.5 5.5 0 0 1 2 7.5 A 5.5 5.5 0 0 1 7.5 2 z" clip-rule="evenodd"/></g></svg>';
    var SEARCH_FIELD_DESCRIPTION = '* = any string\n? = any character\n"" = phrase\nAND, OR & NOT = boolean operators';
    var SEARCH_FIELD_PLACEHOLDER = 'Search';
    var SEARCH_HITS_MAX = 500;
    var SEARCH_AS_YOU_TYPE_PROPOSAL_MAX = 7;
    var SEARCH_RESULTS_PATTERN = new RegExp('<tr[^<]*<td[^<]*<img[^<]*</td[^<]*<td[^<]*<a\\s+(?:(?:class|id|title|onmouseover|onmouseout)\\s*=\\s*(?:(?:\'[^\']*\')|(?:"[^"]*"))\\s+)*href="([^"]*)"(?:\\s+o\\w+="[^"]*")*\\s+title="([^"]*)"[^>]*>([^<]*)</a>(?:(?:(?!<[/]?tr)[\\s\\S])*</tr\\s*>\\s*<tr(?:(?!</tr)(?!class="location">)[\\s\\S])*class="location">((?:(?!</div)[\\s\\S])*))?(?:(?:(?!</tr)(?!\\sclass=["\']description["\'])[\\s\\S])*</tr){1,2}(?:(?!</tr)(?!\\sclass=["\']description["\'])[\\s\\S])*\\sclass=["\']description["\'][^>]*>([^<]*)', 'g');
    var SEARCH_RESULTS_BREADCRUMB_SNIPPET_PATTERN = new RegExp('<a\\s+href="([^"]+)">([^<]+)</a>', 'g');
    var SEARCH_AS_YOU_TYPE_CACHE_SIZE = 7;
    var SEARCH_FULL_SEARCH_CACHE_SIZE = 3;
    var SEARCH_DELAY_IN_MILLISECOND = 99;
    var SEARCH_CACHE = {fi: -1, f: [], ti: -1, t: [] };

    // TODO integration: the browser should not have to calculate the following variables itself;
    //                   only "init()" should be called instead
    var iconExtension = '.svg';
    var title = 'Help';

    var searchPage;
    var currentSearch = {};

    addEvent(window, 'load', function() {

        // title
        remoteRequest((window.INTEGRATED ? '' : '../../') + 'index.jsp?legacy', function(responseText) {
            var match = new RegExp('<title>([^<]*)</title>').exec(responseText);
            if (!match) return;
            var element = createElement(null, 'div');
            element.innerHTML = match[1];
            title = element.textContent || element.innerText;
            document.title = title;
        });

        // .svg or .gif? + embedded?
        remoteRequest((window.INTEGRATED ? '' : '../../') + 'advanced/tabs.jsp', function(responseText) {
            if (responseText.indexOf('e_contents_view.gif') > 0) iconExtension = '.gif';

//            // show history buttons in embedded help, but not in Infocenter mode
//            if (responseText.indexOf('e_bookmarks_view.') > 0) {
//                var ids = ['h-history-back-icon', 'h-history-back-btn', 'h-history-forward-icon', 'h-history-forward-btn'];
//                for (var i = 0; i < ids.length; i++) document.getElementById(ids[i]).style.display = 'inline-block';
//            }

            init();
        });

    });

    function init() {

        // dynamic content area
        searchPage = createElement(getElementById('m'), 0, 'c', 'Loading...');
        searchPage.id = 'r';
        searchPage.s = function(show) {
            searchPage.style.display = show ? 'block' : 'none';
            getElementById('c').style.display = show ? 'none' : 'block';
        }
        searchPage.s(0);

        // TOC sidebar button
        var header = getElementById('h');
        var tocSidebarToggleButton = createElement(header, 'a', 'b');
        tocSidebarToggleButton.href = '#';
        tocSidebarToggleButton.alt = TOC_ICON_DESCRIPTION;
        tocSidebarToggleButton.title = TOC_ICON_DESCRIPTION;
        setInnerHtml(tocSidebarToggleButton, TOC_ICON);

        // TOC slider (to change TOC sidebar width by moving the slider)
        var smallScreenAutoCloseFn = addSlider(tocSidebarToggleButton, createElement(header, 0, 'i'));

        // fill TOC and create search field
        createTree(getElementById('t'),
                   tocContentProvider,
                   function(li, node) {
                       var a = createElement(li, 'a');
                       a.href = node.h;
                       a.target = 'c';
                       addEvent(a, 'click', smallScreenAutoCloseFn);
                       if (node.i) {
                           var iconImg = createElement(a, 'img');
                           iconImg.setAttribute('src', (window.INTEGRATED ? '' : '../../')
                                                       + 'advanced/images/'
                                                       + node.i
                                                       + iconExtension);
                       }
                       a.appendChild(document.createTextNode(node.t));
                       return a;
                   },
                   1);

        // TODO remove dummy code
        createElement(getElementById('f'), 'p', false, 'footer');

    }

    function addSlider(tocSidebarToggleButton, headSpacerElement) {

        // create slider element
        var slider = createElement();
        slider.id = 's';
        getElementById('m').insertBefore(slider, getElementById('c'));

        // create overlay required for smooth slider drag'n'drop
        var overlay = createOverlay();

        // TOC sidebar with its style and width
        var tocWidth;
        var tocSidebar = getElementById('t');
        var tocSidebarStyle = tocSidebar.style;
        var headSpacerElementStyle = headSpacerElement.style;

        // slider movement
        function move(e) {
            tocWidth = (e.touches ? e.touches[0].clientX : e.pageX) - TOC_SLIDER_HALF_WIDTH;
            if (tocWidth < 0) {
                tocWidth = 0;
            }
            tocSidebarStyle.width = tocWidth + 'px';
            headSpacerElementStyle.marginRight = (tocWidth < 30 ? 0 : tocWidth - 30) + 'px';
            preventDefault(e);
        }
        function moveEnd(e) {
            if (e.touches) {
                addOrRemoveEventListener(0, 'touchmove', move, 1);
                addOrRemoveEventListener(0, 'touchcancel', moveEnd);
                addOrRemoveEventListener(0, 'touchend', moveEnd);
            } else {
                addOrRemoveEventListener(0, 'mousemove', move);
                addOrRemoveEventListener(0, 'mouseup', moveEnd);
            }
            overlay.o();
            tocSidebarStyle.userSelect = '';
            if (tocWidth < TOC_SIDEBAR_MINIMUM_WIDTH) {
                var oldWidth = getCookie('toc-width');
                tocWidth = oldWidth ? oldWidth : TOC_SIDEBAR_DEFAULT_WIDTH;
                toggleTocSidebar();
            }
            setCookie(TOC_SIDEBAR_WIDTH_COOKIE_NAME, tocWidth);
            preventDefault(e);
            stopPropagation(e);
        }
        function moveStart(e) {
            if (e.which && e.which != 1) return;
            if (e.touches) {
                addOrRemoveEventListener(1, 'touchend', moveEnd);
                addOrRemoveEventListener(1, 'touchcancel', moveEnd);
                addOrRemoveEventListener(1, 'touchmove', move, 1);
            } else {
                addOrRemoveEventListener(1, 'mouseup', moveEnd);
                addOrRemoveEventListener(1, 'mousemove', move);
            }
            overlay.a();
            setClassName(tocSidebar, '');
            tocSidebarStyle.transition = '';
            headSpacerElementStyle.transition = '';
            preventDefault(e);
            stopPropagation(e);
        }
        var documentElement = document.documentElement;
        function addOrRemoveEventListener(add, event, fn, passive) {
            if (add) {
                documentElement.addEventListener(event, fn, passive ? { passive: false } : false);
            } else {
                documentElement.removeEventListener(event, fn, passive ? { passive: false } : false);
            }
        }

        addEvent(slider, 'mousedown', moveStart);
        addEvent(slider, 'touchstart', moveStart);

        // TOC sidebar toggling
        function toggleTocSidebar(e, initialize, asSmallScreenAutoCloseFn) {
            if (!asSmallScreenAutoCloseFn) {
                preventDefault(e);
            }
            var isSmall = isSmallScreen();
            var currentClass = getClassName(tocSidebar);
            if (asSmallScreenAutoCloseFn && (!isSmall || currentClass != 'show')) return;
            var hideToc = isSmall ? currentClass == 'show' : tocWidth > 0;
            if (initialize) {
                tocWidth = -getCookie(TOC_SIDEBAR_WIDTH_COOKIE_NAME, TOC_SIDEBAR_DEFAULT_WIDTH);
                hideToc = isSmall || tocWidth > 0;
            } else {
                tocSidebarStyle.transition = 'width .25s ease-in';
                headSpacerElementStyle.transition = 'margin-right .25s ease-in';
            }
            setClassName(tocSidebar, isSmall ? (hideToc ? '' : 'show') : (hideToc ? 'hide' : ''));
            if (initialize || !isSmall) {
                tocWidth = -tocWidth;
                if (!initialize) {
                    setCookie(TOC_SIDEBAR_WIDTH_COOKIE_NAME, tocWidth);
                }
            }
            if (initialize || !isSmall) {
                tocSidebarStyle.width =   (hideToc ? 0 : tocWidth > TOC_SIDEBAR_MINIMUM_WIDTH
                                                         ? tocWidth
                                                         : TOC_SIDEBAR_DEFAULT_WIDTH)
                                        + 'px';
                headSpacerElementStyle.marginRight = (hideToc ? 6 : (tocWidth < 30 ? 0 : tocWidth - 30)) + 'px';
            }
            tocSidebarStyle.userSelect = hideToc ? 'none' : '';
            if (!hideToc && tocSidebar.f) {
                tocSidebar.f();
            }
        }
        toggleTocSidebar(0, 1);
        addEvent(slider, 'dblclick', toggleTocSidebar);
        addEvent(tocSidebarToggleButton, 'click', toggleTocSidebar);

        // function to close TOC if screen is small
        return function(e) {
            toggleTocSidebar(e, 0, 1);
        };

    }

    function tocContentProvider(node, processChildrenFn) {
        var callbackUrl =   (window.INTEGRATED ? '' : '../../') + 'advanced/tocfragment'
                          + (node
                             ?   (node.toc ? '?toc=' + node.toc : '')
                               + (node.path ? '&path=' + node.path : '')
                             : '');
        remoteRequest(callbackUrl, (function(toc, path) {
            return function(responseText) {
                var nodes = getXmlNodes(parseXml(responseText), toc, path);
                var children = [];
                for (var i = 0; i < nodes.length; i++) {
                    var n = nodes[i];
                    if (n.tagName != 'node') continue;
                    children.push({
                        n/*ode*/: {
                            toc: toc ? toc : getAttribute(n, 'id'),
                            path: toc ? getAttribute(n, 'id') : 0,
                            t: getAttribute(n, 'title'),
                            h: (window.INTEGRATED ? '' : '../../') + getAttribute(n, 'href').substring(3),
                            i: n.getAttribute('image')
                        },
                        l/*eaf*/: getAttribute(n, 'is_leaf')
                    });
                }
                if (!node) createSearchField(children, '', true);
                processChildrenFn(children);
            };
        })(node ? node.toc : 0, node ? node.path : 0));
        function getXmlNodes(xml, toc, path) {
            var books = xml.documentElement.childNodes;
            if (!toc) return books;
            var book;
            for (var i = 0; i < books.length; i++) {
                book = books[i];
                if (book.tagName == 'node' && toc == book.getAttribute('id')) {
                    if (!path) return book.childNodes;
                    break;
                }
            }
            var nodes = book.childNodes;
            tocLevelLoop: while (1) {
                for (var i = 0; i < nodes.length; i++) {
                    n = nodes[i];
                    if (n.tagName != 'node') continue;
                    var id = n.getAttribute('id');
                    if (path == id) return n.childNodes;
                    if (   id
                        && path.length > id.length
                        && path.substring(0, id.length + 1) == id + '_') {
                        nodes = n.childNodes;
                        continue tocLevelLoop;
                    }
                }
                break;
            }
            return [];
        }
    }

    function isSmallScreen() {
        var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
        return clientWidth <= SMALL_SCREEN_WIDTH;
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Search: search-as-you-type ('t') and full search ('f')

    function createSearchField(bookNodes, defaultBook, showMore) {
        var scope = {n: {}};

        // create overlay required for closing proposals drop-down even when clicking into the content iframe
        var overlay = createOverlay();
        addEvent(overlay, 'click', hideProposals);

        // area (containing scope drop-down, search field and button)
        // "searchFieldAreaWrapper" as workaround for sub-pixel problem in Firefox (1px border might become 0.8px border
        // to align real pixels on high-DPI to CSS px), otherwise proposals drop-down might not correctly aligned with
        // search field area
        var searchFieldAreaWrapper = createElement(getElementById('h'), 0, 'q0');
        var searchFieldArea = createElement(createElement(searchFieldAreaWrapper, 0, 'q1'), 'form', 'q');
        var searchFieldAreaHasFocus;
        var searchFieldAreaContainsQuery;
        var proposals;
        function updateSearchFieldAreaClass() {
            setClassName(searchFieldArea,
                             'q' + (proposals.style.display == 'block' ? 'm' : (searchFieldAreaHasFocus ? 'f' : ''))
                           + (searchFieldAreaContainsQuery ? ' qa' : '')
                         );
        }
        createMenu();

        // scopes drop-down
        var scopeButtonWrapper = createElement(searchFieldArea, 0, 's0');
        var booksButton = createElement(scopeButtonWrapper, 'button', 's');
        setAttribute(booksButton, 'type', 'button');
        booksButtonText = createElement(booksButton, 'span');
        var dropDownHandle = createElement(booksButton, 'span', 'de');
        setInnerHtml(dropDownHandle, TREE_HANDLE);
        var booksDropDown = createElement(scopeButtonWrapper, 0, 'u');
        booksDropDown.style.display = 'none';
        addEvent(booksButton, 'mousedown', function(e) {
            var isOpen = booksDropDown.style.display == 'block';
            try {
                booksButton.focus();
            } catch(e) {}
            booksDropDown.style.display = isOpen ? 'none' : 'block';
            preventDefault(e);
            stopPropagation(e);
        });
        addEvent(booksButton, 'click', function(e) {stopPropagation(e)});
        addEvent(booksButton, 'focus', function() {
            booksDropDown.hasFocus = true;
            booksDropDown.style.display = 'block';
        });
//        addEvent(booksButton, 'blur', function() {
//            booksDropDown.hasFocus = false;
//            setTimeout(function() {if (!booksDropDown.hasFocus) booksDropDown.style.display = 'none'}, 200);
//        });
        var booksDropDownUl = createElement(booksDropDown, 'ul', 'r');
        var menuItems = [];
        var defaultBookData;
        var bookNodesIncludingAll = bookNodes.slice();
        bookNodesIncludingAll.unshift({n: {t: '(All)'}});
        for (var i = 0; i < bookNodesIncludingAll.length; i++) {
            var n = bookNodesIncludingAll[i].n;
            var li = createElement(booksDropDownUl, 'li', null, BOOK_NAME_SHORTENER(n.t));
            menuItems.push(li);
            if (defaultBook && defaultBook == n.toc){
                defaultBookData = [n.t, n.toc, n.h];
            }
        }

        function setBook(bookNode) {
            booksDropDown.style.display = 'none';
            if (scope.n.toc) booksButtonText.removeChild(booksButtonText.firstChild);
            scope = bookNode;
            if (scope.n.toc) booksButtonText.appendChild(document.createTextNode(BOOK_NAME_SHORTENER(bookNode.n.t)));
            setClassName(dropDownHandle, scope.n.toc ? 'd' : 'de');
            search();
        }

        toMenu(booksButton, menuItems, bookNodesIncludingAll, setBook);
        if (defaultBookData) setBook(defaultBookData[0], defaultBookData[1], defaultBookData[2]);

        // search field
        var wrap = createElement(searchFieldArea, 0, 'q2');
        wrap.style.position = 'relative';
        var searchField = createElement(wrap, 'input');
        searchField.id = 'q';
        searchField.type = 'text';
        searchField.alt = SEARCH_FIELD_DESCRIPTION;
        searchField.title = SEARCH_FIELD_DESCRIPTION;
        searchField.autocomplete = 'off';
        searchField.placeholder = SEARCH_FIELD_PLACEHOLDER;
        addEvent(searchField, 'input', search); // for IE 8 do also on 'propertychange'
        addEvent(searchField, 'focus', search);

        var searchButton = createElement(searchFieldArea, 'button', 'b');
        setInnerHtml(searchButton, SEARCH_ICON);
        addEvent(searchFieldArea, 'submit', function(e) {preventDefault(e); search(e, 1);});
addEvent(getElementById('c'), 'load', function() {searchPage.s(0);});

        // hint
        var hintField = createElement(wrap, 'input', 'qh');
        if (searchField.nextSibling) {
            searchField.parentNode.insertBefore(hintField, searchField.nextSibling);
        }
        searchField.style.position = 'relative';
        hintField.style.position = 'absolute';
        hintField.style.left = 0;
        hintField.style.top = 0;
        hintField.style.height = '100%';
        hintField.style.width = '100%';
        hintField.style.background = 'transparent';
        hintField.style.borderColor = 'transparent';
        hintField.setAttribute('disabled', 'disabled');
        wrap.appendChild(searchField);
        searchField.style.background = 'url("data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D") repeat';

        var searchFieldAreaElements = [booksButton, searchField, searchButton];
        for (var i = 0; i < searchFieldAreaElements.length; i++) {
            addEvent(searchFieldAreaElements[i], 'focus', function(e) {
                searchFieldAreaHasFocus = 1;
                updateSearchFieldAreaClass();
            });
            addEvent(searchFieldAreaElements[i], 'blur', function(e) {
                searchFieldAreaHasFocus = 0;
                updateSearchFieldAreaClass();
            });
        }

        // proposals drop-down
        proposals = createElement(searchFieldArea, 0, 'p');
        addEvent(proposals, 'click', function(e) {stopPropagation(e)});
        function showProposals() {
            proposals.style.display = 'block';
            overlay.a();
            updateSearchFieldAreaClass();
        }
        function hideProposals() {
            proposals.style.display = 'none';
            overlay.o();
            updateSearchFieldAreaClass();
        }
        hideProposals();

        // focus search field
        searchField.focus();

        var baseUrl = window.INTEGRATED ? '' : '../../';

        var isKeySelectionMode = false;

        function search(e, fullSearch) {
            var noPendingQueries = !currentSearch[getSearchTypeId(fullSearch)];

            // get query and remember it to detect stale responses
            var query = getQuery();
            currentSearch[getSearchTypeId(fullSearch)] = query;
            var searchWord =  searchField.value

                                  // trim
                                  .replace(/(^\s+|\s+$)/ig, '')

                                  // TODO if Eclipse bug 351077 (https://bugs.eclipse.org/351077), remove following line
                                  .replace(/\-([^\-\s]*$)/ig, ' $1');

            if (fullSearch) {
                currentSearch['t'] = 0;
                hideProposals();
            } else {

                // hide hint
                hintField.value = '';

            }

            // empty search?
            searchFieldAreaContainsQuery = searchWord.length;
            updateSearchFieldAreaClass();
            if (!searchWord.length) {
                if (!fullSearch) {
                    hideProposals();
                }
                return;
            }

            // init UI
            if (fullSearch) {
                searchPage.s(1);
                if (query == searchPage.q) return;
                setInnerHtml(searchPage, 'Searching...');
                searchPage.scrollTop = 0;
            } else if (query == proposals.q) {
                preventDefault(e);
                showProposals();
                return;
            }

            // cached?
            var cache = SEARCH_CACHE[getSearchTypeId(fullSearch)];
            for (var i = 0; i < cache.length; i++) {
                var r = cache[i];
                if (query == r.q) {
                    renderResults(fullSearch, r.r, r.b, query, scope, searchWord);
                    return;
                }
            }

            // submit query to server
            var query =   encodeURIComponent(searchWord.toLowerCase()).replace(/(%20){1,}/g, '+')
                        + (scope.n.toc ? '&toc=' + encodeURIComponent(scope.n.toc).replace(/%20/g, '+') : '');
            var url =   baseUrl
                      + 'advanced/searchView.jsp?searchWord='
                      + query.replace(/(\&|$)/, (fullSearch ? '' : '*') + '$1')
                      + '&maxHits='
                      + (fullSearch ? SEARCH_HITS_MAX : SEARCH_AS_YOU_TYPE_PROPOSAL_MAX)
                      + (query.indexOf('&toc=') < 0 ? '' : '&quickSearch=true&quickSearchType=QuickSearchToc');
            if (noPendingQueries) {
                remoteRequest(url, callbackFor(fullSearch, query, scope, searchWord), getSearchTypeId(fullSearch));
            } else {
                setTimeout(function() {

                    // remote request if and only if not staled/outdated
                    if (query == currentSearch[getSearchTypeId(fullSearch)])
                        remoteRequest(url, callbackFor(fullSearch, query, scope, searchWord), getSearchTypeId(fullSearch));

                }, SEARCH_DELAY_IN_MILLISECOND);
            }

            function callbackFor(fullSearch, query, scope, searchWord) {
                return function(data) {

                    // progress bar (not yet indexed)?
                    if (!new RegExp('window.location.replace[^\\?]*\\?([^"]*)').exec(data)) return;

                    // parse HTML for results
                    var element = createElement();
                    var hasBreadcrumbs = 0;
                    var results = [];
                    for (; (match = SEARCH_RESULTS_PATTERN.exec(data)) != null;) {
                        var items = [];
                        for (var i = 1; i < 6; i++) {
                            element.innerHTML = match[i];
                            items.push((element.textContent ? element.textContent : element.innerText).replace(/^\s+|\s+$/g,'').replace(/\s+/g,' '));
                        }
                        var breadcrumb = [];
                        if (match[4]) {
                            for (; (breadcrumbMatch = SEARCH_RESULTS_BREADCRUMB_SNIPPET_PATTERN.exec(match[4])) != null;) {
                                for (var i = 1; i < 3; i++) {
                                    element.innerHTML = breadcrumbMatch[i];
                                    breadcrumb.push((element.textContent ? element.textContent : element.innerText).replace(/^\s+|\s+$/g,'').replace(/\s+/g,' '));
                                }
                            }
                            hasBreadcrumbs = 1;
                        }
                        results.push({
                            t/*title*/: items[2],
                            d/*description*/:  (items[4] ? items[4] : items[3]),
                            h/*href*/:  items[0].substring(8),
                            b/*breadcrumb*/:  items[4] ? breadcrumb : [0, items[1]]
                        });
                    }

                    // cache parsed results
                    var queryResult = {
                        r/*results*/: results,
                        b/*has breadcrumbs*/: hasBreadcrumbs,
                        q/*query*/: query
                    }
                    var cache = SEARCH_CACHE[getSearchTypeId(fullSearch)];
                    var cacheIndexId = getSearchTypeId(fullSearch) + 'i';
                    var cacheSize = fullSearch ? SEARCH_FULL_SEARCH_CACHE_SIZE : SEARCH_AS_YOU_TYPE_CACHE_SIZE;
                    SEARCH_CACHE[cacheIndexId] = (SEARCH_CACHE[cacheIndexId] + 1) % cacheSize;
                    if (cache.length < cacheSize) {
                        cache.push(queryResult);
                    } else {
                        cache[SEARCH_CACHE[cacheIndexId]] = queryResult;
                    }

                    renderResults(fullSearch, results, hasBreadcrumbs, query, scope, searchWord);
                }

            }

            function renderResults(fullSearch, results, hasBreadcrumbs, query, scope, searchWord) {

                // staled?
                if (query != currentSearch[getSearchTypeId(fullSearch)]) return;

                // show results
                var items = [];
                var data = [];
                var filters = [];
                var filterValues = [];
                function applyFilters(e) {
                    var includeFilters = [];
                    var excludeFilters = [];
                    for (var i = 0; i < filters.length; i++) {
                        var f = filters[i];
                        if (!f.checked && !f.indeterminate) excludeFilters.push(filterValues[i]);
                        if (f.checked && !f.indeterminate) includeFilters.push(filterValues[i]);
                    }
                    for (var i = 0; i < items.length; i++) {
                        items[i].style.display =    arrayContainsPrefix(includeFilters, data[i])
                                                 && !arrayContainsPrefix(excludeFilters, data[i])
                                                 ? 'block'
                                                 : 'none';
                    }
                    stopPropagation(e);
                }

                var parentElement = fullSearch ? searchPage : proposals;
                setInnerHtml(parentElement, '');
                parentElement.q = query;
                if (fullSearch) {

                    // no results?
                    if (!results.length) {
                        var noResults = createElement(searchPage, 0, 'r0', 'No results found for ');
                        createElement(noResults, 'strong', 0, searchWord);
                        return;
                    }

                    // filter tree
                    var filterTree = asTree(results, scope.n.toc ? results[0].b/*breadcrumb*/.slice(0, 2) : [], 9, true);
                    createTree(searchPage,

                        // content provider
                        function(node, processChildrenFn) {
                            if (!node) {
                                processChildrenFn([{ n/*ode*/: {children: filterTree}, l/*eaf*/: 0 }], 1);
                                return;
                            }
                            var children = [];
                            for (var i = 0; i < (node.isNode ? node.children.length : filterTree.length); i++) {
                                var childNode = node ? node.children[i] : filterTree[i];
                                if (childNode.isNode) {
                                    var isLeaf = 1;
                                    for (var j = 0; j < childNode.children.length; j++) {
                                        if (childNode.children[j].isNode) {
                                            isLeaf = 0;
                                            break;
                                        }
                                    }
                                    children.push({ n/*ode*/: childNode, l/*eaf*/: isLeaf });
                                    childNode.p/*arent*/ = node;
                                }
                            }
                            processChildrenFn(children);
                        },

                        // label provider
                        function(li, node) {
                            var isRoot = !node.isNode;

                            // checkbox
                            var checkboxWithLabel = createElement(li);
                            var checkbox = createElement(checkboxWithLabel, 'input', 0);
                            checkbox.type = 'checkbox';
                            checkbox.checked = node.p ? node.p.x.checked : true;
                            node.x = checkbox;
                            if (node.p) {
                                checkbox.parentCheckbox = node.p.x;
                            }
                            checkbox.numberOfResults = isRoot ? results.length : node.count;
                            filters.push(checkbox);
                            filterValues.push(isRoot ? '' : toValue(node.l.concat(node.name)));

                            // label
                            var labelText = '';
                            if (isRoot) {
                                checkbox.style.display = 'none';
                                labelText = 'Results ' + (scope.n.toc ? 'in ' : '');
                            } else {
                                addEvent(checkbox, 'click', (function(liCheck, li) {
                                    return function() {
                                        selectSubtree(li, liCheck.checked);
                                        updateParentsChecks(liCheck);
                                        applyFilters();
                                    };
                                })(checkbox, li));
                                for (var i = 0; i < node.name.length; i+=2) {
                                    labelText += (i == 0 ? '' : ' > ') + node.name[i+1];
                                }
                            }
                            var label = createElement(checkboxWithLabel, 'span', node.isNode ? 0 : 't', labelText + ' ');
                            if (isRoot && scope.n.toc) {
                                createElement(label, 'span', 'tl', scope.n.t + ' ');
                            }
                            createElement(label, 'span', 'count', checkbox.numberOfResults);
                            addEvent(label, 'click', (function(checkbox, li) {
                                return function() {
                                    var root;
                                    for (root = checkbox; root.parentCheckbox; root = root.parentCheckbox);
                                    for (var i = 0;  i < 5; i++) {
                                        root = getParentElement(root);
                                        if (root.tagName == 'UL') break;
                                    }
                                    selectSubtree(root, false);
                                    selectSubtree(li, true);
                                    updateParentsChecks(checkbox);
                                    applyFilters();
                                };
                            })(checkbox, li));

                            return checkboxWithLabel;
                        },
                        0);

                }
                var resultList = createElement(parentElement, 'ol', 'j');
                if (!fullSearch) {

                    // no results?
                    if (!results.length) return;

                    // hint
                    var wordBeginRegEx = queryToRegEx(query);
                    var newHints = {};
                    var rankingUnit = 1 / results.length;
                    for (var i = 0; i < results.length && searchWord.length < 36; i++) {
                        var match = wordBeginRegEx.exec(results[i].t/*title*/);
                        if (match) {
                            var pHint = match[0].toLowerCase();
                            newHints[pHint] =   (newHints[pHint] ? newHints[pHint] : 0)
                                              + (1 + (results.length - i) / results.length) / results.length;
                        }
                        match = wordBeginRegEx.exec(results[i].d/*description*/);
                        if (match) {
                            var pHint = match[0].toLowerCase();
                            newHints[pHint] =   (newHints[pHint] ? newHints[pHint] : 0)
                                              + (0.7 + (results.length - i) / results.length) / results.length;
                        }
                    }
                    var allHints = [];
                    for (var i in newHints) {
                        if (newHints[i] < 1.8 / results.length) continue;
                        allHints.push(newHints[i].toFixed(7) + i);
                    }
                    allHints.sort().reverse();
                    hintField.value = allHints.length > 0
                                      ? searchField.value + wordBeginRegEx.exec(allHints[0].substring(9))[1]
                                      : '';

                    // query proposals
                    for (var i = 0; i < allHints.length && i < 3; i++) {
                        var hintText = allHints[i].substring(9);
                        var li = createElement(resultList, 'li');
                        var button = createElement(li, 'button');
                        var spacerElementStyle = createElement(button, 'span').style;
                        spacerElementStyle.display = 'inline-block';
                        spacerElementStyle.width = booksButton.offsetWidth + 'px';
                        createElement(button, 'span', null, hintText.substring(0, searchWord.length));
                        createElement(button, 'strong', null, hintText.substring(searchWord.length));
                        items.push(li);
                        data.push([hintText]);
                    }

                }

                function toValue(path) {
                    var result = '';
                    for (var i = 0; i < path.length; i++) result += (i > 0 ? '\n' : '') + path[i];
                    return result;
                }

                // list results
                for (var i = 0; i < results.length; i++) {
                    var node = results[i];
                    var li = createElement(resultList, 'li');
                    var a = createElement(li, 'a');
                    a.href = baseUrl + 'topic' + node.h/*href*/;
                    a.target = 'c';
                    var titleAndLocation = createElement(a, 0, 'm');

                    // title
                    addHighlightedText(createElement(titleAndLocation, 0, 'v'), node.t/*title*/, searchWord);

                    // show book title only for no book scope
                    if (!fullSearch && !scope.n.toc) {
                        createElement(titleAndLocation, 0, 'w', node.b/*breadcrumb*/[1]);
                    }

                    // breadcrumb
                    if (fullSearch && hasBreadcrumbs && node.b/*breadcrumb*/) {
                        var location = createElement(titleAndLocation, 0, 'w');
                        for (var j = scope.n.toc ? 2 : 0; j < node.b/*breadcrumb*/.length; j+=2) {
                            var breadcrumbItem = createElement(location, 'span', 0, node.b/*breadcrumb*/[j+1]);
                            if (j < node.b/*breadcrumb*/.length-2) {
                                createElement(location, 'span', 0, ' > ');
                            }
                        }
                    }

                    // description
                    addHighlightedText(createElement(a, 0, 'n'), node.d/*description*/, searchWord);

                    // UI element and corresponding data
                    items.push(li);
                    if (fullSearch) {
                        var resultofStart = node.h/*href*/.indexOf('?resultof=');
                        var hrefNormed = '../topic' + (resultofStart < 0 ? node.h/*href*/ : node.h/*href*/.substring(0, resultofStart));
                        data.push(toValue(node.b/*breadcrumb*/.slice(0, n.path.length).concat(hrefNormed).concat(node.t/*title*/)));
                    } else {
                        data.push([node.t/*title*/, node.h/*href*/]);
                    }

                }

                // add key support (and show proposals)
                if (fullSearch) {
                    toMenu(searchField, items, results, function(d) {
                            getElementById('c').src = baseUrl + 'topic' + d.h/*href*/;
                        },
                        0,
                        0,
                        function(item, data, viaMouse) {
                            if (!viaMouse) {
                                scrollIntoViewIfNeeded(searchPage, item);
                            }
                        },
                        1);
                } else {

                    // key support
                    toMenu(searchField, items, data, function(d) {

                            // apply hint
                            if (d.length < 2) {
                                hintField.value = '';
                                searchField.value = d;
                                search();
                                return;
                            }

                            // show search result
                            var searchWord = d[0];
                            var toc;
                            var tocStart = searchWord.indexOf('&toc=');
                            if (tocStart > 0) {
                                toc = decodeURIComponent(searchWord.substring(tocStart + 5));
                                searchWord = searchWord.substring(0, tocStart);
                            }
                            if (searchSearchWord(searchWord + '*', toc, d[1], false, true)) return;
                            getElementById('c').src = baseUrl + 'topic' + d[1];
                            hideProposals();

                        },
                        function(d, key) {

                            // empty search field?
                            if (!searchField.value) return false;

                            // ignore RIGHT (key: 39) if cursor not at the end
                            if (   key == 39
                                && searchField
                                && searchField.selectionStart
                                && searchField.value
                                && searchField.value.length != searchField.selectionStart)
                                return false;

                            if (d && d.length > 0 && d[0].length < 2) {
                                searchField.value = d[0][0];
                                search();
                                return true;
                            }
                            return false;
                        },
                        hideProposals,
                        function(a, b) {
                            if (b.length < 2 || a.armed) return;
                            a.armed = true;
                            var iFrame = createElement(a, 'iframe', 'f');
                            iFrame.frameBorder = 0;

                            // TODO handle absolute paths
                            iFrame.src = baseUrl + 'topic' + b[1];
                        });

                    // show proposals
                    showProposals();

                }

                // done (no pending queries)
                if (query == currentSearch[getSearchTypeId(fullSearch)]) {
                    currentSearch[getSearchTypeId(fullSearch)] = 0;
                }

            }

        }

        function getSearchTypeId(fullSearch) {
            return fullSearch ? 'f' : 't';
        }

        function asTree(results, path, depth) {
            if (depth < 1) return results;
            var tree = [];
            var grouped = {};
            for (var i = 0; i < results.length; i++) {
                var r = results[i];
                r.p = i;
                r.q = r.b/*breadcrumb*/.slice(0, r.b/*breadcrumb*/.length);
                var resultofStart = r.h/*href*/.indexOf('?resultof=');
                r.q.push('../topic' + (resultofStart < 0 ? r.h/*href*/ : r.h/*href*/.substring(0, resultofStart)));
                r.q.push(r.t/*title*/);

                // child?
                if (!r.b/*breadcrumb*/ || r.b/*breadcrumb*/.length <= path.length) {
                    tree.push(r);
                    continue;
                }

                // not child -> contained in a subtree
                var key = r.b/*breadcrumb*/[path.length] + '\n' + r.b/*breadcrumb*/[path.length+1];
                if (!grouped[key]) {
                    var node = {
                        isNode: true,
                        name: [r.b/*breadcrumb*/[path.length], r.b/*breadcrumb*/[path.length+1]],
                        l/*ocation*/: path.slice(0, path.length),
                        children: [r]
                    };
                    grouped[key] = node;
                    tree.push(node);
                } else {
                    grouped[key].children.push(r);
                }

            }

            // calculate count and set the root (if it exists)
            for (var i = 0; i < tree.length; i++) {
                var r = tree[i];
                if (r.isNode) {
                    r.count = r.children.length + (r.root ? 1 : 0);
                    continue;
                }
                var rootOfGroup = grouped[r.q[r.q.length-2] + '\n' + r.t/*title*/];
                if (rootOfGroup) {
                    rootOfGroup.children.push(r);
                    rootOfGroup.count++;
                    tree.splice(i,1);
                    i--;
                }
            }

            // compact and recursion
            for (var i = 0; i < tree.length; i++) {
                var r = tree[i];
                if (!r.isNode) continue;
                compact(path, r);
                r.children = asTree(r.children, r.children[0].q.slice(0, path.length + r.name.length), depth - 1);
            }

            return tree;
        }
        function compact(path, r) {
            for (var i = path.length+2; r.children.length > 0 && !r.root; i+=2) {
                if (r.children.length == 1 && r.children[0].b/*breadcrumb*/.length == i) return;
                for (var j = 0; j < r.children.length; j++) {
                    var p0 = r.children[0].q;
                    var p = r.children[j].q;
                    if (   p.length < i+1
                        || p[i] != p0[i]
                        || p[i+1] != p0[i+1]) return;
                }
                var p0 = r.children[0].q;
                r.name.push(p0[i]);
                r.name.push(p0[i+1]);
            }
        }

        function getQuery() {
            var query = encodeURIComponent(searchField.value

                        // TODO if Eclipse bug 351077
                        //      (https://bugs.eclipse.org/351077) is fixed
                        //      then remove following line
                        .replace(/\-([^\-\s]*$)/ig, ' $1')

                        .replace(/(^\s+|\s+$)/ig, '')
                        .toLowerCase()).replace(/(%20){1,}/g, '+');
            if (query.length == 0) return '';
            return query + (scope.n.toc ? '&toc=' + encodeURIComponent(scope.n.toc).replace(/%20/g, '+') : '');
        }

        function queryToRegEx(query) {
            query = query.indexOf('&') < 0
                    ? query
                    : query.substr(0, query.indexOf('&'));
            query = decodeURIComponent(query.replace(/\+/g, '%20'));
            query = query.replace(/([\.\?\*\+\-\(\)\[\]\{\}\\])/g, '\\$1');
            return new RegExp("\\b(?:" + query + ")((?:\\w+|\\W+\\w+))", "i");
        }

        function searchSearchWord(searchWord, toc, href, path, isSearchWordDecoded) {
            try {

                // No SearchFrame or no NavFrame? -> exception handling
                var root = parent.parent.parent;
                var searchFrame = root.HelpToolbarFrame.SearchFrame;
                var navFrame = root.HelpFrame.NavFrame;

                var scopeElement = searchFrame.document.getElementById('scope');
                var searchInput = searchFrame.document.getElementById('searchWord');
                if (   searchInput
                    && scopeElement
                    && scopeElement.firstChild.nodeValue == 'All topics') {

                    // no scope -> update top left search input field only
                    searchInput.value = searchWord;

                } else {

                    // disable scope and update top left search input field
                    searchFrame.location.replace(  baseUrl
                                                 + 'scopeState.jsp?workingSet=&searchWord='
                                                 + encodeURIComponent(searchWord));

                }
                var newNavUrl =   baseUrl
                                + 'advanced/nav.jsp?e=h&tab=search&searchWord=' // 'e=h' for tracking (to distinguish normal queries from queries done with this script)
                                + (isSearchWordDecoded ? searchWord : encodeURIComponent(searchWord));
                if (toc) newNavUrl += '&quickSearch=true&quickSearchType=QuickSearchToc&toc=' + encodeURIComponent(toc);
                if (path) newNavUrl += '&path=' + path;
                navFrame.location.replace(newNavUrl);

                // topic (use 'setTimeout()' otherwise in Internet Explorer
                //        'Go Back' does not work sometimes)
                if (href) {
                    setTimeout(function(){window.location.href = baseUrl + 'topic' + href}, 9);
                }

                return true;
            } catch(e) {
                return false;
            }
        }

        // filter tree functions
        function selectSubtree(element, checkStatus) {
            for (var i = 0; i < element.children.length; i++) {
                var n = element.children[i];
                if ('UL' == n.tagName || 'LI' == n.tagName || 'DIV' == n.tagName) {
                    selectSubtree(n, checkStatus);
                } else if ('INPUT' == n.tagName) {
                    n.indeterminate = false;
                    n.checked = checkStatus;
                    n.notAllChecked = false;
                }
            }
        }
        function getChildrenChecks(checkbox) {
            if (!checkbox || !checkbox.parentElement || !checkbox.parentElement.parentElement || 'LI' != checkbox.parentElement.parentElement.tagName) return [];
            var li = checkbox.parentElement.parentElement;
            var children = [];
            for (var i = 0; i < li.children.length; i++) {
                var n1 = li.children[i];
                if ('UL' != n1.tagName) continue;
                for (var j = 0; j < n1.children.length; j++) {
                    var n2 = n1.children[j];
                    if ('LI' != n2.tagName) continue;
                    for (var k = 0; k < n2.children.length; k++) {
                        var n3 = n2.children[k];
                        for (var l = 0; l < n3.children.length; l++) {
                            var n4 = n3.children[l];
                            if ('INPUT' == n4.tagName) children.push(n4);
                        }
                    }
                }
            }
            return children;
        }
        function updateParentsChecks(checkbox) {
            for (var parentCheckbox = checkbox.parentCheckbox; parentCheckbox; parentCheckbox = parentCheckbox.parentCheckbox) {
                var checkedNumberOfResults = 0;
                var uncheckedNumberOfResults = 0;
                var uncheckedAll = true;
                var notAllChecked = false;
                var totalNumberOfResults = 0;
                var indeterminateChildren = 0;
                var children = getChildrenChecks(parentCheckbox);
                for (var i = 0; i < children.length; i++) {
                    var n = children[i];
                    if (n.notAllChecked) notAllChecked = true;
                    if (n.indeterminate) {
                        indeterminateChildren++;
                        uncheckedAll = false;
                        notAllChecked = true;
                    } else if (n.checked) {
                        checkedNumberOfResults += n.numberOfResults;
                        totalNumberOfResults += n.numberOfResults;
                        uncheckedAll = false;
                    } else {
                        uncheckedNumberOfResults += n.numberOfResults;
                        totalNumberOfResults += n.numberOfResults;
                        notAllChecked = true;
                    }
                }
                if (checkedNumberOfResults == parentCheckbox.numberOfResults && !notAllChecked) {
                    parentCheckbox.indeterminate = false;
                    parentCheckbox.checked = true;
                    parentCheckbox.notAllChecked = false;
                } else if (   uncheckedNumberOfResults == parentCheckbox.numberOfResults
                           || (parentCheckbox.indeterminate && uncheckedAll)) {
                    parentCheckbox.indeterminate = false;
                    parentCheckbox.checked = false;
                } else if (   totalNumberOfResults == parentCheckbox.numberOfResults
                           || (   !parentCheckbox.indeterminate
                               && !parentCheckbox.checked
                               && (indeterminateChildren || checkedNumberOfResults || notAllChecked))){
                    parentCheckbox.indeterminate = true;
                } else {
                    parentCheckbox.notAllChecked = notAllChecked;
                }
            }
        }

        function toMenu(master, items, data, chooseFn, applyFn, cancelFn, armFn) {
            function inner(master, items, data, chooseFn, applyFn, cancelFn, amrFn) {

                var isNotInputField = master.nodeName != 'INPUT';
                var isKeySelectionMode = isNotInputField;
                var cursorIndex = 0;
                var isInit = 0;
                master.onkeydown = function(e) {
                    e = e || window.event;
                    var key = e.keyCode || e.charCode;

                    if (   cursorIndex > 0
                        && items[cursorIndex-1].getAttribute('class') == '') {
                        cursorIndex = 0;
                    }

                    // RIGHT (key: 39) or TAB without SHIFT (key: 9) to apply
                    if (applyFn && (key == 39 || (key == 9 && !e.shiftKey))) {
                        if (applyFn(data, key)) preventDefault(e);
                    }

                    // ESC to cancel
                    if (cancelFn && key == 27) {
                        cancelFn();
                        preventDefault(e);
                        return;
                    }

                    // ENTER to choose
                    if (key == 13 && cursorIndex > 0) {
                        preventDefault(e);
                        stopPropagation(e);
                        items[cursorIndex-1].setAttribute('class', '');
                        chooseFn(data[cursorIndex-1]);
                        cursorIndex = 0;
                        return;
                    }

                    // select by UP and DOWN
                    if (key != 40 && key != 38) {
                        isKeySelectionMode = isNotInputField;
                        return;
                    }
                    preventDefault(e);

                    var isDown = key == 40;
                    if (cursorIndex > 0) {
                        items[cursorIndex-1].setAttribute('class', '');
                    }
                    cursorIndex = cursorIndex < 1
                                  ? (isDown ? 1 : items.length)
                                  : (cursorIndex + (isDown ? 1 : -1)) % (items.length + 1);
                    if (cursorIndex > 0) {
                        items[cursorIndex-1].setAttribute('class', 'z');
                        if (armFn) armFn(items[cursorIndex-1], data[cursorIndex-1], 0);
                    }
                }

                for (var i = 0; i < items.length; i++) {
                    items[i].onmousedown = function(a) {setTimeout(function() {if (master && !master.hasFocus) master.focus()}, 42)};
                    items[i].onmouseup = items[i].ontouchend = function(a, b) {return function(e) {preventDefault(e); if (!a.canceled) {chooseFn(b); a.setAttribute('class', ''); cursorIndex = 0}}}(items[i], data[i]);
                    items[i].onmouseover = items[i].ontouchstart = function(a, b, c) {return function() {if (!isInit) return; if (cursorIndex > 0) items[cursorIndex-1].setAttribute('class', ''); a.setAttribute('class', 'z'); cursorIndex = b; a.canceled = ''; if (armFn && b > 0) armFn(a, c, 1)}}(items[i], i+1, data[i]);
                    items[i].onmouseout = function(a) {return function() {a.setAttribute('class', '')}}(items[i]);
                }
                setTimeout(function() {isInit = 1; }, 142);
            }
            var x = function(a,b,c,d,e,f) {return inner(a,b,c,d,e,f)}(master, items, data, chooseFn, applyFn, cancelFn, armFn);
        }

        function addHighlightedText(element, text, searchWord) {
            var searchWordLowerCase = searchWord.toLowerCase();
            var textLowerCase = text.toLowerCase();
            var hIndex = textLowerCase.indexOf(searchWordLowerCase);
            if (hIndex < 0) {
                element.appendChild(document.createTextNode(text));
                return;
            }

            var lastEnd = 0;
            while (hIndex >=0) {
                element.appendChild(document.createTextNode(text.substring(lastEnd, hIndex)));
                lastEnd = hIndex + searchWord.length;
                if (   hIndex == 0
                    || text.substring(hIndex - 1, hIndex).replace(/\w/, "").length != 0) {
                    var strong = createElement(element, 'strong');
                    strong.appendChild(document.createTextNode(text.substring(hIndex, lastEnd)));
                } else {
                    element.appendChild(document.createTextNode(text.substring(hIndex, lastEnd)));
                }
                hIndex = textLowerCase.indexOf(searchWordLowerCase, lastEnd);
            }
            element.appendChild(document.createTextNode(text.substring(lastEnd)));
        }

        function unencodeHtmlContent(escapedHtml) {
            var elem = document.createElement('div');
            elem.innerHTML = escapedHtml;
            var result = '';
            // Chrome splits innerHTML into many child nodes,
            // each one at most 65536.
            // Whereas FF creates just one single huge child node.
            for (var i = 0; i < elem.childNodes.length; ++i) {
              result = result + elem.childNodes[i].nodeValue;
            }
            return result;
        }

    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Menu

    function createMenu() {

        // menu
        var menu = createOverlay(9, 1);
        var overlay = createOverlay(8);
        menu.id = 'a';
        menuStyle = menu.style;
        menu.a = function(e) { preventDefault(e); overlay.a(); menuStyle.width = '270px'; };
        menu.o = function(e) { preventDefault(e); overlay.o(); menuStyle.width = '0'; };
        menu.o();
        addEvent(overlay, 'click', menu.o);
        function createMenuItem(label, description, fn, id) {
            var item = createElement(menu, 'a', 'b', label);
            item.href = '#';
            item.title = description;
            if (id) {
                item.id = id;
            }
            addEvent(item, 'click', function(e) { preventDefault(e); fn(e); menu.o(); });
            return item;
        }

        // "x" button
        var closeMenuButton = createElement(createElement(menu, 0, 'e'), 'a', 'b');
        closeMenuButton.href = '#';
        addEvent(closeMenuButton, 'click', menu.o);
        closeMenuButton.alt = MENU_CLOSE_ICON_DESCRIPTION;
        closeMenuButton.title = MENU_CLOSE_ICON_DESCRIPTION;
        setInnerHtml(closeMenuButton, MENU_CLOSE_ICON);

        // "Highlight search terms"
        function HighlightConnector() {};
        HighlightConnector.prototype.setButtonState = function(name, state) {
            // dummy for highlight() in org.eclipse.help.webapp/advanced/highlight.js
        };
        window.ContentToolbarFrame = new HighlightConnector();
        var highlight = createMenuItem(0, 'Toggle search term highlighting', toggleHighlight, 'ah');
        createElement(highlight, 'span', 'hl', 'Highlight');
        createElement(highlight, 'span', 'hs', ' ');
        createElement(highlight, 'span', 'ht', 'search term');
        toggleHighlight(0, 1);

        // "Print topic"
        createMenuItem('Print topic', 'Print topic without its subtopics', function() {
            try {
                getElementById('c').contentWindow.print();
            } catch (e) {
            }
        }, 'ap');

        // "Print chapter"
        createMenuItem('Print chapter', 'Print topic including subtopics', printChapter, 'app');

        // show menu button
        var menuButton = createElement(getElementById('h'), 'a', 'b');
        menuButton.href = '#';
        menuButton.alt = MENU_ICON_DESCRIPTION;
        menuButton.title = MENU_ICON_DESCRIPTION;
        setInnerHtml(menuButton, MENU_ICON);
        addEvent(menuButton, 'click', menu.a);

    }

    function toggleHighlight(e, initalize) {
        var enableHighlighting = 'false' == getCookie('highlight');
        if (initalize) {
            enableHighlighting = !enableHighlighting;
        } else {
            setCookie('highlight', enableHighlighting ? 'true' : 'false');
            var contentFrameWindow = getElementById('c').contentWindow;
            if (contentFrameWindow && contentFrameWindow.highlight && contentFrameWindow.toggleHighlight) {
                contentFrameWindow.toggleHighlight();
                contentFrameWindow.highlight();
            }
        }
        setClassName(getElementById('ah'), enableHighlighting ? 'b x' : 'b');
    }

    function printChapter() {
        var contentElement = getElementById('c');
        var contentWindow = contentElement.contentWindow;
        var topicHref = contentWindow.location.href;
        if (!topicHref) return;
        var dummy = document.createElement('a');
        dummy.href = (window.INTEGRATED ? '' : '../../') + 'x';
        var topic = topicHref.substring(dummy.href.length - 2);
        if (topic.length > 7 && '/topic/' == topic.substring(0, 7)) topic = topic.substring(6);
        else if (topic.length > 5 && '/nav/' == topic.substring(0, 5)) topic = '/..' + topic;
        else if (topic.length > 8 && ('/rtopic/' == topic.substring(0, 8) || '/ntopic/' == topic.substring(0, 8))) topic = topic.substring(7);
        var w = contentWindow.innerWidth || contentWindow.document.body.clientWidth;
        var h = contentWindow.innerHeight || contentWindow.document.body.clientHeight;
        var element = contentElement;
        var x = window.screenX;
        var y = window.screenY;
        for (var e = contentElement; !!e; e = e.offsetParent) {
            if (e.tagName == "BODY") {
                var xScroll = e.scrollLeft || document.documentElement.scrollLeft;
                var yScroll = e.scrollTop || document.documentElement.scrollTop;
                x += (e.offsetLeft - xScroll + e.clientLeft);
                y += (e.offsetTop  - yScroll + e.clientTop);
            } else {
                x += (e.offsetLeft - e.scrollLeft + e.clientLeft);
                y += (e.offsetTop  - e.scrollTop  + e.clientTop);
            }
        }
        var anchor = '';
        var anchorStart = topic.indexOf('#');
        if (anchorStart > 0) {
            anchor = '&anchor=' + topic.substr(anchorStart + 1);
            topic = topic.substr(0, anchorStart);
        }
        var query = '';
        var queryStart = topic.indexOf('?');
        if (queryStart > 0) {
            query = '&' + topic.substr(queryStart + 1);
            topic = topic.substr(0, queryStart);
        }
        window.open((window.INTEGRATED ? '' : '../../') + 'advanced/print.jsp?topic=' + topic + query + anchor, 'printWindow', 'directories=yes,location=no,menubar=yes,resizable=yes,scrollbars=yes,status=yes,titlebar=yes,toolbar=yes,width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Tree

    function createTree(element, contentProvider, labelProvider, selectable) {
        var root = createElement(element, 0, 'tree');
        function createNode(parent, node, open) {
            contentProvider(node, function(parent, node) {
                return function(children, open) {
                    var ul = createElement(parent, 'ul');
                    for (var i = 0; i < children.length; i++) {
                        var li = createElement(ul, 'li', open ? 'open' : 'closed');
                        li.p = parent;
                        var child = children[i];
                        if (!child.l) {

                            // c(hildren: yes)
                            li.c = 1;

                            // i(nit function to load children)
                            li.i = (function(li, node) {
                                return function() {
                                    createNode(li, node);
                                    li.i = 0;
                                };
                            })(li, child.n);

                            // handle (to toggle subtree)
                            var handle = createElement(li, 'span', 'h');
                            handle.innerHTML = TREE_HANDLE;
                            addEvent(handle, 'click', (function(li) {
                                return function(e) {
                                    toggleLi(li);
                                    stopPropagation(e);

                                    // focus next element (to avoid losing focus since the handle cannot be focused)
                                    try {
                                        li.childNodes[1].focus();
                                    } catch(e) {}

                                };
                            })(li));

                        }
                        var label = labelProvider(li, child.n);
                        setClassName(label, 'l');
                        if (selectable) {
                            addEvent(label, 'click', (function(li, node) {
                                return function(e) {
                                    if (root.s === li) return;
                                    for (var n = root.s; isLi(n); n = n.p) {
                                        n.xx = 0;
                                        n.x = 0;
                                        updateLiClasses(n);
                                    }
                                    root.s = li;
                                    root.n = node;
                                    li.xx = 1;
                                    updateLiClasses(li);
                                    for (var n = li.p; isLi(n); n = n.p) {
                                        n.x = 1;
                                        updateLiClasses(n);
                                    }
                                    stopPropagation(e);
                                };
                            })(li, child.n));
                        }
                        addEvent(label, 'dblclick', (function(li) {
                            return function(e) {
                                toggleLi(li);
                                stopPropagation(e);
                            }
                        })(li));
                        if (open) toggleLi(li);
                    }
                }
            }(parent, node));
        }
        createNode(root);

        // handling via the keys up, down, left, right, home and end
        addEvent(element, 'keydown', function(e) {
            var keyCode = e.keyCode || window.event.keyCode;
            if (keyCode < 35 || keyCode > 40) return;

            // compute focused tree node
            var li;
            for (li = e.target || e.srcElement; li && li !== root; ) {
                if (isLi(li)) break;
                li = getParentElement(li);
            }
            if (!li) return;

            // left/right
            if (keyCode == 37 || keyCode == 39) {
                if (keyCode == 37 ^ !li.o) {
                    toggleLi(li);
                } else if (keyCode == 37) {
                    focusTreeNode(li.p);
                } else {
                    focusFirstChildNode(li);
                }

            // down
            } else if(keyCode == 40) {

                // expanded? -> focus first child, ...
                if (li.o) {
                    focusFirstChildNode(li);
                    preventDefault(e);
                    return;
                }

                // ...otherwise -> focus next sibling at this or higher level
                for (var level = li; isLi(level); level = level.p) {
                    for (var next = getNextSibling(level); next; next = getNextSibling(next)) {
                        if (!isLi(next)) continue;
                        focusTreeNode(next);
                        preventDefault(e);
                        return;
                    }
                }

            // up
            } else if(keyCode == 38) {

                // previous sibling? -> focus previous sibling, ...
                for (var prev = getPreviousSibling(li); prev !== null; prev = getPreviousSibling(prev)) {
                    if (!isLi(prev)) continue;
                    focusDeepestVisibleChild(prev);
                    preventDefault(e);
                    return;
                }

                // ...otherwise -> focus parent
                focusTreeNode(li.p);

            // home
            } else if(keyCode == 36) {
                focusFirstChildNode(root);

            // end
            } else if(keyCode == 35) {
                focusDeepestVisibleChild(root);

            }
            preventDefault(e);

        });
        element.f = function() {
            if (root.s) {
                focusTreeNode(root.s);
            }
        };
        if (selectable) {
            addEvent(element, 'click', element.f);
        }
        function toggleLi(li) {
            if (!li.c) return;
            if (li.i) {
                li.i();
            }
            li.o = !li.o;
            updateLiClasses(li);
        }
        function isLi(element) {
            return element && element.tagName == 'LI'
        }
        function updateLiClasses(li) {
            setClassName(li, (li.o ? 'open': 'closed') + (li.xx ? ' xx' : '') + (li.x ? ' x' : ''))
        }
        function focusFirstChildNode(li) {
            for (var i = 0; i < li.childNodes.length; i++) {
                var n = li.childNodes[i];
                if (n.tagName != 'UL') continue;
                for (var j = 0; j < n.childNodes.length; j++) {
                    var m = n.childNodes[j];
                    if (isLi(m)) {
                        focusTreeNode(m);
                        return;
                    }
                }
            }
        }
        function focusDeepestVisibleChild(li) {
            for (var i = 0; i < li.childNodes.length; i++) {
                var n = li.childNodes[i];
                if (n.tagName != 'UL') continue;
                if (!n.o) break;
                for (var j = n.childNodes.length - 1; j >= 0; j--) {
                    var m = n.childNodes[j];
                    if (!isLi(m)) continue;
                    focusDeepestVisibleChild(m);
                    return;
                }
            }
            focusTreeNode(li);
        }
        function focusTreeNode(li) {
            for (var i = 0; i < li.childNodes.length; i++) {
                var n = li.childNodes[i];
                if (n.tagName != 'A') continue;
                try {
                    n.focus();
                } catch(e) {}
                return;
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Overlay

    function createOverlay(zIndex, withoutStyles) {
        var overlay = createElement();
        var header =  getElementById('h');
        getParentElement(header).insertBefore(overlay, header);
        if (!withoutStyles) {
            var overlayStyle = overlay.style;
            overlayStyle.display = 'none';
            overlayStyle.zIndex  = zIndex ? zIndex : 1;
            overlayStyle.position = 'absolute';
            overlayStyle.height = '100%';
            overlayStyle.width = '100%';
        }
        overlay.a = function() { overlayStyle.display = 'block'; };
        overlay.o = function(e) { overlayStyle.display = 'none'; preventDefault(e); };
        return overlay;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Utility functions (polyfill/retrofit functions see below)

    function addEvent(element, type, fn) {
        if (element.addEventListener) {
            element.addEventListener(type, fn, false);
        } else if (element.attachEvent) {
            element['e' + type + fn] = fn;
            element[type + fn] = function() {
                element['e' + type + fn](window.event);
            }
            element.attachEvent('on' + type, element[type + fn]);
        }
    }

    function getElementById(id) {
        return document.getElementById(id);
    }

    function getParentElement(element) {
        return element.parentElement;
    }

    function getPreviousSibling(element) {
        return element.previousSibling;
    }

    function getNextSibling(element) {
        return element.nextSibling;
    }

    function getClassName(element) {
        return element.className;
    }

    function setClassName(element, value) {
        element.className = value;
        return element;
    }

    function getAttribute(element, attribute) {
        return element.getAttribute(attribute);
    }

    function setAttribute(element, attribute, value) {
        element.setAttribute(attribute, value);
        return element;
    }

    function setInnerHtml(element, innerHtml) {
        element.innerHTML = innerHtml;
    }

    function preventDefault(e) {
        e = e || window.event;
        if (!e) return;
        try {
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
        } catch(e) {}
    }

    function stopPropagation(e) {
        e = e || window.event;
        if (!e) return;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    }

    function getCookie(cookieName, defaultValue) {
        var name = cookieName + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var allCookies = decodedCookie.split(';');
        for (var i = 0; i < allCookies.length; i++) {
            var cookie = allCookies[i];
            while (cookie.charAt(0) == ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) == 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return defaultValue;
    }

    function setCookie(cookieName, value) {
        var d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cookieName + '=' + value + ';' + expires + ';path=/;samesite=strict';
    }

    var openRequests = {};
    function remoteRequest(url, callbackFn, cancelId) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) callbackFn(request.responseText);
        }
        request.open('GET', url);
        request.send();
        if (cancelId) {
            if (openRequests[cancelId] && openRequests[cancelId].abort) openRequests[cancelId].abort();
            openRequests[cancelId] = request;
        }
    }

    var parseXml;
    if (typeof window.DOMParser != 'undefined') {
        parseXml = function(xmlStr) {
            return (new window.DOMParser()).parseFromString(xmlStr, 'text/xml');
        };
    } else if (   typeof window.ActiveXObject != 'undefined'
               && new window.ActiveXObject('Microsoft.XMLDOM')) {
        parseXml = function(xmlStr) {
            var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
            xmlDoc.async = 'false';
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        };
    }

    function scrollIntoViewIfNeeded(scrollArea, element) {
        try {
            var scrollAreaBoundaries = scrollArea.getBoundingClientRect();
            var elementBoundaries = element.getBoundingClientRect();
            if (   elementBoundaries.top >= scrollAreaBoundaries.top
                && elementBoundaries.bottom <= scrollAreaBoundaries.bottom) return;
            scrollArea.scrollTop += elementBoundaries.bottom <= scrollAreaBoundaries.bottom
                                    ? elementBoundaries.top - scrollAreaBoundaries.top
                                    : elementBoundaries.bottom - scrollAreaBoundaries.bottom;
        } catch (e) {}
    }

    function arrayContainsPrefix(array, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].length <= value.length && value.substring(0, array[i].length) == array[i]) return true;
        }
        return false;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Polyfill/retrofit utility functions

    function createElement(parent, name, className, text) {
        var element = document.createElement(name ? name : 'div');
        if (parent) {
            try {
                parent.appendChild(element);
            } catch(e) {

                // POLYFILL IE<=8
                // HTML5 semantic tags (https://www.w3schools.com/html/html5_browsers.asp)
                // polyfill adding child element to the empty HTML 5 semantic element 'aside' (for IE 8 and lower)
                if (parent.tagName == 'ASIDE') {
                    var pp = parent.parentElement;
                    var rest = [];
                    for (var i = 0; i < pp.childNodes.length; i++) {
                        if (parent === pp.childNodes[i]) {
                            if (div) continue;
                            var div = document.createElement('div');
                            for (var j = 0; j < parent.attributes.length; j++) {
                                var attribute = parent.attributes[j];
                                if ('' + parent.getAttribute(attribute.name) != '' + div.getAttribute(attribute.name)
                                    && !('' + parent.getAttribute(attribute.name) == 'null'
                                         && '' + div.getAttribute(attribute.name) == '')) {
                                    setAttribute(div, attribute.name, attribute.value);
                                }
                            }
                            pp.removeChild(parent);
                            div.appendChild(element);
                            rest.push(div);
                            i--;
                            continue;
                        }
                        if (rest && pp.childNodes[i].tagName == '/' + parent.tagName) {
                            pp.removeChild(pp.childNodes[i]);
                            i--;
                            continue;
                        }
                        if (!rest) continue;
                        rest.push(pp.removeChild(pp.childNodes[i]));
                        i--;
                    }
                    for (var i = 0; i < rest.length; i++) pp.appendChild(rest[i]);
                } else throw e;

            }
        }
        if (className) {
            setClassName(element, className);
        }
        if (text) {
            element.appendChild(document.createTextNode(text));
        }
        return element;
    }

}(window, document));