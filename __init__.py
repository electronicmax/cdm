
## 
#    This file is part of CDM for WebBox
#
#    Copyright 2013-2014 Max Van Kleek, Daniel A. Smith
#    Copyright 2013-2014 PINCH, Inc.
#

import logging, traceback, json, re
from twisted.web.resource import Resource
from webbox.webserver.handlers.base import BaseHandler
from webbox.objectstore_async import ObjectStoreAsync
from twisted.internet.defer import Deferred
from twisted.web.server import NOT_DONE_YET

class CDMApp(BaseHandler):
    def __init__(self, server):
        BaseHandler.__init__(self, server)
        self.isLeaf = True

    def hello(self, request):
        self.return_ok(request, { data: "hello" })

    def render(self, request):
        ## nothing necessary here
        path = request.path.split("/")
        logging.debug(" -- path {0}".format(repr(path)))
        if path[-1] in handlers:
            handlers[path[-1]](request)
        else:
            _respond(request, 200, 'ok')
        return NOT_DONE_YET  

def _respond(request, code, message, additional_data=None):
    response = {"message": message, "code": code}
    if additional_data:
        response.update(additional_data)
    try:
        responsejson = cjson.encode(response)
        logging.debug("Encoding response with cjson")
    except Exception as e:
        responsejson = json.dumps(response)
        logging.debug("Encoding response with python json")

    if not request._disconnected:
        request.setResponseCode(code, message=message)
        request.setHeader("Content-Type", "application/json")
        request.setHeader("Content-Length", len(responsejson))
        request.write(responsejson)
        request.finish()
        logging.debug(' just called request.finish() with code %d ' % code)
    else:
        logging.debug(' didnt call request.finish(), because it was already disconnected')

def unix_time_in_millis():
    import time
    millis = int(round(time.time() * 1000))
    return millis


## ARGH.need to deal with OAuth2 business so let's come
## back to this later...
LATITUDE_API_KEY = ''        
def LatitudeHandler(request):
    mintime = 0
    maxtime = unix_time_in_millis()
    maxresults = 100000
    # url = 'https://www.googleapis.com/latitude/v1/location?key={0}&min-time={1}&max-time={2}&max-results={3}'.format([API_KEY, mintime, maxtime ]) ##    params = {
    _respond(request, 200, 'yeh location')
    pass
handlers = {'latitude':LatitudeHandler}
    
APP = CDMApp
