'use strict';

/*
* Title: Bravo App Template
* Source: TBD
* Version: v1.0
* Author: Gunjan Datta
* 
* Copyright © 2015 Bravo Consulting Group, LLC (Bravo). All Rights Reserved.
* Released under the MIT license.
*/

// Global variables
var BRAVO = BRAVO || {};
BRAVO.AppConfig = BRAVO.AppConfig || [];
BRAVO.AppInstances = BRAVO.AppInstances || [];

// Wait for the load event
window.addEventListener("load", function () {
    // Wait for the custom js classes to be initialized
    SP.SOD.executeOrDelayUntilScriptLoaded(initApp, "bravo.app.js");
});

// Function to get the app instance
function getAppInstance(obj) {
    // Ensure the object exists
    if (obj) {
        // See if this is the app panel
        if (obj.className && obj.className.indexOf("app-panel") >= 0) {
            // Get the index of the app
            var appId = obj.id.split("_");
            var appIdx = appId.length == 2 ? parseInt(appId[1]) : 0;

            // Return the app instance
            return BRAVO.AppInstances[appIdx];
        }

        // Get the app instance
        return getAppInstance(obj.parentNode);
    }

    return null;
}

// Function to hide the validation panel
function hideValidationPanel() {
    // Get the validation panel
    var panel = document.querySelector("#app-validation-panel");
    if (panel) {
        // Clear the classes
        panel.className = "";
    }
};

// The initialization method for the app
function initApp() {
    // Return if no app configurations exist
    if (BRAVO.AppConfig.length == 0) { return; }

    // Get the app panel
    var mainBody = document.querySelector("#apps-container");
    var appPanelTemplate = mainBody.querySelector(".app-panel").outerHTML;

    // Clear the main body
    mainBody.innerHTML = "";

    // Parse the app configurations
    for (var i = 0; i < BRAVO.AppConfig.length; i++) {
        // Create the app panel instance
        var appPanel = document.createElement("div");
        appPanel.innerHTML = appPanelTemplate;
        appPanel = appPanel.querySelector(".app-panel");
        appPanel.setAttribute("id", "app_" + i);

        // Create an instance of the app and set the global parameters for all of them
        var app = new BRAVO.App();
        app.APP_DEPENDENCY_CORE_LIB = BRAVO.AppConfig[i].title != "Bravo Core Library";
        app.REFRESH_BUTTON_VISIBLE = true;
        app.VALIDATE_PANEL_VISIBLE = true;

        // Initialize the app
        BRAVO.AppInstances.push(BRAVO.AppConfig[i].initApp(appPanel, app));

        // Append a new panel
        mainBody.appendChild(appPanel);
    }
}

// The install click event
function installApp(btn) {
    // Get the app instance
    var app = getAppInstance(btn);
    if (app) {
        // See if this app is dependant on the core library
        if (app.APP_DEPENDENCY_CORE_LIB) {
            var coreLibApp = null;

            // Parse the app configs for the core library
            for (var i = 0; i < BRAVO.AppConfig.length; i++) {
                // See if this is the core library instance
                if (BRAVO.AppConfig[i].title == "Bravo Core Library") {
                    // Get the app instance
                    coreLibApp = BRAVO.AppInstances[i];
                    break;
                }
            }

            // See if the core library is not currently installed
            if (coreLibApp && !coreLibApp.isInstalled()) {
                // Display an error message
                BRAVO.ModalDialog.openHtml("App Dependency", "<p>This app is dependent on the 'Bravo Core Library'. Click 'Install' to add this app.</p>" +
                    "<p><button class='right' onclick='return BRAVO.ModalDialog.close(SP.UI.DialogResult.OK);'>Install</button><button class='right' onclick='return BRAVO.ModalDialog.close();'>Close</button></p>",
                    false, null, function (dialogResult) {
                        // See if the 'OK' button was clicked
                        if (dialogResult == SP.UI.DialogResult.OK) {
                            // Install the core library
                            coreLibApp.install().done(function () {
                                // Install this app
                                app.install().done(function () {
                                    // Validate this app
                                    app.validate();
                                });
                            });
                        }
                    });

                // Disable postback
                return false;
            }
        }

        // Install this app
        app.install().done(function () {
            // Validate this app
            app.validate();
        });
    }

    // Disable postback
    return false;
}

// The refresh click event
function refreshApp(btn) {
    // Get the app instance
    var app = getAppInstance(btn);
    if (app) {
        // Refresh the app
        app.refresh();
    }

    // Disable postback
    return false;
}

// The uninstall click event
function uninstallApp(btn) {
    // Get the app instance
    var app = getAppInstance(btn);
    if (app) {
        // Display an error message
        BRAVO.ModalDialog.openHtml("Confirmation", "<p>Uninstalling this app will remove the associated assets (Lists, Files, etc). Click 'Uninstall' to confirm the request.</p>" +
            "<p><button class='right' onclick='return BRAVO.ModalDialog.close(SP.UI.DialogResult.OK);'>Uninstall</button><button class='right' onclick='return BRAVO.ModalDialog.close();'>Close</button></p>",
            false, null, function (dialogResult) {
                // See if the 'OK' button was clicked
                if (dialogResult == SP.UI.DialogResult.OK) {
                    // Uninstall the app
                    app.uninstall().done(function () {
                        // Validate this app
                        app.validate();
                    });
                }
            }
        );
    }

    // Disable postback
    return false;
}

// The upgrade click event
function upgradeApp(btn) {
    // Get the app instance
    var app = getAppInstance(btn);
    if (app) {
        // Upgrade the app
        app.upgrade();
    }

    // Disable postback
    return false;
}

// The validate click event
function validateApp(btn) {
    // Get the app instance
    var app = getAppInstance(btn);
    if (app) {
        // Validate the app
        app.validate();
    }

    // Disable postback
    return false;
}
