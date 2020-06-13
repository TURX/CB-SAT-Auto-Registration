// ==UserScript==
// @name         College Board SAT Semi-Auto Registration
// @namespace    https://github.com/TURX/CB-SAT-Auto-Registration
// @version      26
// @description  Your helper in College Board SAT registration
// @author       TURX
// @match        https://nsat.collegeboard.org/*
// @match        https://pps.collegeboard.org/*
// @match        https://account.collegeboard.org/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @run-at       document-idle
// ==/UserScript==

function getIfMobile() {
    var sUserAgent = navigator.userAgent;
    if (sUserAgent.indexOf('Android') > -1 || sUserAgent.indexOf('iPhone') > -1 || sUserAgent.indexOf('iPad') > -1 || sUserAgent.indexOf('iPod') > -1 || sUserAgent.indexOf('Symbian') > -1) {
        return true;
    }
    return false;
}

function wait(time) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() { resolve(); }, time);
    });
}

function countdown(timeoutReload, element, desc, url) {
    var reloaded = false;
    console.log("[College Board SAT Semi-Auto Registration] " + desc + ", will retry in " + timeoutReload + "s.");
    element.innerText = desc + ", will retry after " + timeoutReload + "s.";
    element.scrollIntoView();
    setInterval(function() {
        if (timeoutReload == 0) {
            if (reloaded == false) {
                console.log("[College Board SAT Semi-Auto Registration] Retry now.");
                if (url == undefined) location.reload();
                else location.href = url;
                reloaded = true;
            }
        }
        else timeoutReload--;
        element.innerText = desc + ", will retry after " + timeoutReload + "s."
    }, 1000);
}

var stopPlay = false;

function play(url, count) {
    return new Promise(function(resolve, reject) {
        var m = new Audio(url);
        var p = m.play();
        p.catch(error => {
            alert("Please grant the sound permission for https://nsat.collegeboard.org/, https://pps.collegeboard.org/, and https://account.collegeboard.org/ to use College Board SAT Semi-Auto Registration.");
        })
        m.addEventListener("ended", function (){
            if (count > 1 || count == -1) {
                if (count != -1) count--;
                if (count == -1 && stopPlay == true) {
                    resolve();
                } else {
                    p = m.play();
                }
                p.catch(error => {
                    alert("Please grant the sound permission for https://nsat.collegeboard.org/, https://pps.collegeboard.org/, and https://account.collegeboard.org/ to use College Board SAT Semi-Auto Registration.");
                })
            } else {
                resolve();
            }
        });
        m.addEventListener('error', ()=>{
            alert("Please grant the sound permission for https://nsat.collegeboard.org/, https://pps.collegeboard.org/, and https://account.collegeboard.org/ to use College Board SAT Semi-Auto Registration.");
        });
    });
}

function notify(content, emergency, ifAlert, ifTitle) {
    return new Promise(async function(resolve) {
        console.log("[College Board SAT Semi-Auto Registration] " + content);
        if (ifTitle) document.getElementsByClassName("s2-page-title")[0].innerText = content;
        GM_notification({
            text: content,
            title: "College Board SAT Semi-Auto Registration Notification",
            highlight: true,
            silent: false,
            timeout: 0
        });
        stopPlay = false;
        if (emergency) {
            play("https://github.com/TURX/CB-SAT-Auto-Registration/raw/master/res/se_ymd05.wav", -1, content);
            await wait(10000);
        } else {
            await play("https://github.com/TURX/CB-SAT-Auto-Registration/raw/master/res/se_ymd05.wav", 3, content);
            if (ifAlert) alert(content);
        }
        return resolve();
    });
}

function selectItemByValue(element, value) {
    for (var i = 0; i < element.options.length; i++) {
        if (element.options[i].value === value) {
            element.selectedIndex = i;
            break;
        }
    }
}

async function selectCenter() {
    await notify("Seat available.", true, false, true);
    while (document.getElementsByClassName("selectCenter").length == 0) {
        document.getElementById("testCenterSearchResults_next").click();
    }
    document.getElementsByClassName("selectCenter")[0].click();
    document.getElementById("modalOKBtn").click();
    // document.getElementById("id-messageRegEPIStudy-yes-button").click();
}

