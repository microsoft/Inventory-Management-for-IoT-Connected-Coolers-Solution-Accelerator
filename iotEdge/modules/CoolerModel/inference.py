# Copyright (c) Microsoft Corporation. All rights reserved
# Licensed under the MIT license. See LICENSE file in the project root for more information

from score import MLModel
import cv2
from PIL import Image
import numpy as np
import json
import time
import datetime

from motpy import MultiObjectTracker, ModelPreset
from motpy.core import Detection
from motpy.testing_viz import draw_rectangle, draw_track, draw_text

from azure.iot.device import IoTHubModuleClient, Message
import os

class Crossing:
    def __init__(self, input, min_score, keep_secs, slope, offset, frame_start, frame_end, time_start):

        if not os.path.exists(input):
            # give the recorder time to wrap up if needed
            time.sleep(5)

        self.inferenceEngine = MLModel()
        self.video = cv2.VideoCapture(input)
        self.frame_end = frame_end
        self.frame_width = int(self.video.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.frame_height = int(self.video.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.frame_fps = self.video.get(cv2.CAP_PROP_FPS)

        self.time_start = time_start + frame_start/self.frame_fps
        self.video.set(cv2.CAP_PROP_POS_FRAMES, frame_start)
    
        self.tracker = MultiObjectTracker(dt=1 / self.frame_fps,
                                          model_spec=ModelPreset.constant_acceleration_and_static_box_size_2d.value,
                                          active_tracks_kwargs={'min_steps_alive': 2, 'max_staleness': 6},
                                          tracker_kwargs={'max_staleness': 12})

        self.min_score = min_score
        self.keep_secs = keep_secs
        self.slope = slope
        self.offset = offset*self.frame_height
        self.count=frame_start-1
        
        self.prev_centroids = None
        self.crossing_frames ={}

    def entity2det(self, d):
        b = d['box']
        box = (b['l']*self.frame_width, b['t']*self.frame_height,
               (b['l']+b['w'])*self.frame_width, (b['t']+b['h'])*self.frame_height)
        score = d['tag']['confidence']
        class_id = d['tag']['value']
        return Detection(box=box, score=score, class_id=class_id)


    def line_pred(self, pos):
        ret = self.slope*pos[0] + pos[1] - self.offset
#        print('line_pred =', pos[1], ret)
        return ret

    def next(self):
        ret, img = self.video.read()             # BGR
        self.count += 1
        
        if not ret:
            #print('last frame', self.count)
            return None, [], {}

        if self.count > self.frame_end:
            return None, [], {}

        #print('inferencing frame', self.count)

        detectedObjects = self.inferenceEngine.Score(Image.fromarray(img[:,:,(2,1,0)]))

        cv2.line(img, (0, int(self.offset)), (self.frame_width-1, -int(self.line_pred((self.frame_width-1, 0)))), (0, 255, 255), 1)

        detections = [self.entity2det(d['entity']) for d in detectedObjects
                      if d['entity']['tag']['confidence']> self.min_score]

        active_tracks = self.tracker.step(detections=detections)

        #tracks = {'frameNumber':self.count, 'inferences':detectedObjects}
        tracks = {'frameNumber':self.count, 'inferences': [{'type':'entity', 'inferenceId':t.id,
                                                            'entity': {'tag': {'value': t.class_id, 'confidence':t.score},
                                                                       'box': {'l':t.box[0], 't':t.box[1], 'w':t.box[2]-t.box[0], 'h':t.box[3]-t.box[1]}}}
                                                            for t in active_tracks]}

        centroids = dict({track.id:{'pos':((track.box[0]+track.box[2])/2, (track.box[1]+track.box[3])/2),
                                    'type':track.class_id} for track in active_tracks})

#        print(centroids)
        crossings = dict({tid:self.line_pred(t['pos']) for tid, t in centroids.items() if tid in self.prev_centroids
                          and (self.line_pred(t['pos'])*self.line_pred(self.prev_centroids[tid]['pos'])<0)})
        

#        print('crossings', crossings)

        self.prev_centroids = centroids
        #print('self.prev_centroids', self.prev_centroids)

        for det in detections:
            draw_rectangle(img, det.box, color=(10, 220, 20), thickness=1)

        for track in active_tracks:
            draw_track(img, track)

        pos = [centroids[id]['pos'] for id, pred in crossings.items() if pred]

        self.crossing_frames = dict({f:pos for f, pos in self.crossing_frames.items() if f > self.count-self.keep_secs*self.frame_fps})

        if pos:
            self.crossing_frames[self.count] = pos

        for f, pos in self.crossing_frames.items():
            for p1 in pos:
                draw_text(img, 'frame '+str(f), p1, color=(0,0,0))
            
        ev = [{'event':'itemAdded' if pred<0 else 'itemRemoved', 'time':self.time_start+self.count/self.frame_fps,
               'type':centroids[tid]['type'], 'pos':centroids[tid]['pos']}
              for tid, pred in crossings.items()]
        
        return img, ev, tracks
    

def do_inference2(client, top, bottom, top_output, bottom_output, time_start=time.time(), preview=None, output=None,
                  frame_start=0, frame_end = 1000000, min_score=0.2, 
                  top_slope=0, top_offset=0.65, bottom_slope=0, bottom_offset=0.75, keep_secs=2):
    print("Top Exists: ", os.path.exists(top))
    print("Bottom Exists: ", os.path.exists(bottom))

    crossing_top = Crossing(input=top, min_score=min_score, keep_secs=keep_secs, slope=top_slope, offset=top_offset,
                            frame_start=frame_start, frame_end=frame_end, time_start=0)

    crossing_bottom = Crossing(input=bottom, min_score=min_score, keep_secs=keep_secs, slope=bottom_slope, offset=bottom_offset,
                               frame_start=frame_start, frame_end=frame_end, time_start=0)

    if output:
        writer = cv2.VideoWriter(output, cv2.VideoWriter_fourcc(*'avc1'), crossing_top.frame_fps,
                                 (crossing_top.frame_width, 2*crossing_top.frame_height))
    all_tracks_top = []
    all_tracks_bottom = []

    recent_events = {}

    cooler_id = os.getenv('COOLER_ID', 'DemoCooler')

    while True:
        ret_top, ev_top, tracks_top = crossing_top.next()
        ret_bottom, ev_bottom, tracks_bottom = crossing_bottom.next()
        if  ret_top is None or ret_bottom is None:
            break

        all_tracks_top.append(tracks_top)
        all_tracks_bottom.append(tracks_bottom)

        stacked = np.vstack((ret_top, ret_bottom))

        cur_events = [{'camera':'top', 'cooler_id':cooler_id, **e} for e in ev_top] + [{'camera':'bottom', 'cooler_id':cooler_id,**e} for e in ev_bottom]

        if len(cur_events)>0:
            #print('cur_events', cur_events)
            cur_t = cur_events[0]['time']
            #purge old events
            recent_events = dict({t:events for t, events in recent_events.items() if t > cur_t - keep_secs})
            for e in cur_events:
                is_new = True
                for old_e in sum(recent_events.values(), []):
                    if old_e['type'] == e['type'] and old_e['event'] == e['event']:
                        is_new = False
                        break
                if is_new:
                    print('new crossing', e)
                    video_start_time = datetime.datetime.strptime(time_start, "%Y-%m-%dT%H:%M:%S.%fZ")
                    add_seconds = datetime.timedelta(seconds=e['time'])
                    event_time = video_start_time + add_seconds
                    e['time'] = event_time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
                    print('message to send', e)
                    if client:
                        msg = Message(json.dumps(e))
                        msg.custom_properties
                        client.send_message_to_output(msg, 'output1') 
                        
            recent_events[cur_t] = cur_events

        if output:
            writer.write(stacked)

        if preview:
            cv2.imshow(preview, stacked)
            # stop the demo by pressing q
            #wait_ms = int(1000/crossing_top.frame_fps)
            wait_ms=1
            c = cv2.waitKey(wait_ms)
            if c == ord('q'):
                break

    if top_output:
        json.dump({'inputVideo': top, 'startTime': '', 'events':all_tracks_top}, open(top_output, 'w'), indent=2)

    if bottom_output:
        json.dump({'inputVideo': bottom, 'startTime': '', 'events':all_tracks_bottom}, open(bottom_output, 'w'), indent=2)

if  __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser()
    p.add_argument('top', nargs='?', default='2022-01-18T13-54-39-top.mp4')
    p.add_argument('bottom', nargs='?', default='2022-01-18T13-54-39-bottom.mp4')
    p.add_argument('--top_output', default='2022-01-18T13-54-39-top.json')
    p.add_argument('--bottom_output', default='2022-01-18T13-54-39-bottom.json')
    p.add_argument('--time_start', type=float, default=time.time())
    p.add_argument('--output', default='output.mp4')
    p.add_argument('--preview', default='preview')
    p.add_argument('--frame_start', type=int, default=0)
    p.add_argument('--frame_end', type=int, default=100000)
    p.add_argument('--min_score', type=float, default=0.15)
    p.add_argument('--keep_secs', type=float, default=2)
    p.add_argument('--top_slope', type=float, default=0)
    p.add_argument('--bottom_slope', type=float, default=0)
    p.add_argument('--top_offset', type=float, default=0.65)
    p.add_argument('--bottom_offset', type=float, default=0.75)
    args = p.parse_args()    

    do_inference2(**args.__dict__)
