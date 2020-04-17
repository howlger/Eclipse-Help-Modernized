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
    var TOC_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g fill="#54595d"><path fill-rule="evenodd" d="M19 5H1V3h18v2zm0 10H1v2h18v-2zm-4-6H1v2h14V9z" clip-rule="evenodd"/></g></svg>';
    var TOC_ICON_DESCRIPTION = 'Toggle table of content';
    var TREE_HANDLE = '<svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation">-<path d="M10.294 9.698a.988.988 0 0 1 0-1.407 1.01 1.01 0 0 1 1.419 0l2.965 2.94a1.09 1.09 0 0 1 0 1.548l-2.955 2.93a1.01 1.01 0 0 1-1.42 0 .988.988 0 0 1 0-1.407l2.318-2.297-2.327-2.307z" fill="currentColor" fill-rule="evenodd"></path></svg>';;

    var iconExtension = '.gif';

    window.onload = function() {

        // TOC sidebar button
        var tocSidebarToggleButton = createElement(getElementById('h'), 'a', 'b', 'TOC');
        tocSidebarToggleButton.href = '#';
        tocSidebarToggleButton.alt = TOC_ICON_DESCRIPTION;
        tocSidebarToggleButton.title = TOC_ICON_DESCRIPTION;
        setInnerHtml(tocSidebarToggleButton, TOC_ICON);

        // TOC slider (to change TOC sidebar width by moving the slider)
        var smallScreenAutoCloseFn = addSlider(tocSidebarToggleButton);

        // table of content (TOC)
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

    function addSlider(tocSidebarToggleButton) {

        // create slider element
        var slider = createElement();
        slider.id = 's';
        getElementById('m').insertBefore(slider, getElementById('c'));

        // create overlay required for smooth slider drag'n'drop
        var overlay = createElement();
        var header =  getElementById('h');
        getParentElement(header).insertBefore(overlay, header);
        var overlayStyle = overlay.style;
        overlayStyle.display = 'none';
        overlayStyle.zIndex  = '1';
        overlayStyle.position = 'absolute';
        overlayStyle.height = '100%';
        overlayStyle.width = '100%';

        // TOC sidebar with its style and width
        var tocWidth;
        var tocSidebar = getElementById('t');
        var tocSidebarStyle = tocSidebar.style;

        // slider movement
        function move(e) {
            tocWidth = (e.touches ? e.touches[0].clientX : e.pageX) - TOC_SLIDER_HALF_WIDTH;
            if (tocWidth < 0) {
                tocWidth = 0;
            }
            tocSidebarStyle.width = tocWidth + 'px';
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
            overlayStyle.display = 'none';
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
            overlayStyle.display = 'block';
            setClassName(tocSidebar, '');
            tocSidebarStyle.transition = '';
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
    // Tree

    function createTree(element, contentProvider, labelProvider, selectable) {
        var root = createElement(element, 0, 'tree');
        function createNode(parent, node, open) {
            contentProvider(node, function(parent, node, open) {
                return function(children) {
                    var ul = createElement(parent, 'ul');
                    for (var i = 0; i < children.length; i++) {
                        var li = createElement(ul, 'li', 'closed');
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
                    }
                }
            }(parent, node, open));
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

    function getAttribute(element, attribute) {
        return element.getAttribute(attribute);
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
    }

    function setInnerHtml(element, innerHtml) {
        element.innerHTML = innerHtml;
    }

    function preventDefault(e) {
        e = e || window.event;
        try {
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
        } catch(e) {}
    }

    function stopPropagation(e) {
        e = e || window.event;
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
        document.cookie = cookieName + '=' + value + ';' + expires + ';path=/';
    }

    var openRequest;
    function remoteRequest(url, callbackFn, cancelable) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) callbackFn(request.responseText);
        }
        request.open('GET', url);
        request.send();
        if (openRequest && openRequest.abort) openRequest.abort();
        if (cancelable) openRequest = request;
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
                                    div.setAttribute(attribute.name, attribute.value);
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
