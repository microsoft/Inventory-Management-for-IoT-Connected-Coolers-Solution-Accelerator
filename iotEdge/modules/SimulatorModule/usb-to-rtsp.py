# Copyright (c) Microsoft Corporation. All rights reserved
# Licensed under the MIT license. See LICENSE file in the project root for more information
import sys
import gi
import cv2
from azure.iot.device import IoTHubModuleClient, Message
import os
import json
import logging
import uuid

logging.basicConfig(level=logging.INFO)

gi.require_version('Gst', '1.0')
gi.require_version('GstRtspServer', '1.0')
from gi.repository import Gst, GstRtspServer, GObject, GLib

loop = GLib.MainLoop()
Gst.init(None)

mode = 'info'

class DoorEvent:
    def __init__ (self, event_dict=dict()):
        self.id = event_dict['id']
        self.start = event_dict['start']
        self.end = event_dict['end']
        
    def show_details(self):
        print(f'Door Event ID: {self.id}')
        print(f'Door Event Start Time (seconds): {self.start}')
        print(f'Door Event End Time (seconds): {self.end}')

class SensorFactory(GstRtspServer.RTSPMediaFactory):
    def __init__(self, video_name, **properties):
        super(SensorFactory, self).__init__(**properties)        
        self.video_name = video_name
        
        self.cap = cv2.VideoCapture(video_name)        
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.fps = int(self.cap.get(cv2.CAP_PROP_FPS))
        print(f'Total Frames: {self.total_frames}')
        print(f'Frames per second: {self.fps}')

        # load the json file with the open and close event timestamps                
        with open('open-close-events.json') as f:   
            door_events = json.load(f)
            f.close()
            
        self.events = door_events['events']
        self.num_events = len(self.events)
        self.current_event = 0
            
        print(f'Total Frames: {self.total_frames}')
        print(f'Frames per second: {self.fps}')

        if 'top' in self.video_name:
            self.module_client = IoTHubModuleClient.create_from_edge_environment()
            self.module_client.connect()        

        self.number_frames = 0
        #self.fps = 30
        self.duration = 1 / self.fps * Gst.SECOND  # duration of a frame in nanoseconds
        self.launch_string = 'appsrc name=source is-live=true block=true format=GST_FORMAT_TIME ' \
                            'caps=video/x-raw,format=BGR,width=640,height=480,framerate={}/1 ' \
                            '! videoconvert ! video/x-raw,format=I420 ' \
                            '! x264enc speed-preset=ultrafast tune=zerolatency ' \
                            '! rtph264pay config-interval=1 name=pay0 pt=96'.format(self.fps)
        


    def on_need_data(self, src, lenght):
        if self.cap.isOpened():
            ret, frame = self.cap.read()
            if ret:                 
                cur_frame = self.cap.get(cv2.CAP_PROP_POS_FRAMES)
                cur_event = DoorEvent(self.events[self.current_event])
                last_event = DoorEvent(self.events[self.num_events-1])

                if 'top' in self.video_name:                        
                    if cur_frame / self.fps == cur_event.start:                        
                        print(f'Status: Door Open')
                        msg = Message(json.dumps({'doorOpen': True}))
                        self.module_client.send_message_to_output(msg, 'output1')            
                            
                    elif cur_frame / self.fps == cur_event.end:
                        print(f'Status: Door Closed')
                        msg = Message(json.dumps({'doorOpen': False}))
                        self.module_client.send_message_to_output(msg, 'output1')            
                        
                        # increment the event if needed
                        if cur_frame / self.fps == last_event.end:
                            print('Already on last event. Continuing...')
                            self.current_event = 0
                        else:
                            print('Setting next event')
                            self.current_event+=1
                    
                    if cur_frame % self.fps == 0:                   
                        print(f'Current Time: {cur_frame/self.fps}')     

                # restart video if we reached the end
                if cur_frame == self.total_frames:
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 1)

                data = frame.tostring()
                buf = Gst.Buffer.new_allocate(None, len(data), None)
                buf.fill(0, data)
                buf.duration = self.duration
                timestamp = self.number_frames * self.duration
                buf.pts = buf.dts = int(timestamp)
                buf.offset = timestamp
                self.number_frames += 1
                retval = src.emit('push-buffer', buf)

                if mode == 'debug':
                    print('pushed buffer, frame {}, duration {} ns, durations {} s'.format(self.number_frames,
                                                                                        self.duration,
                                                                                        self.duration / Gst.SECOND))
                if retval != Gst.FlowReturn.OK:
                    print(retval)

    def do_create_element(self, url):
        return Gst.parse_launch(self.launch_string)

    def do_configure(self, rtsp_media):
        self.number_frames = 0
        appsrc = rtsp_media.get_element().get_child_by_name('source')
        appsrc.connect('need-data', self.on_need_data)

class GstreamerRtspServer():
    def __init__(self):
        self.rtspServer = GstRtspServer.RTSPServer()

        factorytop = SensorFactory(video_name="cooler-cam-top.mp4")
        factorytop.set_shared(True)
        
        factorybottom = SensorFactory(video_name="cooler-cam-bottom.mp4")         
        factorybottom.set_shared(True)

        mountPoints = self.rtspServer.get_mount_points()
        mountPoints.add_factory("/stream1", factorytop)
        mountPoints.add_factory("/stream2", factorybottom)
        self.rtspServer.attach(None)

if __name__ == '__main__':
    #send_messages()
    s = GstreamerRtspServer()
    loop.run()    