async function confirmCenter() {
    await notify("This test center is available.", true, false, true);
    document.getElementById("continue").click();
}

async function heldWarning() {
    if (document.getElementById("seatHeldFor-warning").innerText == "Unfortunately, you have exceeded your registration time limit and your test center reservation has been released. Please re-select a test center and complete your registration.") {
        backHomeUnheld();
    } else if (document.getElementById("seatHeldFor-warning").innerText == "Your test center selection has been reserved. You have five minutes to complete your registration. After five minutes, your test center reservation will be released and you will be required to re-select a test center.") {
        await notify("You have less than 5 minutes to finish the registration.", true, false, true);
    } else {
        await notify(document.getElementById("seatHeldFor-warning").innerText, true, false, true);
    }
}

async function backHomeUnheld() {
    await notify("Registration time limit exceeded.", true, true, true);
    location.href = "https://nsat.collegeboard.org/satweb/satHomeAction.action";
}

async function timeoutBack() {
    await notify("The payment session has timed out.", true, false, false);
    document.getElementsByClassName("btn")[0].click();
}

async function confirmPay() {
    await notify("You are about to pay for the new SAT test. Good luck!", true, false, false);
    document.getElementsByName("submit")[0].click();
    setTimeout(function() {
        if (document.getElementsByTagName("h2")[0].innerText == "Errors") {
            notify("The payment information is invalid.", true, true, false);
        }
    }, 1000);
}

