/*******************************************************************************
 * Copyright (c) 2019 Holger Voormann and others.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 ******************************************************************************/

var clientWidth = document.documentElement.clientWidth
               || document.body.clientWidth;
var menuWidth = 280; // Right side menu width
var smallScreenWidth = 768; // Tablet breakpoint;
var sliderWidth = 12;
var isEmbeddedHelp = false;

//console.log('tocWidth0=' + tocWidth);
// Read toc width from cookie
var tocWidth = getCookie('toc-width');
if (tocWidth == '' || tocWidth == undefined) {
    tocWidth = 360;
}
if (clientWidth < smallScreenWidth && tocWidth > sliderWidth) {
    tocWidth = -tocWidth;
}
//console.log('tocWidth1=' + tocWidth);

function h(a, c, d, e) {
    if (typeof _eh != 'undefined')
        _eh.h(a, '', true, d, c, e)
};
function v(a, c, d, e) {
    if (typeof _eh != 'undefined')
        _eh.h(a, 's', true, d, c, e)
};
function addEvent(o, type, fn) {
    if (o.addEventListener)
        o.addEventListener(type, fn, false);
    else if (o.attachEvent) {
        o['e' + type + fn] = fn;
        o[type + fn] = function() {
            o['e' + type + fn](window.event);
        }
        o.attachEvent('on' + type, o[type + fn]);
    }
}
function updateContentFrameSize() {

    // see https://stackoverflow.com/a/49261999 and https://stackoverflow.com/a/819455
    var contentFrame = document.getElementById('m-content');
    var contentFrameDocument = contentFrame.contentWindow.document;
    var contentFrameDocumentElement = contentFrameDocument.documentElement
            || contentFrameDocument.body;
    var magic = 1;

    // start with 0x0 (otherwise issues in Chrome)
    contentFrame.width = '0';
    contentFrame.height = '0';

    // available/required width
    // var innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var clientWidth = document.documentElement.clientWidth
            || document.body.clientWidth;
    var widthAvailable = clientWidth - tocWidth - magic;
    var widthMinRequired = contentFrameDocumentElement.scrollWidth;
    contentFrame.width = (widthMinRequired > widthAvailable ? widthMinRequired
            : widthAvailable)
            + 'px';
    contentFrame.height = contentFrameDocumentElement.scrollHeight + 'px';

    // with vertical scrollbar less space is available
    var newClientWidth = document.documentElement.clientWidth
            || document.body.clientWidth;
    if (newClientWidth < clientWidth) {
        widthAvailable = newClientWidth - tocWidth - magic;
        contentFrame.width = (widthMinRequired > widthAvailable ? widthMinRequired
                : widthAvailable)
                + 'px';
        contentFrame.height = contentFrameDocumentElement.scrollHeight + 'px';
    }
    //console.log("clientWidth=" + clientWidth);
    //console.log("newClientWidth=" + newClientWidth);

}
function initContentFrame() {
    updateContentFrameSize();
    addEvent(window, 'resize', updateContentFrameSize);
    //fixAnchorLinks();
}

function initSearchField() {
    var callbackFn = function(responseText) {
        var nodes = getNodes(parseXml(responseText));
        var firstId;
        var tocs = [];
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (n.tagName != 'node')
                continue;
            var title = n.getAttribute('title');
            var id = n.getAttribute('id');
            var href = n.getAttribute('href');
            if (!firstId)
                firstId = id;
            tocs.push(title ? title : '');
            tocs.push(id ? id : '');
            tocs.push(href ? href : '');
        }
        _eh.e(document.getElementById('f'), tocs, firstId, true, 10,
                function shortenBookName(bookName) {
                    return bookName.replace(
                            /\s+Documentation(\s+\-\s+[0-9,\-]+\s+Preview)?$/i,
                            '')
                });
    }
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200)
            callbackFn(request.responseText);
    }
    request.open('GET', '../../advanced/tocfragment');
    request.send();
};

function remoteRequest(url, callbackFn) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200)
            callbackFn(request.responseText);
    }
    request.open('GET', url);
    request.send();
    if (openRequest && openRequest.abort)
        openRequest.abort();
    if (!uncancelable)
        openRequest = request;
}

var parseXml;
if (typeof window.DOMParser != "undefined") {
    parseXml = function(xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    };
} else if (typeof window.ActiveXObject != "undefined"
        && new window.ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = function(xmlStr) {
        var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    };
}

