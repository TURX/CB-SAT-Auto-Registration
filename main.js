// ==UserScript==
// @name         College Board SAT Semi-Auto Registration
// @namespace    https://github.com/TURX/CB-SAT-Auto-Registration
// @version      1.13
// @description  automatically complete several steps of SAT registration
// @author       TURX
// @match        https://nsat.collegeboard.org/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

function requestPermission() {
    while (Notification.permission != "granted") {
        Notification.requestPermission();
        alert("Please grant the notification permission to use College Board SAT Semi-Auto Registration.");
    }
}

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

function play(url, count) {
    return new Promise(function(resolve) {
        var m = new Audio(url);
        m.play();
        m.addEventListener("ended", function (){
            if (count > 1) {
                count--;
                m.play();
            } else {
                resolve();
            }
        });
    });
}

function notify(content, emergency, ifAlert) {
    return new Promise(async function(resolve) {
        console.log("[College Board SAT Semi-Auto Registration] " + content);
        document.getElementsByClassName("s2-page-title")[0].innerText = content;
        new Notification(content, {body: "College Board SAT Semi-Auto Registration Notification"});
        if (emergency) {
            await play("https://www.otosozai.com/snd/se/2/se_ymd05.ogg", 10, content);
        } else {
            await play("https://www.otosozai.com/snd/se/2/se_ymd05.ogg", 3, content);
        }
        if (ifAlert) alert(content);
        return resolve();
    });
}

async function selectCenter() {
    await notify("Seat available.", true, false);
    while (document.getElementsByClassName("selectCenter").length == 0) {
        document.getElementById("testCenterSearchResults_next").click();
    }
    document.getElementsByClassName("selectCenter")[0].click();
}

async function backHomeUnheld() {
    await notify("Registration time limit exceeded.", true, true);
    location.href = "https://nsat.collegeboard.org/satweb/satHomeAction.action";
}

function startSettings() {
    if (confirm("Are you sure that you want to start settings?")) {
        alert("Instruction:\nUse OK and Cancel buttons to select.\nTo enable all features, select OK, Cancel * 5, OK, Cancel * 3, OK, Cancel.");
        GM_setValue("cbsatar-agreeTerms", confirm("Do you agree to the terms of the College Board?"));
        if (!GM_getValue("cbsatar-agreeTerms", false)) {
            alert("Please agree to the terms of the College Board to use College Board SAT Semi-Auto Registration.");
            return;
        }
        GM_setValue("cbsatar-start", confirm("Do you want to manually continue to fill the personal information from the initial page?"));
        GM_setValue("cbsatar-personalInfo", confirm("Do you want to fill the personal information?"));
        GM_setValue("cbsatar-terms", confirm("Do you want to manually accept the terms?"));
        GM_setValue("cbsatar-dates", confirm("Do you want to manually check if any registration date is available?"));
        GM_setValue("cbsatar-tcselect", confirm("Do you want to manually select a test center and go to the next page?"));
        if (!GM_getValue("cbsatar-tcselect", true)) {
            GM_setValue("cbsatar-prefer", confirm("Do you prefer a new test center?"));
            if (GM_getValue("cbsatar-prefer", true)) {
                GM_setValue("cbsatar-seats", confirm("Do you want to manually check if any seat is available in the region you selected?"));
            } else {
                GM_setValue("cbsatar-seats", true);
            }
        }
        GM_setValue("cbsatar-photo", confirm("Do you want to upload a new photo?"));
        GM_setValue("cbsatar-practice", confirm("Do you want to buy practice materials?"));
        GM_setValue("cbsatar-held", confirm("Do you want to be notified during the seat is held?"));
        GM_setValue("cbsatar-down", confirm("Do you want to manually refresh when the website is down?"));
        alert("Congratulations:\nThe settings are completed. Enjoy!");
    }
}