function startSettings() {
    if (confirm("Press OK to start settings, or press cancel to review settings.")) {
        alert("Use OK and Cancel buttons to select and the input field of the prompt window to type.");
        GM_setValue("cbsatar-agreeTerms", confirm("Do you agree to the terms of the College Board?"));
        if (!GM_getValue("cbsatar-agreeTerms", false)) {
            alert("Please agree to the terms of the College Board to use College Board SAT Semi-Auto Registration.");
            return;
        }
        GM_setValue("cbsatar-login", confirm("Do you want to automaically log in your CB account?"));
        if (GM_getValue("cbsatar-login", false)) {
            GM_setValue("cbsatar-username", prompt("Please fill the username of your CB account:", GM_getValue("cbsatar-username", "")));
            GM_setValue("cbsatar-password", prompt("Please fill the password of your CB account:", GM_getValue("cbsatar-password", "")));
        }
        GM_setValue("cbsatar-start", confirm("Do you want to automaically continue to fill the personal information from the initial page?"));
        GM_setValue("cbsatar-personalInfo", confirm("Do you want to skip filling the personal information?"));
        GM_setValue("cbsatar-terms", confirm("Do you want to automatically accept the terms?"));
        GM_setValue("cbsatar-dates", confirm("Do you want to automaically check if any registration date is available?"));
        GM_setValue("cbsatar-prefer", confirm("Do you prefer a new test center?"));
        if (GM_getValue("cbsatar-prefer", true)) {
            GM_setValue("cbsatar-tcselect", confirm("Do you want to skip selecting a test center and go to the next page?"));
            GM_setValue("cbsatar-enable-preferSelect", confirm("Do you want to add more condition for Search Result Tables?"));
            if (GM_getValue("cbsatar-enable-preferSelect", false)) {
                GM_setValue("cbsatar-preferSelect", prompt("What condition do you need more? (e.g: BANGKOK)", GM_getValue("cbsatar-preferSelect", "BANGKOK")));
            }
            GM_setValue("cbsatar-seats", confirm("Do you want to automaically check if any seat is available in the region you selected?"));
        } else {
            GM_setValue("cbsatar-enable-preferSelect", false);
            GM_setValue("cbsatar-seats", false);
        }
        GM_setValue("cbsatar-photo", confirm("Do you want to skip uploading a new photo?"));
        GM_setValue("cbsatar-practice", confirm("Do you want to skip buying practice materials?"));
        GM_setValue("cbsatar-pay", confirm("Do you want to automatically pay for the test?"));
        if (GM_getValue("cbsatar-pay", false)) {
            GM_setValue("cbsatar-held", false);
            GM_setValue("cbsatar-address1", prompt("Please fill the first line of your address (in 30 characters):", GM_getValue("cbsatar-address1", "")));
            GM_setValue("cbsatar-cardType", prompt("Please fill the number of type of your credit card:\n(0: None (unable to process), 1: Discover, 2: Visa, 3: MasterCard, 4: American Express, 5: JCB)", GM_getValue("cbsatar-cardType", "3")));
            GM_setValue("cbsatar-cardNum", prompt("Please fill the number of your credit card:", GM_getValue("cbsatar-cardNum", "")));
            GM_setValue("cbsatar-expireMonth", prompt("Please fill the month of expire of your credit card (1-12):\nFor example, type 9 for September.", GM_getValue("cbsatar-expireMonth", "0")));
            GM_setValue("cbsatar-expireYear", prompt("Please fill the year of expire of your credit card using the last two digits (YY):\nFor example, type 21 for 2021.", GM_getValue("cbsatar-expireYear", "0")));
            GM_setValue("cbsatar-securityCode", prompt("Please fill the security code of your credit card:", GM_getValue("cbsatar-securityCode", "")));
        } else {
            GM_setValue("cbsatar-held", confirm("Do you want to be notified during the seat is held?"));
        }
        GM_setValue("cbsatar-down", confirm("Do you want to automaically refresh when the website is down?"));
        notify("You are set for main page if you have the sound permission allowed.", false, true, false);
        alert("Congratulations:\nThe settings are completed. Enjoy!");
    } else {
        var review = "Settings - College Board SAT Semi-Auto Registration\n\n";
        review += "Agree terms of College Board: " + GM_getValue("cbsatar-agreeTerms", false) + "\n";
        review += "Auto login: " + GM_getValue("cbsatar-login", false) + "\n";
        review += "CB username: " + GM_getValue("cbsatar-username", "") + "\n";
        review += "CB password: " + GM_getValue("cbsatar-password", "") + "\n";
        review += "Skip start page: " + GM_getValue("cbsatar-start", false) + "\n";
        review += "Skip personal information: " + GM_getValue("cbsatar-personalInfo", false) + "\n";
        review += "Skip terms: " + GM_getValue("cbsatar-terms", false) + "\n";
        review += "Check dates: " + GM_getValue("cbsatar-dates", false) + "\n";
        review += "Auto select test center: " + GM_getValue("cbsatar-tcselect", false) + "\n";
        review += "Prefer a new test center: " + GM_getValue("cbsatar-prefer", false) + "\n";
        review += "Conditioned Selection: " + GM_getValue("cbsatar-enable-preferSelect", false) + "\n";
        review += "Condition: " + GM_getValue("cbsatar-preferSelect", "None") + "\n";
        review += "Auto find seat: " + GM_getValue("cbsatar-seats", false) + "\n";
        review += "Skip practice materials: " + GM_getValue("cbsatar-practice", true) + "\n";
        review += "Auto pay: " + GM_getValue("cbsatar-pay", false) + "\n";
        review += "Notify when held: " + GM_getValue("cbsatar-held", false) + "\n";
        review += "Address 1: " + GM_getValue("cbsatar-address1", "") + "\n";
        review += "Card type: " + GM_getValue("cbsatar-cardType", 3) + "\n";
        review += "Card number: " + GM_getValue("cbsatar-cardNum", "") + "\n";
        review += "Expire month: " + GM_getValue("cbsatar-expireMonth", 0) + "\n";
        review += "Expire year: " + GM_getValue("cbsatar-expireYear", 0) + "\n";
        review += "Security code: " + GM_getValue("cbsatar-securityCode", "") + "\n";
        review += "Auto refresh when down: " + GM_getValue("cbsatar-down", false) + "\n";
        console.log(review);
        alert(review);
    }
}

