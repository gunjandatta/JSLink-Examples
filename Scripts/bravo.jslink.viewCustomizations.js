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
// Example View Class
// **********************************************************************************
BRAVO.JSLink.ExampleView = {
    // Initialization method
    Init: function () {
        // Register the CSR override for this class
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(BRAVO.JSLink.ExampleView);
    }
};

// **********************************************************************************
// Example View Class Methods
// **********************************************************************************
BRAVO.JSLink.ExampleView.Methods = {
    // Method to customize the view's body
    CustomizeBody: function (ctx) {
        var style = " style='background-color: orange; color: white'";

        // Get the default body
        var defaultHTML = RenderBodyTemplate ? RenderBodyTemplate(ctx) : "";

        // See if we have already customized the body
        if (window.bodyCustomizedFl) { return defaultHTML; }

        // Set the flag
        window.bodyCustomizedFl = true;

        // Return the customized body
        return "<tbody><tr><td><h2" + style + ">Body Above</h2></td></tr></tbody>" + defaultHTML + "<tbody><tr><td><h2" + style + ">Body Below</h2></td></tr></tbody>";
    },

    // Method to customize the view's footer
    CustomizeFooter: function (ctx) {
        var style = " style='background-color: brown; color: white'";

        // Get the default header
        var defaultHTML = RenderFooterTemplate(ctx);

        // Return the customized footer
        return "<h1" + style + ">Footer Above</h1>" + (defaultHTML ? defaultHTML + "<h1" + style + ">Footer Below</h1>" : "");
    },

    // Method to customize the view's group
    CustomizeGroup: function (ctx, group, groupId, listItem, listSchema, level, expand) {
        var style = " style='background-color: purple; color: white'";

        // Get the default group
        var defaultHTML = RenderGroupTemplate(ctx, group, groupId, listItem, listSchema, level, expand);

        // Convert the html to an element
        var group = document.createElement("table");
        group.innerHTML = defaultHTML;

        // Append rows above and below the group
        var row = group.querySelector("tr");
        row.innerHTML = "<td><span" + style + ">Before Group</span></td>" + row.innerHTML + "<td><span" + style + ">After Group</span></td>";

        // Return the customized group
        return group.innerHTML;
    },

    // Method to customize the view's header
    CustomizeHeader: function (ctx) {
        var style = " style='background-color: blue; color: white'";

        // Get the default header
        var defaultHTML = RenderHeaderTemplate(ctx);

        // Add a header above and below the default header
        return "<h1" + style + ">Header Above</h1>" + defaultHTML + "<h1" + style + ">Header Below</h1>";
    },

    // The template for each item in this view
    ItemTemplate: function (ctx) {
        var style = " style='background-color: green; color: white'";

        // Get the default item
        var defaultHTML = RenderItemTemplate(ctx);

        // Return the customized item template
        return "<tr><td><h2" + style + ">Above Item</h2></td></tr>" + defaultHTML + "<tr><td><h2" + style + ">Below Item</h2></td></tr>";
    }
};

// **********************************************************************************
// Template Overrides
// **********************************************************************************
BRAVO.JSLink.ExampleView.Templates = {
    Header: BRAVO.JSLink.ExampleView.Methods.CustomizeHeader,
    Footer: BRAVO.JSLink.ExampleView.Methods.CustomizeFooter,
    Body: BRAVO.JSLink.ExampleView.Methods.CustomizeBody,
    Item: BRAVO.JSLink.ExampleView.Methods.ItemTemplate,
    Group: BRAVO.JSLink.ExampleView.Methods.CustomizeGroup,
    ListTemplateType: 100
};

// Write the javascript to initialize the CSR override. This will ensure it's called when MDS is enabled
document.write("<script type='text/javascript'>(function() { BRAVO.JSLink.ExampleView.Init(); })();</script>");
