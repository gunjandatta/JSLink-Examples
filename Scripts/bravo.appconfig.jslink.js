"use strict";

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

// **********************************************************************************
// Bravo App Configuration File
// This configuration file represents the architecture of the app. The 'App' class
// creates an instance of the app from each configuration file.
// **********************************************************************************
BRAVO.AppConfig.push(function () {
    // **********************************************************************************
    // App Information
    // **********************************************************************************

    var _app = null;
    var _appDescription = "This will create an example list for displaying JS Link customizations.";
    var _appTitle = "JS Link Examples";

    // **********************************************************************************
    // Content Type Configuration
    // **********************************************************************************

    var _contentTypeInfo = [];
    /* Example:
    _contentTypeInfo[BRAVO.App.WebTypes.Host] = [
        {
            Data: {
                Description: "My custom content type.",
                Group: "Bravo",
                Name: "My Custom Content Type"
            },
            FieldRefs: ["Internal Field Name"]
        }
    ]; */

    // **********************************************************************************
    // Custom Action Configuration
    // **********************************************************************************

    var _customActionInfo = [];
    /* Example:
    _customActionInfo[BRAVO.App.WebTypes.Host] = [
        { IsScript: false, Location: "Microsoft.SharePoint.StandardMenu", Name: "NameOfAction", Title: "Name of the Action", Url: "~site/Style Library/BRAVO/pages/nameOfTheFile.aspx", Description: "Description of the action." },
        { IsScript: true, UseScriptBlock: false, Name: "NameOfJSFile", Title: "Name of the JS File", FileUrl: "~site/Style Library/BRAVO/js/nameOfTheFile.js", Description: "Description of the JS file." },
        { IsScript: false, Name: "NameOfCSSFile", Title: "Name of the CSS File", FileUrl: "~site/Style Library/BRAVO/css/nameOfTheFile.css", Description: "Description of the CSS file." }
    ]; */

    // **********************************************************************************
    // Field Configuration
    // **********************************************************************************

    var _fieldInfo = [];
    /* Example:
    _fieldInfo[BRAVO.App.WebTypes.Host] = [
        '<Field ID="{AA3AF8EA-2D8D-4345-8BD9-6017205F6212}" Name="TestValue" StaticName="TestValue" DisplayName="Value" Type="Text" />'
    ]; */

    // **********************************************************************************
    // File Configuration
    // **********************************************************************************

    var _fileInfo = [];
    _fileInfo[BRAVO.App.WebTypes.Host] = [
        { Path: "/Scripts/bravo.jslink.fieldCustomizations.js", SubFolder: "js" },
        { Path: "/Scripts/bravo.jslink.formCustomizations.js", SubFolder: "js" },
        { Path: "/Scripts/bravo.jslink.viewCustomizations.js", SubFolder: "js" },
    ];

    // **********************************************************************************
    // List Configuration
    // **********************************************************************************

    var _listInfo = [];
    _listInfo[BRAVO.App.WebTypes.Host] = [
        // JS Link Examples
        {
            ContentTypes: [
                {
                    Data: {
                        JSLink: "~site/style library/bravo/js/bravo.jslink.formCustomizations.js",
                        Name: "Item"
                    },
                },
                {
                    Data: {
                        JSLink: "~site/style library/bravo/js/bravo.jslink.formCustomizations.js",
                        Name: "ChildLink"
                    },
                    FieldRefs: ["ParentID", "Title"]
                }
            ],
            Data: {
                BaseTemplate: 100,
                Description: "This is a demo list to show JS Link.",
                Title: "JS Link Examples"
            },
            UrlName: "jslinks",
            Fields: [
                '<Field ID="{AA3AF8EA-2D8D-4345-8BD9-601720000000}" Name="ParentID" StaticName="ParentID" DisplayName="Parent ID" Type="Integer" JSLink="~site/style library/bravo/js/bravo.jslink.fieldCustomizations.js" />',
                '<Field ID="{AA3AF8EA-2D8D-4345-8BD9-601720000001}" Name="JSLDefaultUser" StaticName="JSLDefaultUser" DisplayName="Default User Value" Type="User" JSLink="~site/style library/bravo/js/bravo.jslink.fieldCustomizations.js" />',
                '<Field ID="{AA3AF8EA-2D8D-4345-8BD9-601720000002}" Name="JSLReadOnly" StaticName="JSLReadOnly" DisplayName="Read Only Field" Type="Text" JSLink="~site/style library/bravo/js/bravo.jslink.fieldCustomizations.js" />',
                '<Field ID="{AA3AF8EA-2D8D-4345-8BD9-601720000003}" Name="JSLDefaultValue" StaticName="JSLDefaultValue" DisplayName="Default Value" Type="Text" JSLink="~site/style library/bravo/js/bravo.jslink.fieldCustomizations.js" />',
            ],
            Views: [
                {
                    Data: {
                        JSLink: "~site/style library/bravo/js/bravo.jslink.viewCustomizations.js",
                        Title: "All Items",
                        ViewQuery: "<Where><IsNull><FieldRef Name='ParentID' /></IsNull></Where>"
                    },
                    ViewFields: ["LinkTitle", "JSLDefaultUser", "JSLReadOnly", "JSLDefaultValue"]
                }
            ]
        },
    ];

    // **********************************************************************************
    // Master Page Gallery Configuration
    // **********************************************************************************

    var _mpgInfo = [];
    _mpgInfo[BRAVO.App.WebTypes.Site] = [
        /*
        { Path: "Scripts/bravo.jslink.formCustomizations.js", SubFolder: "JSLinks", Type: BRAVO.App.MPGTypes.PageLayout, Properties: { MasterPageDescription: "Description of the page layout", Title: "My Custom Template" } },
        { Path: "Scripts/bravo.jslink.viewCustomizations.js", SubFolder: "JSLinks", Type: BRAVO.App.MPGTypes.MasterPage, Properties: { MasterPageDescription: "Description of the masterpage.", Title: "My Custom MasterPage" } },
        */
    ];

    // **********************************************************************************
    // Ribbon Configuration
    // **********************************************************************************

    var _ribbonInfo = [];
    /* Example:
    _ribbonInfo[BRAVO.App.WebTypes.Host] = [
        {
            Location: "CommandUI.Ribbon",
            Name: "BravoExampleRibbonIcon",
            Title: "Bravo - Example Ribbon Icon",
            CommandUIExtension: '\
                <CommandUIExtension xmlns="http://schemas.microsoft.com/sharepoint/">\
                <CommandUIDefinitions>\
                    <CommandUIDefinition Location="[Location of the example button].Controls._children">\
                        <Button Id="Bravo.Example.Button" \
                            Alt="Example" \
                            Command="BravoButtonCommand" \
                            Description="Description of the button." \
                            Image16by16="_layouts/15/images/placeholder16x16.png" \
                            Image32by32="_layouts/15/images/placeholder32x32.png" \
                            LabelText="Custom Button" \
                            Sequence="100" \
                            TemplateAlias="o1" />\
                    </CommandUIDefinition>\
                </CommandUIDefinitions>\
                <CommandUIHandlers>\
                    <CommandUIHandler Command="BravoButtonCommand" CommandAction="javascript:alert(\'Test\');" />\
                </CommandUIHandlers>\
            </CommandUIExtension>'
        }
    ]; */

    // **********************************************************************************
    // Private Methods
    // **********************************************************************************

    // **********************************************************************************
    // Events and Initialization Methods
    // **********************************************************************************

    // Method to initialize the app.
    // panel - The app panel.
    // (Optional) app - The app instance.
    var initApp = function (panel, app) {
        // Create a new instance of the app
        _app = app || new BRAVO.App();

        // Link the app configuration
        _app.APP_DESCRIPTION = _appDescription;
        _app.APP_TITLE = _appTitle;
        _app.CONTENT_TYPE_INFO = _contentTypeInfo;
        _app.CUSTOM_ACTION_INFO = _customActionInfo;
        _app.FIELD_INFO = _fieldInfo;
        _app.FILE_INFO = _fileInfo;
        _app.LIST_INFO = _listInfo;
        _app.MPG_INFO = _mpgInfo;
        _app.RIBBON_INFO = _ribbonInfo;

        // Link the events
        _app.onClick_Install = onClick_Install;
        _app.onClick_Refresh = onClick_Refresh;
        _app.onClick_Uninstall = onClick_Uninstall;
        _app.onClick_Upgrade = onClick_Upgrade;
        _app.onFile_Copied = onFile_Copied;
        _app.onInit = onInit;
        _app.onInit_InstallRequired = onInit_InstallRequired;
        _app.onList_Configured = onList_Configured;
        _app.onList_Created = onList_Created;
        _app.onValidate = onValidate;

        // Set the custom application configuration
        _app.INSTALL_HOST_WEB = true;

        // Initialize the app
        _app.init(panel);

        // Return the app instance
        return _app;
    };

    // The install button click event.
    // source - The active web/site source.
    // panel - The validation panel.
    var onClick_Install = function (source, panel) { };

    // The refresh button click event.
    // source - The active web/site source.
    // panel - The validation panel.
    var onClick_Refresh = function (source, panel) { };

    // The uninstall button click event.
    // source - The active web/site source.
    // panel - The validation panel.
    var onClick_Uninstall = function (source, panel) { };

    // The upgrade button click event.
    // source - The active web/site source.
    // panel - The validation panel.
    var onClick_Upgrade = function (source, panel) { };

    // The file copied click event.
    // file - The copied file.
    // folder - The folder containing the folder.
    // list - The list containing the file.
    // web - The web containing the file.
    var onFile_Copied = function (file, folder, list, web) { };

    // The event called after the app panel is initialized.
    // source - The active web/site source.
    // panel - The validation panel.
    var onInit = function (source, panel) { };

    // The install required event.
    // source - The active web/site source.
    var onInit_InstallRequired = function (source) { };

    // The list configured event.
    // web - The web containing the list.
    // list - The new list.
    // listInfo - The list information.
    var onList_Configured = function (web, list, listInfo, setTemplateName) {
        // Set the template name for the list forms
        setTemplateName(web, web.ServerRelativeUrl + "/lists/jslinks", "CSRListForm");
    };

    // The list created event.
    // web - The web containing the list.
    // list - The new list.
    // listInfo - The list information.
    var onList_Created = function (web, list, listInfo) { };

    // The validation event.
    // source - The active web/site source.
    // panel - The validation panel.
    var onValidate = function (source, panel) { };

    // **********************************************************************************
    // Public Interface
    // **********************************************************************************
    return {
        description: _appDescription,
        initApp: initApp,
        title: _appTitle
    };
}());
