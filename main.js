// ==UserScript==
// @name         College Board SAT Auto Refresh
// @namespace    https://github.com/TURX
// @version      1.0
// @description  auto refresh every 30 seconds for College Board SAT registration
// @author       TURX
// @match        https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var timeOutReload;
    console.log("[College Board SAT Auto Refresh] Enabled.");
    if (document.getElementsByClassName("s2-well-text-block").length != 0) {
        if (document.getElementsByClassName("s2-well-text-block")[0].innerText.search("There are no available registration dates for the current test year. Please check back later to register for future tests.") != -1) {
            console.log("[College Board SAT Auto Refresh] No registration date available, will refresh in 30s.");
            timeOutReload = 30;
            document.getElementsByClassName("s2-well-text-block")[0].innerText = "[College Board SAT Auto Refresh] No registration date available, will refresh after 30s."
            setInterval(function() {
                if (timeOutReload == 0) location.reload();
                else timeOutReload--;
                document.getElementsByClassName("s2-well-text-block")[0].innerText = "[College Board SAT Auto Refresh] No registration date available, will refresh after " + timeOutReload + "s."
            }, 1000);
        } else {
            console.log("[College Board SAT Auto Refresh] Available, be quick.");
            alert("[College Board SAT Auto Refresh] Available now.");
        }
    } else {
        console.log("[College Board SAT Auto Refresh] Website error, will refresh in 3s.");
        document.write("<div id='error'>[College Board SAT Auto Refresh] Website error.</div>");
        timeOutReload = 3;
        document.getElementById("error").innerText = "[College Board SAT Auto Refresh] Website error, will refresh after 3s."
        setInterval(function() {
            if (timeOutReload == 0) location.reload();
            else timeOutReload--;
            document.getElementById("error").innerText = "[College Board SAT Auto Refresh] Website error, will refresh after " + timeOutReload + "s."
        }, 1000);
    }
})();
