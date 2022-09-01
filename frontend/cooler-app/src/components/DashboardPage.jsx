// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';
import Map from './Map';
import DashboardPageSideNav from './DashboardPageSideNav';
import DashboardPageChart from './DashboardPageChart';
import DashboardPageMetrics from './DashboardPageMetrics';
import PageType from '../models/PageType';

export class DashboardPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            azureMapsSubscriptionKey: this.props.azureMapsSubscriptionKey,
            aggregate: this.props.aggregate,
            coolers: this.props.coolers,
            cooler: this.props.cooler,
            currentPage: this.props.currentPage,
            appIsDemo: this.props.appIsDemo,
        };
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.azureMapsSubscriptionKey !== prevProps.azureMapsSubscriptionKey ||
            this.props.aggregate !== prevProps.aggregate,
            this.props.coolers !== prevProps.coolers ||
            this.props.cooler !== prevProps.cooler ||
            this.props.currentPage !== prevProps.currentPage ||
            this.props.appIsDemo !== prevProps.appIsDemo
        ) {
            this.setState({
                azureMapsSubscriptionKey: this.props.azureMapsSubscriptionKey,
                aggregate: this.props.aggregate,
                coolers: this.props.coolers,
                cooler: this.props.cooler,
                currentPage: this.props.currentPage,
                appIsDemo: this.props.appIsDemo
            });
        }
    }

    switchPage = () => {
        this.props.switchPage(this.state.appIsDemo ? PageType.DemoPage : PageType.POCPage, this.state.cooler);
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
                            Dashboard
                        </label>
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0
                        }}
                    >
                        <DashboardPageSideNav
                            currentPage={this.state.currentPage}
                            switchPage={this.switchPage}
                        />
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0
                        }}
                    >
                        <DashboardPageMetrics
                            aggregate={this.state.aggregate}
                            coolers={this.state.coolers}
                        />
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0
                        }}
                    >
                        <DashboardPageChart 
                            aggregate={this.state.aggregate}
                        />
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            top: 390,
                            left: 105,
                            width: 1287,
                            height: 524
                        }}
                    >
                        <Map
                            azureMapsSubscriptionKey={this.state.azureMapsSubscriptionKey}
                            coolers={this.state.coolers}
                            switchPage={this.props.switchPage}
                            appIsDemo={this.state.appIsDemo}
                            width={1287}
                            height={524}
                        />
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default DashboardPage;