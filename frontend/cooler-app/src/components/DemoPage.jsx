// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';
import ReactJson from 'react-json-view';
import PageType from '../models/PageType';
import DemoPageChart from './DemoPageChart';
import DemoPageMetrics from './DemoPageMetrics';
import DemoPageSideNav from './DemoPageSideNav';
import DemoPageTable from './DemoPageTable';
import videos from '../models/videos/videos.json'

export class DemoPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cooler: this.props.cooler,
            currentPage: this.props.currentPage,
            showOverlay: true,
            videos: videos,
            videosList: [2, 3, 4, 6, 9],
            videosIndex: 4,
            playVideos: true,
            events: [],
            showJSON: false,
            timelineWidth: 924,
            originalInventory: this.props.cooler.OriginalItemInventory,
            dietInventory: this.props.cooler.DietItemInventory,
            totalDrinksSold: this.props.cooler.ItemQuantityTotal,
            totalDrinkSales: this.props.cooler.RevenueTotal,
            restockDate: this.props.cooler.RestockDate,
        };

        // insight overlay
        this.insightOverlayButtonRef = React.createRef();
        this.insightOverlayLabelRef = React.createRef();

        // videos
        this.topVideoRef = React.createRef();
        this.bottomVideoRef = React.createRef();
        this.topCanvasRef = React.createRef();
        this.bottomCanvasRef = React.createRef();
        this.videoWidth = 640;
        this.videoHeight = 480;
        this.videoScale = 0.50;
        this.videoRotation = 90;
        this.showControls = false;
        this.currentTime = 0;

        this.currentTimeIncrement = 0;
        this.currentFrame = 1;
        this.fps = 0;
        this.maxTime = 0;

        // table filter
        this.filterButtonImgRef = React.createRef();

        // json
        this.reactJSONRef = React.createRef();

        // videos timeline
        this.playButtonRef = React.createRef();
        this.playTimelineRef = React.createRef();
        this.timelineUnit = this.state.timelineWidth / this.numFrames;
    }

    componentDidMount() {
        let numFrames = this.state.videos[this.state.videosIndex].top.events.length;
        let videoLength = numFrames / 20;
        let videoUnit = videoLength / numFrames;
        let maxTime = numFrames * videoUnit;
        let fps = 1000 / maxTime;

        this.currentTimeIncrement = videoUnit;
        this.currentFrame = 1;
        this.fps = fps;
        this.maxTime = maxTime;

        this.timelineUnit = this.state.timelineWidth / numFrames;

        setInterval(() => {
            if (
                this.state.playVideos &&
                this.state.videos &&
                this.state.videos.length > 0 &&
                this.state.videos[this.state.videosIndex] &&
                this.state.videos[this.state.videosIndex].events
            ) {
                this.currentFrame++;
                this.currentTime += this.currentTimeIncrement;
                if (this.currentTime > this.maxTime) {
                    this.currentTime = 0;
                    this.currentFrame = 1;
                    this.nextVideo();
                } else {
                    if (this.playTimelineRef.current) {
                        const width = `${this.currentFrame * this.timelineUnit}px`;
                        this.playTimelineRef.current.style.width = width;
                    }

                    const l = this.state.videos[this.state.videosIndex].events.length;
                    for (let i = 0; i < l; i++) {
                        const event = this.state.videos[this.state.videosIndex].events[i];
                        if (this.currentFrame === event.frame) {
                            this.addEvent(event);
                        }
                    }

                    if (this.topVideoRef.current &&
                        this.bottomVideoRef.current &&
                        this.topCanvasRef.current &&
                        this.bottomCanvasRef.current) {
                        this.topVideoRef.current.currentTime = this.currentTime;
                        this.bottomVideoRef.current.currentTime = this.currentTime;
                        const topCanvasContext = this.topCanvasRef.current?.getContext("2d");
                        const bottomCanvasContext = this.bottomCanvasRef.current?.getContext("2d");
                        if (topCanvasContext) {
                            topCanvasContext.clearRect(0, 0, this.videoWidth, this.videoHeight);
                            this.drawDetections(topCanvasContext, this.state.videos[this.state.videosIndex].top.events[this.currentFrame - 1].inferences);
                        }
                        if (bottomCanvasContext) {
                            bottomCanvasContext.clearRect(0, 0, this.videoWidth, this.videoHeight);
                            this.drawDetections(bottomCanvasContext, this.state.videos[this.state.videosIndex].bottom.events[this.currentFrame - 1].inferences);
                        }
                    }
                }
            }
        }, this.fps);
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.cooler !== prevProps.cooler ||
            this.props.currentPage !== prevProps.currentPage
        ) {
            this.setState({
                cooler: this.props.cooler,
                currentPage: this.props.currentPage
            }, () => {
                this.resetDemo();
            });
        }
    }

    calculateExpRestockDate = () => {
        const datetime = new Date();
        datetime.setDate(datetime.getDate() + 3);
        return datetime.toISOString().slice(0, 10);
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    nextVideo = () => {
        const index = this.random(0, 4);
        const nextVideoIndex = this.state.videosList[index];
        this.setState({
            videosIndex: nextVideoIndex
        }, () => {
            let numFrames = this.state.videos[this.state.videosIndex].top.events.length;
            let videoLength = numFrames / 20;
            let videoUnit = videoLength / numFrames;
            let maxTime = numFrames * videoUnit;
            let fps = 1000 / maxTime;

            this.currentTimeIncrement = videoUnit;
            this.currentFrame = 1;
            this.fps = fps;
            this.maxTime = maxTime;

            this.timelineUnit = this.state.timelineWidth / numFrames;
        });
    }

    resetDemo = () => {
        this.setState({
            cooler: this.props.cooler,
            videosIndex: 0,
            playVideos: this.props.currentPage === PageType.DemoPage,
            events: [],
            originalInventory: this.props.cooler.OriginalItemInventory,
            dietInventory: this.props.cooler.DietItemInventory,
            totalDrinksSold: this.props.cooler.ItemQuantityTotal,
            totalDrinkSales: this.props.cooler.RevenueTotal,
            restockDate: this.props.cooler.RestockDate,
        }, () => {
            let numFrames = this.state.videos[this.state.videosIndex].top.events.length;
            let videoLength = numFrames / 20;
            let videoUnit = videoLength / numFrames;
            let maxTime = numFrames * videoUnit;
            let fps = 1000 / maxTime;

            this.currentTimeIncrement = videoUnit;
            this.currentFrame = 1;
            this.fps = fps;
            this.maxTime = maxTime;

            this.timelineUnit = this.state.timelineWidth / numFrames;
        });
    }

    switchPage = () => {
        this.props.switchPage(PageType.DashboardPage, null);
    }

    toggleJSON = () => {
        this.setState({
            showJSON: !this.state.showJSON,
            events: [...this.state.events]
        }, () => {
            const events = this.state.events;
        });
    }

    addEvent = (event) => {
        const datetime = new Date();
        const date = datetime.toISOString().slice(0, 10);
        const time = datetime.toISOString().slice(11, 19);
        const description = `${event.event === 'itemAdded' ? 'ADD' : 'REMOVE'} 1 ${event.type === 'diet-contoso' ? 'DIET ' : ''} CONTOSO CAN`;

        this.state.events.push({
            id: this.state.events.length,
            product: event.type,
            type: "PRODUCT RECOGNITION",
            date: date,
            time: time,
            description: description
        });

        let dietInventory = +this.state.dietInventory;
        let originalInventory = +this.state.originalInventory;
        let totalDrinksSold = +this.state.totalDrinksSold;
        let totalDrinkSales = +this.state.totalDrinkSales;

        if (event.event === 'itemAdded') {
            if (event.type === 'contoso') {
                originalInventory = originalInventory + 1;
            } else if (event.type === 'diet-contoso') {
                dietInventory = dietInventory + 1;
            }
        } else if (event.event === 'itemRemoved') {
            if (event.type === 'contoso') {
                originalInventory = originalInventory - 1;
            } else if (event.type === 'diet-contoso') {
                dietInventory = dietInventory - 1;
            }
            totalDrinksSold = totalDrinksSold + 1;
            totalDrinkSales = (totalDrinkSales + 1) * 1.99;
        }

        this.setState({
            dietInventory: dietInventory,
            originalInventory: originalInventory,
            totalDrinksSold: totalDrinksSold,
            totalDrinkSales: totalDrinkSales,
            events: [...this.state.events]
        }, () => {
            if (this.reactJSONRef.current) {
                this.reactJSONRef.current.src = { events: this.state.events };
            }
        });
    }

    drawDetections(canvasContext, detections) {
        const l = detections.length;
        for (let i = 0; i < l; i++) {
            const detection = detections[i];
            if (this.state.showOverlay) {
                this.drawDetection(canvasContext, detection.entity);
            }
        }
    }

    drawDetection(canvasContext, detection) {
        if (detection.hasOwnProperty("box")) {
            if (detection.tag.value === "contoso") {
                canvasContext.strokeStyle = '#00B2FF';
            } else {
                canvasContext.strokeStyle = '#DD5D00';
            }
            canvasContext.lineWidth = 3;
            canvasContext.beginPath();
            canvasContext.moveTo(detection.box.l + detection.box.w / 2, detection.box.t);
            canvasContext.arcTo(
                detection.box.l + detection.box.w,
                detection.box.t,
                detection.box.l + detection.box.w,
                detection.box.t + detection.box.h,
                10
            );
            canvasContext.arcTo(
                detection.box.l + detection.box.w,
                detection.box.t + detection.box.h,
                detection.box.l,
                detection.box.t + detection.box.h,
                10
            );
            canvasContext.arcTo(
                detection.box.l,
                detection.box.t + detection.box.h,
                detection.box.l,
                detection.box.t,
                10
            );
            canvasContext.arcTo(
                detection.box.l,
                detection.box.t,
                detection.box.l + detection.box.w,
                detection.box.t,
                10
            );
            canvasContext.arcTo(
                detection.box.l + detection.box.w,
                detection.box.t,
                detection.box.l + detection.box.w,
                detection.box.t + detection.box.h,
                10
            );
            canvasContext.stroke();
        }
    }

    render() {
        return (
            <React.Fragment>
                <div
                    style={{
                        position: 'relative',
                        width: 1440
                    }}
                >
                    {/* Cooler Title and Subtitle */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 105,
                            top: 42
                        }}
                    >
                        <label
                            style={{
                                margin: '7px 0px',
                                height: 20,
                                fontFamily: 'Segoe UI',
                                fontStyle: 'normal',
                                fontWeight: 700,
                                fontSize: '20px',
                                lineHeight: '20px',
                                letterSpacing: '0.05em',
                                color: '#FFFFFF'
                            }}
                        >
                            {this.props.cooler.title} {this.props.cooler.subTitle}
                        </label>
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0
                        }}
                    >
                        <DemoPageSideNav
                            switchPage={this.switchPage}
                        />
                    </div>

                    {/* Videos */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 105,
                            top: 112,
                            width: 282,
                            height: 847,
                            backgroundColor: '#090E30',
                            borderRadius: '40px'
                        }}
                    >
                        <label
                            style={{
                                position: 'absolute',
                                left: 66,
                                top: 26,
                                width: 96,
                                height: 18,
                                fontFamily: 'Segoe UI',
                                fontStyle: 'normal',
                                fontWeight: 400,
                                fontSize: '13px',
                                lineHeight: '18px',
                                letterSpacing: '0.05em',
                                color: '#FFFFFF'
                            }}
                        >
                            Insight Overlay
                        </label>

                        <img
                            ref={this.insightOverlayButtonRef}
                            alt=""
                            src="Icons/Toggle/Toggle-Button_On_Rest.svg"
                            style={{
                                position: 'absolute',
                                left: 172,
                                top: 19.5,
                                width: 64,
                                height: 30,
                                zIndex: 1
                            }}
                            onMouseEnter={(e) => {
                                if (this.insightOverlayButtonRef.current) {
                                    if (this.state.showOverlay) {
                                        this.insightOverlayButtonRef.current.src = "Icons/Toggle/Toggle-Button_On_Hover.svg"
                                    } else {
                                        this.insightOverlayButtonRef.current.src = "Icons/Toggle/Toggle-Button_Off_Hover.svg"
                                    }
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (this.insightOverlayButtonRef.current) {
                                    if (this.state.showOverlay) {
                                        this.insightOverlayButtonRef.current.src = "Icons/Toggle/Toggle-Button_On_Rest.svg"
                                    } else {
                                        this.insightOverlayButtonRef.current.src = "Icons/Toggle/Toggle-Button_Off_Rest.svg"
                                    }
                                }
                            }}
                            onClick={(e) => {
                                this.setState({
                                    showOverlay: !this.state.showOverlay
                                }, () => {
                                    if (this.insightOverlayButtonRef.current) {
                                        if (this.state.showOverlay) {
                                            this.insightOverlayButtonRef.current.src = "Icons/Toggle/Toggle-Button_On_Hover.svg"
                                        } else {
                                            this.insightOverlayButtonRef.current.src = "Icons/Toggle/Toggle-Button_Off_Hover.svg"
                                        }
                                    }
                                })
                            }}
                        />
                        <label
                            ref={this.insightOverlayLabelRef}
                            style={{
                                position: 'absolute',
                                left: 242,
                                top: 25,
                                width: 29,
                                height: 21,
                                fontFamily: 'Segoe UI',
                                fontStyle: 'normal',
                                fontWeight: 400,
                                fontSize: '13px',
                                lineHeight: '18px',
                                letterSpacing: '0.05em',
                                color: '#FFFFFF'
                            }}
                        >
                            {
                                this.state.showOverlay ? 'On' : 'Off'
                            }
                        </label>

                        <label
                            ref={this.insightOverlayLabelRef}
                            style={{
                                position: 'absolute',
                                left: 26,
                                top: 60,
                                width: 155.37,
                                height: 32.66,
                                fontFamily: 'Segoe UI',
                                fontStyle: 'normal',
                                fontWeight: 700,
                                fontSize: '10px',
                                lineHeight: '30px',
                                letterSpacing: '0.3em',
                                color: '#FFFFFF'
                            }}
                        >
                            TOP RIGHT CAMERA
                        </label>
                        <div
                            style={{
                                position: "absolute",
                                top: 15,
                                left: -179
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <video
                                    ref={this.topVideoRef}
                                    controls={this.showControls}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        borderRadius: 20,
                                        transform: `scale(${this.videoScale}) rotate(${this.videoRotation}deg)`
                                    }}
                                    width={this.videoWidth}
                                    height={this.videoHeight}
                                    src={`videos/${this.state.videos[this.state.videosIndex].top.inputVideo}`}
                                    type="video/mp4"
                                />
                                <canvas
                                    ref={this.topCanvasRef}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        transform: `scale(${this.videoScale}) rotate(${this.videoRotation}deg)`,
                                        border: '1px solid black'
                                    }}
                                    width={this.videoWidth}
                                    height={this.videoHeight}
                                />
                            </div>
                        </div>

                        <label
                            ref={this.insightOverlayLabelRef}
                            style={{
                                position: 'absolute',
                                left: 26,
                                top: 442,
                                // width: 163,
                                height: 30,
                                fontFamily: 'Segoe UI',
                                fontStyle: 'normal',
                                fontWeight: 700,
                                fontSize: '10px',
                                lineHeight: '30px',
                                letterSpacing: '0.3em',
                                color: '#FFFFFF'
                            }}
                        >
                            BOTTOM LEFT CAMERA
                        </label>

                        <div
                            style={{
                                position: "absolute",
                                top: 15,
                                left: -179
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <video
                                    ref={this.bottomVideoRef}
                                    controls={this.showControls}
                                    style={{
                                        position: 'absolute',
                                        top: this.videoWidth * this.videoScale + 60,
                                        left: 0,
                                        borderRadius: 20,
                                        transform: `scale(${this.videoScale}) rotate(-${this.videoRotation}deg)`
                                    }}
                                    width={this.videoWidth}
                                    height={this.videoHeight}
                                    src={`videos/${this.state.videos[this.state.videosIndex].bottom.inputVideo}`}
                                    type="video/mp4"
                                />
                                <canvas
                                    ref={this.bottomCanvasRef}
                                    style={{
                                        position: 'absolute',
                                        top: this.videoWidth * this.videoScale + 60,
                                        left: 0,
                                        transform: `scale(${this.videoScale}) rotate(-${this.videoRotation}deg)`,
                                        border: '1px solid black'
                                    }}
                                    width={this.videoWidth}
                                    height={this.videoHeight}
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0
                        }}
                    >
                        <DemoPageMetrics
                            originalInventory={this.state.originalInventory}
                            dietInventory={this.state.dietInventory}
                            totalDrinksSold={this.state.totalDrinksSold}
                            totalDrinkSales={this.state.totalDrinkSales}
                            restockDate={this.state.restockDate}
                        />
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0
                        }}
                    >
                        <DemoPageChart
                            cooler={this.state.cooler}
                        />
                    </div>

                    {/* JSON or Table */}

                    <label
                        style={{
                            position: 'absolute',
                            left: 412,
                            top: 370,
                            width: 105,
                            height: 30,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 700,
                            fontSize: '10px',
                            lineHeight: '30px',
                            letterSpacing: '0.3em',
                            color: '#0078D4',
                            borderBottom: `${this.state.showJSON ? 0 : 2}px solid #0078D4`
                        }}
                        onClick={(e) => {
                            this.toggleJSON();
                        }}
                    >
                        VIEW EVENTS
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            left: 542,
                            top: 370,
                            width: 175,
                            height: 30,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 700,
                            fontSize: '10px',
                            lineHeight: '30px',
                            letterSpacing: '0.3em',
                            color: '#0078D4',
                            borderBottom: `${this.state.showJSON ? 2 : 0}px solid #0078D4`
                        }}
                        onClick={(e) => {
                            this.toggleJSON();
                        }}
                    >
                        VIEW EVENT LOG DATA
                    </label>
                    {
                        this.state.showJSON ? (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 412,
                                    left: 412,
                                    width: 974,
                                    height: 484,
                                    backgroundColor: '#0b1c2c',
                                    border: '0.5px solid #A6A6A6',
                                    borderRadius: '20px 10px 10px 20px'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 5,
                                        left: 5,
                                        width: 964,
                                        height: 474,
                                        overflowY: 'scroll',
                                        textAlign: 'left'
                                    }}
                                >
                                    <ReactJson
                                        ref={this.reactJSONRef}
                                        src={{
                                            originalInventory: this.state.cooler.OriginalItemInventory,
                                            dietInventory: this.state.cooler.DietItemInventory,
                                            totalDrinksSold: this.state.cooler.ItemQuantityTotal,
                                            totalDrinkSales: this.state.cooler.RevenueTotal,
                                            restockDate: this.state.cooler.RestockDate,
                                            events: this.state.cooler.events
                                        }}
                                        theme={'harmonic'}
                                        iconStyle={'square'}
                                        indentWidth={5}
                                        enableEdit={false}
                                        enableAdd={false}
                                        enableDelete={false}
                                        enableClipboard={false}
                                    />
                                </div>
                            </div>
                        ) : (
                            <DemoPageTable
                                events={this.state.events}
                            />
                        )
                    }

                    {/* Video Timeline */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 412,
                            top: 920,
                            width: 974,
                            height: 38,
                            backgroundColor: '#090E30',
                            borderRadius: '15px'
                        }}
                    >
                        <img
                            ref={this.playButtonRef}
                            alt=''
                            src={this.state.playVideos ? 'icons/Video Control Icons/Pause-Icon.svg' : 'icons/Video Control Icons/Play-Icon.svg'}
                            style={{
                                position: 'absolute',
                                top: 9,
                                left: 8,
                                width: 20,
                                height: 20
                            }}
                            onClick={(e) => {
                                this.setState({
                                    playVideos: !this.state.playVideos
                                }, () => {
                                    if (this.playButtonRef.current) {
                                        this.playButtonRef.current.src = this.state.playVideos ?
                                            'icons/Video Control Icons/Pause-Icon.svg' :
                                            'icons/Video Control Icons/Play-Icon.svg'
                                    }
                                });
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 17.5,
                                left: 37,
                                width: this.state.timelineWidth,
                                height: 3,
                                backgroundColor: '#C4C4C4',
                                borderRadius: 20
                            }}
                        >

                        </div>

                        <div
                            ref={this.playTimelineRef}
                            style={{
                                position: 'absolute',
                                top: 17.5,
                                left: 37,
                                width: 22,
                                height: 3,
                                backgroundColor: '#0078D4',
                                borderRadius: 20,
                                zIndex: 1
                            }}
                        >

                        </div>
                    </div>
                </div>
            </React.Fragment >
        )
    }
}

export default DemoPage;