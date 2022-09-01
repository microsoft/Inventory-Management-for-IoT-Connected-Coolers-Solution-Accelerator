// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';
import FilterTypes from './FilterTypes';

export class DemoPageTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events: this.props.events,
            filteredEvents: [],
            filterTypes: [
                "DOOR MOVEMENT",
                "LOW STOCK",
                "OUT OF STOCK",
                "PRODUCT RECOGNITION",
                "PRODUCT DEFECT",
                "TIME OF PURCHASE"
            ],
            sortedEvents: [],
            finalEvents: []
        };
    }

    componentDidMount() {
        this.setState({
            events: this.props.events
        })
    }

    componentDidUpdate(prevProps) {
        if(this.props.events !== prevProps.events) {
            this.setState({
                events: this.props.events
            }, () => {
                this.filterEvents();
            });
        }
    }

    sortEvents = () => {
        const sortedEvents = [];
        const l = this.state.filteredEvents.length;
        for(let i = l-1; i >= 0; i--) {
            const event = this.state.filteredEvents[i];
            sortedEvents.push(event);
        }

        this.setState({
            sortedEvents: sortedEvents
        });
    }

    filterEvent = (event) => {
        const l = this.state.filterTypes.length;
        for(let i = 0; i < l; i++) {
            const filterType = this.state.filterTypes[i];
            if(event.type === filterType) {
                return true;
            }
        }
        return false;
    }

    filterEvents = () => {
        const filteredEvents = []
        const l = this.state.events.length;
        for(let i = 0; i < l; i++) {
            const event = this.state.events[i];
            if(this.filterEvent(event)) {
                filteredEvents.push(event);
            }
        }
        this.setState({
            filteredEvents: filteredEvents
        }, () => {
            this.sortEvents();
        });
    }

    updateFilterTypes = (filterTypes) => {
        this.setState({
            filterTypes: filterTypes
        }, () => {
            this.filterEvents();
        });
    }

    render() {
        return (
            <React.Fragment>
                <div
                    style={{
                        position: 'absolute',
                        left: 1260,
                        top: 371,
                        zIndex: 2
                    }}
                >
                    <FilterTypes 
                        updateFilterTypes={this.updateFilterTypes}
                    />
                </div>
                <div
                    style={{
                        position: 'absolute',
                        left: 412,
                        top: 411
                    }}
                >
                    <label
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 88,
                            height: 16,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 900,
                            fontSize: '10px',
                            lineHeight: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            textAlign: 'center',
                            letterSpacing: '0.3em',
                            color: '#CDCDCD'
                        }}
                    >
                        EVENT #
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 96,
                            width: 114.87,
                            height: 16,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 900,
                            fontSize: '10px',
                            lineHeight: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            textAlign: 'center',
                            letterSpacing: '0.3em',
                            color: '#CDCDCD'
                        }}
                    >
                        TYPE
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 332,
                            width: 114.07,
                            height: 16,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 900,
                            fontSize: '10px',
                            lineHeight: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            textAlign: 'center',
                            letterSpacing: '0.3em',
                            color: '#CDCDCD'
                        }}
                    >
                        DATE
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 468,
                            width: 114.07,
                            height: 16,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 900,
                            fontSize: '10px',
                            lineHeight: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            textAlign: 'center',
                            letterSpacing: '0.3em',
                            color: '#CDCDCD'
                        }}
                    >
                        TIME
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 603,
                            width: 221,
                            height: 16,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 900,
                            fontSize: '10px',
                            lineHeight: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            textAlign: 'center',
                            letterSpacing: '0.3em',
                            color: '#CDCDCD'
                        }}
                    >
                        DESCRIPTION
                    </label>
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 22
                        }}>
                        {
                            this.state.sortedEvents.slice(0, 10).map((event, key) => {
                                return (
                                    <div
                                        key={key}
                                        style={{
                                            position: 'relative',
                                            marginTop: 7,
                                            width: 980,
                                            height: 41,
                                            backgroundColor: 'rgba(199, 238, 255, 0.1)',
                                            borderRadius: '15px'
                                        }}
                                    >
                                        <label
                                            style={{
                                                position: 'absolute',
                                                top: 13,
                                                left: 20.79,
                                                // width: 88,
                                                height: 16,
                                                fontFamily: 'Segoe UI',
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                fontSize: '10px',
                                                lineHeight: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                letterSpacing: '0.3em',
                                                color: '#FFFFFF'
                                            }}
                                        >
                                            {+(event.id) + 1}
                                        </label>
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 5.5,
                                                left: 93,
                                                width: 185,
                                                height: 30,
                                                alignItems: 'center',
                                                backgroundColor: event.product === 'contoso' ? 'rgb(33, 59, 101, 1)' : 'rgba(59, 54, 76, 1)',
                                                borderRadius: 20
                                            }}
                                        >
                                            <label
                                                style={{
                                                    fontFamily: 'Segoe UI',
                                                    fontStyle: 'normal',
                                                    fontWeight: 700,
                                                    fontSize: '9px',
                                                    lineHeight: '30px',
                                                    letterSpacing: '0.3em',
                                                    color: event.product === 'contoso' ? '#00B2FF' : '#FF9950', 
                                                }}
                                            >
                                                {event.type}
                                            </label>
                                        </div>
                                        <label
                                            style={{
                                                position: 'absolute',
                                                top: 6,
                                                left: 330,
                                                // width: 82,
                                                height: 30,
                                                fontFamily: 'Segoe UI',
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                fontSize: '10px',
                                                lineHeight: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                letterSpacing: '0.3em',
                                                color: '#FFFFFF'
                                            }}
                                        >
                                            {event.date}
                                        </label>
                                        <label
                                            style={{
                                                position: 'absolute',
                                                top: 6,
                                                left: 466,
                                                // width: 80,
                                                height: 30,
                                                fontFamily: 'Segoe UI',
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                fontSize: '10px',
                                                lineHeight: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                letterSpacing: '0.3em',
                                                color: '#FFFFFF'
                                            }}
                                        >
                                            {event.time}
                                        </label>
                                        <label
                                            style={{
                                                position: 'absolute',
                                                top: 6,
                                                left: 601,
                                                // width: 221,
                                                height: 30,
                                                fontFamily: 'Segoe UI',
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                fontSize: '10px',
                                                lineHeight: '30px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                letterSpacing: '0.3em',
                                                color: '#CDCDCD'
                                            }}
                                        >
                                            {event.description}
                                        </label>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </React.Fragment >
        )
    }
}

export default DemoPageTable;