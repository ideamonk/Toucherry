#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import re
import base64

import wsgiref.handlers
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template

T_PATH = os.path.join(os.path.dirname(__file__),'views')

class SurveyResults(db.Model):
    uid = db.StringProperty()
    step1 = db.BlobProperty()
    step2 = db.BlobProperty()
    step3 = db.BlobProperty()
    toughest = db.StringProperty()
    ua = db.StringProperty()
    cat = db.StringProperty()
    timestamp = db.DateTimeProperty(auto_now_add=True)
    # for now lets forget modelling and agility :D
    
class MainHandler(webapp.RequestHandler):
    dataUrlPattern = re.compile('data:image/(png|jpeg);base64,(.*)$')
    def get(self):
        userAgent = os.environ['HTTP_USER_AGENT']
        view_path = os.path.join(T_PATH, 'nophone.html')
        if userAgent.find('iPhone') > 0 or \
            userAgent.find('iPod') > 0 or \
            userAgent.find('iPad') > 0 or \
            (userAgent.find('Safari') > 0 and userAgent.find('Mobile') > 0):
            view_path = os.path.join(T_PATH, 'index.html')
            
        self.response.out.write (template.render(view_path,{}))

    def post(self):
        uid = self.request.get('uid')
        step = int(self.request.get('step'))
        text = self.request.get('text')
        
        if step<4:
            img = self.request.get('img')
            imgb64 = self.dataUrlPattern.match(img).group(2)
            if imgb64 is not None and len(imgb64) > 0:
                if step==1:
                    ua = os.environ['HTTP_USER_AGENT']
                    cat = "unknown"
                    if ua.find('iPhone') > 0:
                        cat = 'iPhone'
                    elif ua.find('iPod') > 0:
                        cat = 'iPod'
                    elif ua.find('iPad') > 0:
                        cat = 'iPad'
                    elif (userAgent.find('Safari') > 0 and userAgent.find('Mobile') > 0):
                        cat = 'A Safari+Mobile'                        
                    survey = SurveyResults(uid = uid, ua=ua, cat=cat)
                else:
                    survey = SurveyResults.all().filter("uid =", uid).fetch(1)[0]
                if step==1:
                    survey.step1 = db.Blob(base64.b64decode(imgb64))
                elif step==2:
                    survey.step2 = db.Blob(base64.b64decode(imgb64))
                elif step==3:
                    survey.step3 = db.Blob(base64.b64decode(imgb64))
                survey.put()
        else:
            survey = SurveyResults.all().filter("uid =", uid).fetch(1)[0]
            survey.toughest = text
            survey.put()

class StatsHandler(webapp.RequestHandler):
    def get(self):
        view_path = os.path.join(T_PATH, 'stats.html')
        results = SurveyResults.all().order('-timestamp').fetch(1000)
        self.response.out.write (template.render(view_path,{'results':results}))

class ImageHandler(webapp.RequestHandler):
    def get(self):
        uid = self.request.get('uid')
        step = int(self.request.get('step'))
        survey = SurveyResults.all().filter("uid =", uid).fetch(1)[0]
        self.response.headers['Content-Type'] = 'image/jpeg'

        if step==1:
            self.response.out.write(survey.step1)
        elif step==2:
            self.response.out.write(survey.step2)
        else:
            self.response.out.write(survey.step3)
        
def main():
    application = webapp.WSGIApplication(
        [
            ('/', MainHandler),
            ('/stats', StatsHandler),
            ('/img', ImageHandler)
        ], debug=False)
    wsgiref.handlers.CGIHandler().run(application)

if __name__ == '__main__':
    main()
