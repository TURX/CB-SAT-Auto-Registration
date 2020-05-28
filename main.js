// ==UserScript==
// @name         College Board SAT Semi-Auto Registration
// @namespace    https://github.com/TURX
// @version      1.4
// @description  automatically complete several steps of SAT registration
// @author       TURX
// @match        https://nsat.collegeboard.org/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    var url = window.location.href.substr(0, window.location.href.length - window.location.search.length);
    console.log("[College Board SAT Semi-Auto Registration] Enabled, current URL: " + url);

    switch (url) {
        case "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action":
            var timeOutReload;
            if (document.getElementsByClassName("s2-well-text-block").length != 0) {
                if (document.getElementsByClassName("s2-well-text-block")[0].innerText.search("There are no available registration dates for the current test year. Please check back later to register for future tests.") != -1) {
                    console.log("[College Board SAT Semi-Auto Registration] No registration date available, will retry in 30s.");
                    timeOutReload = 30;
                    document.getElementsByClassName("s2-well-text-block")[0].innerText = "No registration date available, will retry after 30s."
                    setInterval(function() {
                        if (timeOutReload == 0) location.reload();
                        else timeOutReload--;
                        document.getElementsByClassName("s2-well-text-block")[0].innerText = "No registration date available, will retry after " + timeOutReload + "s."
                    }, 1000);
                } else {
                    console.log("[College Board SAT Semi-Auto Registration] Available, be quick.");
                    alert("[College Board SAT Semi-Auto Registration] Available now.");
                }
            } else {
                if (document.body.innerText.search("unavailable") != -1) {
                    console.log("[College Board SAT Semi-Auto Registration] Website error, will retry in 3s.");
                    document.write("<div id='error'>[College Board SAT Semi-Auto Registration] Website error.</div>");
                    timeOutReload = 3;
                    document.getElementById("error").innerText = "[College Board SAT Semi-Auto Registration] Website error, will retry after 3s."
                    setInterval(function() {
                        if (timeOutReload == 0) location.reload();
                        else timeOutReload--;
                        document.getElementById("error").innerText = "[College Board SAT Semi-Auto Registration] Website error, will retry after " + timeOutReload + "s."
                    }, 1000);
                } else {
                    console.log("[College Board SAT Semi-Auto Registration] Available, be quick.");
                    alert("[College Board SAT Semi-Auto Registration] Available now.");
                }
            }
            break;
        case "https://nsat.collegeboard.org/satweb/satHomeAction.action":
            console.log("[College Board SAT Semi-Auto Registration] Start to register.");
            $("#actionRegisterAnother").click();
            $("#useBookmarkProceed").click();
            break;
        case "https://nsat.collegeboard.org/satweb/processMySatAction.action":
            console.log("[College Board SAT Semi-Auto Registration] Go to the next step.");
            if (typeof newRegistration == "function") newRegistration('', 'initRegistration', '');
            $("#continue").click();
            break;
        case "https://nsat.collegeboard.org/satweb/registration/viewSatTicketID.action":
            console.log("[College Board SAT Semi-Auto Registration] Go to the next step.");
            $("#continue").click();
            break;
        case "https://nsat.collegeboard.org/satweb/registration/sdqDemographics.action":
            console.log("[College Board SAT Semi-Auto Registration] Skip to the next step.");
            $("#updateLater").click();
            break;
        case "https://nsat.collegeboard.org/satweb/registration/viewSatTermsAndConditions.action":
            console.log("[College Board SAT Semi-Auto Registration] Check to agree the terms and go to the next step.");
            $("#agreeTerms").prop("checked", true);
            $("#continue").click();
            break;
        case "https://nsat.collegeboard.org/errors/down.html":
            console.log("[College Board SAT Semi-Auto Registration] Website down, will retry in 30s.");
            timeOutReload = 30;
            document.getElementsByClassName("cb-alert-heading")[0].getElementsByTagName("p")[0].innerText = "Website down, will retry after 30s."
            setInterval(function() {
                if (timeOutReload == 0) location.href = "https://nsat.collegeboard.org/satweb/satHomeAction.action";
                else timeOutReload--;
                document.getElementsByClassName("cb-alert-heading")[0].getElementsByTagName("p")[0].innerText = "Website down, will retry after " + timeOutReload + "s."
            }, 1000);
    }
})();
