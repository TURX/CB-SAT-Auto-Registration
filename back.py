import time
import urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading
from playsound import playsound

host = ("0.0.0.0", 8080)
versionNum = "31"
soundPlayCount = -1
soundPlayStop = False
soundPlaying = False
lastUrl = ""
visitCount = 0
errorCount = 0
noError = 0

def play():
    global soundPlayStop, soundPlaying, soundPlayCount
    while (soundPlayStop == False):
        if (soundPlayCount > 0):
            soundPlayCount = soundPlayCount - 1
        elif (soundPlayCount == 0):
            break
        log("sound play for one time")
        playsound("res/se_ymd05.wav")
    soundPlayStop = True
    soundPlaying = False

def log(str):
    print("[College Board SAT Auto Registration] " + time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()) + ": " + str)

def idle():
    global soundPlaying, soundPlayCount, soundPlayStop
    log("event: idle")
    if (soundPlaying == False):
        soundPlayCount = -1
        soundPlayStop = False
        soundPlaying = True
        soundPlayThread = threading.Thread(target=play, args=())
        soundPlayThread.start()
    else:
        soundPlayCount = -1

timerIdle = threading.Timer(60.0, idle)

class Request(BaseHTTPRequestHandler):
    def do_GET(self):
        global soundPlayStop, soundPlaying, soundPlayCount, lastUrl, visitCount, errorCount, noError, timerIdle
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-type", "application/json")
        self.end_headers()
        urlInfo = urllib.parse.urlparse(self.path)
        path = urlInfo.path
        query = urllib.parse.parse_qs(urlInfo.query)
        if (path == "/startPlay") or (path == "/stopPlay") or (path == "/visit") or (path == "/errorHandler") or (path == "/log"):
            self.send_response(200)
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
            if (soundPlaying == False):
                if (query.get("count")):
                    soundPlayCount = int(query.get("count")[0])
                else:
                    soundPlayCount = -1
                soundPlayStop = False
                soundPlaying = True
                soundPlayThread = threading.Thread(target=play, args=())
                soundPlayThread.start()
            else:
                if (query.get("count")):
                    soundPlayCount = int(query.get("count")[0])
                else:
                    soundPlayCount = -1
            responseBody = "completed"
        elif path == "/stopPlay":
            soundPlayStop = True
            soundPlaying = False
            log("stop playing sound")
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
        self.wfile.write(responseBody.encode("utf-8"))
        log("respond to frontend")
    def log_message(self, format, *args):
        return

if __name__ == "__main__":
    print("College Board SAT Auto Registration Backend Ver. " + versionNum +
          "\n\nCopyright (C) 2020  TURX\nThis program comes with ABSOLUTELY NO WARRANTY with GNU GPL v3 license. This is free software, and you are welcome to redistribute it under certain conditions; go to https://www.gnu.org/licenses/gpl-3.0.html for details.\n")
    server = HTTPServer(host, Request)
    print("Starting server, listen at: %s:%s" % host)
    server.serve_forever()
