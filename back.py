from http.server import HTTPServer, BaseHTTPRequestHandler
from playsound import playsound
from threading import Thread
from time import gmtime, strftime
import urllib.parse

host = ("0.0.0.0", 8080)
versionNum = "29"

soundPlayCount = -1
soundPlayStop = False
soundPlaying = False

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
    print("[College Board SAT Auto Registration] " + strftime("%Y-%m-%d %H:%M:%S", gmtime()) + ": " + str)

class Request(BaseHTTPRequestHandler):
    def do_GET(self):
        global soundPlayStop, soundPlaying, soundPlayCount
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-type", "application/json")
        self.end_headers()
        urlInfo = urllib.parse.urlparse(self.path)
        path = urlInfo.path
        query = urllib.parse.parse_qs(urlInfo.query)
        if (path == "/startPlay") or (path == "/stopPlay"):
            self.send_response(200)
        else:
            self.send_response(404)
            self.end_headers()
            return
        if path == "/startPlay":
            log("start playing sound")
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
                soundPlayThread = Thread(target = play, args = ())
                soundPlayThread.start()
            else:
                if (query.get("count")):
                    soundPlayCount = int(query.get("count")[0])
                else:
                    soundPlayCount = -1
        elif path == "/stopPlay":
            soundPlayStop = True
            soundPlaying = False
            log("stop playing sound")
        responseBody = "completed"
        self.wfile.write(responseBody.encode("utf-8"))
        log("respond to frontend")

if __name__ == "__main__":
    print("College Board SAT Auto Registration Backend Ver. " + versionNum + "\n\nCopyright (C) 2020  TURX\nThis program comes with ABSOLUTELY NO WARRANTY with GNU GPL v3 license. This is free software, and you are welcome to redistribute it under certain conditions; go to https://www.gnu.org/licenses/gpl-3.0.html for details.\n")
    server = HTTPServer(host, Request)
    print("Starting server, listen at: %s:%s" % host)
    server.serve_forever()
