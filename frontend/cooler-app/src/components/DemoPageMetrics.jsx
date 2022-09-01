// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';

export class DemoPageMetrics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            originalInventory: this.props.originalInventory,
            dietInventory: this.props.dietInventory,
            totalDrinksSold: this.props.totalDrinksSold,
            totalDrinkSales: this.props.totalDrinkSales,
            restockDate: this.props.restockDate,
            originalInventoryGlow: false,
            dietInventoryGlow: false
        };
    }

    componentDidUpdate(prevProps) {
        if(
            this.props.originalInventory !== prevProps.originalInventory ||
            this.props.dietInventory !== prevProps.dietInventory ||
            this.props.totalDrinksSold !== prevProps.totalDrinksSold ||
            this.props.totalDrinkSales !== prevProps.totalDrinkSales ||
            this.props.restockDate !== prevProps.restockDate
        ) {
            this.setState({
                originalInventory: this.props.originalInventory,
                dietInventory: this.props.dietInventory,
                totalDrinksSold: this.props.totalDrinksSold,
                totalDrinkSales: this.props.totalDrinkSales,
                restockDate: this.props.restockDate
            })
        }
        
        if(this.props.originalInventory !== prevProps.originalInventory) {
            this.setState({
                originalInventoryGlow: true
            }, () => {
                setTimeout( () => {
                    this.setState({
                        originalInventoryGlow: false
                    });
                }, 1500)
            })
        }
        if(this.props.dietInventory !== prevProps.dietInventory) {
            this.setState({
                dietInventoryGlow: true
            }, () => {
                setTimeout( () => {
                    this.setState({
                        dietInventoryGlow: false
                    });
                }, 1500)
            })
        }
    }

    render() {
        return (
            <React.Fragment>
                <div
                    style={{
                        position: 'absolute',
                        left: 416,
                        top: 115,
                        width: 236,
                        height: 104,
                        backgroundColor: '#2A2E53',
                        // boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
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
                        {this.state.totalDrinksSold}
                    </label>
                    <label
                        style={{
                            position: 'absolute',
                            top: 75,
                            left: 63,
                            width: 131,
                            height: 18,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 600,
                            fontSize: '12px',
                            lineHeight: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#B1B7EB'
                        }}
                    >
                        ${(+(this.state.totalDrinkSales)).toFixed(2)}
                    </label>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        left: 416,
                        top: 233,
                        width: 236,
                        height: 104,
                        backgroundColor: '#2A2E53',
                        // boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '15px'
                    }}
                >
                    <img
                        alt=''
                        src='icons/Card Icons/Restock-Icon.svg'
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
                        Exp. Restock Date
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
                        {new Date(this.state.restockDate).toISOString().slice(0, 10)}
                    </label>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        left: 665,
                        top: 115,
                        width: 190,
                        height: 104,
                        backgroundColor: '#2A2E53',
                        boxShadow: `0px 0px 20px rgba(0, 78, 255, ${this.state.originalInventoryGlow ? 1 : 0})`,
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
                        {this.state.originalInventory}
                    </label>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        left: 665,
                        top: 233,
                        width: 190,
                        height: 104,
                        backgroundColor: '#2A2E53',
                        boxShadow: `0px 0px 20px rgba(255, 153, 80, ${this.state.dietInventoryGlow ? 1 : 0})`,
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
                        {this.state.dietInventory}
                    </label>
                </div>
            </React.Fragment>
        )
    }
}

export default DemoPageMetrics;