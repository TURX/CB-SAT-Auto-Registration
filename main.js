// ==UserScript==
// @name         College Board SAT Semi-Auto Registration
// @namespace    https://github.com/TURX
// @version      1.9
// @description  automatically complete several steps of SAT registration
// @author       TURX
// @match        https://nsat.collegeboard.org/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    var url = window.location.href.substr(0, window.location.href.length - window.location.search.length);
    var timeOutReload;
    var reloaded = false;
    console.log("[College Board SAT Semi-Auto Registration] Enabled, current URL: " + url);

    if (document.getElementsByTagName("h1").length != 0 && url != "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action") {
        if (document.getElementsByTagName("h1")[0].innerText == "Service Unavailable - Zero size object" || document.getElementsByTagName("h1")[0].innerText == "Access Denied") {
            console.log("[College Board SAT Semi-Auto Registration] Website error, will retry in 3s.");
            document.write("<div id='error'>[College Board SAT Semi-Auto Registration] Website error.</div>");
            timeOutReload = 3;
            document.getElementById("error").innerText = "[College Board SAT Semi-Auto Registration] Website error, will retry after 3s."
            setInterval(function() {
                if (timeOutReload == 0) {
                    if (reloaded == false) {
                        console.log("[College Board SAT Semi-Auto Registration] Retry now.");
                        location.reload();
                        reloaded = true;
                    }
                }
                else timeOutReload--;
                document.getElementById("error").innerText = "[College Board SAT Semi-Auto Registration] Website error, will retry after " + timeOutReload + "s."
            }, 1000);
        }
    }

    switch (url) {
        case "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action":
            if (document.getElementsByClassName("s2-well-text-block").length != 0) {
                if (document.getElementsByClassName("s2-well-text-block")[0].innerText.search("There are no available registration dates for the current test year. Please check back later to register for future tests.") != -1) {
                    console.log("[College Board SAT Semi-Auto Registration] No registration date available, will retry in 30s.");
                    timeOutReload = 30;
                    document.getElementsByClassName("s2-well-text-block")[0].innerText = "No registration date available, will retry after 30s."
                    setInterval(function() {
                        if (timeOutReload == 0) {
                            if (reloaded == false) {
                                console.log("[College Board SAT Semi-Auto Registration] Retry now.");
                                location.reload();
                                reloaded = true;
                            }
                        }
                        else timeOutReload--;
                        document.getElementsByClassName("s2-well-text-block")[0].innerText = "No registration date available, will retry after " + timeOutReload + "s."
                    }, 1000);
                } else {
                    console.log("[College Board SAT Semi-Auto Registration] Registration date available.");
                    alert("[College Board SAT Semi-Auto Registration] Registration date available.");
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
                        console.log("[College Board SAT Semi-Auto Registration] No seat available in this region, will retry in 30s.");
                        document.getElementById("sortLinks").remove();
                        document.getElementById("availabilityFilter").remove();
                        timeOutReload = 30;
                        document.getElementById("testCenterSearchResults_wrapper").innerText = "No seat available in this region, will retry after 30s."
                        setInterval(function() {
                            if (timeOutReload == 0) {
                                if (reloaded == false) {
                                    console.log("[College Board SAT Semi-Auto Registration] Retry now.");
                                    location.reload();
                                    reloaded = true;
                                }
                            }
                            else timeOutReload--;
                            document.getElementById("testCenterSearchResults_wrapper").innerText = "No seat available in this region, will retry after " + timeOutReload + "s."
                        }, 1000);
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
                    console.log("[College Board SAT Semi-Auto Registration] Seat available.");
                    alert("[College Board SAT Semi-Auto Registration] Seat available.");
                }
            } else {
                if (document.getElementById("newCenterInfo") == null) {
                    console.log("[College Board SAT Semi-Auto Registration] Please select another country.");
                    alert("[College Board SAT Semi-Auto Registration] Please select another country.");
                }
            }
            break;
        case "https://nsat.collegeboard.org/errors/down.html":
            console.log("[College Board SAT Semi-Auto Registration] Website down, will retry in 30s.");
            timeOutReload = 30;
            document.getElementsByClassName("cb-alert-heading")[0].getElementsByTagName("p")[0].innerText = "Website down, will retry after 30s."
            setInterval(function() {
                if (timeOutReload == 0) {
                    if (reloaded == false) {
                        console.log("[College Board SAT Semi-Auto Registration] Retry now.");
                        location.href = "https://nsat.collegeboard.org/satweb/satHomeAction.action";
                        reloaded = true;
                    }
                }
                else timeOutReload--;
                document.getElementsByClassName("cb-alert-heading")[0].getElementsByTagName("p")[0].innerText = "Website down, will retry after " + timeOutReload + "s."
            }, 1000);
            break;
    }
})();
