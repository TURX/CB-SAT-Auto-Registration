// ==UserScript==
// @name         College Board SAT Semi-Auto Registration
// @namespace    https://github.com/TURX
// @version      1.1
// @description  automatically complete several steps of SAT registration
// @author       TURX
// @match        https://nsat.collegeboard.org/satweb/*
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
                    console.log("[College Board SAT Semi-Auto Registration] No registration date available, will refresh in 30s.");
                    timeOutReload = 30;
                    document.getElementsByClassName("s2-well-text-block")[0].innerText = "[College Board SAT Semi-Auto Registration] No registration date available, will refresh after 30s."
                    setInterval(function() {
                        if (timeOutReload == 0) location.reload();
                        else timeOutReload--;
                        document.getElementsByClassName("s2-well-text-block")[0].innerText = "[College Board SAT Semi-Auto Registration] No registration date available, will refresh after " + timeOutReload + "s."
                    }, 1000);
                } else {
                    console.log("[College Board SAT Semi-Auto Registration] Available, be quick.");
                    alert("[College Board SAT Semi-Auto Registration] Available now.");
                }
            } else {
                console.log("[College Board SAT Semi-Auto Registration] Website error, will refresh in 3s.");
                document.write("<div id='error'>[College Board SAT Semi-Auto Registration] Website error.</div>");
                timeOutReload = 3;
                document.getElementById("error").innerText = "[College Board SAT Semi-Auto Registration] Website error, will refresh after 3s."
                setInterval(function() {
                    if (timeOutReload == 0) location.reload();
                    else timeOutReload--;
                    document.getElementById("error").innerText = "[College Board SAT Semi-Auto Registration] Website error, will refresh after " + timeOutReload + "s."
                }, 1000);
            }
            break;
        case "https://nsat.collegeboard.org/satweb/satHomeAction.action":
            console.log("[College Board SAT Semi-Auto Registration] Start to register.");
            $("#actionRegisterAnother").click();
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
    }
})();
