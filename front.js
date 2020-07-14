// ==UserScript==
// @author       TURX
// @connect      *
// @description  Your helper in College Board SAT registration
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @match        https://account.collegeboard.org/*
// @match        https://nsat.collegeboard.org/*
// @match        https://pps.collegeboard.org/*
// @name         College Board SAT Auto Registration
// @namespace    https://github.com/TURX/CB-SAT-Auto-Registration
// @run-at       document-idle
// @supportURL   https://github.com/TURX/CB-SAT-Auto-Registration/issues
// @updateURL    https://raw.githubusercontent.com/TURX/CB-SAT-Auto-Registration/master/front.js
// @version      37
// ==/UserScript==

var url;

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

function log(content) {
    console.log("[College Board SAT Auto Registration] " + content);
    var promise = send("http://" + GM_getValue("cbsatar-backend", "localhost") + ":8080/log", {
        "url": url,
        "content": content
    });
    promise.catch((e) => {
        console.log("Backend log error: " + e);
    });
}

function logp(content) {
    console.log(content);
}

function countdown(timeoutReload, element, desc, url) {
    var reloaded = false;
    if (GM_getValue("cbsatar-brute", false)) {
        log(desc + ", will retry immediately (brute mode).");
        element.innerText = desc + ", will retry immediately (brute mode).";
        element.scrollIntoView();
        if (url == undefined) location.reload();
        else location.href = url;
    } else {
        log(desc + ", will retry in " + timeoutReload + "s.");
        element.innerText = desc + ", will retry after " + timeoutReload + "s.";
        element.scrollIntoView();
        setInterval(function() {
            if (timeoutReload == 0) {
                if (reloaded == false) {
                    log("Retry now.");
                    if (url == undefined) location.reload();
                    else location.href = url;
                    reloaded = true;
                }
            }
            else timeoutReload--;
            element.innerText = desc + ", will retry after " + timeoutReload + "s."
        }, 1000);
    }
}

function send(url, content) {
    return new Promise(async function(resolve, reject) {
        if (content) {
            url += "?";
            for (var k in content) {
                url += k + "=" + encodeURIComponent(content[k]) + "&";
            }
            url = url.slice(0, -1);
        }
        console.log("[College Board SAT Auto Registration] Ready to open " + url);
        await GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onerror: function() {
                reject();
            },
            onload: function(data) {
                if (data.responseText == "completed")
                    resolve();
                else
                    reject();
            }
        });
    });
}

function sendg(url, content) {
    return new Promise(async function(resolve, reject) {
        if (content) {
            url += "?";
            for (var k in content) {
                url += k + "=" + encodeURIComponent(content[k]) + "&";
            }
            url = url.slice(0, -1);
        }
        console.log("[College Board SAT Auto Registration] Ready to open " + url);
        await GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onerror: function() {
                reject();
            },
            onload: function(data) {
                resolve();
                return data.responseText;
            }
        });
    });
}

var stopPlay = false;

async function play(url, count, content) {
    return new Promise(async function(resolve, reject) {
        try {
            await send("http://" + GM_getValue("cbsatar-backend", "localhost") + ":8080/startPlay", {
                "count": count,
                "reason": content,
                "file": url
            });
        } catch (e) {
            log(e);
            if (count >= 0) await browserPlay(url, count);
            else browserPlay(url, count);
        }
        resolve();
    });
}

function browserPlay(url, count) {
    return new Promise(function(resolve, reject) {
        url = "https://github.com/TURX/CB-SAT-Auto-Registration/raw/master/res/" + url;
        var m = new Audio(url);
        var p = m.play();
        p.catch(error => {
            alert("Please grant the sound permission for https://nsat.collegeboard.org/, https://pps.collegeboard.org/, and https://account.collegeboard.org/ to use College Board SAT Auto Registration.");
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
                    alert("Please grant the sound permission for https://nsat.collegeboard.org/, https://pps.collegeboard.org/, and https://account.collegeboard.org/ to use College Board SAT Auto Registration.");
                })
            } else {
                resolve();
            }
        });
        m.addEventListener('error', () => {
            alert("Please grant the sound permission for https://nsat.collegeboard.org/, https://pps.collegeboard.org/, and https://account.collegeboard.org/ to use College Board SAT Auto Registration.");
        });
    });
}