function init() {

    // load TOC
    var callbackFn = function(responseText) {
        var start = responseText.indexOf('title="Topic View" src=\'');

        if (start > 0) {
            var end = responseText.indexOf("'", start + 24);
            var element = createElement(null, 'p');
            element.innerHTML = responseText.substring(start + 24, end);
            document.getElementById('m-content').src = '../'
                    + (element.textContent ? element.textContent
                            : element.innerText);
            loadTocChildrenInit(document.getElementById('m-toc'));
        }
    }
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200)
            callbackFn(request.responseText);
    }
    request.open('GET', '../../advanced/content.jsp');
    request.send();

    // activate slider (to resize TOC width)
    var slider = document.getElementById("m-slider");
    slider.mousemove = function(e) {
        tocWidth = e.pageX + 8;
        if (tocWidth < sliderWidth)
            tocWidth = sliderWidth;
        var asideStyle = document.getElementById("m-aside").style;
        asideStyle.transition = '';
        asideStyle.width = tocWidth + 'px';
        document.getElementById("m-slider").setAttribute('class', '');
        updateContentFrameSize();
        setTocWidth(tocWidth);
    };
    slider.onmousedown = function(e) {
        try {
            document.getElementById("m-ovrl").style.display = 'block';
            document.documentElement.addEventListener('mousemove',
                    slider.doDrag, false);
            document.documentElement.addEventListener('mouseup',
                    slider.stopDrag, false);
        } catch (e) {
        }
    }
    slider.doDrag = function(e) {
        if (e.which != 1) {
            slider.stopDrag(e);
            return;
        }
        slider.mousemove(e);
    }
    slider.stopDrag = function(e) {
        document.getElementById("m-ovrl").style.display = 'none';
        document.documentElement.removeEventListener('mousemove',
                slider.doDrag, false);
        document.documentElement.removeEventListener('mouseup',
                slider.stopDrag, false);
    }
    var toggle_toc = function(e) {
        tocWidth = -tocWidth;
        var asideStyle = document.getElementById("m-aside").style;
        asideStyle.transition = 'width .25s ease-in';
        asideStyle.width = (tocWidth < sliderWidth ? sliderWidth : tocWidth)
                + 'px';
        document.getElementById("m-slider").setAttribute('class',
                tocWidth < sliderWidth ? 'o' : '');
        updateContentFrameSize();
    }
    var toc_width = function(e) {
        var asideStyle = document.getElementById("m-aside").style;
        //console.log(tocWidth);
        asideStyle.width = tocWidth;
        //console.log( asideStyle.width );
    }
    document.getElementById("m-aside").onclick = toc_width;
    slider.ondblclick = toggle_toc;
    document.getElementById("m-slider_").onclick = toggle_toc;

    scrollToTop();
    // Read font size from cookie if already set
    var fontSize = getFontSize();
    if (fontSize != "") {
        setFontSize(fontSize);
    }

}

// Stores the toc width in a cookie
function setTocWidth(w) {
    setCookie("toc-width", w, 365);
}

// TODO remove when integrated into Eclipse
// (the following function is only required to support older Eclipse versions having GIF instead of SVG icons)
var iconExtension = '.svg';
function loadTocChildrenInit(item, toc, path) {
    var callbackFn = function(responseText) {
        if (responseText.indexOf('"images/e_restore.gif"') > 0) {
            iconExtension = '.gif';
            isEmbeddedHelp = true;
        }
        loadTocChildren(item, toc, path);
        showHistoryButtons(); /* Enable browser history buttons if run as embedded help viewer */
    }
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200)
            callbackFn(request.responseText);
    }
    request.open('GET', '../../advanced/contentToolbar.jsp');
    request.send();
}

function loadTocChildren(item, toc, path) {
    var callbackFn = function(responseText) {
        showLoadedTocChildren(item, parseXml(responseText), toc, path);
    }
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200)
            callbackFn(request.responseText);
    }
    request.open('GET', '../../advanced/tocfragment'
            + (toc ? '?toc=' + toc : '') + (path ? '&path=' + path : ''));
    request.send();
}

function createElement(parent, name, clazz, text) {
    var element = document.createElement(name);
    if (parent) {
        parent.appendChild(element);
    }
    if (clazz) {
        element.setAttribute('class', clazz);
    }
    if (text) {
        element.appendChild(document.createTextNode(text));
    }
    return element;
}

