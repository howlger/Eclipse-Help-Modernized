/*******************************************************************************
 * Copyright (c) 2019 Holger Voormann and others.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************
 *
 * Based on:
 *
 * Eclipse Help search fields 1.3
 *
 * 'eh.js' is the compressed version of this file created by
 * http://lisperator.net/uglifyjs/#demo
 *
 * 'eh_legacy.js' does not require specific JavaCode but Eclipse 3.5 or higher
 * (because of the "Search selected topic and all subtopics" feature).
 * It is the compressed version of this file created by
 * http://lisperator.net/uglifyjs/#demo after replacing all occurrences of
 * '/*isLegacy=+/false' with '/*isLegacy=+/true' ('+' should be '*')
 *
 * 'eh_msproxy_net.js' is for cross domain: if the search field and JavaScript
 * are located on a different domains than Eclipse Help. Callbacks are made via
 * 'msproxs.net'. (Demo see: https://goo.gl/Pvlvoz)
 * It is the compressed version of this file created by
 * http://lisperator.net/uglifyjs/#demo after replacing all occurrences of
 * '/*isLegacy=+/false' with '/*isLegacy=+/true' ('+' should be '*') and
 * '/*viaMsproxyNet=+/false' with '/*viaMsproxyNet=+/true' ('+' should be '*').
 *
 ******************************************************************************/