async function notify(content, loop, ifAlert, ifTitle, emergency) {
    return new Promise(async function(resolve) {
        log(content);
        if (ifTitle) document.getElementsByClassName("s2-page-title")[0].innerText = content;
        GM_notification({
            text: content,
            title: "College Board SAT Auto Registration Notification",
            highlight: true,
            timeout: 0
        });
        stopPlay = false;
        if (loop) {
            if (emergency) {
                play("se_sud06.wav", -1, content);
            } else {
                play("se_ymd05.wav", -1, content);
                try {
                    await send("http://" + GM_getValue("cbsatar-backend", "localhost") + ":8080/test");
                } catch (e) {
                    log("Backend test error: " + e);
                    await wait(5000);
                }
            }
        } else {
            await play("se_ymd05.wav", 3, content);
            if (ifAlert) alert(content);
        }
        return resolve();
    });
}

var i;

function selectItemByValue(element, value) {
    for (i = 0; i < element.options.length; i++) {
        if (element.options[i].value === value) {
            element.selectedIndex = i;
            break;
        }
    }
}

function selectItemByText(element, text) {
    for (i = 0; i < element.options.length; i++) {
        if (element.options[i].text === text) {
            element.selectedIndex = i;
            break;
        }
    }
}

var preferSelectId;

function findTestCenter() {
    logp(document.getElementById("testCenterSearchResults_wrapper").innerText);
    if (document.getElementById("testCenterSearchResults_wrapper").innerText.search("Seat Available") != -1) {
        if (GM_getValue("cbsatar-enable-preferSelect", false) && document.getElementById("testCenterSearchResults_wrapper").innerText.search(GM_getValue("cbsatar-preferSelect", "BANGKOK")) != -1) {
            if (document.getElementsByTagName("tr").length > 1) {
                for (i = 1; i < document.getElementsByTagName("tr").length; i++) {
                    if (document.getElementsByTagName("tr")[i].children[1].innerText.search(GM_getValue("cbsatar-preferSelect", "BANGKOK")) != -1) {
                        if (document.getElementsByTagName("tr")[i].children[2].innerText.search("Seat Available") != -1) {
                            preferSelectId = document.getElementsByTagName("tr")[1].children[3].getElementsByTagName("a")[0].id;
                            return true;
                        }
                    }
                }
            }
        } else {
            return true;
        }
    }
    return false;
}

async function selectCenter() {
    await notify("Seat available.", true, false, true, true);
    while (document.getElementsByClassName("selectCenter").length == 0) {
        document.getElementById("testCenterSearchResults_next").click();
    }
    document.getElementsByClassName("selectCenter")[0].click();
    document.getElementById("modalOKBtn").click();
    // document.getElementById("id-messageRegEPIStudy-yes-button").click();
}

async function selectCenterById(id) {
    await notify("Seat available.", true, false, true, true);
    document.getElementById(id).click();
    document.getElementById("modalOKBtn").click();
}

async function confirmCenter() {
    await notify("This test center is available.", true, false, true, true);
    document.getElementById("continue").click();
}

async function heldWarning() {
    if (document.getElementById("seatHeldFor-warning").innerText == "Unfortunately, you have exceeded your registration time limit and your test center reservation has been released. Please re-select a test center and complete your registration.") {
        backHomeUnheld();
    } else if (document.getElementById("seatHeldFor-warning").innerText == "Your test center selection has been reserved. You have five minutes to complete your registration. After five minutes, your test center reservation will be released and you will be required to re-select a test center.") {
        await notify("You have less than 5 minutes to finish the registration.", true, false, true, true);
    } else {
        await notify(document.getElementById("seatHeldFor-warning").innerText, true, false, true, true);
    }
}

async function backHomeUnheld() {
    await notify("Registration time limit exceeded.", true, true, true, true);
    location.href = "https://nsat.collegeboard.org/satweb/satHomeAction.action";
}

async function timeoutBack() {
    await notify("The payment session has timed out.", true, false, false, true);
    document.getElementsByClassName("btn")[0].click();
}

async function confirmPay() {
    await notify("You are about to pay for the new SAT test. Good luck!", true, false, false, true);
    document.getElementsByName("submit")[0].click();
    setTimeout(function() {
        if (document.getElementsByTagName("h2")[0].innerText == "Errors") {
            notify("The payment information is invalid.", true, true, false, true);
        }
    }, 1000);
}

