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
BRAVO.ModalDialog = BRAVO.ModalDialog || {};

// **********************************************************************************
// Example Form Class
// **********************************************************************************
BRAVO.JSLink.ExampleForm = {
    // Initialization method
    Init: function () {
        // Register the CSR override for this class
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(BRAVO.JSLink.ExampleForm);
    }
};

// **********************************************************************************
// Example Form Class Methods
// **********************************************************************************
BRAVO.JSLink.ExampleForm.Methods = {
    // Add new child button click event
    AddChild: function () {
        // Get the current list
        var list = BRAVO.JSLink.getCurrentList(BRAVO.JSLink.ExampleForm._ctx);
        if (list) {
            // Show the new item form
            BRAVO.ModalDialog.open("New Child", "NewForm.aspx?Form=Child&ParentId=" + BRAVO.Core.getQueryStringValue("ID"), null, null, function (dlgResult) {
                // See if we added a new item
                if (dlgResult == SP.UI.DialogResult.OK) {
                    // Render the table
                    var table = document.createElement("div");
                    table.innerHTML = BRAVO.JSLink.ExampleForm.Methods.RenderChildTable(BRAVO.JSLink.ExampleForm._ctx);

                    // Refresh the table data
                    document.querySelector("#childTable tbody").innerHTML = table.querySelector("tbody").innerHTML;
                }
            });
        }
    },

    // Method to render the child form
    RenderChildForm: function (ctx) {
        // Determine if this is the new/edit form
        var isEditable = ctx.BaseViewID != "DisplayForm";

        // Set the form template
        var template = "<table width='100%' cellpadding='5'>" +
            // Rows
            "<tr><td width='300px'><div>Title</div></td><td width='450px'><div id='form_Title'>{{Title}}</div></td></tr>" +
            "<tr><td><div>Parent ID</div></td><td><div id='form_Title'>{{ParentID}}</div></td></tr>" +
            // Buttons
            "<tr colspan='99'><td><table width='100%'><tr>" +
            (isEditable ? "<td><input class='ms-ButtonHeightWidth' onclick='SPClientForms.ClientFormManager.SubmitClientForm(\"{{FormId}}\")' type='button' value='Save' target='_self'></td><td class='ms-separator'></td>" : "") +
            "<td><input class='ms-ButtonHeightWidth' onclick='BRAVO.ModalDialog.close();' type='button' value='" + (isEditable ? "Cancel" : "Close") + "' target='_self'></td>" +
            "</tr></table></td></tr>" +
            "</table>";

        // Render the fields to display
        template = template.replace("{{Title}}", BRAVO.JSLink.renderFieldHtml(ctx, "Title"));
        template = template.replace("{{ParentID}}", BRAVO.JSLink.renderFieldHtml(ctx, "ParentID"));
        template = template.replace("{{FormId}}", ctx.FormUniqueId);

        // Return the child form
        return template;
    },

    // Method to render the child table
    RenderChildTable: function (ctx) {
        var rowData = "";

        // Child Table
        var table = "<table id='childTable' width='100%' border='0' class='ms-listviewtable' cellspacing='0' cellpadding='0' style='margin-left: 25px;'>" +
            "<thead>" +
            // Header
            "<tr><th colspan='7' style='text-align:left;'><h1>Child Items</h1></th></tr>" +
            // Add New Approval Link
            "<tr id='rowAddItem'><th colspan='7' class='ms-list-addnew ms-textLarge ms-soften'>" +
            "<a title='Add new child.' class='ms-heroCommandLink ms-hero-command-enabled-alt' style='cursor:pointer' onclick='BRAVO.JSLink.ExampleForm.Methods.AddChild();'>" +
            "<span class='ms-list-addnew-imgSpan20'><img class='ms-list-addnew-img20' src='/_layouts/15/images/spcommon.png?rev=41'></span>" +
            "<span>New Item</span></a></th></tr>" +
            // Header Columns
		    "<tr>" +
		    "<th class='ms-vh2'>Title</th>" +
		    "<th class='ms-vh2'>Links</th>" +
		    "</tr>" +
		    "</thead>" +
            // Table Body
            "<tbody>{{RowData}}</tbody></table>";

        // Row template
        var rowTemplate = "<tr class='ms-itmHoverEnabled ms-itmhover'>" +
            "<td class='ms-cellstyle ms-vb2'>{{Title}}</td>" +
            "<td class='ms-cellstyle ms-vb2'>{{Links}}</td>" +
            "</tr>";

        // Query the current list for all child items
        var items = BRAVO.JSLink.getCurrentList(ctx).getItemsByFilter("ParentID eq " + ctx.FormContext.itemAttributes.Id).results;

        // Parse the results
        for (var i = 0; i < items.length; i++) {
            // Add the item
            rowData += rowTemplate
                .replace("{{Title}}", items[i].Title)
                .replace("{{Links}}", "");
        }

        // Return the table
        return table.replace("{{RowData}}", rowData)
    },

    // Method to render the form
    RenderForm: function (ctx) {
        // Save a reference to the context
        BRAVO.JSLink.ExampleForm._ctx = ctx;

        // Hide the ribbon
        // TODO: Need to figure out a clean way to link the OTB ribbon buttons to the form, to include: Save, Cancel and Attachments.
        var ribbon = document.querySelector("#s4-ribbonrow");
        if (ribbon) { ribbon.style.display = "none"; }

        // Render the form
        switch (BRAVO.Core.getQueryStringValue("Form")) {
            case "Child":
                return BRAVO.JSLink.ExampleForm.Methods.RenderChildForm(ctx);
            default:
                return BRAVO.JSLink.ExampleForm.Methods.RenderMainForm(ctx);
        }
    },

    // Method to render the main form
    RenderMainForm: function (ctx) {
        // Determine if this is the new/edit form
        var isEditable = ctx.BaseViewID != "DisplayForm";

        // Set the form template
        var template = "<table width='100%' cellpadding='5'>" +
            // Rows
            "<tr><td width='300px'><div>Title</div></td><td width='450px'><div id='form_Title'>{{Title}}</div></td></tr>" +
            "<tr><td><div>User</div></td><td><div id='form_Title'>{{User}}</div></td></tr>" +
            "<tr><td><div>Read Only</div></td><td><div id='form_Title'>{{ReadOnly}}</div></td></tr>" +
            "<tr><td><div>Default Value</div></td><td><div id='form_Title'>{{DefaultValue}}</div></td></tr>" +
            "<tr colspan='99'><td><table width='100%'><tr>" +
            // Buttons
            (isEditable ? "<td><input class='ms-ButtonHeightWidth' onclick='SPClientForms.ClientFormManager.SubmitClientForm(\"{{FormId}}\")' type='button' value='Save' target='_self'></td><td class='ms-separator'></td>" : "") +
            "<td><input class='ms-ButtonHeightWidth' onclick='BRAVO.ModalDialog.close();' type='button' value='" + (isEditable ? "Cancel" : "Close") + "' target='_self'></td>" +
            "</tr></table></td></tr>" +
            // Attachments
            "<tr colspan='99'><td>{{Attachments}}</td></tr>" +
            "</table>";

        // Render the child table, if this is not the new form
        template += ctx.BaseViewID == "NewForm" ? "" : BRAVO.JSLink.ExampleForm.Methods.RenderChildTable(ctx);

        var renderAttachmentsTable = function () {
            return "<tr>" +
            "<td colspan='13'>" +
                "<h2 class='heading' style='margin-bottom:0; font-size:16px;color:#2887dc'>Attachments:</h2>" +
                "<div class='content' style='white-space: -moz-pre-wrap;'>" + description +
                    "<table><tr id='idAttachmentsRow' style='display: table-row;'>" +
                        "<td class='ms-formbody' id='SPFieldAttachments'><table border='0' cellpadding='0' cellspacing='0' id='idAttachmentsTable'><tr><td><span>" + attachments + "</span></td></tr></table></td>" +
                    "</tr></table>" +
                "</div>" +
            "</td>" +
           "</tr>";

            return
            /* Required for the ribbon button to work */
            '<span id="part1">' +
            /* Attachments Table */
            '<table width="100%"><tr id="idAttachmentsRow">' +
            '<td><table border="0" cellpadding="0" cellspacing="0" id="idAttachmentsTable">' +
            '' +
            '</table></td>' +
            '<tr><td><script type="text/javascript">if (typeof ShowAttachmentRows == "function") { ShowAttachmentRows(); }</script></td></tr>' +
            '</tr></table>' +
            '<input type="hidden" name="attachmentsToBeRemovedFromServer" />' +
            '<input type="hidden" name="RectGifUrl" value="/_layouts/15/images/rect.gif?rev=23" />' +
            /* Upload Attachment Section */
            '<span id="partAttachment" style="display:none">' +
            '<table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody>' +
            '<tr><td class="ms-descriptiontext" style="padding-bottom: 8px;" colspan="4" valign="top">Use this page to add attachments to an item.</td></tr>' +
            '<tr><td width="190px" class="ms-formlabel" valign="top" height="50px">Name</td>' +
            '<td class="ms-formbody" valign="bottom" height="15" id="attachmentsOnClient"><span dir="ltr"><input type="file" name="fileupload0" id="onetidIOFile" class="ms-fileinput" size="56" title="Name"></input></span></td></tr>' +
            '<tr><td class="ms-formline" colspan="4" height="1"><img src="/_layouts/15/images/blank.gif?rev=23" width="1" height="1" alt="" /></td></tr>' +
            '<tr><td colspan="4" height="10"><img src="/_layouts/15/images/blank.gif?rev=23" width="1" height="1" alt="" /></td></tr>' +
            '<tr><td class="ms-attachUploadButtons" colspan="4"><input class="ms-ButtonHeightWidth" id="attachOKbutton" type="BUTTON" onclick="OkAttach()" value="OK"/><span id="idSpace" class="ms-SpaceBetButtons"></span><input class="ms-ButtonHeightWidth" id="attachCancelButton" type="BUTTON" onclick="CancelAttach()" value="<%$Resources:wss,form_cancel%>" accesskey="<%$Resources:wss,form_cancel_ak%>" runat="server" /></td></tr>' +
            '</tbody></table>' +
            '<script type="text/javascript">' +
            'if (document.getElementById("onetidIOFile") != null) { document.getElementById("onetidIOFile").title = "<%$Resources:wss,form_attachments_name%>"; } ' +
            'if (document.getElementById("attachOKbutton") != null) { document.getElementById("attachOKbutton").value = "$Resources:wss,form_ok"; } ' +
            '</script>' +
            '</span>' +
            '</span>';
        };

        // Render the fields to display
        template = template.replace("{{Attachments}}", "");
        template = template.replace("{{DefaultValue}}", BRAVO.JSLink.renderFieldHtml(ctx, "JSLDefaultValue"));
        template = template.replace("{{ReadOnly}}", BRAVO.JSLink.renderFieldHtml(ctx, "JSLReadOnly"));
        template = template.replace("{{Title}}", BRAVO.JSLink.renderFieldHtml(ctx, "Title"));
        template = template.replace("{{User}}", BRAVO.JSLink.renderFieldHtml(ctx, "JSLDefaultUser"));
        template = template.replace("{{FormId}}", ctx.FormUniqueId);

        // Return the main form
        return template;
    },
};

// **********************************************************************************
// Template Overrides
// **********************************************************************************
BRAVO.JSLink.ExampleForm.Templates = {
    View: BRAVO.JSLink.ExampleForm.Methods.RenderForm,
    ListTemplateType: 100
};

// Write the javascript to the page. This will ensure it's called when MDS is enabled
document.write("<script type='text/javascript'>(function() { BRAVO.JSLink.ExampleForm.Init(); })();</script>");
