// ==UserScript==
// @name         College Board SAT Semi-Auto Registration
// @namespace    https://github.com/TURX
// @version      1.12
// @description  automatically complete several steps of SAT registration
// @author       TURX
// @match        https://nsat.collegeboard.org/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

function countdown(timeOutReload, element, desc, url) {
    var reloaded = false;
    console.log("[College Board SAT Semi-Auto Registration] " + desc + ", will retry in 3s.");
    element.innerText = desc + ", will retry after 3s.";
    setInterval(function() {
        if (timeOutReload == 0) {
            if (reloaded == false) {
                console.log("[College Board SAT Semi-Auto Registration] Retry now.");
                if (url == undefined) location.reload();
                else location.href = url;
                reloaded = true;
            }
        }
        else timeOutReload--;
        element.innerText = desc + ", will retry after " + timeOutReload + "s."
    }, 1000);
}

function notify(content) {
    console.log("[College Board SAT Semi-Auto Registration] " + content);
    new Notification(content, {body: "College Board SAT Semi-Auto Registration Notification"});
    document.getElementsByClassName("s2-page-title")[0].innerText = content;
    setTimeout(function() {
        alert(content);
    }, 500);
}

function requestPermission() {
    while (Notification.permission != "granted") {
        Notification.requestPermission();
        alert("Please grant the notification permission to use College Board SAT Semi-Auto Registration.");
    }
}

(function() {
    'use strict';

    var url = window.location.href.substr(0, window.location.href.length - window.location.search.length);
    var error = false;
    console.log("[College Board SAT Semi-Auto Registration] Enabled, current URL: " + url);

    requestPermission();

    if (document.getElementsByTagName("h1").length != 0 && url != "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action") {
        if (document.getElementsByTagName("h1")[0].innerText == "Service Unavailable - Zero size object" || document.getElementsByTagName("h1")[0].innerText == "Access Denied") {
            error = true;
            document.write("<div id='error'>[College Board SAT Semi-Auto Registration] Website error.</div>");
            countdown(3, document.getElementById("error"), "Website error");
        }
    }

    if (!error) switch (url) {
        case "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action":
            if (document.getElementsByClassName("s2-well-text-block").length != 0) {
                if (document.getElementsByClassName("s2-well-text-block")[0].innerText.search("There are no available registration dates for the current test year. Please check back later to register for future tests.") != -1) {
                    countdown(30, document.getElementsByClassName("s2-well-text-block")[0], "No registration date available")
                } else {
                    notify("Registration date available.");
                }
            }
            break;
        case "https://nsat.collegeboard.org/satweb/satHomeAction.action":
            console.log("[College Board SAT Semi-Auto Registration] Start to register.");
            /*
            $("#actionRegisterAnother").click();
            $("#useBookmarkProceed").click();
            */
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
        case "https://nsat.collegeboard.org/satweb/registration/selectTestCenterAction.action":
        case "https://nsat.collegeboard.org/satweb/registration/updateTestAndDateAction.action":
            if (document.getElementById("testCenterSearchResults_wrapper") != null) {
                if (document.getElementById("testCenterSearchResults_wrapper").innerText.search("Seat Available") == -1) {
                    if (document.getElementById("testCenterSearchResults_wrapper").innerText.search("My Ideal Test Center") == -1) {
                        document.getElementById("sortLinks").remove();
                        document.getElementById("availabilityFilter").remove();
                        countdown(15, document.getElementById("testCenterSearchResults_wrapper"), "No seat available in this region");
                    } else {
                        console.log("[College Board SAT Semi-Auto Registration] Select Ideal Test Center.");
                        console.log("[College Board SAT Semi-Auto Registration] Test Center Information:");
                        var i;
                        while ($("#testCenterSearchResults_next").hasClass("disabled") == false) {
                            for (i = 1; i < document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr").length; i++) {
                                console.log("[College Board SAT Semi-Auto Registration] Code: " + document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr")[i].getElementsByTagName("td")[2].getElementsByTagName("a")[0].getAttribute("data-code") + "; Name: " + document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr")[i].getElementsByTagName("td")[0].innerText)
                            }
                            $("#testCenterSearchResults_next").click();
                        }
                        for (i = 1; i < document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr").length; i++) {
                            console.log("[College Board SAT Semi-Auto Registration] Code: " + document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr")[i].getElementsByTagName("td")[2].getElementsByTagName("a")[0].getAttribute("data-code") + "; Name: " + document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr")[i].getElementsByTagName("td")[0].innerText)
                        }
                    }
                } else {
                    notify("Seat available.");
                }
            } else {
                if (document.getElementById("newCenterInfo") == null) {
                    notify("Please select another country and search again.");
                }
            }
            break;
        case "https://nsat.collegeboard.org/errors/down.html":
            countdown(30, document.getElementsByClassName("cb-alert-heading")[0].getElementsByTagName("p")[0], "Website down", "https://nsat.collegeboard.org/satweb/satHomeAction.action");
            break;
    }
})();
