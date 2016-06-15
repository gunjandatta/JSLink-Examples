"use strict";

/*
* Title: Bravo App Template
* Version: v1.0
* Author: Gunjan Datta
* 
* Copyright © 2015 Bravo Consulting Group, LLC (Bravo). All Rights Reserved.
* Released under the MIT license.
*/

// Global variable
var BRAVO = BRAVO || {};

// **********************************************************************************
// Bravo App Class
// This class is the core code for the app template. This file should not be modifed,
// since all configuration code is in the bravo.appconfig.[name].js file(s).
// **********************************************************************************
BRAVO.App = function () {

    // **********************************************************************************
    // Private Variables
    // **********************************************************************************

    // The base object
    var base = this;

    // The Global Variables
    var _activeSource = null;       // The active source
    var _activeWebType = null;      // The active web type
    var _appPanel = null;           // The app panel
    var _cachedFolders = [];        // Array containing the folders by path
    var _cachedLists = [];          // Array containing the lists by name
    var _existsFlags = [];          // Array containing the flags determining if object types exist
    var _initFl = false;            // Flag to determine if the app has been initialized
    var _installFl = false;         // Flag to determine if the app is currently installed
    var _source = null;             // The sources
    var _validationResults = [];    // The array containing the validation results

    // **********************************************************************************
    // Events
    // **********************************************************************************

    this.onClick_Install = null;
    this.onClick_Refresh = null;
    this.onClick_Uninstall = null;
    this.onClick_Upgrade = null;
    this.onFile_Copied = null;
    this.onInit = null;
    this.onInit_InstallRequired = null;
    this.onList_Configured = null;
    this.onList_Created = null;
    this.onValidate = null;

    // **********************************************************************************
    // Public Variables
    // **********************************************************************************

    // App Information - These values are displayed on the home page.
    this.APP_DEPENDENCY_CORE_LIB = false;
    this.APP_DESCRIPTION = "This is the description of the app.";
    this.APP_INSTRUCTIONS = "These are the installation instructions.";
    this.APP_TITLE = "Name of the App";

    // Error Messages - These are the default error messages displayed to the user.
    this.ERROR_MESSAGE_ACCESS_DENIED = "Access Denied: You do not have the security rights to modify the web.";
    this.ERROR_MESSAGE_NOT_CUSTOM_WEB = "Error: This app is designed to be installed at the custom web: '[URL To Custom Web]'.";
    this.ERROR_MESSAGE_NOT_SITE = "Error: This app is designed to be installed at the root web of the site collection.";

    // Installation Flags - This will determine the active source the app will be installed to.
    this.INSTALL_CUSTOM_WEB = false;
    this.INSTALL_HOST_WEB = false;
    this.INSTALL_ROOT_WEB = false;
    this.INSTALL_SITE = false;

    // Application Configuration
    this.BASE_PERMISSIONS = [SP.PermissionKind.manageLists];
    this.CONTENT_TYPE_INFO = [];
    this.CUSTOM_ACTION_INFO = [];
    this.FIELD_INFO = [];
    this.FILE_INFO = [];
    this.LIST_INFO = [];
    this.MPG_INFO = [];
    this.RIBBON_INFO = [];

    // File Destination Information
    this.FILE_LIST_NAME = "Style Library";
    this.FILE_SUBFOLDER_NAME = "Bravo";

    // Custom Web Information
    // Note - If the associated flag is set, the app will only install to host web matching the defined url.
    this.CUSTOM_WEB_URL = "/";

    // Refersh Button Configuration
    this.REFRESH_BUTTON_MESSAGE = "Any changes to the app may require you to 'Refresh' it.";
    this.REFRESH_BUTTON_VISIBLE = false;

    // Validation
    this.VALIDATE_PANEL_VISIBLE = false;
    this.VALIDATE_LOGGING_LEVEL = BRAVO.App.ValidationType.Information;

    // Version Number
    this.VERSION_NUMBER = 0.0;
    this.VERSION_MESSAGE = "There is an upgrade available.";

    // Wait Screen Messages
    this.WAIT_SCREEN_MESSAGE_INIT = "Loading the App...";
    this.WAIT_SCREEN_MESSAGE_INSTALL = "Installing the App...";
    this.WAIT_SCREEN_MESSAGE_REFRESH = "Refreshing the App...";
    this.WAIT_SCREEN_MESSAGE_UNINSTALL = "Uninstalling the App...";
    this.WAIT_SCREEN_MESSAGE_UPGRADE = "Upgrading the App...";
    this.WAIT_SCREEN_MESSAGE_VALIDATION = "Validating the App...";

    // **********************************************************************************
    // Public Methods
    // **********************************************************************************

    // Method to return the app panel
    this.getAppPanel = function () { return _appPanel; }

    // Method to initialize the class
    // panel - The app panel.
    this.init = function (panel) {
        var methods = [];

        // Clear the cache
        methods.push({ method: cache_Clear });

        // Initialize the panel
        methods.push({ method: panel_Init, args: [panel] });

        // Load the sources
        methods.push({ method: initSource });

        // Load the buttons
        methods.push({ method: buttons_Load });

        // Call the base on-initialized event
        methods.push({ method: panel_OnInitialized, args: [panel] });

        // See if the initialized event exists
        if (base.onInit) {
            // Add the event
            methods.push({ method: base.onInit, args: [_activeSource, panel] });
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to install the app
    this.install = function () {
        var methods = [];

        // Show the modal dialog
        methods.push({ method: BRAVO.ModalDialog.showWaitScreen, args: [base.WAIT_SCREEN_MESSAGE_INSTALL] });

        // Ensure the active source exists
        if (_activeSource.exists) {
            // Clear the cache
            methods.push({ method: cache_Clear });

            // Remove the custom actions
            methods.push({ message: "Removing all custom actions...", method: exists_CustomActions, args: [true] });

            // Add the ribbon custom actions
            methods.push({ message: "Adding the ribbon custom actions...", method: add_RibbonCustomActions });

            // Add the custom actions
            methods.push({ message: "Adding the custom actions...", method: add_CustomActions });

            // Add the fields
            methods.push({ message: "Adding the fields...", method: add_Fields });

            // Add the content types
            methods.push({ message: "Adding the content types...", method: add_ContentTypes });

            // Copy the files
            methods.push({ message: "Copying the files...", method: add_Files, args: [base.FILE_INFO[_activeWebType], base.FILE_LIST_NAME] });

            // Copy the master page gallery files
            methods.push({ message: "Copying the master page gallery files...", method: add_Files, args: [base.MPG_INFO[_activeWebType], "Master Page Gallery"] });

            // Add the lists
            methods.push({ message: "Adding the lists...", method: add_Lists });

            // See if the install event exists
            if (base.onClick_Install) {
                // Add the event
                methods.push({ message: "Install Event", method: base.onClick_Install, args: [_activeSource] });
            }

            // Re-Initialize the app
            methods.push({ message: "Re-Initializing the App", method: base.init, args: [_appPanel] });
        }

        // Close the dialog
        methods.push({ method: BRAVO.ModalDialog.close });

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to determine if the app is currently installed
    this.isInstalled = function () { return _installFl; }

    // Method to get the source by web type
    // webType - The web type to get.
    this.getSourceByType = function (webType) { return _source[webType]; };

    // Method to refresh the term sets
    this.refresh = function () {
        var methods = [];

        // Show the modal dialog
        methods.push({ method: BRAVO.ModalDialog.showWaitScreen, args: [base.WAIT_SCREEN_MESSAGE_REFRESH] });

        // Ensure the active source exists
        if (_activeSource.exists) {
            // Clear the cache
            methods.push({ method: cache_Clear });

            // Remove the custom actions
            methods.push({ message: "Removing all custom actions...", method: exists_CustomActions, args: [true] });

            // Add the ribbon custom actions
            methods.push({ message: "Adding the ribbon custom actions...", method: add_RibbonCustomActions });

            // Add the custom actions
            methods.push({ message: "Adding the custom actions...", method: add_CustomActions });

            // Add the fields
            methods.push({ message: "Adding the fields...", method: add_Fields });

            // Add the content types
            methods.push({ message: "Adding the content types...", method: add_ContentTypes });

            // Copy the files
            methods.push({ message: "Copying the files...", method: add_Files, args: [base.FILE_INFO[_activeWebType], base.FILE_LIST_NAME] });

            // Copy the master page gallery files
            methods.push({ message: "Copying the master page gallery files...", method: add_Files, args: [base.MPG_INFO[_activeWebType], "Master Page Gallery"] });

            // Add the lists
            methods.push({ message: "Adding the lists...", method: add_Lists });

            // See if the refresh event exists
            if (base.onClick_Refresh) {
                // Add the event
                methods.push({ message: "Refresh Event", method: base.onClick_Refresh, args: [_activeSource] });
            }

            // Re-Initialize the app
            methods.push({ message: "Re-Initializing the App", method: base.init, args: [_appPanel] });
        }

        // Close the dialog
        methods.push({ method: BRAVO.ModalDialog.close });

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to refresh the page
    // TO DO - Remove this function w/ the latest UI/UX updates, we no longer need post backs.
    this.refreshPage = function () {
        // Close the dialog
        BRAVO.ModalDialog.close();

        // Refresh the page
        document.location = document.location;
    };

    // Method to uninstall the app
    this.uninstall = function () {
        var methods = [];

        // Show the modal dialog
        methods.push({ method: BRAVO.ModalDialog.showWaitScreen, args: [base.WAIT_SCREEN_MESSAGE_UNINSTALL] });

        // Ensure the active source exists
        if (_activeSource.exists) {
            // Clear the cache
            methods.push({ method: cache_Clear });

            // Remove the custom actions
            methods.push({ message: "Removing all custom actions...", method: exists_CustomActions, args: [true] });

            // Remove the lists
            methods.push({ message: "Removing all lists...", method: exists_Lists, args: [true] });

            // Remove the files
            methods.push({ message: "Removing all files...", method: exists_Files, args: [base.FILE_INFO[_activeWebType], base.FILE_LIST_NAME, true] });

            // Remove the master page gallery files
            methods.push({ message: "Removing all master page gallery files...", method: exists_Files, args: [base.MPG_INFO[_activeWebType], "Master Page Gallery", true] });

            // Remove the content types
            methods.push({ message: "Removing all content types...", method: exists_ContentTypes, args: [true] });

            // Remove the fields
            methods.push({ message: "Removing all fields...", method: exists_Fields, args: [true] });

            // See if the uninstall event exists
            if (base.onClick_Uninstall) {
                // Add the event
                methods.push({ message: "Uninstall Event", method: base.onClick_Uninstall, args: [_activeSource, _appPanel] });
            }

            // Re-Initialize the app
            methods.push({ message: "Re-Initializing the App", method: base.init, args: [_appPanel] });
        }

        // Close the modal dialog
        methods.push({ method: BRAVO.ModalDialog.close });

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to upgrade the app
    this.upgrade = function () {
        // TO DO
    };

    // Method to validate the app
    // (Optional) panel - The validation panel.
    this.validate = function (panel) {
        var methods = [];

        // Show the modal dialog
        methods.push({ method: BRAVO.ModalDialog.showWaitScreen, args: [base.WAIT_SCREEN_MESSAGE_VALIDATION] });

        // Get the validation panel
        var panel = panel || document.querySelector("#app-validation-panel");
        if (panel) {
            // Initialize the panel
            methods.push({ method: panel_InitValidation, args: [panel] });

            // Validate the content types
            methods.push({ message: "Validating the content types...", method: exists_ContentTypes });

            // Validate the custom actions
            methods.push({ message: "Validating the custom actions...", method: exists_CustomActions });

            // Validate the fields
            methods.push({ message: "Validating the fields...", method: exists_Fields });

            // Validate the files
            methods.push({ message: "Validating the files...", method: exists_Files, args: [base.FILE_INFO[_activeWebType], base.FILE_LIST_NAME] });

            // Validate the master page gallery files
            methods.push({ message: "Validating the master page gallery files...", method: exists_Files, args: [base.MPG_INFO[_activeWebType], "Master Page Gallery"] });

            // Validate the lists
            methods.push({ message: "Validating the lists...", method: exists_Lists });

            // Render the validation results
            methods.push({ method: panel_RenderValidation, args: [panel] });

            // See if the validate event exists
            if (base.onValidate) {
                // Add the event
                methods.push({ message: "Validation Event", method: base.onValidate, args: [_activeSource, panel] });
            }
        }

        // Close the modal dialog
        methods.push({ method: BRAVO.ModalDialog.close });

        // Execute the methods
        return executeMethods(methods);
    };

    // **********************************************************************************
    // Private Methods
    // **********************************************************************************

    // Method to add the content types
    var add_ContentTypes = function () {
        var methods = [];

        // Set the active source to the root web, if it's set to the site
        var activeSource = _activeWebType == BRAVO.App.WebTypes.Site ? _source[BRAVO.App.WebTypes.RootWeb] : _activeSource;

        // Parse the content type information
        for (var i = 0; i < base.CONTENT_TYPE_INFO[_activeWebType].length; i++) {
            // Get the content type information
            var ctInfo = base.CONTENT_TYPE_INFO[_activeWebType][i];

            // Add the content type
            methods.push({ message: "Adding the " + ctInfo.Data.Name + " content type...", method: contentType_Create, args: [activeSource, ctInfo, activeSource] });

            // Update the content type
            methods.push({ message: "Updating the " + ctInfo.Data.Name + " content type...", method: contentType_UpdateFields, args: [activeSource, ctInfo, activeSource] });
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to add the custom actions
    // customActions - (Optional) The custom actions to add.
    var add_CustomActions = function (customActions) {
        var methods = [];
        var sequence = 1000;

        // Default the custom actions
        customActions = customActions || base.CUSTOM_ACTION_INFO[_activeWebType];

        // Parse the custom action information
        for (var i = 0; i < customActions.length; i++) {
            var caInfo = customActions[i];

            // Set the sequence
            caInfo.Sequence = caInfo.Sequence ? caInfo.Sequence : sequence;

            // Add the custom action
            methods.push({ message: "Add Custom Action: " + (caInfo.Name || caInfo.Title), method: customAction_Create, args: [_activeSource, caInfo] });

            // Increment the sequence
            sequence += 10;
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to add the fields
    var add_Fields = function () {
        var methods = [];

        // Set the active source to the root web, if it's set to the site
        var activeSource = _activeWebType == BRAVO.App.WebTypes.Site ? _source[BRAVO.App.WebTypes.RootWeb] : _activeSource;

        // Generate the methods to execute
        for (var i = 0; i < base.FIELD_INFO[_activeWebType].length; i++) {
            // Get the field information
            var fieldInfo = field_GetInfo(activeSource, base.FIELD_INFO[_activeWebType][i]);

            // Add the field
            methods.push({ message: "Updating the " + fieldInfo.Title + " site field...", method: field_Create, args: [activeSource, fieldInfo] });
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to add the files
    // files - The files to copy.
    // listName - The list name to copy the files to.
    var add_Files = function (files, listName) {
        var promise = new BRAVO.Core.Promise();

        // Set the active source to the root web, if it's set to the site
        var activeSource = _activeWebType == BRAVO.App.WebTypes.Site ? _source[BRAVO.App.WebTypes.RootWeb] : _activeSource;

        // Get the destination folder
        list_GetDestinationFolder(activeSource, listName, true).done(function (dstList, dstFolder) {
            var methods = [];

            // Ensure the folder and list exists
            if (dstList.exists && dstFolder.exists) {
                // Parse the files
                for (var i = 0; i < files.length; i++) {
                    // Set the file name
                    var fileName = files[i].Path.split("/");
                    fileName = fileName[fileName.length - 1];

                    // Copy the file
                    methods.push({ message: "Copying File: " + fileName, method: file_Copy, args: [files[i], dstFolder, dstList, activeSource] });
                }
            }

            // Execute the methods and resolve the promise
            executeMethods(methods).done(function () { promise.resolve(); });
        });

        // Return the promise
        return promise;
    };

    // Method to add the lists
    var add_Lists = function () {
        var methods = [];

        // Set the active source to the root web, if it's set to the site
        var activeSource = _activeWebType == BRAVO.App.WebTypes.Site ? _source[BRAVO.App.WebTypes.RootWeb] : _activeSource;

        // Generate the methods to execute
        for (var i = 0; i < base.LIST_INFO[_activeWebType].length; i++) {
            var listInfo = base.LIST_INFO[_activeWebType][i];

            // Add the list
            methods.push({ message: "Creating the " + listInfo.Data.Title + " list...", method: list_Create, args: [activeSource, listInfo] });

            // Update the list
            methods.push({ message: "Updating the " + listInfo.Data.Title + " list...", method: list_Update, args: [activeSource, listInfo] });
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to add a ribbon custom action
    var add_RibbonCustomActions = function () { return add_CustomActions(base.RIBBON_INFO[_activeWebType]); };

    // Method to hide a button
    // buttonType - The button type to hide.
    var buttons_Hide = function (buttonType) {
        var selector = null;

        // Set the selector
        switch (buttonType) {
            case BRAVO.App.ButtonTypes.Install:
                selector = ".app-buttons-install";
                break;
            case BRAVO.App.ButtonTypes.Refresh:
                selector = ".app-icons-refresh";
                break;
            case BRAVO.App.ButtonTypes.Uninstall:
                selector = ".app-buttons-uninstall";
                break;
            case BRAVO.App.ButtonTypes.Upgrade:
                selector = ".app-icons-upgrade";
                break;
            case BRAVO.App.ButtonTypes.Validate:
                selector = ".app-icons-validate";
                break;
        }

        // Ensure the selector exists
        if (selector) {
            // Get the button
            var button = _appPanel.querySelector(selector);
            if (button) {
                // Hide the button
                button.style.display = "none";
            }
        }
    };

    // Method to load the buttons
    var buttons_Load = function () {
        var promise = new BRAVO.Core.Promise();

        // Hide all the buttons by default
        for (var key in BRAVO.App.ButtonTypes) { buttons_Hide(BRAVO.App.ButtonTypes[key]); }

        // Ensure an active source exists
        if (_activeSource && _activeSource.exists) {
            // Ensure the user has access
            if (hasAccess()) {
                // See an install is required
                installRequired().done(function () {
                    // See if the app is already installed
                    if (_installFl) {
                        // Show the uninstall button
                        buttons_Show(BRAVO.App.ButtonTypes.Uninstall);

                        // See if we are showing the refresh button
                        if (base.REFRESH_BUTTON_VISIBLE) {
                            // Set the refresh message
                            setElementText(".app-refresh-message", base.REFRESH_BUTTON_MESSAGE)

                            // Show the refresh button
                            buttons_Show(BRAVO.App.ButtonTypes.Refresh);
                        }
                    }
                    else {
                        // Show the install button
                        buttons_Show(BRAVO.App.ButtonTypes.Install);
                    }

                    // See if we are showing the validation panel
                    if (base.VALIDATE_PANEL_VISIBLE) {
                        // Show the validation panel
                        buttons_Show(BRAVO.App.ButtonTypes.Validate);
                    }

                    // Determine if an upgrade is available
                    // TO DO

                    // Resolve the promise
                    promise.resolve();
                });
            }
            else {
                // Resolve the promise
                promise.resolve();
            }
        }

        // Return the promise
        return promise;
    };

    // Method to show a button
    // buttonType - The button type to show.
    var buttons_Show = function (buttonType) {
        var selector = null;

        // Set the selector
        switch (buttonType) {
            case BRAVO.App.ButtonTypes.Install:
                selector = ".app-buttons-install";
                break;
            case BRAVO.App.ButtonTypes.Refresh:
                selector = ".app-icons-refresh";
                break;
            case BRAVO.App.ButtonTypes.Uninstall:
                selector = ".app-buttons-uninstall";
                break;
            case BRAVO.App.ButtonTypes.Upgrade:
                selector = ".app-icons-upgrade";
                break;
            case BRAVO.App.ButtonTypes.Validate:
                selector = ".app-icons-validate";
                break;
        }

        // Ensure the selector exists
        if (selector) {
            // Get the button
            var button = _appPanel.querySelector(selector);
            if (button) {
                // Show the button
                button.style.display = "";
            }
        }
    };

    // Method to clear the cache
    var cache_Clear = function () {
        // Clear the cache
        _cachedFolders = [];
        _cachedLists = [];
    };

    // Method to add the content type field links
    // web - The web containing the source.
    // parent - The parent object of the content type.
    // ct - The content type.
    // ctInfo - The content type information.
    var contentType_AddFields = function (web, parent, ct, ctInfo) {
        var promise = new BRAVO.Core.Promise();

        // Note - There is a bug in the REST api. Until it's fixed, we have to write JSOM
        //        code to update the field links.

        // Get the source
        var context = SP.ClientContext.get_current();
        var src = context.get_site().openWebById(web.Id);

        // See if the parent is a list
        if (parent.type == "SP.List") {
            // Set the source to the list
            src = src.get_lists().getByTitle(parent.Title);
        }

        // Get the content type
        var contentType = src.get_contentTypes().getById(ct.Id.StringValue);

        // Load the objects
        context.load(src);
        context.load(contentType);

        // Parse the field links
        for (var i = 0; i < ctInfo.FieldRefs.length; i++) {
            // Create the field link
            var fl = new SP.FieldLinkCreationInformation();
            fl.set_field(src.get_fields().getByInternalNameOrTitle(ctInfo.FieldRefs[i]));

            // Add the field link
            contentType.get_fieldLinks().add(fl);
        }

        // Update the content type
        contentType.update(parent.type == "SP.List" ? null : true);

        // Execute the request
        context.executeQueryAsync(
            // Success
            function () { promise.resolve(); },
            // Error
            function () {
                // Log the error
                // TO DO

                // Resolve the promise
                promise.resolve();
            }
        );

        // Return the promise
        return promise;
    }

    // Method to clear the content type.
    // web - The web containing the source.
    // parent - The parent object of the content type.
    // ct - The content type.
    // ctInfo - The content type information.
    var contentType_Clear = function (web, parent, ct, ctInfo) {
        var promise = new BRAVO.Core.Promise();

        // Note - There is a bug in the REST api. Until it's fixed, we have to write JSOM
        //        code to update the field links.

        // Ensure field links are defined for this content type
        if (ctInfo.FieldRefs == null) { return; }

        // Get the source
        var context = SP.ClientContext.get_current();
        var src = context.get_site().openWebById(web.Id);

        // See if the parent is a list
        if (parent.type == "SP.List") {
            // Set the source to the list
            src = src.get_lists().getByTitle(parent.Title);
        }

        // Get the content type
        var contentType = src.get_contentTypes().getById(ct.Id.StringValue);
        context.load(contentType);

        // Load the field links
        var ctFieldLinks = contentType.get_fieldLinks();
        context.load(ctFieldLinks);

        // Execute the request
        context.executeQueryAsync(
            // Success
            function () {
                var fieldLinks = [];

                // Populate the field links array
                var enumerator = ctFieldLinks.getEnumerator();
                while (enumerator.moveNext()) {
                    // Save a reference to the field link
                    fieldLinks.push(enumerator.get_current());
                }

                // Parse the field links
                for (var i = 0; i < fieldLinks.length; i++) {
                    // Delete the field link
                    fieldLinks[i].deleteObject();
                }

                // Update the content type
                contentType.update();

                // Execute the request
                context.executeQueryAsync(
                    // Success
                    function () { promise.resolve(); },
                    // Error
                    function () {
                        // Log the error
                        // TO DO

                        // Resolve the promise
                        promise.resolve();
                    }
                );
            },
            // Error
            function () {
                // Log the error
                // TO DO

                // Resolve the promise
                promise.resolve();
            }
        );

        // Return the promise
        return promise;
    };

    // Method to create a content type.
    // source - The source to create the content type in.
    // ctInfo - The content type information.
    // web - The web containing the source.
    var contentType_Create = function (source, ctInfo, web) {
        var promise = new BRAVO.Core.Promise();

        // Get the content type
        contentType_Get(source, ctInfo).done(function (ct) {
            // See if the content type exists
            if (ct && ct.exists) {
                // Resolve the promise
                promise.resolve(ct);
            }
            else {
                // Find the content type
                contentType_Get(web, ctInfo).done(function (ct) {
                    // See if the content type exists
                    if (ct && ct.exists) {
                        // Add the content type
                        source.addExistingContentType({ contentTypeId: ct.Id.StringValue }).done(function (ct) {
                            // Resolve the promise
                            promise.resolve(ct);
                        });
                    }
                    else {
                        // Add the content type
                        source.addContentType(ctInfo.Data).done(function (ct) {
                            // Resolve the promise
                            promise.resolve(ct);
                        });
                    }
                });
            }
        });

        // Return a promise
        return promise
    };

    // Method to recursively look for a content type.
    // source - The source to find the content type in.
    // ctInfo - The content type information.
    var contentType_Get = function (source, ctInfo) {
        var promise = new BRAVO.Core.Promise();

        // Ensure the source exists
        if (source.exists) {
            // Get the content type
            source.getContentType(ctInfo.Data.Name).done(function (ct) {
                // See if the content type exists
                if (ct.exists) {
                    // Resolve the promise
                    promise.resolve(ct);
                }
                else {
                    // See if we can search the parent web
                    if (source.get_ParentWeb) {
                        // Search the parent web for the content type
                        contentType_Get(source.get_ParentWeb(), ctInfo).done(function (ct) {
                            // Resolve the promise
                            promise.resolve(ct);
                        });
                    }
                    else {
                        // Resolve the promise
                        promise.resolve(ct);
                    }
                }
            });
        }
        else {
            // Resolve the promise
            promise.resolve();
        }

        // Return the promise
        return promise;
    };

    // Method to update the content type field links
    // source - The source containing the content type.
    // ctInfo - The content type information.
    // web - The web containing the source.
    var contentType_UpdateFields = function (source, ctInfo, web) {
        var promise = new BRAVO.Core.Promise();

        // Get the content type
        contentType_Get(source, ctInfo).done(function (ct) {
            var methods = [];

            // See if the content type exists
            if (ct && ct.exists) {
                // See if the JS Link property is defined
                if (ctInfo.Data.JSLink) {
                    // Check if this field exists
                    methods.push({
                        message: "Updating the JS Link property", method: function (ct, ctInfo) {
                            var promise = new BRAVO.Core.Promise();

                            // Set the JS Link
                            ct.setProperty("JSLink", ctInfo.Data.JSLink).done(function () {
                                // Resolve the promise
                                promise.resolve();
                            });

                            // Return the promise
                            return promise;
                        },
                        args: [ct, ctInfo]
                    });
                }

                // See if we are updating the field links
                if (ctInfo.FieldRefs) {
                    // Clear the field links
                    methods.push({ message: "Clearing the field links", method: contentType_Clear, args: [web, source, ct, ctInfo] });

                    // Add the field links
                    methods.push({ message: "Adding the field links", method: contentType_AddFields, args: [web, source, ct, ctInfo] });
                }
            }

            // Execute the methods
            executeMethods(methods).done(function () {
                // Resolve the promise
                promise.resolve();
            });
        });

        // Return the promise
        return promise;
    };

    // Method to create a custom action.
    // source - The source to create the custom action in.
    // ctInfo - The custom action information.
    var customAction_Create = function (source, caInfo) {
        var promise = new BRAVO.Core.Promise();

        // Get the custom action
        customAction_Get(source, caInfo).done(function (ca) {
            // See if the custom action exists
            if (ca.exists) {
                // Resolve the promise
                promise.resolve(ca);
            }
            else {
                // Set the custom action properties
                var caProperties = {
                    Description: caInfo.Description,
                    Location: caInfo.Location ? caInfo.Location : "ScriptLink",
                    Name: caInfo.Name,
                    Sequence: caInfo.Sequence ? caInfo.Sequence : sequenceNumber,
                    Title: caInfo.Title
                };

                // See if the script block is set
                if (caInfo.ScriptBlock) { caProperties.ScriptBlock = caInfo.ScriptBlock; }

                // See if we are security trimming the custom action
                if (caInfo.Rights) { caProperties.Rights = caInfo.Rights }

                // Determine the url to the file
                var fileUrl = caInfo.FileUrl ? caInfo.FileUrl.replace(/~appurl/gi, _spPageContextInfo.webAbsoluteUrl) : "";

                // See if this is a script
                if (caInfo.IsScript) {
                    if (caInfo.UseScriptBlock) {
                        // Convert the wild card values
                        fileUrl = caInfo.FileUrl ? caInfo.FileUrl.replace(/~sitecollection/gi, _spPageContextInfo.siteAbsoluteUrl) : "";
                        fileUrl = caInfo.FileUrl ? caInfo.FileUrl.replace(/~site/gi, _spPageContextInfo.siteAbsoluteUrl + source.ServerRelativeUrl) : "";

                        // Set the script block
                        caProperties.ScriptBlock = "var script = document.createElement('script'); " +
                            "script.src = '" + fileUrl + "'; " +
                            "script.type = 'text/javascript'; " +
                            "document.head.appendChild(script);";
                    } else {
                        // Set the script source
                        caProperties.ScriptSrc = fileUrl;
                    }

                    // See if the name space exists
                    if (caInfo.Namespace) {
                        // Set the MDS script
                        mdsScript = "Type.registerNamespace('" + caInfo.Namespace + "'); " +
                            "(function $_global_mds_" + caInfo.Namespace + "() { " +
                            caInfo.Namespace + "._mdsInitFl = true; " +
                            "console.log('[" + caInfo.Namespace + "] Namespace registered.'); " +
                            "})();";
                    }
                } else {
                    // See if the Url property is set
                    if (caInfo.Url) {
                        // Set the url
                        caProperties.Url = caInfo.Url;
                    }

                    // See if we are adding a css file
                    if (typeof caInfo.IsScript != "undefined") {
                        // Set the script block to reference the css file
                        caProperties.ScriptBlock = "var link = document.createElement('link'); " +
                            "link.href = '" + fileUrl + "'; " +
                            "link.rel = 'stylesheet'; " +
                            "link.type = 'text/css'; " +
                            "document.head.appendChild(link);";
                    }
                }

                // Add the custom action and resolve the promise
                source.addCustomAction(caProperties).done(function (ca) { promise.resolve(ca); });
            }
        });

        // Return the promise
        return promise;
    };

    // Method to get a custom action.
    // source - The source to create the custom action in.
    // ctInfo - The custom action information.
    var customAction_Get = function (source, caInfo) {
        var promise = new BRAVO.Core.Promise();

        // Get the custom action
        source.getCustomAction(caInfo.Name).done(function (ca) {
            // Resolve the promise
            promise.resolve(ca);
        });

        // Return the promise
        return promise;
    };

    // Execute Methods
    // methods - Methods to execute.
    var executeMethods = function (methods) {
        var busy = false;
        var methodIdx = 0;
        var promise = new BRAVO.Core.Promise();
        var resolveReturnValue = null;

        // Loop until the methods are executed
        var intervalId = window.setInterval(function () {
            // Ensure we are not busy
            if (busy) {
                return;
            }

            // Execute the method
            if (methodIdx < methods.length) {
                var methodInfo = methods[methodIdx++];

                // Ensure the method exists
                if (methodInfo.method == null) {
                    return;
                }

                // Set the flag
                busy = true;

                // Update the wait screen
                var oldDialogInfo = BRAVO.ModalDialog.updateWaitScreen(methodInfo.title, methodInfo.message);
                window.setTimeout(function () {

                    // Execute the method
                    var returnVal = methodInfo.method.apply(this, methodInfo.args);

                    // See if the return val is a promise
                    if (returnVal && returnVal.done) {
                        returnVal.done(function () {
                            // Update the wait screen
                            BRAVO.ModalDialog.updateWaitScreen(oldDialogInfo.title, oldDialogInfo.message);

                            // Save the arguments
                            if (arguments && arguments.length > 0) {
                                // Default the value
                                resolveReturnValue = [];

                                // Parse the arguments
                                for (var i = 0; i < arguments.length; i++) {
                                    // Append the value
                                    resolveReturnValue.push(arguments[i]);
                                }
                            }

                            // Reset the flag
                            busy = false;
                        });
                    } else {
                        // Update the wait screen
                        BRAVO.ModalDialog.updateWaitScreen(oldDialogInfo.title, oldDialogInfo.message);

                        // Reset the flag
                        busy = false;
                    }
                }, 1);
            } else {
                // Clear the current interval
                window.clearInterval(intervalId);

                // Resolve the promise
                promise.resolve.apply(promise, resolveReturnValue);
            }
        }, 100);

        // Return a promise
        return promise;
    };

    // Method to determine if a content type exists.
    // source - The web containing the content type.
    // ctInfo - The content type information.
    // removeFl - Flag to remove the content type.
    // logCategory - The logging category associated w/ this content type.
    var exists_ContentType = function (source, ctInfo, removeFl, logCategory) {
        var promise = new BRAVO.Core.Promise();

        // Get the content type
        contentType_Get(source, ctInfo).done(function (ct) {
            // See if the content type exists
            if (ct && ct.exists) {
                // See if we are removing it
                if (removeFl) {
                    // Disable asynchronous requests
                    ct.asyncFl = false;

                    // Delete it
                    ct.deleteObject();
                } else {
                    // Add a validation message
                    _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Information, Message: "The content type '" + ctInfo.Data.Name + "' exists." });
                }
            }
            else {
                // Set the flag
                _existsFlags[logCategory] = false;

                // Add a validation message
                _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Error, Message: "The content type '" + ctInfo.Data.Name + "' does not exist." });
            }

            // Resolve the promise
            promise.resolve();
        });

        // Return the promise
        return promise;
    };

    // Method to determine if the content types exist
    // removeFl - Flag to remove the content types.
    // source - Optional source to validate.
    // contentTypes - Optional content type collection to validate.
    var exists_ContentTypes = function (removeFl, source, contentTypes) {
        var methods = [];

        // Determine the logging category
        var logCategory = contentTypes ? BRAVO.App.LogCategory.List : BRAVO.App.LogCategory.ContentType;

        // Add a validation message
        _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Debug, Message: "Validating the content types." });

        // Set the active source to the root web, if it's set to the site
        var activeSource = source ? source : _activeWebType == BRAVO.App.WebTypes.Site ? _source[BRAVO.App.WebTypes.RootWeb] : _activeSource;

        // Set the content types
        contentTypes = contentTypes || base.CONTENT_TYPE_INFO[_activeWebType];

        // Ensure content types exist
        if (contentTypes && contentTypes.length > 0) {
            // Parse the content type information
            for (var i = 0; i < contentTypes.length; i++) {
                var ctInfo = contentTypes[i];

                // Check if this content type exists
                methods.push({ message: "Content Type Validation: " + ctInfo.Data.Name, method: exists_ContentType, args: [activeSource, ctInfo, removeFl, logCategory] });
            }
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to determine if a custom action exists.
    // source - The web containing the custom action.
    // ctInfo - The custom action information.
    // removeFl - Flag to remove the custom action.
    // logCategory - The logging category associated w/ this custom action.
    var exists_CustomAction = function (source, caInfo, removeFl, logCategory) {
        var promise = new BRAVO.Core.Promise();

        // Get the custom action
        customAction_Get(source, caInfo).done(function (ca) {
            // See if the custom action exists
            if (ca.exists) {
                // See if we are removing it
                if (removeFl) {
                    // Disable asynchronous requests
                    ca.asyncFl = false;

                    // Delete it
                    ca.deleteObject();

                    // Resolve the promise
                    promise.resolve();
                }
                else {
                    // See if the file url attributes exist
                    var fileUrl = caInfo.FileUrl || caInfo.Url;

                    // Add a validation message
                    _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Information, Message: "The custom action '" + caInfo.Name + "' exists." });

                    // Ensure the app has been initialized for further validation
                    if (_initFl && fileUrl) {
                        // Validate the file
                        exists_FileByUrl(fileUrl, logCategory).done(function () {
                            // Resolve the promise
                            promise.resolve();
                        });
                    }
                    else {
                        // Resolve the promise
                        promise.resolve();
                    }
                }
            }
            else {
                // Set the flag
                _existsFlags[logCategory] = false;

                // Add a validation message
                _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Error, Message: "The custom action '" + caInfo.Name + "' does not exist." });

                // Resolve the promise
                promise.resolve();
            }
        });

        // Return the promise
        return promise;
    };

    // Method to determine if the custom actions exist
    // removeFl - Flag to remove the custom actions.
    var exists_CustomActions = function (removeFl) {
        var methods = [];

        // Determine the logging category
        var logCategory = BRAVO.App.LogCategory.CustomAction;

        // Add a validation message
        _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Debug, Message: "Validating the custom actions." });

        // Parse the custom actions
        for (var i = 0; i < base.CUSTOM_ACTION_INFO[_activeWebType].length; i++) {
            var caInfo = base.CUSTOM_ACTION_INFO[_activeWebType][i];

            // Check if this custom action exists
            methods.push({ message: "Custom Action Validation: " + caInfo.Name, method: exists_CustomAction, args: [_activeSource, caInfo, removeFl, logCategory] });
        }

        // Parse the ribbon custom actions
        for (var i = 0; i < base.RIBBON_INFO[_activeWebType].length; i++) {
            var caInfo = base.RIBBON_INFO[_activeWebType][i];

            // Check if this custom action exists
            methods.push({ message: "Ribbon Custom Action Validation: " + caInfo.Name, method: exists_CustomAction, args: [_activeSource, caInfo, removeFl, logCategory] });
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to determine if a field exists.
    // source - The web/list containing the field.
    // fieldInfo - The field information.
    // removeFl - Flag to remove the field.
    // logCategory - The logging category associated w/ this field.
    var exists_Field = function (source, fieldInfo, removeFl, logCategory) {
        var promise = new BRAVO.Core.Promise();

        // Get the field
        source.getFieldByInternalName(fieldInfo.Name).done(function (field) {
            // See if the field exists
            if (field.exists) {
                // See if we are removing it
                if (removeFl) {
                    // Disable aysnchronous requests
                    field.asyncFl = false;

                    // Delete it
                    field.deleteObject();
                }
                else {
                    // Add a validation message
                    _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Information, Message: "The field '" + fieldInfo.Title + "' exists." });
                }
            }
            else {
                // Set the flag
                _existsFlags[logCategory] = false;

                // Add a validation message
                _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Error, Message: "The field '" + fieldInfo.Title + "' does not exist." });
            }

            // Resolve the promise
            promise.resolve();
        });

        // Return the promise
        return promise;
    };

    // Method to determine if the content types exist
    // removeFl - Flag to remove the custom actions.
    // source - Optional source to validate.
    // fields - Optional field collection to validate.
    var exists_Fields = function (removeFl, source, fields) {
        var methods = [];

        // Determine the logging category
        var logCategory = fields ? BRAVO.App.LogCategory.List : BRAVO.App.LogCategory.Field;

        // Add a validation message
        _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Debug, Message: "Validating the fields." });

        // Set the active source to the root web, if it's set to the site
        var activeSource = source ? source : _activeWebType == BRAVO.App.WebTypes.Site ? _source[BRAVO.App.WebTypes.RootWeb] : _activeSource;

        // Set the fields
        fields = fields || base.FIELD_INFO[_activeWebType];

        // Ensure custom actions exist
        if (fields && fields.length > 0) {
            // Parse the fields
            for (var i = 0; i < fields.length; i++) {
                var fieldInfo = field_GetInfo(activeSource, fields[i]);

                // Check if this field exists
                methods.push({ message: "Field Validation: " + fieldInfo.Title, method: exists_Field, args: [activeSource, fieldInfo, removeFl, logCategory] });
            }
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to see if a file exists in a folder.
    // web - The web containing the file.
    // folder - The folder containing the files.
    // fileInfo - The file information.
    // removeFl - Flag to remove the field.
    // logCategory - The logging category associated w/ this field.
    var exists_File = function (web, folder, fileInfo, removeFl, logCategory) {
        var promise = new BRAVO.Core.Promise();

        // Set the file name
        var fileName = fileInfo.Path.split('/');
        fileName = fileName[fileName.length - 1];

        // Set the file url
        var fileUrl = (folder.ServerRelativeUrl + '/' + fileInfo.SubFolder + '/' + fileName).replace("//", "/");

        // Get the source file
        file_Get(web, fileUrl).done(function (file) {
            // See if the file exists
            if (file.exists) {
                // See if we are removing it
                if (removeFl) {
                    // Delete the file
                    file.deleteObject().done(function () {
                        // Set the folder url
                        var folderUrl = file.ServerRelativeUrl.split('/');
                        folderUrl = (file.ServerRelativeUrl.substr(0, file.ServerRelativeUrl.length - folderUrl[folderUrl.length - 1].length));

                        // Get the folder
                        folder_Get(web, folderUrl).done(function (folder) {
                            // Remove the empty folders
                            folder_RemoveEmpty(folder).done(function () {
                                // Resolve the promise
                                promise.resolve();
                            });
                        });
                    });
                }
                else {
                    // Add a validation message
                    _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Information, Message: "The file '" + fileName + "' exists." });

                    // Resolve the promise
                    promise.resolve();
                }
            }
            else {
                // Set the flag
                _existsFlags[logCategory] = false;

                // Add a validation message
                _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Error, Message: "The file '" + fileName + "' does not exist." });

                // Resolve the promise
                promise.resolve();
            }
        });

        // Return the promise
        return promise;
    };

    // Method to determine if a file exists
    // url - The url to the file.
    // logCategory - The logging category associated w/ this field.
    var exists_FileByUrl = function (url, logCategory) {
        var promise = new BRAVO.Core.Promise();

        // Determine the logging category
        var logCategory = logCategory || BRAVO.App.LogCategory.File;

        // Add a validation message
        _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Debug, Message: "Validating the file." });

        // Set the active source to the root web, if it's set to the site
        var web = _activeWebType == BRAVO.App.WebTypes.Site ? _source[BRAVO.App.WebTypes.RootWeb] : _activeSource;
        if (web.exists) {
            // Ensure the url is lower case
            url = url.toLowerCase();

            // See if we are referencing the site or site collection dynamically
            if (url.indexOf("~site") == 0) {
                // Update the url to be relative
                var idx = url.indexOf('/');
                url = (web.ServerRelativeUrl.length > 1 ? web.ServerRelativeUrl : "") + url.substr(idx);
            }

            // Ensure the file exists
            web.getFileByServerRelativeUrl(url).done(function (file) {
                if (file.exists) {
                    // Add a validation message
                    _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Information, Message: "File exists at: " + url });
                } else {
                    // Set the flag
                    _existsFlags[logCategory] = false;

                    // Add a validation message
                    _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Error, Message: "File not found at: " + url });
                }

                // Resolve the promise
                promise.resolve();
            });
        }
        else {
            // Set the flag
            _existsFlags[logCategory] = false;

            // Add a validation message
            _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Error, Message: "Unable to determine the source web to search for the file at: " + url });
        }

        // Return the promise
        return promise;
    };

    // Method to determine if the files exist
    // files - The files to ensure exist.
    // listName - The list name containing the files.
    // removeFl - Flag to remove the lists.
    var exists_Files = function (files, listName, removeFl) {
        var promise = new BRAVO.Core.Promise();

        // Determine the logging category
        var logCategory = BRAVO.App.LogCategory.File;

        // Add a validation message
        _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Debug, Message: "Validating the files." });

        // Set the active source to the root web, if it's set to the site
        var activeSource = _activeWebType == BRAVO.App.WebTypes.Site ? _source[BRAVO.App.WebTypes.RootWeb] : _activeSource;

        // Ensure files exist
        if (files == null || files.length == 0) {
            // Resolve the promise
            promise.resolve();
        }
        else {
            // Get the destination folder
            list_GetDestinationFolder(activeSource, listName).done(function (dstList, dstFolder) {
                var methods = [];

                // Ensure the destination folder exists
                if (dstFolder.exists) {
                    // Parse the files
                    for (var i = 0; i < files.length; i++) {
                        var fileInfo = files[i];

                        // Check if this file exists
                        methods.push({ message: "File Validation:" + fileInfo.Path, method: exists_File, args: [activeSource, dstFolder, fileInfo, removeFl, logCategory] });
                    }

                    // Execute the methods and resolve the promise
                    executeMethods(methods).done(function () { promise.resolve(); });
                }
                else {
                    // Set the flag
                    _existsFlags[logCategory] = false;

                    // Add a validation message
                    _validationResults.push({
                        Category: logCategory, Type: BRAVO.App.ValidationType.Error, Message: "The destination list '" +
                            dstList.Title + "' sub-folder '" + base.FILE_SUBFOLDER_NAME + "' does not exist."
                    });

                    // Resolve the promise
                    promise.resolve();
                }
            });
        }

        // Return the promise
        return promise;
    };

    // Method to determine if a list exists.
    // source - The web containing the list.
    // listInfo - The list information.
    // removeFl - Flag to remove the list.
    // logCategory - The logging category associated w/ this list.
    var exists_List = function (source, listInfo, removeFl, logCategory) {
        var promise = new BRAVO.Core.Promise();

        // Get the list
        source.getListByTitle(listInfo.Data.Title).done(function (list) {
            // See if the list exists
            if (list.exists) {
                // See if we are removing it
                if (removeFl) {
                    // Disable asynchronous requests
                    list.asyncFl = false;

                    // Delete it
                    list.deleteObject();

                    // Resolve the promise
                    promise.resolve();
                }
                else {
                    // Add a validation message
                    _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Information, Message: "The list '" + listInfo.Data.Title + "' exists." });

                    // Ensure the app has been initialized for further validation
                    if (_initFl) {
                        // Validate the content types
                        exists_ContentTypes(false, list, listInfo.ContentTypes).done(function () {
                            // Validate the fields
                            exists_Fields(false, list, listInfo.Fields).done(function () {
                                // Validate the views
                                exists_Views(list, listInfo.Views).done(function () {
                                    // Resolve the promise
                                    promise.resolve();
                                })
                            });
                        });
                    }
                    else {
                        // Resolve the promise
                        promise.resolve();
                    }
                }
            }
            else {
                // Set the flag
                _existsFlags[logCategory] = false;

                // Add a validation message
                _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Error, Message: "The list '" + listInfo.Data.Title + "' does not exist." });

                // Resolve the promise
                promise.resolve();
            }
        });

        // Return the promise
        return promise;
    };

    // Method to determine if the lists exist
    // removeFl - Flag to remove the lists.
    var exists_Lists = function (removeFl) {
        var methods = [];

        // Determine the logging category
        var logCategory = BRAVO.App.LogCategory.List;

        // Add a validation message
        _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Debug, Message: "Validating the lists." });

        // Set the active source to the root web, if it's set to the site
        var activeSource = _activeWebType == BRAVO.App.WebTypes.Site ? _source[BRAVO.App.WebTypes.RootWeb] : _activeSource;

        // Ensure lists exist
        if (base.LIST_INFO[_activeWebType].length > 0) {
            // Parse the list information
            for (var i = 0; i < base.LIST_INFO[_activeWebType].length; i++) {
                var listInfo = base.LIST_INFO[_activeWebType][i];

                // Check if this list exists
                methods.push({ message: "List Validation: " + listInfo.Data.Title, method: exists_List, args: [activeSource, listInfo, removeFl, logCategory] });
            }
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to determine if a view exists.
    // list - The list containing the view.
    // viewInfo - The view information.
    // removeFl - Flag to remove the view.
    // logCategory - The logging category associated w/ this view.
    var exists_View = function (list, viewInfo, logCategory) {
        var promise = new BRAVO.Core.Promise();

        // Get the view
        list.getViewByTitle(viewInfo.Data.Title).done(function (view) {
            if (!view.exists) {
                // Set the flag
                _existsFlags[logCategory] = false;

                // Add a validation message
                _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Error, Message: "The list view '" + viewInfo.Data.Title + "' does not exist." });
            } else {
                // Add a validation message
                _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Information, Message: "The list view '" + viewInfo.Data.Title + "' exists." });
            }

            // Resolve the promise
            promise.resolve();
        });

        // Return the promise
        return promise;
    };

    // Method to determine if the list views exist
    // list - The list containing the view.
    // views - The view collection to validate.
    var exists_Views = function (list, views) {
        var methods = [];

        // Determine the logging category
        var logCategory = BRAVO.App.LogCategory.View;

        // Add a validation message
        _validationResults.push({ Category: logCategory, Type: BRAVO.App.ValidationType.Debug, Message: "Validating the views." });

        // Ensure views exist
        if (views && views.length > 0) {
            // Parse the views
            for (var i = 0; i < views.length; i++) {
                var viewInfo = views[i];

                // Check if this list exists
                methods.push({ message: "List View Validation: " + viewInfo.Data.Title, method: exists_View, args: [list, viewInfo, logCategory] });
            }
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to create a field
    // source - The source to create the field in.
    // fieldInfo - The field information.
    var field_Create = function (source, fieldInfo) {
        var promise = new BRAVO.Core.Promise();

        // Get the field
        source.getFieldByInternalName(fieldInfo.Name).done(function (field) {
            // See if the field doesn't exist
            if (!field.exists) {
                // Add the field
                source.addFieldAsXml(fieldInfo.SchemaXml).done(function () {
                    // Resolve the promise
                    promise.resolve();
                });
            }
            else {
                // Resolve the promise
                promise.resolve();
            }
        });

        // Return the promise
        return promise;
    };

    // Method to create the field information object
    // web - The web containing the field.
    // fieldXml - The field schema xml.
    var field_GetInfo = function (web, fieldXml) {
        // Set the field information
        var fieldInfo = document.createElement("field");
        fieldInfo.innerHTML = fieldXml;
        fieldInfo = fieldInfo.querySelector("field");

        // See if this is a lookup field
        var fieldType = fieldInfo.getAttribute("Type");
        if (fieldType == "Lookup" || fieldType == "LookupMulti") {
            var isAsync = web.asyncFl;

            // Execute synchronously
            web.asyncFl = false;

            // Get the list
            var lookupList = web.getList(web.ServerRelativeUrl + "/" + fieldInfo.getAttribute("List"));
            if (lookupList.exists && lookupList.Id) {
                var startIdx = fieldXml.toLowerCase().indexOf("list=");
                var endIdx = fieldXml.indexOf(" ", startIdx);

                // Replace the List property
                fieldXml = fieldXml.substr(0, startIdx) + "List=\"" + lookupList.Id + "\"" + fieldXml.substr(endIdx);
            }

            // Revert the asynchronous flag
            web.asyncFl = isAsync;
        }

        // Return the field info
        return { Info: fieldInfo, Name: fieldInfo.getAttribute("Name"), SchemaXml: fieldXml, Title: fieldInfo.getAttribute("DisplayName") };
    };

    // Method to check-in, publish and approve the file
    // list - The list containing the file.
    // file - The file to check-in.
    var file_CheckIn = function (list, file) {
        var methods = [];

        // Ensure the file exists
        if (file.exists) {
            // Determine the flags
            var approvalRequiredFl = list.EnableModeration;
            var checkInRequiredFl = file.CheckOutType != SP.CheckOutType.none || list.ForceCheckout;
            var publishRequiredFl = list.EnableMinorVersions;

            // See if a check-in is required
            if (checkInRequiredFl) {
                // Check-in the file
                methods.push({ method: function (file) { file.checkIn({ comment: "", checkInType: publishRequiredFl ? SP.CheckinType.minorCheckIn : SP.CheckinType.majorCheckIn }); }, args: [file] });
            }

            // See if publishing is required
            if (publishRequiredFl) {
                // Publish the file
                methods.push({ method: function (file) { file.publish({ comment: "" }); }, args: [file] });
            }

            // See if approval is required
            if (approvalRequiredFl) {
                // Approve the file
                methods.push({ method: function (file) { file.approve({ comment: "" }); }, args: [file] });
            }
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to check-out a file
    // file - The file to check-out.
    var file_CheckOut = function (file) {
        var methods = [];

        // Ensure the file exists
        if (file.exists) {
            // See if the file needs to be checked-out
            if (file.CheckOutType != SP.CheckOutType.online) {
                // Check-out the file
                methods.push({ method: function (file) { file.checkOut(); }, args: [file] });
            }
        }

        // Execute the methods
        return executeMethods(methods);
    };

    // Method to copy a file.
    // fileInfo - The file information.
    // dstFolder - The folder to copy the file to.
    // dstList - The list containing the file.
    // dstWeb - The web containing the file.
    var file_Copy = function (fileInfo, dstFolder, dstList, dstWeb) {
        var promise = new BRAVO.Core.Promise();

        // TO DO
        // Add a file cache and rewrite similar to folder methods

        // Get the destination folder
        folder_Get(dstWeb, dstFolder.ServerRelativeUrl + '/' + fileInfo.SubFolder, true).done(function (dstFolder) {
            // Ensure the destination folder exists
            if (dstFolder.exists) {
                var currentWeb = base.getSourceByType(BRAVO.App.WebTypes.App);

                // Get the source file
                file_Get(currentWeb, currentWeb.ServerRelativeUrl + fileInfo.Path, true).done(function (srcFile, content) {
                    // Ensure the file and content exist
                    if (srcFile.exists && content) {
                        // Get the destination file
                        dstFolder.getFile(srcFile.Name).done(function (dstFile) {
                            // Check-out the file
                            file_CheckOut(dstFile).done(function () {
                                // Copy the file
                                dstFolder.addFile({ overwrite: true, url: srcFile.Name }, content).done(function (dstFile) {
                                    // Check for error
                                    if (dstFile.error) {
                                        // Log the error
                                        // TO DO

                                        // Resolve the promise
                                        promise.resolve();
                                    }
                                    else {
                                        // Method to check in the file
                                        var checkInFile = function () {
                                            // See if the file copied event exists
                                            if (base.onFile_Copied) {
                                                base.onFile_Copied(dstFile, dstFolder, dstList, dstWeb);
                                            }

                                            // Check in the file and resolve the promise
                                            file_CheckIn(dstList, dstFile).done(function () { promise.resolve(); });
                                        };

                                        // See if this is the master page gallery
                                        if (dstList.Title == "Master Page Gallery") {
                                            // Update the file properties
                                            file_UpdateProperties(dstFile, fileInfo).done(function () {
                                                // Check-in the file
                                                checkInFile();
                                            });
                                        } else {
                                            // Check-in the file
                                            checkInFile();
                                        }
                                    }
                                });
                            });
                        });
                    }
                    else {
                        // Log the error
                        // TO DO

                        // Resolve the promise
                        promise.resolve();
                    }
                });
            }
            else {
                // Log the error
                // TO DO

                // Resolve the promise
                promise.resolve();
            }
        });

        // Return a promise
        return promise;
    };

    // Method to get a file.
    // web - The web containing the file.
    // fileUrl - The server relative url of the file.
    // contentFl - Flag to indicate to return the content of the file.
    var file_Get = function (web, fileUrl, contentFl) {
        var promise = new BRAVO.Core.Promise();

        // Get the file
        web.getFileByServerRelativeUrl(fileUrl).done(function (file) {
            // See if we are returning the file content
            if (file.exists && contentFl) {
                // Get the file content
                file.openBinaryStream().done(function (file, content) {
                    // Resolve the promise
                    promise.resolve(file, content);
                });
            }
            else {
                // Resolve the promise
                promise.resolve(file);
            }
        });

        // Return the promise
        return promise;
    };

    // Method to update the item properties of the file
    // file - The file to update.
    // fileInfo - The file information.
    var file_UpdateProperties = function (file, fileInfo) {
        var promise = new BRAVO.Core.Promise();

        // Get the list item for this file
        var item = file.get_ListItemAllFields();
        if (item.exists) {
            var properties = {};
            var associatedContentType = null;

            // Default the properties
            properties.Title = file.Name;

            // Default the properties based on the type
            switch (fileInfo.Type) {
                case BRAVO.App.MPGTypes.DisplayTemplateControl:
                    properties.ContentTypeId = "0x0101002039C03B61C64EC4A04F5361F385106601";
                    break;
                case BRAVO.App.MPGTypes.DisplayTemplateItem:
                    properties.ContentTypeId = "0x0101002039C03B61C64EC4A04F5361F385106603";
                    break;
                case BRAVO.App.MPGTypes.MasterPage:
                    properties.ContentTypeId = "0x01010500A8B69F8A072C384090BB2F363986E5EA";
                    properties.UIVersion = {
                        _metadata: { type: "Collection(Edm.String)" }, results: ["15"]
                    };
                    break;
                case BRAVO.App.MPGTypes.PageLayout:
                    properties.ContentTypeId = "0x01010007FF3E057FA8AB4AA42FCB67B453FFC100E214EEE741181F4E9F7ACC43278EE811";
                    properties.UIVersion = {
                        _metadata: { type: "Collection(Edm.String)" }, results: ["15"]
                    };
                    associatedContentType = ";#Article Page;#0x010100C568DB52D9D0A14D9B2FDCC96666E9F2007948130EC3DB064584E219954237AF3900242457EFB8B24247815D688C526CD44D;#";
                    break;
            }

            // See if custom properties exist
            if (fileInfo.Properties) {
                // Parse the custom properties
                for (var key in fileInfo.Properties) {
                    // Update the properties
                    switch (key) {
                        case "PublishingAssociatedContentType":
                            associatedContentType = fileInfo.Properties[key];
                            break;
                        case "UIVersion":
                            properties[key] = {
                                _metadata: { type: "Collection(Edm.String)" }, results: fileInfo.Properties[key].length ? fileInfo.Properties[key] : [fileInfo.Properties[key]]
                            };
                            break;
                        default:
                            properties[key] = fileInfo.Properties[key];
                            break;
                    }
                }
            }

            // Update the item
            var result = item.update(properties);

            // See if the associate content type exists
            if (associatedContentType) {
                // Load the item
                var context = SP.ClientContext.get_current();
                var web = context.get_site().get_rootWeb();
                var list = web.get_lists().getByTitle("Master Page Gallery");
                item = list.getItemById(item.Id);
                context.load(item);

                // Execute the request
                context.executeQueryAsync(
                    // Success
                    function () {
                        // Update the associated content type
                        item.set_item("PublishingAssociatedContentType", associatedContentType);
                        item.update();

                        // Execute the request and resolve the promise
                        context.executeQueryAsync(function () { promise.resolve(); }, function () { promise.resolve(); });
                    },
                    // Error
                    function () {
                        // Resolve the promise
                        promise.resolve();
                    }
                );
            }
            else {
                // Resolve the promise
                promise.resolve();
            }
        }
        else {
            // Resolve the promise
            promise.resolve();
        }

        // Return a promise
        return promise;
    };

    // Method to create a folder
    // web - The web containing the folder.
    // parentFolderUrl - The parent folder url.
    // folderName - The folder name to create.
    // logCategory - The logging category associated w/ this view.
    var folder_Create = function (web, parentFolderUrl, folderName) {
        var promise = new BRAVO.Core.Promise();

        // Get the parent folder
        folder_Get(web, parentFolderUrl).done(function (parentFolder) {
            // Ensure the folder exists
            if (parentFolder.exists) {
                // Create the folder
                parentFolder.addSubFolder(folderName).done(function (folder) {
                    // Resolve the promise
                    promise.resolve(folder);
                });
            }
        });

        // Return the promise
        return promise;
    }

    // Method to get a folder
    // web - The web containing the folder.
    // relativeUrl - The relative url of the folder.
    // createFl - Flag to create the folder, if it doesn't exist
    // logCategory - The logging category associated w/ this view.
    var folder_Get = function (web, relativeUrl, createFl) {
        var promise = new BRAVO.Core.Promise();

        // Determine the folder url
        relativeUrl = relativeUrl.toLowerCase();
        var webUrl = web.ServerRelativeUrl.toLowerCase();
        var folderUrl = ((relativeUrl.indexOf(webUrl) == 0 ? "" : webUrl + '/') + relativeUrl).toLowerCase().replace("//", "/");

        // See if we have already queried for this folder
        if (_cachedFolders[folderUrl]) {
            // Resolve the promise
            promise.resolve(_cachedFolders[folderUrl]);
        }
        else {
            // Get the folder
            web.getFolderByServerRelativeUrl(folderUrl).done(function (folder) {
                // Method to save a reference for the folder
                var cacheFolder = function (folder) {
                    // Ensure the folder exists
                    if (folder.exists) {
                        // Add the folder to the array
                        _cachedFolders[folderUrl] = folder;
                    }

                    // Resolve the promise
                    promise.resolve(folder);
                };

                // See if the folder does not exists and we are creating it
                if (!folder.exists && createFl) {
                    // Get the root folder
                    web.get_RootFolder().done(function (rootFolder) {
                        var methods = [];
                        var dstFolderPath = "";

                        // Parse the folder heirarchy
                        var folderNames = folderUrl.substr(web.ServerRelativeUrl.length).split('/');
                        for (var i = 0; i < folderNames.length; i++) {
                            // Ensure the folder name exists
                            if (folderNames[i].length > 0) {
                                // Create the folder
                                methods.push({ method: folder_Create, args: [web, rootFolder.ServerRelativeUrl + dstFolderPath, folderNames[i]] });

                                // Update the destination folder path
                                dstFolderPath += '/' + folderNames[i];
                            }
                        }

                        // Execute the methods
                        executeMethods(methods).done(function (folder) {
                            // Resolve the promise
                            promise.resolve(folder);
                        });
                    });
                }
                else {
                    // Cache the folder
                    cacheFolder(folder);
                }
            });
        }

        // Return the promise
        return promise;
    }

    // Method to remove empty folders
    // folder - The folder to search.
    var folder_RemoveEmpty = function (folder) {
        var promise = new BRAVO.Core.Promise();

        // Ensure the folder exists
        if (folder.exists) {
            // Refresh the folder
            folder.refresh().done(function (folder) {
                // See if this folder is empty
                if (folder.ItemCount == 0) {
                    // Delete the folder
                    folder.deleteObject();

                    // Get the parent folder
                    folder.get_ParentFolder().done(function (parentFolder) {
                        // Check the parent folder
                        folder_RemoveEmpty(parentFolder).done(function () {
                            // Resolve the promise
                            promise.resolve();
                        });
                    });
                }
                else {
                    // Resolve the promise
                    promise.resolve();
                }
            });
        }
        else {
            // Resolve the promise
            promise.resolve();
        }

        // Return the promise
        return promise;
    };

    // Method to determine if the user has owner access to the site
    var hasAccess = function () {
        // Ensure the user has full rights to the parent web
        if (_activeSource.hasAccess(base.BASE_PERMISSIONS)) {
            return true;
        }

        // Display the error message
        _appPanel.querySelector(".app-info-error").innerHTML = base.ERROR_MESSAGE_ACCESS_DENIED;

        // User does not have correct permissions
        return false;
    };

    // Method to initialize the source
    var initSource = function () {
        var hostUrl = BRAVO.Core.getQueryStringValue("SPHostUrl");
        var promise = new BRAVO.Core.Promise();

        // Clear the active source and web type
        _activeSource = null;
        _activeWebType = null;

        // Initialize the global variables
        _source = [];
        for (var webType in BRAVO.App.WebTypes) {
            var webTypeValue = BRAVO.App.WebTypes[webType];

            // Default the source
            _source[webTypeValue] = null;

            // Default the global variables
            base.CONTENT_TYPE_INFO[webTypeValue] = base.CONTENT_TYPE_INFO[webTypeValue] || [];
            base.CUSTOM_ACTION_INFO[webTypeValue] = base.CUSTOM_ACTION_INFO[webTypeValue] || [];
            base.FIELD_INFO[webTypeValue] = base.FIELD_INFO[webTypeValue] || [];
            base.FILE_INFO[webTypeValue] = base.FILE_INFO[webTypeValue] || [];
            base.LIST_INFO[webTypeValue] = base.LIST_INFO[webTypeValue] || [];
            base.MPG_INFO[webTypeValue] = base.MPG_INFO[webTypeValue] || [];
            base.RIBBON_INFO[webTypeValue] = base.RIBBON_INFO[webTypeValue] || [];
        }

        // Create the app web
        (new BRAVO.Core.WebAsync()).done(function (appWeb) {
            // Set the app web
            _source[BRAVO.App.WebTypes.App] = appWeb;

            // Ensure the app web exists
            if (!appWeb.exists) {
                // Resolve the promise
                promise.resolve();
                return;
            }

            // See if we are not installing to a custom, host or root web
            if (!base.INSTALL_CUSTOM_WEB && !base.INSTALL_HOST_WEB && !base.INSTALL_SITE) {
                // Set the active source
                _activeWebType = BRAVO.App.WebTypes.App;
                _activeSource = _source[_activeWebType];

                // Resolve the promise
                promise.resolve();
                return;
            }

            // Create the host web
            (new BRAVO.Core.WebAsync(hostUrl)).done(function (hostWeb) {
                // Ensure the host web exists
                if (hostWeb.exists) {
                    // See if we are installing to a custom web
                    if (base.INSTALL_CUSTOM_WEB && hostWeb.Url.toLowerCase() == base.CUSTOM_WEB_URL.toLowerCase()) {
                        // Set the active source and web type
                        _activeWebType = BRAVO.App.WebTypes.Custom;
                        _source[_activeWebType] = hostWeb;
                        _activeSource = _source[_activeWebType];
                    }

                    // See if we are installing to the root web
                    if (base.INSTALL_SITE || base.INSTALL_ROOT_WEB) {
                        // Disable asynchronous requests
                        hostWeb.asyncFl = false;

                        // See if the host web is the root web
                        var isRootWeb = hostWeb.get_ParentWeb().ParentWeb == null;

                        // Enable asynchronous requests
                        hostWeb.asyncFl = true;

                        // See if the host web is the root web
                        if (isRootWeb) {
                            // Set the active source and web type
                            _activeWebType = BRAVO.App.WebTypes.RootWeb;
                            _source[_activeWebType] = hostWeb;
                            _activeSource = _source[_activeWebType];
                        }
                    }

                    // See if we are installing to the host web
                    if (base.INSTALL_HOST_WEB && _activeSource == null) {
                        // Set the active source and web type
                        _activeWebType = BRAVO.App.WebTypes.Host;
                        _source[_activeWebType] = hostWeb;
                        _activeSource = hostWeb;
                    }
                }

                // Method to set the active source
                var setActiveSource = function () {
                    // Ensure the active source exists
                    if (_activeSource == null) {
                        // Determine the error message
                        var errorMessage = base.INSTALL_CUSTOM_WEB ? base.ERROR_MESSAGE_NOT_CUSTOM_WEB : "";
                        errorMessage = errorMessage == "" && base.INSTALL_SITE ? base.ERROR_MESSAGE_NOT_SITE : errorMessage;
                        errorMessage = errorMessage == "" ? "Unable to determine the active source." : errorMessage;

                        // Display the error message
                        _appPanel.querySelector(".app-info-error").innerHTML = base.ERROR_MESSAGE_NOT_CUSTOM_WEB;
                    }

                    // Resolve the promise
                    promise.resolve();
                };

                // See if we are installing to the site
                if (base.INSTALL_SITE) {
                    // Create the site
                    (new BRAVO.Core.SiteAsync(hostUrl)).done(function (site) {
                        // Ensure the site exists
                        if (site.exists) {
                            // Set the active source and web type
                            _activeWebType = BRAVO.App.WebTypes.Site;
                            _source[_activeWebType] = site;
                            _activeSource = _source[_activeWebType];
                        }

                        // Set the active source
                        setActiveSource();
                    });
                }
                else {
                    // Set the active source
                    setActiveSource();
                }
            });
        });

        // Return the promise
        return promise;
    };

    // Method to determine if an install is required
    var installRequired = function () {
        var installRequiredFl = true;
        var promise = new BRAVO.Core.Promise();

        // Parse the logging types
        for (var logType in BRAVO.App.LogCategory) {
            // Default the flag for this category
            _existsFlags[BRAVO.App.LogCategory[logType]] = true;
        }

        // Define the methods to determine if an install is required
        var methods = [
            { message: "Content Types Exists", method: exists_ContentTypes },
            { message: "Custom Actions Exists", method: exists_CustomActions },
            { message: "Fields Exists", method: exists_Fields },
            { message: "Files Exists", method: exists_Files, args: [base.FILE_INFO[_activeWebType], base.FILE_LIST_NAME] },
            { message: "Lists Exists", method: exists_Lists },
            { message: "Master Page Gallery Files Exists", method: exists_Files, args: [base.MPG_INFO[_activeWebType], "Master Page Gallery"] }
        ];

        // Execute the methods
        executeMethods(methods).done(function () {
            // Default the install flag
            _installFl = true;

            // Parse the exists array
            for (var i = 0; i < _existsFlags.length; i++) {
                // See if an install is required
                if (!_existsFlags[i]) {
                    // Set the flag and break from the loop
                    _installFl = false;
                    break;
                }
            }

            // Resolve the promise
            promise.resolve();
        });

        // Return the promise
        return promise;
    };

    // Method to create a list.
    // web - The web to create the list in.
    // listInfo - The list information.
    var list_Create = function (web, listInfo) {
        var promise = new BRAVO.Core.Promise();

        // Get the list
        list_Get(web, listInfo.Data.Title).done(function (list) {
            // See if the list exists
            if (list.exists) {
                // Resolve the promise
                promise.resolve();
            }
            else {
                // Save the list name
                var listName = listInfo.Data.Title;

                // Set the title to the url
                listInfo.Data.Title = listInfo.UrlName || listName;

                // Create the list
                web.addList(listInfo.Data).done(function (list) {
                    // Revert the title to the original value
                    listInfo.Data.Title = listName;

                    // Update the title
                    list.setProperty("Title", listName);

                    // See if the list created event exists
                    if (base.onList_Created) {
                        // Execute the event
                        var returnVal = base.onList_Created(web, list, listInfo, list_SetTemplateName);

                        // See if a promise was returned
                        if (returnVal && returnVal.done) {
                            // Wait for the event to complete
                            returnVal.done(function () {
                                // Resolve the promise
                                promise.resolve(list);
                            });
                        }
                        else {
                            // Resolve the promise
                            promise.resolve(list);
                        }
                    }
                    else {
                        // Resolve the promise
                        promise.resolve(list);
                    }
                });
            }
        });

        // Return the promise
        return promise;
    };

    // Method to get a list
    // web - The web to create the list in.
    // listName - The list name.
    var list_Get = function (web, listName) {
        var promise = new BRAVO.Core.Promise();

        // Ensure the list name is lower case
        listName = listName.toLowerCase();

        // See if we have already found this list
        if (_cachedLists[listName]) {
            // Resolve the promise
            promise.resolve(_cachedLists[listName]);
        }
        else {
            // Get the list
            web.getListByTitle(listName).done(function (list) {
                // See if the list exists
                if (list.exists) {
                    // Store this list
                    _cachedLists[listName] = list;
                }

                // Resolve the promise
                promise.resolve(list);
            });
        }

        // Return the promise
        return promise;
    };

    // Method to get the destination folder to copy the files to.
    // web - The web containing the file.
    // listName - The list to containing the files.
    // createFl - Flag to create the folder.
    var list_GetDestinationFolder = function (web, listName, createFl) {
        var promise = new BRAVO.Core.Promise();

        // Get the destination list
        list_Get(web, listName).done(function (dstList) {
            // Ensure the list exists
            if (dstList.exists) {
                // Get the root folder of the list
                dstList.get_RootFolder().done(function (rootFolder) {
                    // Get the destination folder
                    folder_Get(web, rootFolder.ServerRelativeUrl + '/' + base.FILE_SUBFOLDER_NAME, createFl).done(function (dstFolder) {
                        // Resolve the promise
                        promise.resolve(dstList, dstFolder);
                    });
                });
            }
            else {
                // Resolve the promise
                promise.resolve(dstList);
            }
        });

        // Return the promise
        return promise;
    };

    // Method to set the list form template name.
    // web - The web containing the list.
    // listUrl - The relative url to the list.
    // templateName - The template name to set the list form to.
    var list_SetTemplateName = function (web, listUrl, templateName) {
        var wpMgrs = [];
        var webParts = [];
        var promise = new BRAVO.Core.Promise();

        // Get the source
        var context = SP.ClientContext.get_current();
        var src = context.get_site().openWebById(web.Id);

        // Parse the form types
        for (var formType in BRAVO.App.FormType) {
            var formName = formType + ".aspx";

            // Get the form
            var file = src.getFileByServerRelativeUrl(listUrl + "/" + formName);

            // Load the web part manager
            var wpMgr = file.getLimitedWebPartManager(SP.WebParts.PersonalizationScope.shared);
            wpMgrs.push(wpMgr);
            context.load(wpMgr);

            // Load the web parts
            var wpColl = wpMgr.get_webParts();
            webParts.push(wpColl);
            context.load(wpColl, "Include(WebPart.Properties)");
        }

        // Execute the request
        context.executeQueryAsync(
            // Success
            function () {
                // Parse the web parts
                for (var i = 0; i < webParts.length; i++) {
                    var wpd = webParts[i].get_item(0);
                    var wp = wpd.get_webPart();

                    // Set the template name
                    wp.get_properties().set_item("TemplateName", templateName);

                    // Save the changes
                    wpd.saveWebPartChanges();
                }

                // Execute the request
                context.executeQueryAsync(
                    // Success
                    function () { promise.resolve(); },
                    // Error
                    function () { promise.resolve(); }
                );
            },
            // Error
            function () {
                // Resolve the promise
                promise.resolve();
            }
        );

        // Return the promise
        return promise;
    };

    // Method to update the list
    // list - The list to update.
    var list_Update = function (web, listInfo) {
        var promise = new BRAVO.Core.Promise();

        // Get the list
        list_Get(web, listInfo.Data.Title).done(function (list) {
            var methods = [];

            // Ensure the list exists
            if (list.exists) {
                // See if content types exist
                if (listInfo.ContentTypes && listInfo.ContentTypes.length > 0) {
                    // Parse the content types
                    for (var i = 0; i < listInfo.ContentTypes.length; i++) {
                        // Add the method to create the content types
                        methods.push({ message: "Adding the " + list.Title + " list content types: " + listInfo.ContentTypes[i].Data.Name, method: contentType_Create, args: [list, listInfo.ContentTypes[i], web] });
                    }
                }

                // See if fields exist
                if (listInfo.Fields && listInfo.Fields.length > 0) {
                    // Parse the fields
                    for (var i = 0; i < listInfo.Fields.length; i++) {
                        // Get the field information
                        var fieldInfo = field_GetInfo(web, listInfo.Fields[i]);

                        // Add the method
                        methods.push({ message: "Updating the " + list.Title + " list fields...", method: field_Create, args: [list, fieldInfo] });
                    }
                }

                // See if content types exist
                if (listInfo.ContentTypes && listInfo.ContentTypes.length > 0) {
                    // Parse the content types
                    for (var i = 0; i < listInfo.ContentTypes.length; i++) {
                        // Add the method
                        methods.push({ message: "Updating the " + list.Title + " list content types: " + listInfo.ContentTypes[i].Data.Name, method: contentType_UpdateFields, args: [list, listInfo.ContentTypes[i], web] });
                    }
                }

                // See if the content type order exists
                if (listInfo.ContentTypeOrder && listInfo.ContentTypeOrder.length > 0) {
                    // Add the method 
                    methods.push({ message: "Updating the " + list.Title + " list content type order", method: list_UpdateContentTypeOrder, args: [list, listInfo.ContentTypeOrder, web] });
                }

                // See if views exist
                if (listInfo.Views && listInfo.Views.length > 0) {
                    // Parse the fields
                    for (var i = 0; i < listInfo.Views.length; i++) {
                        // Add the method
                        methods.push({ message: "Updating the " + list.Title + " list views: " + listInfo.Views[i].Data.Title, method: list_UpdateView, args: [list, listInfo.Views[i]] });
                    }
                }

                // See if the list configured event exists
                if (base.onList_Configured) {
                    // Add the event
                    methods.push({ method: base.onList_Configured, args: [web, list, listInfo, list_SetTemplateName] });
                }
            }

            // Execute the methods and resolve the promise
            return executeMethods(methods).done(function () { promise.resolve(); });
        });

        // Return the promise
        return promise;
    };

    // Method to update the list content type order.
    // list - The list to update.
    // ctOrder - The content type order.
    // web - The web containing the list.
    var list_UpdateContentTypeOrder = function (list, ctOrder, web) {
        var promise = new BRAVO.Core.Promise();

        // Get the list
        var context = SP.ClientContext.get_current();
        var list = context.get_site().openWebById(web.Id).get_lists().getByTitle(list.Title);

        // Load the content types
        var contentTypes = list.get_contentTypes();
        context.load(contentTypes);

        // Load the root folder
        var rootFolder = list.get_rootFolder();
        context.load(rootFolder);

        // Execute the request
        context.executeQueryAsync(function () {
            var ctArray = new Array();

            // Parse the content types
            var enumerator = contentTypes.getEnumerator();
            while (enumerator.moveNext()) {
                var ct = enumerator.get_current();

                // Parse the content type order
                for (var i = 0; i < ctOrder.length; i++) {
                    // See if this is the content type we are looking for
                    if (ctOrder[i] == ct.get_name()) {
                        // Add the content type to the array
                        ctArray.push(ct.get_id());
                    }
                }
            }

            // Update the root folder
            rootFolder.set_uniqueContentTypeOrder(ctArray);
            rootFolder.update();

            // Execute the request
            context.executeQueryAsync(function () { promise.resolve(); }, function () { promise.resolve(); });
        }, function () { promise.resolve(); });

        // Return the promise
        return promise;
    };

    // Method to update the list views
    // list - The list to update.
    // listInfo - The views to add.
    var list_UpdateView = function (list, viewInfo) {
        var promise = new BRAVO.Core.Promise();

        // Get the view
        list.getViewByTitle(viewInfo.Data.Title).done(function (view) {
            // Disable asynchronous requests
            view.asyncFl = false;

            // See if the view exists
            if (view.exists) {
                // Update it
                view.update(viewInfo.Data);
            }
            else {
                // Disable asynchronous requests
                list.asyncFl = false;

                // Create it
                view = list.addView(viewInfo.Data);

                // Enable asynchronous requests
                list.asyncFl = true;
            }

            // See if view fields exist
            if (viewInfo.ViewFields && viewInfo.ViewFields.length > 0) {
                // Get the view fields
                var viewFields = view.get_ViewFields();

                // Clear the view fields
                viewFields.removeAllViewFields();

                // Parse the fields to add
                for (var j = 0; j < viewInfo.ViewFields.length; j++) {
                    // Add the view field
                    viewFields.addViewField(viewInfo.ViewFields[j]);
                }
            }

            // Resolve the promise
            promise.resolve();
        });

        // Return the promise
        return promise;
    };

    // Method to initialize the app panel
    // panel - The app panel.
    var panel_Init = function (panel) {
        // Set the app panel
        _appPanel = panel;

        // Set the initialized flag
        _initFl = false;

        // Hide the main panel
        _appPanel.querySelector(".app-main-panel").className = "app-main-panel";

        // Show the loading panel
        _appPanel.querySelector(".app-loading-panel").className = "app-loading-panel";

        // Set the app information
        setElementText(".app-info-description", base.APP_DESCRIPTION);
        setElementText(".app-info-instructions", base.APP_INSTRUCTIONS);
        setElementText(".app-info-title", base.APP_TITLE);
    };

    // Method to initialize the validation panel
    // panel - The validation panel.
    var panel_InitValidation = function (panel) {
        // Get the app title
        var appTitle = panel.querySelector(".app-title");
        if (appTitle) {
            // Set it
            appTitle.innerText = _appPanel.querySelector(".app-info-title").innerText;
        }

        // Get the content
        var content = panel.querySelector(".app-validation-content");
        if (content) {
            // Clear it
            content.innerHTML = "";
        }

        // Clear the validation results
        _validationResults = [];
    };

    // Event called after the app panel is initialized
    // panel - The validation panel.
    var panel_OnInitialized = function (panel) {
        // Set the initialized flag
        _initFl = true;

        // Hide the loading panel
        _appPanel.querySelector(".app-loading-panel").className += " hide-panel";

        // Show the main panel
        _appPanel.querySelector(".app-main-panel").className += " show-panel";
    };

    // Method to render the validation results to the panel.
    // panel - The validation panel.
    var panel_RenderValidation = function (panel) {
        // Get the content
        var content = panel.querySelector(".app-validation-content");
        if (content) {
            // Parse the validation results
            for (var i = 0; i < _validationResults.length; i++) {
                var category = "";
                var className = "";
                var messageTitle = "";

                // Set the category
                switch (_validationResults[i].Category) {
                    case BRAVO.App.LogCategory.ContentType:
                        category = "[Content Type] ";
                        break;
                    case BRAVO.App.LogCategory.CustomAction:
                        category = "[Custom Action] ";
                        break;
                    case BRAVO.App.LogCategory.Field:
                        category = "[Field] ";
                        break;
                    case BRAVO.App.LogCategory.File:
                        category = "[File] ";
                        break;
                    case BRAVO.App.LogCategory.List:
                        category = "[List] ";
                        break;
                    case BRAVO.App.LogCategory.View:
                        category = "[View] ";
                        break;
                }

                // Set the class name and message title
                switch (_validationResults[i].Type) {
                    case BRAVO.App.ValidationType.Debug:
                        className = "app-validation-debug";
                        messageTitle = "Debug: "
                        break;
                    case BRAVO.App.ValidationType.Error:
                        className = "app-validation-error";
                        messageTitle = "Error: "
                        break;
                    case BRAVO.App.ValidationType.Information:
                        className = "app-validation-information";
                        messageTitle = "Info: "
                        break;
                    case BRAVO.App.ValidationType.Warning:
                        className = "app-validation-warning";
                        messageTitle = "Warning: "
                        break;
                }

                // See if we are adding this message
                if (_validationResults[i].Type >= base.VALIDATE_LOGGING_LEVEL) {
                    // Append the result to the validation results
                    content.innerHTML += "<p class='" + className + "'>" + category + messageTitle + _validationResults[i].Message + "</p>";
                }
            }
        }

        // Show the validation panel
        panel.className += " show-validation";
    };

    // Method to set the element's inner text value
    // selector - The query selector.
    // text - The inner text.
    var setElementText = function (selector, text) {
        // Get the elements
        var elements = _appPanel.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            // Set the inner text
            elements[i].innerText = text;
        }
    };
};

// The Button Types
BRAVO.App.ButtonTypes = {
    Install: 0, Refresh: 1, Uninstall: 2, Upgrade: 3, Validate: 4
};

// The Form Types
BRAVO.App.FormType = {
    DispForm: 0, EditForm: 1, NewForm: 2
};

// The Logging Categories
BRAVO.App.LogCategory = {
    ContentType: 0, CustomAction: 1, Field: 2, File: 3, List: 4, View: 5
};

// The Master Page Gallery Types
BRAVO.App.MPGTypes = {
    DisplayTemplateControl: 0, DisplayTemplateItem: 1, MasterPage: 2, PageLayout: 3
};

// The Validation Types
BRAVO.App.ValidationType = { Debug: 0, Information: 1, Warning: 2, Error: 3 };

// The Web Types
BRAVO.App.WebTypes = {
    App: 0, Custom: 1, Host: 2, RootWeb: 3, Site: 4
};

// Wait for the custom js classes to be initialized
SP.SOD.executeOrDelayUntilScriptLoaded(function () {
    // Notify scripts that this class is loaded
    SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs("bravo.app.js");
}, "bravo.js");