(function() {
    'use strict';

    var url = window.location.href.substr(0, window.location.href.length - window.location.search.length);
    var error = false;
    console.log("[College Board SAT Semi-Auto Registration] Enabled, current URL: " + url);

    requestPermission();

    if (!GM_getValue("cbsatar-agreeTerms", false)) {
        error = true;
    }

    if (!error) if (document.getElementsByTagName("h1").length != 0 && url != "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action") {
        if (document.getElementsByTagName("h1")[0].innerText == "Service Unavailable - Zero size object" || document.getElementsByTagName("h1")[0].innerText == "Access Denied") {
            error = true;
            document.write("<div id='error'>[College Board SAT Semi-Auto Registration] Website error.</div>");
            countdown(3, document.getElementById("error"), "Website error");
        }
    }

    if (url == "https://nsat.collegeboard.org/satweb/satHomeAction.action") {
        console.log("[College Board SAT Semi-Auto Registration] Homepage.");
        var openSettingsLi = document.createElement("li");
        var openSettingsA = document.createElement("a");
        openSettingsA.innerText = "Auto Registration Settings";
        openSettingsA.addEventListener("click", startSettings);
        openSettingsLi.appendChild(openSettingsA);
        document.getElementsByClassName("cb-desktop-navigation")[0].children[0].children[0].children[1].appendChild(openSettingsLi);
    }

    if (!error) switch (url) {
        case "https://nsat.collegeboard.org/satweb/processMySatAction.action":
            if (!GM_getValue("cbsatar-start", true)) {
                console.log("[College Board SAT Semi-Auto Registration] Go to the next step.");
                if (typeof newRegistration == "function") newRegistration('', 'initRegistration', '');
                document.getElementById("continue").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/viewSatTicketID.action":
            if (!GM_getValue("cbsatar-personalInfo", true)) {
                console.log("[College Board SAT Semi-Auto Registration] Go to the next step.");
                document.getElementById("continue").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/sdqDemographics.action":
            if (!GM_getValue("cbsatar-personalInfo", true)) {
                console.log("[College Board SAT Semi-Auto Registration] Skip to the next step.");
                document.getElementById("updateLater").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/viewSatTermsAndConditions.action":
            if (!GM_getValue("cbsatar-terms", true)) {
                console.log("[College Board SAT Semi-Auto Registration] Check to agree the terms and go to the next step.");
                $("#agreeTerms").prop("checked", true);
                document.getElementById("continue").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action":
        case "https://nsat.collegeboard.org/satweb/registration/viewTestAndDateAction.action":
            if (!GM_getValue("cbsatar-dates", true)) {
                if (document.getElementsByClassName("s2-well-text-block").length != 0) {
                    if (document.getElementsByClassName("s2-well-text-block")[0].innerText.search("There are no available registration dates for the current test year. Please check back later to register for future tests.") != -1) {
                        countdown(30, document.getElementsByClassName("s2-well-text-block")[0], "No registration date available")
                    } else {
                        notify("Registration date available.", true, true);
                    }
                }
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/updateTestAndDateAction.action":
        case "https://nsat.collegeboard.org/satweb/registration/selectTestCenterAction.action":
            if (document.getElementsByClassName("s2-h2")[1] != null) {
                if (document.getElementsByClassName("s2-h2")[1].innerText == "Your Test Center") {
                    if (!GM_getValue("cbsatar-prefer", true)) {
                        if (document.getElementById("previousTestCenter") != null && document.getElementById("seatAvailable") != null) {
                            if (document.getElementById("previousTestCenter").checked == true && document.getElementById("seatAvailable").innerText == "Seat Available") {
                                document.getElementById("continue").click();
                            } else {
                                notify("Your previous test center is not available.", false, true);
                            }
                        }
                    } else {
                        if (document.getElementById("newTestCenter") != null && document.getElementById("newSeatAvailable") != null) {
                            if (document.getElementById("newTestCenter").checked == true && document.getElementById("newSeatAvailable").innerText == "Seat Available") {
                                document.getElementById("continue").click();
                            } else {
                                notify("This new test center is not available.", false, true);
                            }
                            break;
                        } else if (!GM_getValue("cbsatar-seats", true)) {
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
                                            document.getElementById("testCenterSearchResults_next").click();
                                        }
                                        for (i = 1; i < document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr").length; i++) {
                                            console.log("[College Board SAT Semi-Auto Registration] Code: " + document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr")[i].getElementsByTagName("td")[2].getElementsByTagName("a")[0].getAttribute("data-code") + "; Name: " + document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr")[i].getElementsByTagName("td")[0].innerText)
                                        }
                                    }
                                } else {
                                    selectCenter();
                                }
                            } else {
                                if (document.getElementById("newCenterInfo") == null) {
                                    notify("Please select another country and search again.", false, true);
                                }
                            }
                        }
                    }
                } else if (document.getElementById("s2-uploadPhotoButton") != null) {
                    if (!GM_getValue("cbsatar-photo", true)) {
                        console.log("[College Board SAT Semi-Auto Registration] Skip photo upload.");
                        document.getElementById("s2-continueButton").click();
                    }
                }
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/commitPhotoSelectionAction.action":
            if (!GM_getValue("cbsatar-practice", true)) {
                document.getElementById("continue").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/selectPractice.action":
            if (GM_getValue("cbsatar-held", false)) {
                if (document.getElementById("seatHeldFor-warning") != null) {
                    if (document.getElementById("seatHeldFor-warning").innerText == "Unfortunately, you have exceeded your registration time limit and your test center reservation has been released. Please re-select a test center and complete your registration.") {
                        backHomeUnheld();
                    } else if (document.getElementById("seatHeldFor-warning").innerText == "Your test center selection has been reserved. You have five minutes to complete your registration. After five minutes, your test center reservation will be released and you will be required to re-select a test center.") {
                        notify("You have less than 5 minutes to finish the registration.");
                    } else {
                        notify(document.getElementById("seatHeldFor-warning").innerText, true, false);
                    }
                    setInterval(function() {
                        if (document.getElementById("seatHeldFor-warning").innerText == "Unfortunately, you have exceeded your registration time limit and your test center reservation has been released. Please re-select a test center and complete your registration.") {
                            backHomeUnheld();
                        } else if (document.getElementById("seatHeldFor-warning").innerText == "Your test center selection has been reserved. You have five minutes to complete your registration. After five minutes, your test center reservation will be released and you will be required to re-select a test center.") {
                            notify("You have less than 5 minutes to finish the registration.");
                        } else {
                            notify(document.getElementById("seatHeldFor-warning").innerText, true, false);
                        }
                    }, 60000);
                }
            }
            break;
        case "https://nsat.collegeboard.org/errors/down.html":
            if (!GM_getValue("cbsatar-down", true)) {
                countdown(30, document.getElementsByClassName("cb-alert-heading")[0].getElementsByTagName("p")[0], "Website down", "https://nsat.collegeboard.org/satweb/satHomeAction.action");
            }
            break;
    }
})();
