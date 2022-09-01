// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';

export class POCPageSideNav extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        
        this.dashboardPageButtonRef = React.createRef();
        this.coolerPageButtonRef = React.createRef();
    }

    render() {
        return (
            <React.Fragment>
                <div
                    style={{
                        position: 'absolute',
                        left: 25,
                        top: 112,
                        width: 55,
                        height: 136,
                        backgroundColor: '#2A2E53',
                        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                        borderRadius: '40px'
                    }}
                >
                    <img
                        ref={this.dashboardPageButtonRef}
                        alt=""
                        title="Click to navigate to Dashboard Page"
                        src="icons/Nav Icons/Dashboard-Icon_Rest.svg"
                        style={{
                            position: 'absolute',
                            left: 10,
                            top: 25,
                            width: 35,
                            height: 35,
                            zIndex: 1
                        }}
                        onMouseEnter={(e) => {
                            if (this.dashboardPageButtonRef.current) {
                                this.dashboardPageButtonRef.current.src = "icons/Nav Icons/Dashboard-Icon_Hover.svg"
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (this.dashboardPageButtonRef.current) {
                                this.dashboardPageButtonRef.current.src = "icons/Nav Icons/Dashboard-Icon_Rest.svg"
                            }
                        }}
                        onMouseDown={(e) => {
                            if (this.dashboardPageButtonRef.current) {
                                this.dashboardPageButtonRef.current.src = "icons/Nav Icons/Dashboard-Icon_Press-selected.svg"
                            }
                        }}
                        onMouseUp={(e) => {
                            if (this.dashboardPageButtonRef.current) {
                                this.dashboardPageButtonRef.current.src = "icons/Nav Icons/Dashboard-Icon_Hover.svg"
                            }
                            this.props.switchPage();
                        }}
                    />
                    <img
                        ref={this.coolerPageButtonRef}
                        alt=""
                        title="Cooler Page"
                        src="Icons/Nav Icons/Cooler-Icon_Selected.svg"
                        style={{
                            position: 'absolute',
                            left: 10,
                            top: 76,
                            width: 35,
                            height: 35,
                            zIndex: 1
                        }}
                        onMouseEnter={(e) => {
                            if (this.coolerPageButtonRef.current) {
                                this.coolerPageButtonRef.current.src = "icons/Nav Icons/Cooler-Icon_Hover.svg"
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (this.coolerPageButtonRef.current) {
                                this.coolerPageButtonRef.current.src = "icons/Nav Icons/Cooler-Icon_Selected.svg"
                            }
                        }}
                        onMouseDown={(e) => {
                            if (this.coolerPageButtonRef.current) {
                                this.coolerPageButtonRef.current.src = "icons/Nav Icons/Cooler-Icon_Press-selected.svg"
                            }
                        }}
                        onMouseUp={(e) => {
                            if (this.coolerPageButtonRef.current) {
                                this.coolerPageButtonRef.current.src = "icons/Nav Icons/Cooler-Icon_Hover.svg"
                            }
                        }}
                    />
                </div>
            </React.Fragment>
        )
    }
}

export default POCPageSideNav;