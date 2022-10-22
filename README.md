
The modernized Eclipse Help prototype
**[became part of Eclipse in version 2020-12 (4.18)](https://bugs.eclipse.org/bugs/show_bug.cgi?id=501718)**.

[It needs to be activated](https://github.com/eclipse-platform/eclipse.platform.ua/tree/master/org.eclipse.help.webapp/m)
(it's not activated by default, e.g. the active help is missing and the UI lags behind the legacy UI in terms of
accessibility).

Please [report issues to the Eclipse Platform project here](https://github.com/eclipse-platform/eclipse.platform.ua/issues).

The
[**modernized Eclipse Help** prototype is already used by Remain Software here](https://remainsoftware.com/docs/openapi/help/index.jsp)
(**vs. [legacy UI](https://remainsoftware.com/docs/openapi/help/index.jsp?legacy)**).


# Modernized Eclipse Help (Prototype)

Prototype of a modernized Eclipse help web UI (see [Eclipse bug 501718](https://bugs.eclipse.org/bugs/show_bug.cgi?id=501718)).

In the the legacy UI click the star button (<img src="de.agilantis.help_ui_modernized/m.svg" width="20">) in the top right corner to switch to the new experimental UI.

Update site: [`https://raw.githubusercontent.com/howlger/Eclipse-Help-Modernized/update-site/staging`](https://raw.githubusercontent.com/howlger/Eclipse-Help-Modernized/update-site/staging)

Requires Eclipse 2019-06 (4.12) or higher, otherwise no icons are shown in the TOC.

## Improved search

* Search as you type and auto completion of search terms
* Topic preview when hovering over instant search results
* Search one book or all books

<img src="artwork/help-viewer-01.gif " alt="Improved search" width="800"/>

## Mobile ready

* Table of contents slider
* Show and hide table of contents button
* Menu with change font size

<img src="artwork/help-viewer-02.gif " alt="Mobile ready" width="800"/>

Developed for and sponsored by [Advantest Corporation](https://www.advantest.com/).
