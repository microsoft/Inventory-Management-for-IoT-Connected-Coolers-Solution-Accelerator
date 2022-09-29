from functools import update_wrapper
from multiprocessing import Pipe
import sys

sys.path.append('../')
import gi
# import configparser
gi.require_version('Gst', '1.0')
from gi.repository import GObject, Gst, GLib
from ctypes import *
import time
import sys
import datetime

from threading import Thread, Event
import json
import os

Gst.init(None)

class CoolerCamera:
    def __init__(self, name, client, rtsp_url_top, rtsp_url_bottom, simulated=False, min_recording_duration=10):
        self.name = name
        self.client = client
        self.rtsp_url_top = rtsp_url_top
        self.rtsp_url_bottom = rtsp_url_bottom
        self.simulated = simulated
        self.min_recording_duration = min_recording_duration
        
        # initialize a few variables for tracking state
        self.desired_state = "ALIVE"
        self.is_recording = False
        self.instance_id = 1

        #######################################
        # Start building GStreamer pipeline
        #######################################
        """
        Iniital set of elements added here.
        Others will be linked dynamically
        as pads are added (e.g. RTSP source 
        discovered or new filesink added)
        """

        self.pipeline = Gst.Pipeline.new(name)
        
        # create sources and pad-added listener to connect to multiqueue
        self.rtspsrc_top = Gst.ElementFactory.make('rtspsrc', 'rtspsrc-top')
        self.rtspsrc_bottom = Gst.ElementFactory.make('rtspsrc', 'rtspsrc-bottom')
        
        self.rtspsrc_top.set_property("location", self.rtsp_url_top)
        self.rtspsrc_bottom.set_property("location", self.rtsp_url_bottom)
        
        if not simulated:
            self.rtspsrc_top.set_property("protocols", "tcp")
            self.rtspsrc_bottom.set_property("protocols", "tcp")
        
        self.rtspsrc_top.connect("pad-added", self.on_source_added)
        self.rtspsrc_bottom.connect("pad-added", self.on_source_added)

        # create the queue
        self.video_queue = Gst.ElementFactory.make('multiqueue', 'video-queue') 
        self.video_queue.connect("pad-added", self.source_added_to_queue)
                                    
        #######################################
        # add elements to pipeline
        #######################################
        self.pipeline.add(self.rtspsrc_top)
        self.pipeline.add(self.rtspsrc_bottom)
        self.pipeline.add(self.video_queue)               
                              
        ###################################################
        # Start the Pipeline in a new thread
        ###################################################
        """
        Pipeline is started in a thread so we can more easily
        control the status. For example, we can call the 
        start_recording or stop_recording methods of this class
        to dynamically trigger recordings for both the top
        and bottom camera instances
        """

        self.bus = self.pipeline.get_bus()
        self.bus.add_signal_watch()        
        print("Starting pipeline \n")
        self.pipeline.set_state(Gst.State.PLAYING)
         
                                      
        self.stop_event = Event()
        self.thread = Thread(target=self.run)
        self.thread.start()    

    def source_added_to_queue(self, src, new_pad):
        """
        This is a callback for adding elements downstream
        from the multiqueue once the rtspsrc has already been
        linked. The next step is to link a separate queue with a 
        minimum buffer to hold the prior data. Then a tee element
        is linked for each the top and bottom cameras to allow the 
        data to flow to sink elements. A fakesink is created upfront
        here to make the pipeline fully linked. Upon start_recording
        events, a new filesink bin will be dynamically added to the 
        pipeline in order to record to a file.
        """
        print("In source added to queue")
        print("Element Name ", src.name)
        print("Pad name ", new_pad.name)
        
        if new_pad.name == "sink_0":
            sourcepad = self.video_queue.get_static_pad("src_0")
            #sinkpad = self.fakesink_top.get_static_pad("sink")
            
            # create a queue and link to the multiqueue
            queue = Gst.ElementFactory.make("queue", "queue-prebuffer-top")
            # queue.set_property("min-threshold-time", 5000000000)            
            # queue.set_property("max-size-time", 0)
            # queue.set_property("max-size-buffers", 0)
            # queue.set_property("max-size-bytes", 20000000)
            self.pipeline.add(queue)
            sinkpad = queue.get_static_pad("sink")
            
            self.check_before_linking(sourcepad, sinkpad)
            ret = sourcepad.link(sinkpad)
            self.check_link_status(ret)
            
            # create a new tee pad to link to the queue            
            tee = Gst.ElementFactory.make("tee", "tee-top")            
            self.pipeline.add(tee)
            queue.link(tee)

            # request a new pad from the tee and link to fakesink
            sourcepad = tee.get_request_pad("src_0")
            queue_fakesink_top = Gst.ElementFactory.make("queue", "queue-fakesink-top")
            fakesink_top = Gst.ElementFactory.make("fakesink", "fakesink-top")
            self.pipeline.add(queue_fakesink_top)
            self.pipeline.add(fakesink_top)
                                    
            sinkpad = queue_fakesink_top.get_static_pad("sink")
            
            print("linking top tee to queue")
            self.check_before_linking(sourcepad, sinkpad)
            ret = sourcepad.link(sinkpad)
            self.check_link_status(ret)        
            
            queue_fakesink_top.link(fakesink_top)
            
            # set the state of all new elements to playing
            queue.set_state(Gst.State.PLAYING)
            tee.set_state(Gst.State.PLAYING)
            queue_fakesink_top.set_state(Gst.State.PLAYING)
            fakesink_top.set_state(Gst.State.PLAYING)
            self.rtspsrc_top.set_state(Gst.State.PLAYING)            
                   
            print("Added fakesink tee for top camera")
            print("Pipeline State ", self.pipeline.get_state(0))
            
            self.prebuffer_queue_top = queue
            self.tee_top = tee
            self.queue_fakesink_top = queue_fakesink_top
            self.fakesink_top = fakesink_top
                      
            self.pipeline.set_state(Gst.State.PLAYING) # turned this off

        elif new_pad.name == "sink_1":     
            sourcepad = self.video_queue.get_static_pad("src_1")
            
            queue = Gst.ElementFactory.make("queue", "queue-prebuffer-bottom")
            # queue.set_property("min-threshold-time", 5000000000)            
            # queue.set_property("max-size-time", 0)
            # queue.set_property("max-size-buffers", 0)
            # queue.set_property("max-size-bytes", 20000000)
            self.pipeline.add(queue)
            sinkpad = queue.get_static_pad("sink")

            self.check_before_linking(sourcepad, sinkpad)
            ret = sourcepad.link(sinkpad)
            self.check_link_status(ret)

            # create a new tee pad to link to the queue
            tee = Gst.ElementFactory.make("tee", "tee-bottom")            
            self.pipeline.add(tee)
            queue.link(tee)
            
            # request a new pad from the tee and link to fakesink
            sourcepad = tee.get_request_pad("src_0")
            queue_fakesink_bottom = Gst.ElementFactory.make("queue", "queue-fakesink-bottom")
            fakesink_bottom = Gst.ElementFactory.make("fakesink", "fakesink-bottom")
            self.pipeline.add(queue_fakesink_bottom)
            self.pipeline.add(fakesink_bottom)
                                    
            sinkpad = queue_fakesink_bottom.get_static_pad("sink")
            
            print("linking bottom tee to queue")
            self.check_before_linking(sourcepad, sinkpad)
            ret = sourcepad.link(sinkpad)
            self.check_link_status(ret)        
            
            queue_fakesink_bottom.link(fakesink_bottom)
            
            # set the state of all new elements to playing
            queue.set_state(Gst.State.PLAYING)
            tee.set_state(Gst.State.PLAYING)
            queue_fakesink_bottom.set_state(Gst.State.PLAYING)
            fakesink_bottom.set_state(Gst.State.PLAYING)
            self.rtspsrc_bottom.set_state(Gst.State.PLAYING)
                   
            print("Added fakesink tee for bottom camera")
            print("Pipeline State ", self.pipeline.get_state(0))
            
            self.prebuffer_queue_bottom = queue
            self.tee_bottom = tee
            self.queue_fakesink_bottom = queue_fakesink_bottom
            self.fakesink_bottom = fakesink_bottom

    def on_source_added(self, src, new_pad):
        """
        This is a callback for adding new elements
        to the pipeline when a new pad is detected
        on the rtspsrc elements. This will pick up the 
        newly created src pad and link it to the sink
        pad on the muliqueue object
        """
        
        print(src, new_pad)
        caps=new_pad.get_current_caps()
        gststruct=caps.get_structure(0)
        gstname=gststruct.get_name()           

        print("Element Name ", src.name)
        print("Pad name ", new_pad.name)
        print(caps.to_string())       
        features = caps.get_features(0)      
        print(features)             
        print("gstname=",gstname)


        if src.name == "rtspsrc-top":
            print("Creating sink pad for top camera")
            sinkpad = self.video_queue.get_request_pad("sink_0")
            #self.rtspsrc_top.sync_state_with_parent()            
        elif src.name == "rtspsrc-bottom":
            print("Creating sink pad for bottom camera")
            sinkpad = self.video_queue.get_request_pad("sink_1")
            #self.rtspsrc_bottom.sync_state_with_parent()
        
        ret = new_pad.link(sinkpad)
        self.check_link_status(ret)
            
        print("Received new pad {} from {}".format(new_pad.get_name(), src.get_name()))
        
    def create_filesink_bin(self, name):
        """
        This is a utility function for creating new
        bin object containing the elements necessary to
        send data to a filesink element. A ghostpad is created
        on the bin for linking with the rest of the pipeline.
        This is intended to be called in the start_recording
        process to request a new tee pad, link, and start
        recording.
        """
        bin_name=f"filesink-bin-{name}"
        print(bin_name)                           
        
        nbin = Gst.Bin.new(bin_name)        
        if not nbin:
            sys.stderr.write("Unable to create source bin \n")
        
        queue = Gst.ElementFactory.make("queue", "video-queue")
        depay = Gst.ElementFactory.make("rtph264depay", "video-depay")
        parser = Gst.ElementFactory.make("h264parse", "video-parse")
        muxer = Gst.ElementFactory.make("mpegtsmux", "mux")

        # these queeue options were copied from an example
        queue.set_property("max-size-buffers", 0)
        queue.set_property("max-size-bytes", 0)
        queue.set_property("max-size-time", 0)
        # queue.set_property("min-threshold-time", 5000000000)
        # queue.set_property("min-threshold-time", 60000000000)
        # end copied options

        filesink = Gst.ElementFactory.make("filesink", "filesink")
        filesink.set_property("sync", False)
        filesink.set_property("async", False)
        filesink.set_property("qos", True)
        filesink.set_property("max-lateness", -1)
        # filesink.set_property("ts-offset", 5000000000)
        
        Gst.Bin.add(nbin, queue)
        Gst.Bin.add(nbin, depay)
        Gst.Bin.add(nbin, parser)
        Gst.Bin.add(nbin, muxer)
        Gst.Bin.add(nbin, filesink)
                
        queue.link(depay)
        depay.link(parser)
        parser.link(muxer)
        muxer.link(filesink)
        
        print('creating ghostpad')
        sinkpad = queue.get_static_pad("sink")
        bin_pad = nbin.add_pad(Gst.GhostPad.new("videosink", sinkpad))
        # nbin.set_property("async_handling", False)
        
        if not bin_pad:
            sys.stderr.write("Failed to add ghost pad in filesink bin \n")
            return None
        
        return nbin

    def check_before_linking(self, srcpad, sinkpad):
        """
        This is a utility function for checking
        whether both pads exist before linking.
        """
        if not srcpad:
            print('Could not get sourcpad')
        if not sinkpad:
            print('Could not get sinkpad')

    def check_link_status(self, ret):
        """
        This is a utility function for checking
        whether the link operation was successful.
        """
        if not ret == Gst.PadLinkReturn.OK:
            print("Link failed")
        else:
            print("Link Succeeded")   
    
    def start_recording(self):
        """
        This function is responsible for triggering
        the creation of a new tee pad and linking the
        necessary elements for saving the rtsp stream
        to a filesink. If a recording is already in 
        progress, this function does nothing.
        """
        print("Starting Recording")
        if self.is_recording:
            print("Already recording")
            return
        else:
            self.is_recording = True
               
        ts = datetime.datetime.now().strftime("%Y%m%dT%H%M%SZ")
        
        output_dir_top = "/app/outputs/TopCamera"
        output_dir_bottom = "/app/outputs/BottomCamera"
        
        if not os.path.exists(output_dir_top):
            os.makedirs(output_dir_top)
            
        if not os.path.exists(output_dir_bottom):
            os.makedirs(output_dir_bottom)
        
        outfile_top = f"{output_dir_top}/TopCamera_{ts}.mp4"
        outfile_bottom = f"{output_dir_bottom}/BottomCamera_{ts}.mp4"
        
        filesink_bin_top = self.create_filesink_bin("top")
        self.pipeline.add(filesink_bin_top)
        filesink_top = filesink_bin_top.get_by_name("filesink")
        filesink_top.set_property("location", outfile_top)
        
        sourcepad = self.tee_top.get_request_pad(f"src_{self.instance_id}")
        sinkpad = filesink_bin_top.get_static_pad("videosink")
        
        print("linking top tee to queue")
        self.check_before_linking(sourcepad, sinkpad)
        ret = sourcepad.link(sinkpad)
        self.check_link_status(ret)  
        
        filesink_bin_top.set_state(Gst.State.PLAYING)
        self.filesink_bin_top = filesink_bin_top
        
        # create and link elements for bottom camera
        filesink_bin_bottom = self.create_filesink_bin("bottom")
        self.pipeline.add(filesink_bin_bottom)
        filesink_bottom = filesink_bin_bottom.get_by_name("filesink")
        filesink_bottom.set_property("location", outfile_bottom)
        
        sourcepad = self.tee_bottom.get_request_pad(f"src_{self.instance_id}")
        sinkpad = filesink_bin_bottom.get_static_pad("videosink")
        
        print("linking bottom tee to queue")
        self.check_before_linking(sourcepad, sinkpad)
        ret = sourcepad.link(sinkpad)
        self.check_link_status(ret)  
        
        filesink_bin_bottom.set_state(Gst.State.PLAYING)
        self.filesink_bin_bottom = filesink_bin_bottom
        
        self.start_recording_time = time.perf_counter()
        self.is_recording = True
    
    def stop_recording(self):
        """
        This is a function for stopping the recording
        process. It finds the current recording and 
        unlinks and removes it from the pipeline. Then
        it sends a message to a RabbitMQ queue that
        there is a new recording available for downstream
        processing
        """
        print("In Stop Recording")
        if not self.is_recording:
            print("Not recording. Nothing to do")
            return

        self.stop_recording_time = time.perf_counter()

        recording_duration = self.stop_recording_time - self.start_recording_time
        print(f"Time elapsed: {recording_duration}")
        if recording_duration < self.min_recording_duration:
            print("Stop recording received before min duration. Sleeping now")
            timeout_duration = self.min_recording_duration - recording_duration
            print("timeout_duration",timeout_duration)
            time.sleep(timeout_duration)
            print('Done sleeping')
                
        queue_top = self.filesink_bin_top.get_by_name("video-queue")
        filename_top = self.filesink_bin_top.get_by_name("filesink").props.location
        sourcepad = self.tee_top.get_static_pad(f"src_{self.instance_id}")
        sinkpad = queue_top.get_static_pad("sink")
        sourcepad.unlink(sinkpad)
        self.tee_top.release_request_pad(sourcepad)
        
        print('done releasing filesink for top')
        
        # self.filesink_bin_top.get_by_name("video-depay").send_event(Gst.Event.new_eos())
                
        self.filesink_bin_top.set_state(Gst.State.NULL)
        self.pipeline.remove(self.filesink_bin_top)
        
        queue_bottom = self.filesink_bin_bottom.get_by_name("video-queue")   
        filename_bottom = self.filesink_bin_bottom.get_by_name("filesink").props.location     
        sourcepad = self.tee_bottom.get_static_pad(f"src_{self.instance_id}")
        sinkpad = queue_bottom.get_static_pad("sink")
        sourcepad.unlink(sinkpad)
        self.tee_bottom.release_request_pad(sourcepad)
        
        print('done releasing filesink for bottom')
        self.filesink_bin_bottom.set_state(Gst.State.NULL)
        self.pipeline.remove(self.filesink_bin_bottom)
        
        # set the next id for the tee request pad
        self.instance_id += 1
        
        datestring = filename_top.split("_")[-1].strip(".mp4")
        event_time = datetime.datetime.strptime(datestring, "%Y%m%dT%H%M%Sz").strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        msg_body = {
            "eventType": "RecordingAvailable",
            "topcameraLocation": filename_top,
            "bottomcameraLocation": filename_bottom,
            "startTime": event_time
        }

        self.client.publish(msg_body)
        self.is_recording = False
        #self.filesink_bin_bottom.send_event(Gst.Event.new_eos())
        # self.filesink_bin_bottom.set_state(Gst.State.NULL)
        
    def run(self):
        """
        This is the main method in use for the Gstreamer pipeline
        thread. This manages the overall state of the module and
        will output various information to stdout or stderr based
        on the pipeline status.
        """
         
        while True:
            if self.desired_state == 'KILL':
                break
            
            try:
                
                message = self.bus.timed_pop(Gst.SECOND)
                                                                
                if message == None:
                    pass
                
                else:               
                    t = message.type
                    
                    if t == Gst.MessageType.EOS:
                        sys.stdout.write("End-of-stream\n")
                    elif t == Gst.MessageType.WARNING:
                        err, debug = message.parse_warning()
                        sys.stderr.write("Warning: %s: %s\n" % (err, debug))
                    elif t == Gst.MessageType.ERROR:
                        err, debug = message.parse_error()
                        sys.stderr.write("Error: %s: %s\n" % (err, debug))
                        break
                    elif message.type == Gst.MessageType.APPLICATION:
                        sys.stderr.write("App message received")
                    elif message.type == Gst.MessageType.STATE_CHANGED:
                        old_state, new_state, pending_state = message.parse_state_changed()
                        #my_sources = ['pipeline', 'source-bin','filesink-bin', 'video-queue']
                        #if any([s in message.src.get_name() for s in my_sources]):                        
                        sys.stdout.write(f"{message.src.get_name()} : State changed from {old_state} to {new_state} \n")
                    elif t == Gst.MessageType.ELEMENT:
                        struct = message.get_structure()
                        #Check for stream-eos message
                        if struct is not None and struct.has_name("stream-eos"):
                            parsed, stream_id = struct.get_uint("stream-id")
                            if parsed:
                                #Set eos status of stream to True, to be deleted in delete-sources
                                print("Got EOS from stream %d" % stream_id)                                
                    else:
                        #print(message.type)
                        pass
            except KeyboardInterrupt:
                break
            
        print("Shutting down")
        self.stop_event.set()
        self.pipeline.set_state(Gst.State.NULL)
        print("Shut down")

if __name__ == "__main__":
    mycooler = CoolerCamera('testcooler', 'rtsp://eflow:ConnectedCoolerSA!!@192.168.1.149:8554/Camera1', 'rtsp://eflow:ConnectedCoolerSA!!@192.168.1.149:8554/Camera2')
    
    # monitor_pipeline_status(mycooler.pipeline)
    
    
    time.sleep(10)
    
    mycooler.start_recording()
    
    time.sleep(30)
    
    mycooler.stop_recording()
    
    time.sleep(10)
    
    mycooler.start_recording()
    
    time.sleep(10)
    
    mycooler.stop_recording()
    
    time.sleep(10)
    
    mycooler.desired_state = "KILL"