<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <script type="text/javascript" src="../Scripts/bravo.js"></script>
    <script type="text/javascript" src="../Scripts/bravo.app.js"></script>
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add the app configuration files -->
    <script type="text/javascript" src="../Scripts/bravo.appconfig.core.js"></script>
    <script type="text/javascript" src="../Scripts/bravo.appconfig.jslink.js"></script>

    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/App.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    <span id="pageTitle">SharePoint Apps</span>
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <!-- App Validation Panel -->
    <div id="app-validation-panel">
        <div class="app-validation-header">
            <h2>Validation:
                <span class="app-title"></span>
                <a class="app-validation-close" href="#" onclick="hideValidationPanel();">&#171;</a>
            </h2>
            <hr />
        </div>
        <div class="app-validation-content">
        </div>
    </div>

    <!-- Apps Container -->
    <div id="apps-container">
        <!-- App Panel -->
        <div class="app-panel">
            <!-- Loading Panel -->
            <div class="app-loading-panel">
                <h3 class="app-info-title">App Title</h3>
                <p>Loading the app...</p>
                <div class="loader"></div>
            </div>
            <!-- Main Panel -->
            <div class="app-main-panel">
                <!-- App Information -->
                <div class="app-info">
                    <p class="app-info-error"></p>
                    <h2 class="app-info-title">App Title</h2>
                    <p class="app-info-description">App Description</p>
                </div>
                <!-- Buttons Container -->
                <div class="app-buttons-container">
                    <!-- Icons -->
                    <div class="app-icons">
                        <a href="#" class="app-icons-refresh" title="Refresh App" style="width: 28px; height: 36px; margin-right: 6px;" onclick="return refreshApp(this);">
                            <svg class="reload" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><title>reload</title>
                                <rect class="cls-inner" width="30" height="30"></rect>
                                <path class="cls-outer" d="M0-.12v30H30v-30H0ZM14,24.65a9.36,9.36,0,0,1-3.44-18V6.24A1,1,0,0,1,12,5.39l2.38,1.36,2.39,1.36a1,1,0,0,1,0,1.67L14.4,11.17,12,12.56a1,1,0,0,1-1.45-.82V11.25a5.44,5.44,0,1,0,8.92,2.67,2,2,0,0,1,3.78-1A9.37,9.37,0,0,1,14,24.65Z"></path>
                            </svg>
                        </a>
                        <a href="#" class="app-icons-upgrade" title="Upgrade App" style="width: 28px; height: 36px; margin-right: 6px" onclick="return upgradeApp(this);">
                            <svg class="update" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><title>update</title>
                                <rect class="cls-inner" width="30" height="30"></rect>
                                <path class="cls-outer" d="M-0.62-.56v31h31v-31h-31ZM10.65,12.37L12.4,9.14l1.74-3.07a1.17,1.17,0,0,1,2,0l1.74,3,1.75,3.28a1.42,1.42,0,0,1-1,2.06H17.38v2c0,1.26-.33,3-1.59,3l-1.53,0c-1.12,0-1.29-1.57-1.29-2.83l0-2.21-1.34,0A1.42,1.42,0,0,1,10.65,12.37ZM22.38,23.44a1,1,0,0,1-1,1h-12a1,1,0,0,1-1-1h0a1,1,0,0,1,1-1h12a1,1,0,0,1,1,1h0Z"></path>
                            </svg>
                        </a>
                        <a href="#" class="app-icons-validate" title="Validate App" style="width: 28px; height: 36px; margin-right: 10px" onclick="return validateApp(this);">
                            <svg class="validate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><title>validate</title>
                                <rect class="cls-inner" width="30" height="30"></rect>
                                <path class="cls-outer" d="M0,0V30H30V0H0ZM11.72,23.5s-4.16-6.25-7.5-7.92l3.58-3.07L11.47,19,19.24,6.49l6.39,4.14S13,21.23,11.72,23.5Z"></path>
                            </svg>
                        </a>
                    </div>
                    <!-- Install/Uninstall Buttons -->
                    <div class="app-buttons">
                        <a href="#" title="Activate App" class="app-button app-buttons-install" onclick="return installApp(this);">Activate</a>
                        <a href="#" title="Deactivate App" class="app-button app-buttons-uninstall" onclick="return uninstallApp(this);">Deactivate</a>
                    </div>
                </div>
                <!-- Clear the styling -->
                <div style="clear: both"></div>
            </div>
        </div>
    </div>
</asp:Content>