function getNodes(xml, toc, path) {
    var books = xml.documentElement.childNodes;
    if (!toc)
        return books;
    var book;
    for (var i = 0; i < books.length; i++) {
        book = books[i];
        if (book.tagName == 'node' && toc == book.getAttribute('id')) {
            if (!path)
                return book.childNodes;
            break;
        }
    }
    var nodes = book.childNodes;
    tocLevelLoop: while (true) {
        for (var i = 0; i < nodes.length; i++) {
            n = nodes[i];
            if (n.tagName != 'node')
                continue;
            var id = n.getAttribute('id');
            if (path == id)
                return n.childNodes;
            if (id && path.length > id.length
                    && path.substring(0, id.length + 1) == id + '_') {
                nodes = n.childNodes;
                continue tocLevelLoop;
            }
        }
        break;
    }
    return [];
}

function showLoadedTocChildren(item, xml, toc, path) {
    var ul = createElement(item, 'ul');
    var nodes = getNodes(xml, toc, path);
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.tagName != 'node')
            continue;
        var li = createElement(ul, 'li', 'closed');
        if (n.getAttribute('is_leaf') != 'true') {
            var handle = createElement(li, 'span');
            handle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation">-<path d="M10.294 9.698a.988.988 0 0 1 0-1.407 1.01 1.01 0 0 1 1.419 0l2.965 2.94a1.09 1.09 0 0 1 0 1.548l-2.955 2.93a1.01 1.01 0 0 1-1.42 0 .988.988 0 0 1 0-1.407l2.318-2.297-2.327-2.307z" fill="currentColor" fill-rule="evenodd"></path></svg>';
            addEvent(handle, 'click', (function(li, toc, path) {
                return function() {
                    toggleTocItem(li, toc, path)
                };
            })(li, toc ? toc : n.getAttribute('id'), toc ? n.id : undefined));
        }
        var a = createElement(li, 'a');
        a.setAttribute('href', '../../' + n.getAttribute('href').substring(3));
        a.setAttribute('target', 'm-content');
        // For small screen close the TOC again when link is clicked
        var clientWidth = document.documentElement.clientWidth
                || document.body.clientWidth;
        if (clientWidth < smallScreenWidth) {
            a.setAttribute('onclick', 'closeToc();');
        }
        var icon = n.getAttribute('image');
        if (icon) {
            var iconImg = createElement(a, 'img');
            iconImg.setAttribute('src', '../../advanced/images/' + icon
                    + iconExtension);
        }
        a.appendChild(document.createTextNode(n.getAttribute('title')));
    }
    updateContentFrameSize();
}
function toggleTocItem(li, toc, path) {
    var isOpen = li.getAttribute('class') == 'open'
            || li.getAttribute('class') == 'open loaded';
    li.setAttribute('class', isOpen ? 'closed' : 'open');
    var nodes = li.childNodes;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].tagName == 'UL')
            return;
    }
    loadTocChildren(li, toc, path);
}

// Prints current loaded topic
function printContent() {
    var content = document.getElementById('m-content');
    try {
        var orgTitle = document.title;
        document.title = content.contentDocument.title;
        window.print();
        // Reset the title again to the original value
        document.title = orgTitle;
    } catch (e) {
    }
}

// TODO
function printSection() {
    var content = document.getElementById('m-content');
    var url = content.contentDocument.location.href;
    var topic = url.substr(url.indexOf('/help/topic/'), url.length);
    topic = topic.replace('/help/topic/', '');
    return true;
    /*
    console.log("topic=" + topic);
    window.location.href = '../../advanced/print.jsp?topic=' + topic;
     */
}

// Opens requested topic in content frame
function openTopic(topic) {
    var a = document.createElement('a');
    a.href = topic;
    a.target = 'm-content';
    document.body.appendChild(a);
    a.click();
}

// Opens more menu
function openMenu() {
    document.getElementById("h-menu-ovrl").style.width = menuWidth + 'px';
}
// Closes more menu
function closeMenu() {
    document.getElementById("h-menu-ovrl").style.width = '0px';
}

// Closes menu if the user clicks outside of it

// TODO Close menu also when content iframe is clicked
//var contentFrame = document.getElementById('m-content');
//var contentFrameDocument = contentFrame.contentWindow.document;
//contentFrameDocument.addEventListener('click', function(event) {closeMenu(this.id);}, false);

window.onclick = function(event) {
    //console.log("event.target.id=" + event.target.id);
    if (event.target.id != 'h-more-btn' && event.target.id != 'h-more-icon'
            && event.target.id != 'h-menu-close-btn'
            && event.target.id != 'h-menu-settings-font-btn'
    //&& event.target.id != 'h-toc-btn'
    ) {
        document.getElementById("h-menu-ovrl").style.width = '0px';
        //document.getElementById("m-aside").style.width = '0px';
    }
}