function startSettings() {
    if (confirm("Press OK to start settings, or press cancel to review settings.")) {
        alert("Use OK and Cancel buttons to select and the input field of the prompt window to type.");
        GM_setValue("cbsatar-agreeTerms", confirm("Do you agree to the terms of the College Board?"));
        if (!GM_getValue("cbsatar-agreeTerms", false)) {
            alert("Please agree to the terms of the College Board to use College Board SAT Auto Registration.");
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
        GM_setValue("cbsatar-brute", confirm("Do you want a brute mode (no refresh interval)?"));
        GM_setValue("cbsatar-autoDate", confirm("Do you want to automaically select a date?"));
        if (GM_getValue("cbsatar-autoDate", false)) {
            GM_setValue("cbsatar-preferDate", prompt("Please fill the year and the month of administration using YYYYMM format:\nFor example, 202012 for December 2020", GM_getValue("cbsatar-preferDate", "")));
            GM_setValue("cbsatar-subject", confirm("Do you want to register SAT Subject Tests?"));
            if (GM_getValue("cbsatar-subject", false)) {
                GM_setValue("cbsatar-subjectSelect", prompt("Please fill in all the subjects you want to take (up to three) using one space to seperate:\nFor example, you can fill mathLevelTwo physics\n\nAvailable choices: mathLevelOne, mathLevelTwo, chemistry, physics, biology, usHistory, worldHistory, literature, french, german, modernHebrew, spanish, italian, latin, frenchWithListening, germanWithListening, spanishWithListening, chineseWithListening, koreanWithListening, japaneseWithListening", GM_getValue("cbsatar-subjectSelect", false)));
            } else {
                GM_setValue("cbsatar-date-essay", confirm("Do you want to register SAT essay?"));
                GM_setValue("cbsatar-date-sas", confirm("Do you need the student answer service?"));
            }
            GM_setValue("cbsatar-date-feeWaiver", confirm("Do you have a fee waiver?"));
            GM_setValue("cbsatar-dates", false);
        } else {
            GM_setValue("cbsatar-dates", confirm("Do you want to automaically check if any registration date is available?"));
        }
        GM_setValue("cbsatar-selectDate", confirm("Do you want to automaically select the set date when continuing registration?"));
        GM_setValue("cbsatar-prefer", confirm("Do you prefer a new test center?"));
        if (GM_getValue("cbsatar-prefer", true)) {
            GM_setValue("cbsatar-country", confirm("Do you want to automatically select a country?"));
            if (GM_getValue("cbsatar-country", false)) {
                GM_setValue("cbsatar-countryName", prompt("Please the country name that would appear in the dropdown menu:\nFor example, Thailand.", GM_getValue("cbsatar-countryName", "None")));
            } else {
                GM_setValue("cbsatar-countryName", "None");
            }
            GM_setValue("cbsatar-enable-preferSelect", confirm("Do you want to add more condition for the address of the test center?"));
            if (GM_getValue("cbsatar-enable-preferSelect", false)) {
                GM_setValue("cbsatar-preferSelect", prompt("What condition do you need more?\nFor example: BANGKOK.", GM_getValue("cbsatar-preferSelect", "BANGKOK")));
            }
            GM_setValue("cbsatar-tcselect", confirm("Do you want to skip selecting a test center and go to the next page?"));
            GM_setValue("cbsatar-seats", confirm("Do you want to automaically check if any seat is available in the region you selected?"));
        } else {
            GM_setValue("cbsatar-enable-preferSelect", false);
            GM_setValue("cbsatar-seats", false);
        }
        GM_setValue("cbsatar-photo", confirm("Do you want to skip uploading a new photo?"));
        GM_setValue("cbsatar-practice", confirm("Do you want to skip buying practice materials?"));
        GM_setValue("cbsatar-pay", false);
        GM_setValue("cbsatar-held", confirm("Do you want to be notified during the seat is held?"));
        /*
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
        */
        GM_setValue("cbsatar-down", confirm("Do you want to automaically refresh when the website is down?"));
        GM_setValue("cbsatar-backend", prompt("Please fill the host for the backend:\nlocalhost: for no backend or backend on this PC", GM_getValue("cbsatar-backend", "localhost")))
        notify("You are set for main page if you have the sound permission allowed.", false, true, false, false);
        alert("Congratulations:\nThe settings are completed. Enjoy!");
    } else {
        var review = "Settings - College Board SAT Auto Registration (Page 1/2)\n\n";
        review += "Agree terms of College Board: " + GM_getValue("cbsatar-agreeTerms", false) + "\n";
        review += "Auto login: " + GM_getValue("cbsatar-login", false) + "\n";
        review += "CB username: " + GM_getValue("cbsatar-username", "") + "\n";
        review += "CB password: " + GM_getValue("cbsatar-password", "") + "\n";
        review += "Skip start page: " + GM_getValue("cbsatar-start", false) + "\n";
        review += "Skip personal information: " + GM_getValue("cbsatar-personalInfo", false) + "\n";
        review += "Skip terms: " + GM_getValue("cbsatar-terms", false) + "\n";
        review += "Brute mode: " + GM_getValue("cbsatar-brute", false) + "\n";
        review += "Auto select date: " + GM_getValue("cbsatar-autoDate", false) + "\n";
        review += "Check dates: " + GM_getValue("cbsatar-dates", false) + "\n";
        review += "Auto select set date: " + GM_getValue("cbsatar-selectDate", false) + "\n";
        review += "Auto select test center: " + GM_getValue("cbsatar-tcselect", false) + "\n";
        review += "Prefer a new test center: " + GM_getValue("cbsatar-prefer", true) + "\n";
        review += "Auto select country: " + GM_getValue("cbsatar-country", false) + "\n";
        review += "Country name: " + GM_getValue("cbsatar-countryName", "None") + "\n";
        review += "Conditioned Selection: " + GM_getValue("cbsatar-enable-preferSelect", false) + "\n";
        review += "Address Condition: " + GM_getValue("cbsatar-preferSelect", "None") + "\n";
        review += "Auto find seat: " + GM_getValue("cbsatar-seats", false) + "\n";
        review += "Skip practice materials: " + GM_getValue("cbsatar-practice", false) + "\n";
        // review += "Auto pay: " + GM_getValue("cbsatar-pay", false) + "\n";
        review += "Notify when held: " + GM_getValue("cbsatar-held", false) + "\n";
        console.log(review);
        alert(review);
        review = "Settings - College Board SAT Auto Registration (Page 2/2)\n\n";
        /*
        review += "Address 1: " + GM_getValue("cbsatar-address1", "") + "\n";
        review += "Card type: " + GM_getValue("cbsatar-cardType", 3) + "\n";
        review += "Card number: " + GM_getValue("cbsatar-cardNum", "") + "\n";
        review += "Expire month: " + GM_getValue("cbsatar-expireMonth", 0) + "\n";
        review += "Expire year: " + GM_getValue("cbsatar-expireYear", 0) + "\n";
        review += "Security code: " + GM_getValue("cbsatar-securityCode", "") + "\n";
        */
        review += "SAT essay: " + GM_getValue("cbsatar-date-essay", false) + "\n";
        review += "Fee waiver: " + GM_getValue("cbsatar-date-feeWaiver", false) + "\n";
        review += "Student answer service: " + GM_getValue("cbsatar-date-sas", false) + "\n";
        review += "SAT Subject Tests: " + GM_getValue("cbsatar-subject", false) + "\n";
        review += "Selected subjects: " + GM_getValue("cbsatar-subjectSelect", "") + "\n";
        review += "Auto refresh when down: " + GM_getValue("cbsatar-down", false) + "\n";
        review += "Backend host: " + GM_getValue("cbsatar-backend", "localhost");
        console.log(review);
        alert(review);
    }
}

function terminatePlay() {
    if (!stopPlay) {
        stopPlay = true;
        var promise = send("http://" + GM_getValue("cbsatar-backend", "localhost") + ":8080/stopPlay");
        promise.catch((e) => {
            log("Backend stopPlay error: " + e);
        });
    }
}

function dateCheckOtherComponents() {
    if (GM_getValue("cbsatar-date-essay", false))
        document.getElementById("essayAddOnYes").checked = true;
    else
        document.getElementById("essayAddOnNo").checked = true;
    if (GM_getValue("cbsatar-date-feeWaiver", false))
        document.getElementById("feeWaiverYes").checked = true;
    else
        document.getElementById("feeWaiverNo").checked = true;
    if (GM_getValue("cbsatar-date-sas", false))
        document.getElementById("optBuySAS").checked = true;
    else
        document.getElementById("optDeclineSAS").checked = true;
}

async function main() {
    var error = false;
    log("Enabled, current URL: " + url);

    var promise = send("http://" + GM_getValue("cbsatar-backend", "localhost") + ":8080/visit", {
        "url": url
    });
    promise.catch((e) => {
        log("Backend visit error: " + e);
    });

    document.addEventListener("mousemove", terminatePlay);
    document.addEventListener("touchstart", terminatePlay);

    if (!GM_getValue("cbsatar-agreeTerms", false)) {
        error = true;
    }

    if (!error && document.getElementsByTagName("h1").length != 0 && url != "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action") {
        if (document.getElementsByTagName("h1")[0].innerText == "Service Unavailable - Zero size object" || document.getElementsByTagName("h1")[0].innerText == "Access Denied") {
            error = true;
            document.write("<div id='error'>[College Board SAT Auto Registration] Website error.</div>");
            countdown(3, document.getElementById("error"), "Website error");
        }
    }

    if (!error)
        try {
            jQuery();
        } catch (e) {
            log("jQuery failed to load.");
            notify("jQuery failed.", false, false, false, false);
            location.reload();
        }

    if (url == "https://nsat.collegeboard.org/satweb/satHomeAction.action") {
        log("Homepage.");
        var openSettingsLi1 = document.createElement("li");
        var openSettingsA = document.createElement("a");
        openSettingsA.innerText = "Auto Registration Settings";
        openSettingsA.addEventListener("click", startSettings);
        openSettingsLi1.appendChild(openSettingsA);
        document.getElementsByClassName("cb-desktop-navigation")[0].children[0].children[0].children[1].appendChild(openSettingsLi1);
        var openSettingsLi2 = openSettingsLi1.cloneNode(true);
        openSettingsLi2.children[0].addEventListener("click", startSettings);
        document.getElementsByClassName("cb-mobile-navigation")[0].children[1].children[0].children[0].appendChild(openSettingsLi2);
    } else {
        setTimeout(function() {
            handleError("idle detected");
        }, 60000);
    }

    if (!error) switch (url) {
        case "https://account.collegeboard.org/login/login":
            if (GM_getValue("cbsatar-login", false)) {
                log("Login.");
                document.getElementById("username").value = GM_getValue("cbsatar-username", "");
                document.getElementById("password").value = GM_getValue("cbsatar-password", "");
                log("Username: " + document.getElementById("username").value);
                log("Password: " + document.getElementById("password").value);
                document.getElementsByClassName("btn")[0].disabled = false;
                document.getElementsByClassName("btn")[0].click();
            }
            break;
        case "https://account.collegeboard.org/login/authenticateUser":
            if (GM_getValue("cbsatar-login", false)) {
                if (document.getElementsByClassName("cb-error-msg").length > 0) {
                    notify("The login information is invalid.", true, true, false, false);
                }
            }
            break;
        case "https://nsat.collegeboard.org/satweb/processMySatAction.action":
            if (document.getElementsByClassName("s2-h2").length == 0) {
                if (GM_getValue("cbsatar-start", false)) {
                    log("Go to the next step.");
                    if (typeof newRegistration == "function") newRegistration('', 'initRegistration', '');
                }
            } else {
                if (GM_getValue("cbsatar-personalInfo", false)) {
                    log("Go to the next step.");
                    document.getElementById("continue").click();
                }
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/viewSatTicketID.action":
            if (GM_getValue("cbsatar-personalInfo", false)) {
                log("Go to the next step.");
                document.getElementById("continue").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/sdqDemographics.action":
            if (GM_getValue("cbsatar-personalInfo", false)) {
                log("Skip to the next step.");
                document.getElementById("updateLater").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/viewSatTermsAndConditions.action":
            if (GM_getValue("cbsatar-terms", false)) {
                log("Check to agree the terms and go to the next step.");
                document.getElementById("agreeTerms").click();
                document.getElementById("continue").click();
            }
            break;
        case "https://nsat.collegeboard.org/satweb/registration/acceptSatTermsAndConditions.action":
        case "https://nsat.collegeboard.org/satweb/registration/viewTestAndDateAction.action":
            if (document.referrer == "https://nsat.collegeboard.org/satweb/satHomeAction.action" && GM_getValue("cbsatar-selectDate", false)) {
                document.getElementById("continue").click();
            }
            else if (GM_getValue("cbsatar-dates", false)) {
                if (document.getElementsByClassName("s2-well-text-block").length != 0) {
                    if (document.getElementsByClassName("s2-well-text-block")[0].innerText.search("There are no available registration dates for the current test year. Please check back later to register for future tests.") != -1) {
                        countdown(30, document.getElementsByClassName("s2-well-text-block")[0], "No registration date available")
                    } else {
                        notify("Registration date available.", true, true, true, true);
                    }
                }
            } else if (GM_getValue("cbsatar-autoDate", false)) {
                if (GM_getValue("cbsatar-subject", false)) {
                    document.getElementById("testTypeSubjects").click();
                    while (document.getElementsByClassName("regAdmin s2-tab-link").length == 0) {
                        await new Promise(r => setTimeout(r, 500));
                    }
                    if (document.getElementById("testDateTab_" + GM_getValue("cbsatar-preferDate", ""))) {
                        document.getElementById("testDateTab_" + GM_getValue("cbsatar-preferDate", "")).children[0].click();
                        notify("Preferred date is available.", true, false, true, true);
                        await new Promise(r => setTimeout(r, 500));
                        var selectedSubjects = GM_getValue("cbsatar-subjectSelect", "").split(" ");
                        selectedSubjects.forEach(id => {
                            document.getElementById(id).click();
                        });
                        if (GM_getValue("cbsatar-date-feeWaiver", false))
                            document.getElementById("feeWaiverYes").checked = true;
                        else
                            document.getElementById("feeWaiverNo").checked = true;
                        document.getElementById("continue").click();
                    } else {
                        countdown(15, document.getElementById("testDateAndAvailability"), "The preferred date is not available");
                    }
                } else {
                    var foundDate = false;
                    document.getElementsByName("selectedTestAdminYYYYMM").forEach((v) => {
                        if (v.value == GM_getValue("cbsatar-preferDate", "")) {
                            foundDate = true;
                            v.checked = true;
                        }
                    });
                    if (foundDate) {
                        notify("Preferred date is available.", true, false, true, true);
                        dateCheckOtherComponents();
                        document.getElementById("continue").click();
                    } else {
                        countdown(15, document.getElementById("testRegistrationHeader"), "The preferred date is not available");
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
                                else notify("This test center is available.", true, true, true, true);
                            } else {
                                notify("Your previous test center is not available.", false, true, true, false);
                            }
                        }
                    } else {
                        if (document.getElementById("newTestCenter") != null && document.getElementById("newSeatAvailable") != null) {
                            if (document.getElementById("newTestCenter").checked == true && document.getElementById("newSeatAvailable").innerText == "Seat Available") {
                                if (GM_getValue("cbsatar-tcselect", false)) confirmCenter();
                                else notify("This test center is available.", true, true, true, true);
                            } else {
                                notify("This new test center is not available.", false, true, true, false);
                            }
                            break;
                        } else if (GM_getValue("cbsatar-seats", false)) {
                            if (GM_getValue("cbsatar-country", false)) {
                                var countrySelect = document.getElementById("selectCountryName");
                                log("Selected Country: " + countrySelect.options[countrySelect.selectedIndex].text);
                                if (countrySelect.options[countrySelect.selectedIndex].text != GM_getValue("cbsatar-countryName", "None") && GM_getValue("cbsatar-countryName", "None") != "None") {
                                    log("Preferred Country: " + GM_getValue("cbsatar-countryName", "None"));
                                    selectItemByText(countrySelect, GM_getValue("cbsatar-countryName", "None"));
                                    document.getElementById("searchByZipOrCountry").click();
                                }
                            }
                            log("Finding seat...");
                            var seatAvailable = false;
                            if (document.getElementById("testCenterSearchResults_wrapper") != null) {
                                log("Test Center Information:");
                                while ($("#testCenterSearchResults_next").hasClass("disabled") == false) {
                                    if (findTestCenter() == true) {
                                        seatAvailable = true;
                                        break;
                                    }
                                    document.getElementById("testCenterSearchResults_next").click();
                                }
                                if (findTestCenter() == true) {
                                    seatAvailable = true;
                                }
                                if (!seatAvailable) {
                                    if (document.getElementById("testCenterSearchResults_wrapper").innerText.search("My Ideal Test Center") == -1) {
                                        try {
                                            document.getElementById("sortLinks").remove();
                                            document.getElementById("availabilityFilter").remove();
                                        } catch (e) {
                                            notify("Content error.", false, false, true, false);
                                        }
                                        countdown(15, document.getElementById("testCenterSearchResults_wrapper"), "No seat available in this region");
                                    } else {
                                        document.getElementById("testCenterSearchResults_first").click();
                                        log("Select Ideal Test Center.");
                                        log("Test Center Information:");
                                        while ($("#testCenterSearchResults_next").hasClass("disabled") == false) {
                                            for (i = 1; i < document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr").length; i++) {
                                                log("Code: " + document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr")[i].getElementsByTagName("td")[2].getElementsByTagName("a")[0].getAttribute("data-code") + "; Name: " + document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr")[i].getElementsByTagName("td")[0].innerText)
                                            }
                                            document.getElementById("testCenterSearchResults_next").click();
                                        }
                                        for (i = 1; i < document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr").length; i++) {
                                            log("Code: " + document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr")[i].getElementsByTagName("td")[2].getElementsByTagName("a")[0].getAttribute("data-code") + "; Name: " + document.getElementById("testCenterSearchResults_wrapper").getElementsByTagName("tr")[i].getElementsByTagName("td")[0].innerText)
                                        }
                                    }
                                } else {
                                    if (GM_getValue("cbsatar-tcselect", false)) {
                                        if (GM_getValue("cbsatar-enable-preferSelect", false)) {
                                            selectCenterById(preferSelectId);
                                        } else {
                                            selectCenter();
                                        }
                                    }
                                    else notify("Seat available.", true, true, true, true);
                                }
                            } else {
                                if (document.getElementById("newCenterInfo") == null) {
                                    if (window.location.href != "https://nsat.collegeboard.org/satweb/registration/updateTestAndDateAction.action" || !GM_getValue("cbsatar-country", false)) {
                                        if (GM_getValue("cbsatar-country", false)) {
                                            var countrySelect = document.getElementById("selectCountryName");
                                            log("Selected Country: " + countrySelect.options[countrySelect.selectedIndex].text);
                                            if (countrySelect.options[countrySelect.selectedIndex].text != GM_getValue("cbsatar-countryName", "None") && GM_getValue("cbsatar-countryName", "None") != "None") {
                                                log("Preferred Country: " + GM_getValue("cbsatar-countryName", "None"));
                                                selectItemByText(countrySelect, GM_getValue("cbsatar-countryName", "None"));
                                                document.getElementById("searchByZipOrCountry").click();
                                            }
                                        } else {
                                            notify("Please select another country and search again.", true, true, true, false);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else if (document.getElementById("s2-uploadPhotoButton") != null) {
                    if (GM_getValue("cbsatar-photo", false)) {
                        log("Skip photo upload.");
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
                            notify("You are set for payment page if you have the sound permission allowed.", false, true, false, false);
                        } else {
                            notify("The payment is invalid.", true, true, false, true);
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
                                    document.getElementsByName("submit")[0].disabled = false;
                                    confirmPay();
                                });
                            }, 1000);
                        }
                    }
                }
            }, 3000);
            break;
    }
}

async function handleError(e) {
    console.log("[College Board SAT Auto Registration] Error detected: " + e);
    var errorSendError = false;
    try {
        var errorPageCount = await sendg("http://" + GM_getValue("cbsatar-backend", "localhost") + ":8080/errorHandler", {
            "url": url,
            "e": e
        });
    } catch (err) {
        errorSendError = true;
        console.log("[College Board SAT Auto Registration] Error send error to backend: " + err);
        notify("Error occurred.", true, false, false, false);
    }
    if (errorSendError == false) {
        if (errorPageCount < 10) {
            location.reload();
        } else {
            notify("Error occurred.", true, false, false, false);
        }
    }
}

(function() {
    'use strict';

    url = window.location.href.substr(0, window.location.href.length - window.location.search.length);

    window.addEventListener("error", function (e) {
        handleError(e.error.message);
    });

    try {
        main();
    } catch (e) {
        handleError(e);
    }
})();
