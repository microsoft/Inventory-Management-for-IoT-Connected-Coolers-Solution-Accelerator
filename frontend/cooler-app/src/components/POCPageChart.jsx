// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';
import Chart from 'chart.js/auto';

export class POCPageChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cooler: this.props.cooler,
            originalData: [],
            dietData: [],
            totalData: [],
            max: 0
        };

        this.chartRef = React.createRef();
        this.chart = null;
    }

    componentDidMount() {
        if (this.chart == null && this.chartRef.current) {
            this.update();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.cooler !== prevProps.cooler) {
            this.setState({
                cooler: this.props.cooler
            }, () => {
                this.update();
            });
        }
    }

    update = () => {
        const events = this.state.cooler.events;
        const [originalData, dietData, totalData] = this.calculateData(events);
        const max = this.calculateMax(totalData);
        this.setState({
            originalData: originalData,
            dietData: dietData,
            totalData: totalData,
            max: max
        }, () => {
            this.initChart();
        });
    }

    calculateData = (events) => {
        const originalEvents = [];
        const dietEvents = [];
        const totalEvents = [];

        const l = events.length;
        for (let i = 0; i < l; i++) {
            const event = events[i];
            if (event.itemSku === 'contoso') {
                originalEvents.push({
                    x: new Date(event.fulfilledDate).toISOString().slice(11, 16),
                    y: event.totalQuantity,
                    type: 'Original'
                });
            } else if (event.itemSku === 'diet-contoso') {
                dietEvents.push({
                    x: new Date(event.fulfilledDate).toISOString().slice(11, 16),
                    y: event.totalQuantity,
                    type: 'Diet'
                });
            }
        }

        const l2 = originalEvents.length <= dietEvents.length ? originalEvents.length : dietEvents.length;
        for (let i = 0; i < l2; i++) {
            const originalEvent = originalEvents[i];
            const dietEvent = dietEvents[i];
            totalEvents.push({
                x: originalEvent.x,
                y: originalEvent.y + dietEvent.y
            });
        }

        return [originalEvents.slice(- 10), dietEvents.slice(- 10), totalEvents.slice(- 10)];
    }

    calculateMax = (data) => {
        let max = 0;
        const l = data.length;
        for (let i = 0; i < l; i++) {
            const item = data[i];
            if (item.y > max) {
                max = item.y
            }
        }

        return max;
    }

    initChart = () => {
        this.chart = new Chart(this.chartRef.current, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'ORIGINAL INVENTORY OVER TIME',
                    data: this.state.originalData,
                    fill: false,
                    borderColor: '#00B2FF',
                    color: '#00B2FF',
                    segment: {
                        borderDash: (ctx) => {
                            if (ctx.p0.parsed.x > 5) {
                                return [6, 6];
                            } else {
                                return [6, 0];
                            }
                        }
                    },
                    tension: 0.1
                }, {
                    label: 'DIET INVENTORY OVER TIME',
                    data: this.state.dietData,
                    fill: false,
                    borderColor: '#FF9950',
                    color: '#FF9950',
                    segment: {
                        borderDash: (ctx) => {
                            if (ctx.p0.parsed.x > 5) {
                                return [6, 6];
                            } else {
                                return [6, 0];
                            }
                        }
                    },
                    tension: 0.1
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.raw.type}: ${context.raw.y}`;
                            },
                            title: (context) => {
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(211, 211, 211, 0.5)',
                            borderColor: 'rgba(211, 211, 211, 0.5)'
                        },
                        ticks: {
                            color: 'white',
                            font: {
                                family: 'Segoe UI',
                                size: 9,
                                weight: 700,
                                style: 'normal'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        suggestedMax: this.state.max,
                        grid: {
                            color: 'rgba(211, 211, 211, 0.5)',
                            borderColor: 'rgba(211, 211, 211, 0.5)'
                        },
                        ticks: {
                            color: 'white',
                            font: {
                                family: 'Segoe UI',
                                size: 9,
                                weight: 700,
                                style: 'normal'
                            },
                            maxTicksLimit: 4,
                            callback: this.limitYTicks
                        }
                    }
                }
            }
        });
    }

    limitYTicks = (value, index, ticks) => {
        if (value > 0 && value < this.state.max * 1.1) {
            return `${value.toFixed(0)}K`;
        } else {
            return '';
        }
    }

    render() {
        return (
            <React.Fragment>
                <label
                    style={{
                        position: 'absolute',
                        top: 78,
                        left: 906,
                        width: 316,
                        height: 30,
                        fontFamily: 'Segoe UI',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        fontSize: '10px',
                        lineHeight: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        letterSpacing: '0.3em',
                        color: '#FFFFFF'
                    }}
                >
                    ORIGINAL VS. DIET INVENTORY OVER TIME
                </label>
                <div
                    style={{
                        position: 'absolute',
                        left: 884,
                        top: 110
                    }}
                >
                    <div style={{ width: 512, height: 250 }}>
                        <canvas ref={this.chartRef} width={512} height={250}></canvas>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default POCPageChart;