(function(window, undefined) {

    var classPrefix = '-eh'

    var callbackUrl = /*isLegacy=*/true
                      ? 'advanced/searchView.jsp?'
                      : '[[[URL]]]';

    var eh = {};

    var baseUrl = '../../'; // relative path from one subfolder) to '/help/'

    // *************************************************************************
    // utilities functions

    var inSearchView = window.location.href.indexOf('/help/ntopic/') > 0;

    function preventDefault(e) {
        e = e || window.event;
        e.returnValue = false; if (e.preventDefault) e.preventDefault();
    }

    function stopPropagation(e) {
        e = e || window.event;
        e.cancelBubble = true; if (e.stopPropagation) e.stopPropagation();
    }

    function createElement(parent, name, clazz, text) {
        var element = document.createElement(name);
        if (parent) {
            parent.appendChild(element);
        }
        if (clazz) {
            element.setAttribute('class', classPrefix + clazz);
        }
        if (text) {
            element.appendChild(document.createTextNode(text));
        }
        return element;
    }

    function createHiddenInput(form, name, value) {
        var hiddenInput = createElement(form, 'input');
        hiddenInput.style.display = 'none';
        hiddenInput.name = name;
        hiddenInput.value = value;
        return hiddenInput;
    };

    function wrapInSpan(toWrap, clazz) {
        var parent = toWrap.parentNode;
        var nextSibling = toWrap.nextSibling;
        parent.removeChild(toWrap);
        var span = createElement(null, 'span', clazz);
        span.appendChild(toWrap);
        if (nextSibling) {
            parent.insertBefore(span, nextSibling);
        } else {
            parent.appendChild(span);
        }
        return span;
    }

    function addEvent(o, type, fn){
       if (o.addEventListener) o.addEventListener(type, fn, false);
       else if (o.attachEvent) {
          o['e'+type+fn] = fn;
          o[type+fn] = function() { o['e'+type+fn](window.event); }
          o.attachEvent('on'+type, o[type+fn]);
       }
    }
    var bgOnClickFns = [];
    addEvent(document.documentElement, 'click', function() {
        for (var i = 0; i < bgOnClickFns.length; i++) {
            bgOnClickFns[i]();
        }
    });

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
            if (href)
                setTimeout(function(){window.location.href = baseUrl + 'topic' + href}, 9);

            return true;
        } catch(e) {
            return false;
        }
    }

    function toMenu(master, items, data, chooseFn, applyFn, cancelFn, armFn) {
        function inner(master, items, data, chooseFn, applyFn, cancelFn, amrFn) {

            var isNotInputField = master.nodeName != 'INPUT';
            var isKeySelectionMode = isNotInputField;
            var cursorIndex = 0;
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
                    items[cursorIndex-1].setAttribute('class', classPrefix + 'z');
                    if (armFn) armFn(items[cursorIndex-1], data[cursorIndex-1]);
                }
            }

            for (var i = 0; i < items.length; i++) {
                items[i].onmousedown = function(a) {setTimeout(function() {if (!master.hasFocus) master.focus()}, 42)};
                items[i].onmouseup = items[i].ontouchend = function(a, b) {return function(e) {preventDefault(e); if (!a.canceled) {chooseFn(b); a.setAttribute('class', ''); cursorIndex = 0}}}(items[i], data[i]);
                items[i].onmouseover = items[i].ontouchstart = function(a, b, c) {return function() {if (cursorIndex > 0) items[cursorIndex-1].setAttribute('class', ''); a.setAttribute('class', classPrefix + 'z'); cursorIndex = b; a.canceled = ''; if (armFn && b > 0) armFn(a, c)}}(items[i], i+1, data[i]);
                items[i].onmouseout = function(a) {return function() {a.setAttribute('class', '')}}(items[i]);
            }
        }
        var x = function(a,b,c,d,e,f) {return inner(a,b,c,d,e,f)}(master, items, data, chooseFn, applyFn, cancelFn, armFn);
    }

    // end of utilities functions
    // *************************************************************************

    /**
     * Sets a new base URL (required to use search fields from outside the help
     * system to search, e.g. from a static web site).
     *
     * @param newBaseUrl the base URL to set
     *                   (e.g. 'http://help.eclipse.org/kepler/')
     */
    eh.setBaseUrl = eh.b = function (newBaseUrl) {
        baseUrl = newBaseUrl;
    }

    /**
     * Show search field on hover
     *
     * @param master the element to show the search field on hover
     * @param placement where to show the search field: 'n', 's', 'w', 'e' to
     *                  place the search field in the north (= above), south
     *                  (= bellow), west (= right) or east (= left) of the
     *                  element that has been specified by 'master' (see above)
     * @param relativeToFirstChild 'true' to place hover search field relative
     *                             to the first child of master, 'false' to
     *                             place hover search field relative to master
     * @param toc (optional) the table of content to search in (e.g.
     *            '/org.eclipse.platform.doc.user/toc.xml')
     * @param href (optional) the relative URL of the topic to show (e.g.
     *             '/org.eclipse.platform.doc.user/gettingStarted/qs-01.htm')
     * @param path (optional) the path of the subtopic within the TOC to search
     *             in (e.g. '1_0' for the first subtopic of the second subtopic
     *             of the primary TOC which is given by the 'toc' parameter)
     */
    eh['h'] = function (master, placement, relativeToFirstChild, toc, href, path) {
        if (inSearchView) return;
        if (!placement) placement = 'e';
// TODO make 'toc' optional

        var form = createElement(master, 'form');
        form.setAttribute('class', classPrefix + 'h ' + classPrefix + 'h' + placement);
        var visibilityLevel = 1; // 0 = hidden, 1 = hover, 2 = has focus
        var speedCount = 0;
        var maybeShow = function() {if (visibilityLevel > 0) form.style.display = 'block'};
        var maybeHide = function() {if (visibilityLevel < 1) form.style.display = 'none'};
        var showIfMouseStops = function() {
            if (visibilityLevel < 1) return;
            if (speedCount++ > 2) {
                maybeShow();
                speedCount = 0;
                return;
            }
            setTimeout(showIfMouseStops, 42);
        };

        // master
        master.style.position = 'relative';
        master.onmouseover = function() {if (visibilityLevel == 2) return;
                                         visibilityLevel = 1;
                                         showIfMouseStops()};
        master.onmouseout = function() {if (visibilityLevel == 2) return;
                                        visibilityLevel = 0;
                                        setTimeout(maybeHide, 42)};
        master.onmousemove = function(e) {speedCount = 0};

        // form container
        form.action = baseUrl + 'index.jsp';
        form.target = '_top';
        form.method = 'GET';
        form.acceptCharset = 'utf-8';
        form.style.display = 'none';
        form.style.position = 'absolute';

        var baseElement = relativeToFirstChild ? master.firstChild : master;
        if (placement == 's') {
            form.style.left = '0';
            form.style.top = baseElement.offsetHeight + 'px';
        } else if (placement == 'n') {
            form.style.left = '0';
            form.style.bottom = baseElement.offsetHeight + 'px';
        } else if (placement == 'w') {
            form.style.right = baseElement.offsetWidth + 'px';
            form.style.top = '0';
        } else { // placement == 'e' (default)
            form.style.left = baseElement.offsetWidth + 'px';
            form.style.top = '0';
        }
        form.onsubmit =
            function(e) {if(searchSearchWord(searchField.value, toc, href, path)) preventDefault(e)};
        form.onmouseover = function() {if (visibilityLevel < 2) visibilityLevel = 1};
        form.onmouseout = function() {if (visibilityLevel < 2) visibilityLevel = 0};

        // handle at the beginning
        createElement(form, 'span', 'g');

        // hidden fields
        createHiddenInput(form, 'tab', 'search');
        createHiddenInput(form, 'quickSearch', 'true');
        createHiddenInput(form, 'quickSearchType', 'QuickSearchToc');
        createHiddenInput(form, 'toc', toc);
        if (path) createHiddenInput(form, 'path', path);
        if (href) createHiddenInput(form, 'topic', href);

        // search field
        var searchField = createElement(form, 'input', 'i');
        searchField.name = 'searchWord';
        searchField.onfocus = function() {visibilityLevel = 2};
        searchField.onblur = function() {visibilityLevel = 0; setTimeout(maybeHide, 200)};
        searchField.onmouseover = function() {if (visibilityLevel < 2) visibilityLevel = 1};
        searchField.onmouseout = function() {if (visibilityLevel < 2) visibilityLevel = 0};
        searchField.onkeydown =  function(e) {
            e = e || window.event; var key = e.keyCode || e.charCode;
            if (key != 13) return;
            if(searchSearchWord(searchField.value, toc, href, path)) {
                preventDefault(e); return
            };
            form.submit()
        };

        // search button
        var searchButton = createElement(null, 'input', 'j');
        searchButton.type = 'submit';
        searchButton.title = 'Search Chapter';
        searchButton.onfocus = function() {visibilityLevel = 2; setTimeout(maybeShow, 32)};
        searchButton.onblur = function() {visibilityLevel = 0; setTimeout(maybeHide, 32)};
        form.appendChild(searchButton);

        // track mouse speed
        setTimeout(showIfMouseStops, 50);

        // handle at the end
        createElement(form, 'span', 'k');
    }

    /**
     * @param master the search field to enhance
     */
    eh.enhanceSearchField = eh.e = function (form, books, defaultBook, showMore, maxProposals, bookNameShortener) {
        form.autocomplete='off'; // because of Google Chrome Mobile (iOS)
        var updateProposals = function(){};
        var searchField;
        var tocField;
        var scopeField;
        var topicField;
        var group;
        var groupFirstChild;
        var inputFields = form.getElementsByTagName('input');
        for (var i = 0; i < inputFields.length; i++) {
            if ('searchWord' == inputFields[i].name) {
                searchField = inputFields[i];
                group = wrapInSpan(searchField, 'e');
                break;
            }
        }
        if (!searchField) return;
        searchField.setAttribute('class', classPrefix + 's');
        searchField.onclick = function(e) {stopPropagation(e)};
        groupFirstChild = searchField;
        form.onsubmit = function(e) {
            var searchWord = searchField.value;
            var toc;
            if (tocField && tocField.name == 'toc') {
                toc = tocField.value;
            }
            var href;
            if (topicField && topicField.name == 'topic') {
                href = topicField.value;
            }
            preventDefault(e);
            stopPropagation(e);
            if (searchSearchWord(searchWord, toc, href)) return;

            // #mobile_ready
//            top.location =   baseUrl
//                           + 'index.jsp?tab=search&searchWord='
//                           + encodeURIComponent(searchWord)
//                           + (toc ? '&quickSearch=true&quickSearchType=QuickSearchToc&toc=' + encodeURIComponent(toc) : '')
//                           + (href ? '&topic=' + encodeURIComponent(href)  : '');
            document.getElementById('m-content').src = baseUrl
                           + 'advanced/searchView.jsp?view=search&e=h&tab=search&searchWord='
                           + encodeURIComponent(searchWord)
                           + (toc ? '&quickSearch=true&quickSearchType=QuickSearchToc&toc=' + encodeURIComponent(toc) : '');
            hideProposals();

        }


        ////////////////////////////////////////////////////////////////////////
        // books
        if (books) {
            var booksButtonText;
            var booksDropDown;

            // hidden input fields
            tocField = createHiddenInput(form, 'notoc', '');          // name: 'toc' or 'notoc'
            topicField = createHiddenInput(form, 'notopic', '');      // name: 'topic' or 'notopic'
            scopeField = createHiddenInput(form, 'allBooks', 'true'); // name: 'quickSearch' or 'allBooks'
            createHiddenInput(form, 'quickSearchType', 'QuickSearchToc');

            function setBook(bookName, bookToc, bookTopic) {
                tocField.name = bookToc ? 'toc' : 'notoc';
                tocField.value = bookToc ? bookToc : '';
                scopeField.name = bookToc ? 'quickSearch' : 'allBooks';
                topicField.name = bookTopic ? 'topic' : 'notopic';
                topicField.value = bookTopic ? bookTopic : '';
                if (booksDropDown) booksDropDown.style.display = 'none';
                if (booksButtonText) {
                    booksButtonText.removeChild(booksButtonText.firstChild);
                    booksButtonText.appendChild(document.createTextNode(bookName));
                }
                updateProposals();
            }

            // button
            var booksButton = createElement(null, 'button', 'p');
            booksButton.setAttribute('type', 'button');
            booksButtonText = createElement(booksButton, 'span', null, '(All Books)');
            createElement(booksButton, 'span', 'd');
            group.insertBefore(booksButton, groupFirstChild);
            groupFirstChild = booksButton;
            booksButton.onmousedown = function(e) {
                var isOpen = booksDropDown.style.display == 'block';
                booksButton.focus();
                booksDropDown.style.display = isOpen ? 'none' : 'block';
                preventDefault(e);
                stopPropagation(e);
            };
            booksButton.onclick = function(e) {stopPropagation(e)};
            booksButton.onfocus = function() {
                booksDropDown.hasFocus = true;
                booksDropDown.style.display = 'block';
            }
            booksButton.onblur = function() {
                booksDropDown.hasFocus = false;
                setTimeout(function() {if (!booksDropDown.hasFocus) booksDropDown.style.display = 'none'}, 200);
            }

            // drop-down menu
            booksDropDown = createElement(null, 'ul', 'q');
            booksDropDown.style.display = 'none';
            group.insertBefore(booksDropDown, searchField);
            var menuItems = [createElement(booksDropDown, 'li', null, '(All Books)')];
            var data = [['(All Books)', null, null]];
            var defaultBookData;
            for (var i = 0; i < books.length; i+=3) {
                var bookName = books[i];
                if (bookNameShortener) {
                    bookName = bookNameShortener(bookName);
                }
                data.push([bookName, books[i+1], books[i+2]]);
                var li = createElement(booksDropDown, 'li', null, bookName);
                menuItems.push(li);
                if (defaultBook && defaultBook == books[i+1]){
                    defaultBookData = [bookName, books[i+1], books[i+2]];
                }
            }
            toMenu(booksButton, menuItems, data, function(d) {setBook(d[0], d[1], d[2]); searchField.focus(); updateProposals()});
            if (defaultBookData) setBook(defaultBookData[0], defaultBookData[1], defaultBookData[2]);
        }

        ////////////////////////////////////////////////////////////////////////
        // more
        if (showMore) {
            var values = ['', '', '', '', ''];
            var inputs = [];
            var fireChanged = function() {
                if (   values[0] == inputs[0].value
                    && values[1] == inputs[1].value
                    && values[2] == inputs[2].value
                    && values[3] == inputs[3].value
                    && values[4] == inputs[4].value) return;
                for (var i = 0; i < 5; i++) {
                    values[i] = inputs[i].value;
                }

                // all these words
                var result = values[0];

                // any of these words
                var tokens = values[1].match(/\w+|"[^"]+"/g);
                if (tokens) {
                    if (result.length > 0) result += ' ';
                    if (tokens.length > 1) result += '(';
                    for (var i = 0; i < tokens.length; i++) {
                        if (i != 0) result += ' OR ';
                        result += tokens[i];
                    }
                    if (tokens.length > 1) result += ')';
                }

                // this exact word or phrase
                var trimmed = values[2].replace(/"/g,' ')
                                       .replace(/^\s+|\s+$/g,'')
                                       .replace(/\s+/g,' ');
                if (trimmed.length > 0) {
                    if (result.length > 0) result += ' ';
                    result += '"' + trimmed + '"';
                }

                // words starting with
                tokens = values[3].replace(/"/g,' ')
                                  .replace(/^\s+|\s+$/g,'')
                                  .replace(/\s+/g,' ')
                                  .match(/\w+/g);
                for (var i = 0; tokens && i < tokens.length; i++) {
                    if (result.length > 0) result += ' ';
                    result += tokens[i] + '*';
                }

                // none of these words
                tokens = values[4].match(/\w+|"[^"]+"/g);
                for (var i = 0; tokens && i < tokens.length; i++) {
                    if (result.length > 0) result += ' ';
                    result += "NOT " + tokens[i];
                }

                searchField.value = result;
                updateProposals();
            }

            // 'more' area
            var more = createElement(null, 'div', 'm');
            more.style.display = 'none';
            more.style.display == 'block' ? 'none' : 'block';
            more.onclick = function(e) {stopPropagation(e)};
            var table = createElement(more, 'table');
            var tr = createElement(table, 'tr');
            var td1 = createElement(tr, 'th', null, 'Find topics with...');
            var td2 = createElement(tr, 'th');
            var closer = createElement(td2, 'span', 'x');
            createElement(closer, 'span');
            var descriptions = ['...', 'all', ' these words:',
                                '...', 'any', ' of these words:',
                                '...this exact word or ', 'phrase', ':',
                                '...words ', 'starting', ' with:',
                                '...', 'none', ' of these words:'];
            for (var i = 0; i < descriptions.length/3; i++) {
                tr = createElement(table, 'tr');
                td1 = createElement(tr, 'td', 'n', descriptions[i*3]);
                createElement(td1, 'strong', null, descriptions[i*3+1]);
                td1.appendChild(document.createTextNode(descriptions[i*3+2]));
                td2 = createElement(tr, 'td');
                inputs.push(createElement(td2, 'input', 'o'));
                inputs[i].name = 'm' + i;
                inputs[i].onmouseover = fireChanged;
                inputs[i].onchange = fireChanged;
                inputs[i].onkeyup = fireChanged;
            }
            group.insertBefore(more, groupFirstChild);

            // button: 'More...'
            var moreButton = createElement(group, 'button', 'l', 'More');
            moreButton.setAttribute('type', 'button');
            createElement(moreButton, 'span', 'u');
            var toggleMore = function(e) {
                preventDefault(e);
                stopPropagation(e);
                more.style.display =
                    more.style.display == 'block' ? 'none' : 'block';
                (more.style.display == 'none' ? searchField : inputs[0]).focus();
            };
            addEvent(moreButton, 'click', function(e) {stopPropagation(e)});
            addEvent(moreButton, 'mousedown', toggleMore);
            addEvent(moreButton, 'keydown', function(e) {var key = e.keyCode || e.charCode; if(key == 13 || key == 32) toggleMore(e)});
            addEvent(closer, 'click', toggleMore);
        }

        ////////////////////////////////////////////////////////////////////////
        // proposals
        if (maxProposals && maxProposals > 0) {
            var cache = {};
            var currentQuery = '';
            var isKeySelectionMode = false;
            searchField.autocomplete = 'off';

            // hint
            var wrap = wrapInSpan(searchField);
            wrap.style.position = 'relative';
            wrap.style.display = 'inline-block';
            var hintField = createElement(wrap, 'input', 'r');
            if (searchField.nextSibling) {
                searchField.parentNode.insertBefore(hintField, searchField.nextSibling);
            }
            searchField.style.position = 'relative';
            hintField.style.position = 'absolute';
            hintField.style.left = 0;
            hintField.style.top = 0;
            hintField.style.height = '100%';
            hintField.style.width = '100%';
            hintField.style.borderColor = 'transparent';
            hintField.setAttribute('disabled', 'disabled');
            wrap.appendChild(searchField);
            searchField.style.background = 'url("data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D") repeat';

            // drop-down with proposals
            var proposals;
            proposals = createElement(group, 'div', 'y');
            proposals.onclick = function(e) {stopPropagation(e)};
            var ul = createElement(proposals, 'ul');
            function showProposals() {
                proposals.style.display = 'block';
            }

            function hideProposals() {
                proposals.style.display = 'none';
            }
            hideProposals();
            bgOnClickFns.push(hideProposals); // workaround for ie instead of simple: addEvent(document.documentElement, 'click', ...)

            function getQuery() {
                var query = encodeURIComponent(searchField.value

                            // TODO if Eclipse bug 351077
                            //      (https://bugs.eclipse.org/351077) is fixed
                            //      then remove following line
                            .replace(/\-([^\-\s]*$)/ig, ' $1')

                            .replace(/(^\s+|\s+$)/ig, '')
                            .toLowerCase()).replace(/(%20){1,}/g, '+');
                if (query.length == 0) return '';
                return tocField && tocField.name == 'toc'
                       ? query + '&toc=' + encodeURIComponent(tocField.value).replace(/%20/g, '+')
                       : query;
            }

            var openRequest;
            function remoteRequest(url, callbackFn, uncancelable) {
                var request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if (request.readyState == 4 && request.status == 200)
                        callbackFn(request.responseText);
                }
                request.open('GET', url);
                request.send();
                if (openRequest && openRequest.abort) openRequest.abort();
                if (!uncancelable) openRequest = request;
            }

            function callback(data) {
                if (/*isLegacy=*/true) {
                    var element = createElement(null, 'div');
                    var match = new RegExp('window.location.replace[^\\?]*\\?([^"]*)').exec(data);
                    if (match == null) return;
                    element.innerHTML = match[1].replace(/\\u([0-9A-F]{4})/g,'&#x$1;');
                    var lines = [(element.textContent ? element.textContent : element.innerText).replace(/\*(?=\&)|(^searchWord=)|(\&maxHits=.+$)/g,'')];
                    if (/*viaMsproxyNet=*/false) lines[0] = lines[0].replace(/%2A($|(?=\&toc=))/g,'');
                    var pattern = new RegExp('<tr[^<]*<td[^<]*<img[^<]*</td[^<]*<td[^<]*<a\\s+(?:(?:class|id|title|onmouseover|onmouseout)\\s*=\\s*(?:(?:\'[^\']*\')|(?:"[^"]*"))\\s+)*href="([^"]*)"(?:\\s+o\\w+="[^"]*")*\\s+title="([^"]*)"[^>]*>([^<]*)</a>(?:(?:(?!</tr)(?!\\sclass=["\']description["\'])[\\s\\S])*</tr){1,2}(?:(?!</tr)(?!\\sclass=["\']description["\'])[\\s\\S])*\\sclass=["\']description["\'][^>]*>([^<]*)', 'g');
                    for (; (match = pattern.exec(data)) != null;) {
                        var items = [];
                        for (var i = 1; i < 5; i++) {
                            element.innerHTML = match[i];
                            items.push((element.textContent ? element.textContent : element.innerText).replace(/^\s+|\s+$/g,'').replace(/\s+/g,' '));
                        }
                        lines.push(items[2]);
                        lines.push(items[3]);
                        if (/*viaMsproxyNet=*/false){
                            element.innerHTML = decodeURIComponent(items[0].substring(35));
                            lines.push(element.textContent ? element.textContent : element.innerText);
                        } else {
                            lines.push(items[0].substring(8));
                        }
                        lines.push(items[1]);
                    }
                } else {
                    var lines = data.split('\n');
                }
                if (lines.length < 1) return;

                renderProposals(lines, true);

                // update cache
                cache[lines[0]] = lines;
            }

            function prefetch(data) {
                var blocks = data.split('\n');
                for (var i = 0; i < blocks.length; i++) {
                    var lines = blocks[i].split('\t');
                    if (lines.length < 1) continue;
                    cache[lines[0]] = lines;
                }
            }

            updateProposals = function() {

//                // remember query to restor on page reload
//                document.getElementById('b').value = document.getElementById('ehs-q').value;

                // callback required?
                var query = getQuery();
                if (query == currentQuery) {
                    if (cache[query]) renderProposals(cache[query], true, true);
                    return;
                }
                currentQuery = query;

                // hide hint
                if (hintField) hintField.value = '';

                // query empty?
                if (query.length == 0) {
                    hideProposals();
                    return;
                }

                // cached?
                var cached = cache[query];
                if (cached) {
                    renderProposals(cached, true);
                    return;
                }

                // interim results: cached elements with matching title
                var interimResults = [currentQuery];
                var interimResultsHrefs = {};
                var wordBeginRegEx = queryToRegEx(currentQuery);
                var queryPart = currentQuery.indexOf('&') < 0
                                ? currentQuery
                                : currentQuery.substr(0, currentQuery.indexOf('&'));
                // TODO first search in cached results of part of query
                loop: for(var key in cache) {
                    var lines = cache[key];
                    for (var i = 1; i < lines.length-2; i+=4) {
                        var match = wordBeginRegEx.exec(lines[i]);
                        if (match) {
                            var hrefEnd = lines[i+2].lastIndexOf('?resultof=');
                            var href = hrefEnd < 0
                                       ? lines[i+2]
                                       : lines[i+2].substring(0, hrefEnd);
                            if (interimResultsHrefs[href]) continue;
                            interimResultsHrefs[href] = true;
                            interimResults.push(lines[i]);
                            interimResults.push(lines[i+1]);
                            interimResults.push(href); // TODO add ?resultof=...
                            interimResults.push(lines[i+3]);

                            // enough results?
                            if (interimResults.length > maxProposals * 4) break loop;
                        }
                    }
                }
                if (interimResults.length > 1) {
                    renderProposals(interimResults, false);
                }

                // remote callback
                var url =
                      baseUrl
                    + callbackUrl
                    + (/*isLegacy=*/true ? 'searchWord=' : 's=')
                    + (/*isLegacy=*/true ? query.replace(/(\&|$)/, '*$1') : query)
                    + '&maxHits='
                    + maxProposals
                    + (/*isLegacy=*/true
                       ? (query.indexOf('&toc=') < 0
                          ? ''
                          : '&quickSearch=true&quickSearchType=QuickSearchToc')
                       : '');
                remoteRequest(/*viaMsproxyNet=*/false
                              ?   'http://www.msproxy.net/index.php?hl=e1&q='
                                + encodeURIComponent(url)
                              : url,
                              callback);

            }

            function renderProposals(lines, done, hintOnly) {

                // actual callback?
                if (lines[0] != currentQuery) return;

                // hint
                var wordBeginRegEx = queryToRegEx(lines[0]);
                var newHints = {};
                var rankingUnit = 1 / lines.length;
                var queryLength = lines[0].indexOf('&') < 0
                                  ? lines[0].length
                                  : lines[0].indexOf('&');
                for (var i = 1; i < lines.length-2 && queryLength < 36; i+=4) {
                    var match = wordBeginRegEx.exec(lines[i]);
                    if (match) {
                        var pHint = match[0].toLowerCase();
                        newHints[pHint] =   (newHints[pHint] ? newHints[pHint] : 0)
                                          + (1 + (lines.length - i) / lines.length) / lines.length;
                    }
                    match = wordBeginRegEx.exec(lines[i+1]);
                    if (match) {
                        var pHint = match[0].toLowerCase();
                        newHints[pHint] =   (newHints[pHint] ? newHints[pHint] : 0)
                                          + (0.7 + (lines.length - i) / lines.length) / lines.length;
                    }
                }
                var allHints = [];
                for (var i in newHints) {
                    if (newHints[i] < 1.8 / lines.length) continue;
                    allHints.push(newHints[i].toFixed(7) + i);
                }
                allHints.sort().reverse();
                if (hintField) hintField.value = allHints.length > 0
                                                 ? searchField.value + wordBeginRegEx.exec(allHints[0].substring(9))[1]
                                                 : '';
                if (hintOnly) return;

                // search word(s)
                var searchWord = lines[0].indexOf('&') < 0
                                 ? lines[0]
                                 : lines[0].substr(0, lines[0].indexOf('&'));
                searchWord = decodeURIComponent(searchWord.replace(/\+/g, '%20'));

                // proposals
                var newUl = createElement(null, 'ul');
                if (!done) newUl.setAttribute('style', 'opacity:0.5;');
                var items = [];
                var data = [];
                var searchWordLength = lines[0].indexOf('&toc=') > 0
                                       ? decodeURIComponent(lines[0].substring(0, lines[0].indexOf('&toc='))).length
                                       : decodeURIComponent(lines[0]).length;
                for (var i = 0; i < allHints.length && i < 3; i++) {
                    var hintText = allHints[i].substring(9);
                    var li = createElement(newUl, 'li')
                    if (booksButton) {
                        var spacer = createElement(li, 'span', 'b');
                        spacer.style.display = 'inline-block';
                        spacer.style.width = booksButton.offsetWidth + 'px';
                    }
                    createElement(li, 'span', null, hintText.substring(0, searchWordLength));
                    createElement(li, 'strong', null, hintText.substring(searchWordLength));
                    items.push(li);
                    data.push([hintText]);
                }
                for (var i = 1; i < lines.length-2; i+=4) {
                    var nr = (i - 1) / 4;
                    var li = createElement(newUl, 'li');
                    items.push(li);
                    data.push([lines[0], lines[i+2]]);
                    var btDiv = createElement(li, 'div', 'v');
                    var bookDiv = createElement(btDiv, 'div', 'w', lines[i+3]);
                    bookDiv.onmouseup = (function(tocName) {
                        return function(e) {
                            stopPropagation(e);
                            if (!books) return;
                            for (var i = 0; i < books.length; i+=3) {
                                if (tocName == books[i]) {
                                    var bookName = books[i];
                                    if (bookNameShortener) {
                                        bookName = bookNameShortener(bookName);
                                    }
                                    setBook(bookName, books[i+1], books[i+2]);
                                    return;
                                }
                            }
                        }
                    })(lines[i+3]);
                    bookDiv.ontouchend = function(e) {stopPropagation(e)};

                    var titleDiv = createElement(btDiv, 'div', 't');
                    addHighlightedText(titleDiv, lines[i], searchWord);
                    var descDiv = createElement(li, 'div', 'c', null);
                    addHighlightedText(descDiv, lines[i+1], searchWord);

                    // preview on hovering
                    li.ontouchmove = function(a) { return function() {
                        a.canceled = 'x';
                    }}(li);
                }

                searchField.hasFocus = true;
                toMenu(searchField, items, data, function(d) {

                    // apply hint
                    if (d.length < 2) {
                        hintField.value = '';
                        searchField.value = d;
                        updateProposals();
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

                    // #mobile_ready
//                    top.location =   baseUrl
//                                   + (inSearchView
//                                      ? 'ntopic' + d[1]
//                                      :   'index.jsp?topic='
//                                        + (/*viaMsproxyNet=*/false ? encodeURIComponent(d[1].substring(baseUrl.length + 17)) : d[1])
//                                        + '&tab=search&searchWord='
//                                        + searchWord
//                                        + (toc ? '*&quickSearch=true&quickSearchType=QuickSearchToc&toc=' + encodeURIComponent(toc) : '*'));
                    document.getElementById('m-content').src = baseUrl + 'ntopic' + d[1];
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
                        updateProposals();
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
                    iFrame.src = /*viaMsproxyNet=*/false
                                 ? b[1].replace(/\/topic[\/]/, '/ntopic/')
                                 : '/help/ntopic' + b[1];
                });

                proposals.removeChild(proposals.firstChild);
                if (lines.length > 1) showProposals(); else hideProposals();
                proposals.appendChild(newUl);
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

            function queryToRegEx(query) {
                query = query.indexOf('&') < 0
                        ? query
                        : query.substr(0, query.indexOf('&'));
                query = decodeURIComponent(query.replace(/\+/g, '%20'));
                query = query.replace(/([\.\?\*\+\-\(\)\[\]\{\}\\])/g, '\\$1');
                return new RegExp("\\b(?:" + query + ")((?:\\w+|\\W+\\w+))", "i");
            }

            addEvent(searchField, 'focus', updateProposals);
            addEvent(searchField, 'keyup', updateProposals);
            addEvent(searchField, 'change', updateProposals);

            // prefetch
            if (!/*isLegacy=*/true) {
                remoteRequest(  baseUrl
                              + callbackUrl
                              + 'p=abcdefghijklmnopqrstuvwxyz'
                              + (tocField && tocField.name == 'toc'
                                ? '&toc=' + tocField.value
                                : '')
                              + '&maxHits=' + maxProposals,
                                prefetch,
                              true);
            }

        }

    }

    window['_eh'] = eh;

})(window);

// TODO because of stemming: if available, use resultof=... to mark as <strong>
// TODO common caches?
// TODO use 'new' object instead of 'var x = ...' -> smaller?
// TODO preview on hover: option to disable
// TODO books drop-down menu with stopPropagation() and without setTimeout()?