function main() {
    var url = window.location.href.substr(0, window.location.href.length - window.location.search.length);
    var error = false;
    console.log("[College Board SAT Semi-Auto Registration] Enabled, current URL: " + url);

    if (!GM_getValue("cbsatar-agreeTerms", false)) {
        error = true;
    }

    document.addEventListener("mousemove", function() {
        if (!stopPlay) stopPlay = true;
    });

    if (!error && document.getElementsByTagName("h1").length != 0 && url != "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action") {
        if (document.getElementsByTagName("h1")[0].innerText == "Service Unavailable - Zero size object" || document.getElementsByTagName("h1")[0].innerText == "Access Denied") {
            error = true;
            document.write("<div id='error'>[College Board SAT Semi-Auto Registration] Website error.</div>");
            countdown(3, document.getElementById("error"), "Website error");
        }
    }

    if (url == "https://nsat.collegeboard.org/satweb/satHomeAction.action") {
        console.log("[College Board SAT Semi-Auto Registration] Homepage.");
        var openSettingsLi1 = document.createElement("li");
        var openSettingsA = document.createElement("a");
        openSettingsA.innerText = "Auto Registration Settings";
        openSettingsA.addEventListener("click", startSettings);
        openSettingsLi1.appendChild(openSettingsA);
        document.getElementsByClassName("cb-desktop-navigation")[0].children[0].children[0].children[1].appendChild(openSettingsLi1);
        var openSettingsLi2 = openSettingsLi1.cloneNode(true);
        openSettingsLi2.children[0].addEventListener("click", startSettings);
        document.getElementsByClassName("cb-mobile-navigation")[0].children[1].children[0].children[0].appendChild(openSettingsLi2);
    }

    if (!error) switch (url) {
        case "https://account.collegeboard.org/login/login":
            if (GM_getValue("cbsatar-login", false)) {
                console.log("[College Board SAT Semi-Auto Registration] Login.");
                document.getElementById("username").value = GM_getValue("cbsatar-username", "");
                document.getElementById("password").value = GM_getValue("cbsatar-password", "");
                console.log("[College Board SAT Semi-Auto Registration] Username: " + document.getElementById("username").value);
                console.log("[College Board SAT Semi-Auto Registration] Password: " + document.getElementById("password").value);
                document.getElementsByClassName("btn")[0].disabled = false;
                document.getElementsByClassName("btn")[0].click();
            }
            break;
        case "https://account.collegeboard.org/login/authenticateUser":
            if (GM_getValue("cbsatar-login", false)) {
                if (document.getElementsByClassName("cb-error-msg").length > 0) {
                    notify("The login information is invalid.", true, true, false);
                }
            }
            break;
        case "https://nsat.collegeboard.org/satweb/processMySatAction.action":
            if (GM_getValue("cbsatar-start", false)) {
                console.log("[College Board SAT Semi-Auto Registration] Go to the next step.");
                if (typeof newRegistration == "function") newRegistration('', 'initRegistration', '');
                document.getElementById("continue").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/viewSatTicketID.action":
            if (GM_getValue("cbsatar-personalInfo", false)) {
                console.log("[College Board SAT Semi-Auto Registration] Go to the next step.");
                document.getElementById("continue").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/sdqDemographics.action":
            if (GM_getValue("cbsatar-personalInfo", false)) {
                console.log("[College Board SAT Semi-Auto Registration] Skip to the next step.");
                document.getElementById("updateLater").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/viewSatTermsAndConditions.action":
            if (GM_getValue("cbsatar-terms", false)) {
                console.log("[College Board SAT Semi-Auto Registration] Check to agree the terms and go to the next step.");
                document.getElementById("agreeTerms").click();
                document.getElementById("continue").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action":
        case "https://nsat.collegeboard.org/satweb/registration/viewTestAndDateAction.action":
            if (GM_getValue("cbsatar-dates", false)) {
                if (document.getElementsByClassName("s2-well-text-block").length != 0) {
                    if (document.getElementsByClassName("s2-well-text-block")[0].innerText.search("There are no available registration dates for the current test year. Please check back later to register for future tests.") != -1) {
                        countdown(30, document.getElementsByClassName("s2-well-text-block")[0], "No registration date available")
                    } else {
                        notify("Registration date available.", true, true, true);
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
                                if (GM_getValue("cbsatar-tcselect", false)) confirmCenter();
                                else notify("This test center is available.", true, true, true);
                            } else {
                                notify("Your previous test center is not available.", false, true, true);
                            }
                        }
                    } else {
                        if (document.getElementById("newTestCenter") != null && document.getElementById("newSeatAvailable") != null) {
                            if (document.getElementById("newTestCenter").checked == true && document.getElementById("newSeatAvailable").innerText == "Seat Available") {
                                if (GM_getValue("cbsatar-tcselect", false)) confirmCenter();
                                else notify("This test center is available.", true, true, true);
                            } else {
                                notify("This new test center is not available.", false, true);
                            }
                            break;
                        } else if (GM_getValue("cbsatar-seats", false)) {
                            console.log("[College Board SAT Semi-Auto Registration] Finding seat...");
                            if (document.getElementById("testCenterSearchResults_wrapper") != null) {
                                var seatAvailable = false;
                                console.log("[College Board SAT Semi-Auto Registration] Test Center Information:");
                                while ($("#testCenterSearchResults_next").hasClass("disabled") == false) {
                                    console.log(document.getElementById("testCenterSearchResults_wrapper").innerText);
                                    if (document.getElementById("testCenterSearchResults_wrapper").innerText.search("Seat Available") != -1) {
                                        if (GM_getValue("cbsatar-enable-preferSelect", false) && document.getElementById("testCenterSearchResults_wrapper").innerText.search(GM_getValue("cbsatar-preferSelect", "BANGKOK")) != -1) {
                                            var tdTags = document.getElementsByTagName("td");
                                            var searchText = GM_getValue("cbsatar-preferSelect", "BANGKOK");
                                            var found;
                                            for (var i = 0; i < tdTags.length; i++) {
                                                if (tdTags[i].innerText.search(searchText) != -1) {
                                                    found = tdTags[i];
                                                    if ($(found).closest('td').next('td').text() == "Seat Available") {
                                                        seatAvailable = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        } else {
                                            seatAvailable = true;
                                            break;
                                        }
                                    }
                                    document.getElementById("testCenterSearchResults_next").click();
                                }
                                console.log(document.getElementById("testCenterSearchResults_wrapper").innerText);
                                if (document.getElementById("testCenterSearchResults_wrapper").innerText.search("Seat Available") != -1) {
                                    if (GM_getValue("cbsatar-enable-preferSelect", false) && document.getElementById("testCenterSearchResults_wrapper").innerText.search(GM_getValue("cbsatar-preferSelect", "BANGKOK")) != -1) {
                                        console.log("[College Board SAT Semi-Auto Registration] Prefer Select: " + GM_getValue("cbsatar-preferSelect", "BANGKOK"));
                                        var tdTags = document.getElementsByTagName("td");
                                        var searchText = GM_getValue("cbsatar-preferSelect", "BANGKOK");
                                        var found;
                                        for (var i = 0; i < tdTags.length; i++) {
                                            if (tdTags[i].innerText.search(searchText) != -1) {
                                                found = tdTags[i];
                                                if ($(found).closest('td').next('td').text() == "Seat Available") {
                                                    seatAvailable = true;
                                                }
                                            }
                                        }
                                    } else {
                                        seatAvailable = true;
                                    }
                                }
                                if (!seatAvailable) {
                                    if (document.getElementById("testCenterSearchResults_wrapper").innerText.search("My Ideal Test Center") == -1) {
                                        try {
                                            document.getElementById("sortLinks").remove();
                                            document.getElementById("availabilityFilter").remove();
                                        } catch (e) {
                                            notify("Content error.", false, false, true);
                                        }
                                        countdown(15, document.getElementById("testCenterSearchResults_wrapper"), "No seat available in this region");
                                    } else {
                                        document.getElementById("testCenterSearchResults_first").click();
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
                                    if (GM_getValue("cbsatar-tcselect", false)) selectCenter();
                                    else notify("Seat available.", true, true, true);
                                }
                            } else {
                                if (document.getElementById("newCenterInfo") == null) {
                                    notify("Please select another country and search again.", true, true, true);
                                }
                            }
                        }
                    }
                } else if (document.getElementById("s2-uploadPhotoButton") != null) {
                    if (GM_getValue("cbsatar-photo", false)) {
                        console.log("[College Board SAT Semi-Auto Registration] Skip photo upload.");
                        document.getElementById("s2-continueButton").click();
                    }
                }
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/commitPhotoSelectionAction.action":
            if (GM_getValue("cbsatar-practice", false)) {
                document.getElementById("continue").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/selectPractice.action":
        case "https://nsat.collegeboard.org/satweb/registration/completeRegistrationCCAction.action":
            if (GM_getValue("cbsatar-pay", false)) {
                document.getElementById("continue").click();
                document.getElementById("confirmRegAgreeCheckbox").click();
                document.getElementById("confirmConfirmInfoModalButton").click();
            }
            if (GM_getValue("cbsatar-held", false)) {
                if (document.getElementById("seatHeldFor-warning") != null) {
                    heldWarning();
                    setInterval(function() {
                        heldWarning();
                    }, 60000);
                }
            }
            break;
        case "https://nsat.collegeboard.org/errors/down.html":
            if (GM_getValue("cbsatar-down", false)) {
                countdown(30, document.getElementsByClassName("cb-alert-heading")[0].getElementsByTagName("p")[0], "Website down", "https://nsat.collegeboard.org/satweb/satHomeAction.action");
            }
            break;
        case "https://pps.collegeboard.org/":
            setTimeout(function() {
                if (document.getElementsByTagName("h2")[0] != null) {
                    if (document.getElementsByTagName("h2")[0].innerText == "Session has timed out") {
                        timeoutBack();
                    }
                    if (document.getElementsByTagName("h2")[0].innerText == "Make a Payment") {
                        if (window.location.search.length == 0) {
                            notify("You are set for payment page if you have the sound permission allowed.", false, true, false);
                        } else {
                            notify("The payment is invalid.", true, true, false);
                            history.back(-1);
                        }
                    }
                    if (document.getElementsByTagName("h2")[0].innerText == "Payment Method") {
                        if (GM_getValue("cbsatar-pay", false)) {
                            document.getElementById("paymentCreditCard").click();
                            document.getElementsByName("submit")[0].click();
                            setTimeout(function() {
                                document.getElementById("address1").value = GM_getValue("cbsatar-address1", "");
                                document.getElementById("address1").blur();
                                document.getElementById("cards").options.selectedIndex = GM_getValue("cbsatar-cardType", 3);
                                document.getElementById("cards").blur();
                                document.getElementById("creditCardNumber").value = GM_getValue("cbsatar-cardNum", "");
                                document.getElementById("creditCardNumber").blur();
                                document.getElementById("expireMonth").options.selectedIndex = GM_getValue("cbsatar-expireMonth", 0);
                                document.getElementById("expireMonth").blur();
                                selectItemByValue(document.getElementById("expireYear"), GM_getValue("cbsatar-expireYear", 0));
                                document.getElementById("expireYear").blur();
                                document.getElementById("securityCode").value = GM_getValue("cbsatar-securityCode", "");
                                document.getElementById("securityCode").blur();
                                setTimeout(function() {
                                    if (document.getElementsByName("submit")[0].disabled) {
                                        notify("The payment information is invalid.", true, true, false);
                                    } else {
                                        confirmPay();
                                    }
                                });
                            }, 1000);
                        }
                    }
                }
            }, 3000);
            break;
    }
}

(function() {
    'use strict';

    try {
        main();
    } catch (e) {
        console.log("[College Board SAT Semi-Auto Registration] Error: " + e);
        notify("Error occurred.", true, false, false);
    }
})();