// Closes table of contents
function closeToc() {
    var masideStyle = document.getElementById("m-aside").style;
    masideStyle.width = '0px';
    if (clientWidth < smallScreenWidth && tocWidth > sliderWidth) {
        tocWidth = -tocWidth;
    }
    updateContentFrameSize();
}

// Show or hide the table of contents
function toggleToc() {

    var masideStyle = document.getElementById("m-aside").style;
    var mSlider = document.getElementById("m-slider");

    tocWidth = -tocWidth;
    mSlider.setAttribute('class', tocWidth < sliderWidth ? 'o' : '');
    /*
    console.log( 'display=' + masideStyle.display
            + ', width=' + masideStyle.width
            + ', tocWidth=' + tocWidth
            + ', sliderWidth=' + sliderWidth
            + ', clientWidth=' + clientWidth );
     */
    if (tocWidth < sliderWidth) {
        masideStyle.width = '0px';
        // For Microsoft Edge
        if (/Edge\/\d./i.test(navigator.userAgent)) {
            masideStyle.display = "none";
        }
    } else {
        masideStyle.width = tocWidth + 'px';
        masideStyle.display = "table-cell";
    }
    updateContentFrameSize();
    //console.log( 'tocWidth=' + tocWidth + ', sliderWidth=' + sliderWidth );

}

// Sets cursor in search field
function focusSearch() {
    document.getElementById('focusByDefault').focus();
}

// Show browsing buttons when run as embedded help viewer
function showHistoryButtons() {
    if ( isEmbeddedHelp ) {
        document.getElementById('h-history-back-icon').style.display = 'inline-block';
        document.getElementById('h-history-back-btn').style.display = 'inline-block';
        document.getElementById('h-history-forward-icon').style.display = 'inline-block';
        document.getElementById('h-history-forward-btn').style.display = 'inline-block';
    }
}

// Go one page back in browser history
// (required in standalone help viewer only)
function goBack() {
    window.history.back();
}

// Go one page forward in browser history
// (required in standalone help viewer only)
function goForward() {
    window.history.forward();
}

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {
    scrollFunction()
};

function scrollFunction() {

    // Initialize go to top button
    var topButton = document.getElementById("f-totop");

    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        topButton.style.display = "block";
    } else {
        topButton.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// From the TOC scroll to the heading of the topic
function scrollToHeading() {
    var content = document.getElementById('m-content');
    location.href = "#ariaid-title1";
}

// Adds target for anchor links (https://stackoverflow.com/a/19325592)
function fixAnchorLinks() {
    var iframe = document.getElementById('m-content');
    var doc = (iframe.contentDocument) ? iframe.contentDocument
            : iframe.contentWindow.document;

    var anchors = doc.getElementsByTagName('a');
    for (var i = 0; i < anchors.length; i++)
        anchors[i].target = '_parent';
}

// In-Decrease the font size for the toc and content iframe
function setFontSize(change) {
    var fontChange = 3;
    var newFontSize = 0;
    var contentFrame = document.getElementById('m-content');
    var contentFrameDocument = contentFrame.contentWindow.document;
    var contentFrameDocumentElement = contentFrameDocument.documentElement
            || contentFrameDocument.body;
    var contentStyle = window.getComputedStyle(contentFrameDocumentElement,
            null).getPropertyValue('font-size');
    var contentFontSize = parseFloat(contentStyle);
    var toc = document.getElementById('m-toc');
    var tocStyle = getComputedStyle(toc, null).getPropertyValue('font-size');
    var tocFontSize = parseFloat(tocStyle);

    if (change == 'plus') {
        newFontSize = (tocFontSize + fontChange);
    } else if (change == 'minus' && tocFontSize > 12) {
        newFontSize = (tocFontSize - fontChange);
    } else if (change != '') { // value from cookie
        newFontSize = change;
    } else {
        return null;
    }

    contentFrameDocumentElement.style.fontSize = newFontSize + 'px';
    toc.style.fontSize = newFontSize + 'px';

    // Store the font size in a cookie
    setCookie("font-size", newFontSize, 365);
}

function getFontSize() {
    return getCookie("font-size");
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

/* TODO */
function toggleHighlight(button, param) {
    try {
        parent.ContentViewFrame.toggleHighlight();
        var highlight = parent.ContentViewFrame.currentHighlight;
        window.setButtonState("toggle_highlight", highlight);
        var date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = document.cookie = "highlight=" + highlight
                + "; expires=" + date.toGMTString() + ";path=/";
        ;

    } catch (e) {
    }
}