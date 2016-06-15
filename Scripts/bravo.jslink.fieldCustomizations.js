"use strict";

/*
* Title: Bravo JS Link Template
* Source: TBD
* Version: v1.0
* Author: Gunjan Datta
* 
* Copyright © 2015 Bravo Consulting Group, LLC (Bravo). All Rights Reserved.
* Released under the MIT license.
*/

// **********************************************************************************
// Namespace
// **********************************************************************************
Type.registerNamespace("BRAVO");

// **********************************************************************************
// Global Variables
// **********************************************************************************
BRAVO.JSLink = BRAVO.JSLink || {};

// **********************************************************************************
// Example Fields Class
// **********************************************************************************
BRAVO.JSLink.ExampleFields = {
    // Initialization method
    Init: function () {
        // Register the CSR override for this class
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(BRAVO.JSLink.ExampleFields);
    }
};

// **********************************************************************************
// Example Form Class Methods
// **********************************************************************************
BRAVO.JSLink.ExampleFields.Methods = {
    // Method to set the parent id value
    DefaultParentId: function (ctx, field) {
        // Default the value
        ctx.CurrentFieldValue = BRAVO.Core.getQueryStringValue("ParentId");
        if (ctx.CurrentFieldValue && ctx.CurrentFieldValue != "") {
            // Hide the field
            return BRAVO.JSLink.hideField(ctx);
        }

        // Return the default html
        return BRAVO.JSLink.getFieldDefaultHtml(ctx, field);
    },

    // Method to default the value.
    DefaultValue: function (ctx, field) {
        // Default the value
        ctx.CurrentFieldValue = "Gunjan";

        // Hide the field
        return BRAVO.JSLink.hideField(ctx);
    },
};

// **********************************************************************************
// Template Overrides
// **********************************************************************************
BRAVO.JSLink.ExampleFields.Templates = {
    Fields: {
        JSLDefaultUser: {
            NewForm: BRAVO.JSLink.defaultToCurrentUser
        },
        JSLDefaultValue: {
            NewForm: BRAVO.JSLink.ExampleFields.Methods.DefaultValue
        },
        JSLReadOnly: {
            EditForm: BRAVO.JSLink.disableEdit,
            View: BRAVO.JSLink.disableQuickEdit
        },
        ParentID: {
            DisplayForm: BRAVO.JSLink.hideField,
            EditForm: BRAVO.JSLink.hideField,
            NewForm: BRAVO.JSLink.ExampleFields.Methods.DefaultParentId,
            View: BRAVO.JSLink.hideField
        }
    },
    ListTemplateType: 100
};

// Write the javascript to initialize the CSR override. This will ensure it's called when MDS is enabled.
document.write("<script type='text/javascript'>(function() { BRAVO.JSLink.ExampleFields.Init(); })();</script>");
