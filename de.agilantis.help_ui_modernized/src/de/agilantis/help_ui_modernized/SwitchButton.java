/*******************************************************************************
 * Copyright (c) 2019 Holger Voormann and others.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *******************************************************************************/
package de.agilantis.help_ui_modernized;

import java.util.Locale;

import org.eclipse.help.webapp.AbstractButton;

public class SwitchButton extends AbstractButton {

    @Override
    public String getId() {
        return getClass().getSimpleName();
    }

    @Override
    public String getImageURL() {
        return "/topic/de.agilantis.help_ui_modernized/m.svg";
    }

    @Override
    public String getTooltip(Locale locale) {
        return "Switch to UI prototype";
    }

    @Override
    public String getAction() {
        return "switchUi";
    }

    public String getJavaScriptURL() {
        return "../../topic/de.agilantis.help_ui_modernized/switch.js";
    }

}
