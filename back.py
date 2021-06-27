import os
import signal
import sys
import threading
import time
import urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer
from playsound import playsound
from twilio.rest import Client

# Variables

host = ("0.0.0.0", 8080)
versionNum = "40"

# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure
account_sid = "ACc9acc883cbbe0570164c0cbcd06029c1"
auth_token = "988c497cf2376b61c8f9687e9a20deae"


# Constants

soundPlayCount = -1
soundPlayStop = False
soundPlaying = False
soundForIdle = False
lastUrl = ""
visitCount = 0
errorCount = 0
noError = 0
serverRunning = True

def play(file):
    if (file == None):
        file = "se_ymd05.wav"
    global soundPlayStop, soundPlaying, soundPlayCount
    while (soundPlayStop == False):
        if (soundPlayCount > 0):
            soundPlayCount = soundPlayCount - 1
        elif (soundPlayCount == 0):
            break
        log("sound play for one time")
        playsound("res/" + file)
    soundPlayStop = True
    soundPlaying = False

def call(number):
    client = Client(account_sid, auth_token)
    call = client.calls.create(
                        url='http://demo.twilio.com/docs/voice.xml',
                        to=number,
                        from_='+17034578413'
                    )

def sendSMS(message):
    client = Client(account_sid, auth_token)

    message = client.messages \
                    .create(
                         body=message,
                         from_='+17034578413',
                         to='+447907706670'
                     )

def logToFile(str):
    with open("cbsatar.log", "a") as logFile:
        logFile.write(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) + ": " + str + "\n")

def logToConsole(str):
    print("[College Board SAT Auto Registration] " + time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) + ": " + str)

def log(str):
    logToConsole(str)
    logToFile(str)

soundPlayThread = threading.Thread(target=play, args=("se_ymd05.wav",))

def idle():
    global soundPlaying, soundPlayCount, soundPlayStop, soundForIdle, soundPlayThread
    log("event: idle")
    soundForIdle = True
    if (soundPlaying == False):
        soundPlayCount = -1
        soundPlayStop = False
        soundPlaying = True
        soundPlayThread = threading.Thread(target=play, args=("se_ymd05.wav",))
        soundPlayThread.start()
    else:
        soundPlayCount = -1

timerIdle = threading.Timer(60.0, idle)

class Request(BaseHTTPRequestHandler):
    def do_GET(self):
        global soundPlayStop, soundPlaying, soundPlayCount, lastUrl, visitCount, errorCount, noError, timerIdle, soundForIdle, soundPlayThread
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-type", "application/json")
        self.end_headers()
        urlInfo = urllib.parse.urlparse(self.path)
        path = urlInfo.path
        query = urllib.parse.parse_qs(urlInfo.query)
        if path in ["/startPlay", "/stopPlay", "/visit", "/errorHandler", "/log", "/test"]:
            self.send_response(200)
            if (soundForIdle == True):
                soundForIdle = False
                soundPlayStop = True
                soundPlaying = False
                log("event: stop playing sound by idle")
            timerIdle.cancel()
            timerIdle = threading.Timer(60.0, idle)
            timerIdle.start()
        else:
            self.send_response(404)
            self.end_headers()
            return
        if path == "/startPlay":
            log("event: start playing sound")
            if (query.get("reason")):
                log("reason: " + query.get("reason")[0])
            if (query.get("count")):
                log("count: " + query.get("count")[0])
            if (query.get("file")):
                file = query.get("file")[0]
            else:
                file = "se_ymd05.wav"
            if (query.get("count")):
                soundPlayCount = int(query.get("count")[0])
            else:
                soundPlayCount = -1
            while (soundPlayThread.is_alive()):
                soundPlayStop = True
                soundPlaying = False
            soundPlayStop = False
            soundPlaying = True
            soundPlayThread = threading.Thread(target=play, args=(file,))
            soundPlayThread.start()

            responseBody = "completed"
        elif path == "/stopPlay":
            soundPlayStop = True
            soundPlaying = False
            log("event: stop playing sound by request")
            responseBody = "completed"
        elif path == "/visit":
            print()
            log("event: site visited")
            if (query.get("url")):
                if (lastUrl == query.get("url")[0]):
                    visitCount = visitCount + 1
                else:
                    lastUrl = query.get("url")[0]
                    errorCount = 0
                    visitCount = 1
                noError = noError + 1
                log("url: " + query.get("url")[0])
                log("times visited this page: " + str(visitCount))
                log("times visited without error: " + str(noError))
            responseBody = "completed"
        elif path == "/errorHandler":
            log("event: error occured")
            if (query.get("url")):
                log("url: " + query.get("url")[0])
            if (query.get("e")):
                log("message: " + query.get("e")[0])
            errorCount = errorCount + 1
            noError = 0
            log("times errors occured: " + str(errorCount))
            responseBody = str(errorCount)
        elif path == "/log":
            log("event: console log")
            if (query.get("url")):
                log("url: " + query.get("url")[0])
            if (query.get("content")):
                log("content: " + query.get("content")[0])
            responseBody = "completed"
        elif path == "/test":
            responseBody = "completed"
        self.wfile.write(responseBody.encode("utf-8"))
        log("respond to frontend")
    def log_message(self, format, *args):
        return

def getSlash():
    if (os.name == "nt"):
        return "\\"
    else:
        return "/"

server = HTTPServer(host, Request)

def runServer():
    global serverRunning
    while (serverRunning == True):
        server.handle_request()

serverThread = threading.Thread(target=runServer, args=())

def interruptHandler(sig, frame):
    global serverRunning
    logToFile("Interrupted by user.")
    print("Shutting down...")
    serverRunning = False
    sys.exit(0)

if (__name__ == "__main__"):
    print("College Board SAT Auto Registration Backend Ver. " + versionNum +
          "\n\nCopyright (C) 2020  TURX\nThis program comes with ABSOLUTELY NO WARRANTY with GNU GPL v3 license. This is free software, and you are welcome to redistribute it under certain conditions; go to https://www.gnu.org/licenses/gpl-3.0.html for details.\n")
    open("cbsatar.log", "w").close()
    print("Starting log, write to: " + os.getcwd() + getSlash() + "cbsatar.log")
    print("Starting interrupt handler, you can press Ctrl+C or send SIGINT to exit")
    signal.signal(signal.SIGINT, interruptHandler)
    serverThread.start()
    print("Starting server, listen at: %s:%s" % host)
    logToFile("Service started.")
