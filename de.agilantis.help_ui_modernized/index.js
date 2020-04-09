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

    window.onload = function() {

        // TODO remove dummy code
        createElement(getElementById('t'), 'p', false, 'TOC');
        createElement(getElementById('f'), 'p', false, 'footer');

        // TOC sidebar button
        var tocSidebarToggleButton = createElement(getElementById('h'), 'a', 'b', 'TOC');
        tocSidebarToggleButton.href = '#';
        tocSidebarToggleButton.alt = TOC_ICON_DESCRIPTION;
        tocSidebarToggleButton.title = TOC_ICON_DESCRIPTION;
        setInnerHtml(tocSidebarToggleButton, TOC_ICON);

        // make TOC sidebar resizeable
        addSlider(tocSidebarToggleButton);

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
        function toggleTocSidebar(e, initialize) {
            preventDefault(e);
            var isSmall = isSmallScreen();
            var currentClass = getClassName(tocSidebar);
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
        }
        toggleTocSidebar(0, 1);
        addEvent(slider, 'dblclick', toggleTocSidebar);
        addEvent(tocSidebarToggleButton, 'click', toggleTocSidebar);

    }

    function isSmallScreen() {
        var clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
        return clientWidth <= SMALL_SCREEN_WIDTH;
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
