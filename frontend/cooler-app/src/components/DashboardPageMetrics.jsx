// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';

export class DashboardPageMetrics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            aggregate: this.props.aggregate,
            coolers: this.props.coolers
        };
    }

    componentDidUpdate(prevProps) {
        if(
            this.props.aggregate !== prevProps.aggregate ||
            this.props.coolers !== prevProps.coolers
        ) {
            this.setState({
            aggregate: this.props.aggregate,
               coolers: this.props.coolers
            });
        }
    }

    render() {
        return (
            <React.Fragment>
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
                    <label
                        style={{
                            position: 'absolute',
                            top: 28,
                            left: 17,
                            width: 200,
                            height: 20,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#CDCDCD'
                        }}
                    >
                        Sales Trend per Location
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 61,
                            left: 17,
                            width: 23,
                            height: 20,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '10px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#FFFFFF'
                        }}
                    >
                        LOCATION
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 61,
                            left: 95,
                            width: 31,
                            height: 20,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '10px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#FFFFFF'
                        }}
                    >
                        SOLD
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 61,
                            left: 145,
                            width: 34,
                            height: 20,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '10px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#FFFFFF'
                        }}
                    >
                        REVENUE
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 61,
                            left: 210,
                            width: 70,
                            height: 20,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '10px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#FFFFFF'
                        }}
                    >
                        RESTOCK
                    </label>
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 80
                        }}
                    >
                        {
                            this.state.coolers.map((cooler, key) => {
                                return (
                                    <div
                                        key={key}
                                        style={{
                                            marginTop: 2
                                        }}
                                    >
                                        <label
                                            style={{
                                                position: 'absolute',
                                                top: 20 * key,
                                                left: 17,
                                                width: 90,
                                                height: 20,
                                                fontFamily: 'Segoe UI',
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                fontSize: '10px',
                                                lineHeight: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                letterSpacing: '0.05em',
                                                color: '#FFFFFF'
                                            }}
                                        >
                                            {cooler.subTitle}
                                        </label>
                                        <label
                                            style={{
                                                position: 'absolute',
                                                top:  20 * key,
                                                left: 95,
                                                height: 20,
                                                fontFamily: 'Segoe UI',
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                fontSize: '10px',
                                                lineHeight: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                letterSpacing: '0.05em',
                                                color: '#FFFFFF'
                                            }}
                                        >
                                            {cooler.ItemQuantityTotal}
                                        </label>
                                        <label
                                            style={{
                                                position: 'absolute',
                                                top:  20 * key,
                                                left: 145,
                                                height: 20,
                                                fontFamily: 'Segoe UI',
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                fontSize: '10px',
                                                lineHeight: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                letterSpacing: '0.05em',
                                                color: '#FFFFFF'
                                            }}
                                        >
                                            ${cooler.RevenueTotal.toFixed(2)}
                                        </label>
                                        <label
                                            style={{
                                                position: 'absolute',
                                                top:  20 * key,
                                                left: 210,
                                                width: 90,
                                                height: 20,
                                                fontFamily: 'Segoe UI',
                                                fontStyle: 'normal',
                                                fontWeight: 700,
                                                fontSize: '10px',
                                                lineHeight: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                letterSpacing: '0.05em',
                                                color: '#FFFFFF'
                                            }}
                                        >
                                            {new Date(cooler.RestockDate).toISOString().slice(0, 10)}
                                        </label>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        left: 418,
                        top: 115,
                        width: 221,
                        height: 223,
                        backgroundColor: '#2A2E53',
                        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '15px'
                    }}
                >
                    <img
                        alt=''
                        src='icons/Card Icons/Money-Icon.svg'
                        style={{
                            position: 'absolute',
                            top: 25,
                            left: 19,
                            width: 34,
                            height: 52
                        }}
                    />
                    <label
                        style={{
                            position: 'absolute',
                            top: 25,
                            left: 63,
                            width: 131,
                            height: 24,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#CDCDCD'
                        }}
                    >
                        Total Drinks Sold
                    </label>
                    <img
                        alt=''
                        src='icons/Map Icons/Increase-Arrow-Icon-Small.svg'
                        style={{
                            position: 'absolute',
                            top: 67,
                            left: 63,
                            width: 23.06,
                            height: 14
                        }}
                    />
                    <label
                        style={{
                            position: 'absolute',
                            top: 97,
                            left: 63,
                            width: 132,
                            height: 36,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '40px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#FFFFFF'
                        }}
                    >
                        {this.state.aggregate.totalDrinksSold}
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 156,
                            left: 63,
                            width: 131,
                            height: 42,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '20px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#B1B7EB'
                        }}
                    >
                        ${this.state.aggregate.totalDrinkSales.toFixed(2)}
                    </label>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        left: 655,
                        top: 115,
                        width: 190,
                        height: 104,
                        backgroundColor: '#2A2E53',
                        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '15px'
                    }}
                >
                    <img
                        alt=''
                        src='icons/Card Icons/Can-Icon_Original_Rest.svg'
                        style={{
                            position: 'absolute',
                            top: 25,
                            left: 19,
                            width: 34,
                            height: 52
                        }}
                    />
                    <label
                        style={{
                            position: 'absolute',
                            top: 25,
                            left: 63,
                            width: 131,
                            height: 24,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#CDCDCD'
                        }}
                    >
                        Original Invt
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 39,
                            left: 63,
                            width: 137,
                            height: 42,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '23.5px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#FFFFFF'
                        }}
                    >
                        {this.state.aggregate.originalInventory}
                    </label>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        left: 655,
                        top: 233,
                        width: 190,
                        height: 104,
                        backgroundColor: '#2A2E53',
                        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '15px'
                    }}
                >
                    <img
                        alt=''
                        src='icons/Card Icons/Can-Icon_Diet_Rest.svg'
                        style={{
                            position: 'absolute',
                            top: 25,
                            left: 19,
                            width: 34,
                            height: 52
                        }}
                    />
                    <label
                        style={{
                            position: 'absolute',
                            top: 25,
                            left: 63,
                            width: 131,
                            height: 24,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#CDCDCD'
                        }}
                    >
                        Diet Invt
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 39,
                            left: 63,
                            width: 137,
                            height: 42,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '23.5px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#FFFFFF'
                        }}
                    >
                        {this.state.aggregate.dietInventory}
                    </label>
                </div>
            </React.Fragment>
        )
    }
}

export default DashboardPageMetrics;