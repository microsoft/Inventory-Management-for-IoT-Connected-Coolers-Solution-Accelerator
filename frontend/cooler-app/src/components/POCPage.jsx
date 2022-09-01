// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';
import ReactJson from 'react-json-view';
import POCPageChart from './POCPageChart';
import POCPageMetrics from './POCPageMetrics';
import POCPageSideNav from './POCPageSideNav';
import PageType from '../models/PageType';

export class POCPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cooler: this.props.cooler,
            events: this.props.cooler.events,
            originalInventory: this.props.cooler.OriginalItemInventory,
            dietInventory: this.props.cooler.DietItemInventory,
            totalDrinksSold: this.props.cooler.ItemQuantityTotal,
            totalDrinkSales: this.props.cooler.RevenueTotal,
            restockDate: this.props.cooler.RestockDate,
        };

        this.reactJSONRef = React.createRef();
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.cooler !== prevProps.cooler ||
            this.props.events !== prevProps.events
        ) {
            this.setState({
                cooler: this.props.cooler,
                events: this.props.events
            });
        }
    }

    switchPage = () => {
        this.props.switchPage(PageType.DashboardPage, null);
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
                        <POCPageSideNav
                            switchPage={this.switchPage}
                            toggleJSON={this.toggleJSON}
                        />
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            left: 105,
                            top: 115,
                            width: 296,
                            height: 223,
                            backgroundColor: '#2A2E53',
                            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                            borderRadius: '15px'
                        }}
                    >
                        <img
                            alt=''
                            src='images/Cooler_Camera-LOS.png'
                            style={{
                                position: 'absolute',
                                top: 16.5,
                                left: 108,
                                width: 80,
                                height: 190
                            }}
                        />
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0
                        }}
                    >
                        <POCPageMetrics
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
                        <POCPageChart
                            cooler={this.state.cooler}
                        />
                    </div>
                    <div
                        style={{
                            position: 'absolute',
                            top: 390,
                            left: 105,
                            width: 1287,
                            height: 524,
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
                                width: 1277,
                                height: 514,
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
                </div>
            </React.Fragment >
        )
    }
}

export default POCPage;