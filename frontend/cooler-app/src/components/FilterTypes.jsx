// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';
import FilterTypesElement from './FilterTypesElement';

export class FilterTypes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Dropdown
            showItems: false,
            dropdownBackgroundColor: '#252E54',
            buttonBackgroundColor: '#252E54',
            allChecked: true,
            doorMovementChecked: true,
            lowStockChecked: true,
            outOfStockChecked: true,
            productRecognitionChecked: true,
            productDefectChecked: true,
            timeOfPurchaseChecked: true,
            filterTypes: [],
            // Button
            filterImage: 'Rest'
        };
    }

    areAllChecked = () => {
        return (
            this.state.doorMovementChecked &&
            this.state.lowStockChecked &&
            this.state.outOfStockChecked &&
            this.state.productRecognitionChecked &&
            this.state.productDefectChecked &&
            this.state.timeOfPurchaseChecked
        );
    }

    numChecked = () => {
        let num = 0;

        if (this.state.doorMovementChecked) {
            num++;
        }
        if (this.state.lowStockChecked) {
            num++;
        }
        if (this.state.outOfStockChecked) {
            num++;
        }
        if (this.state.productRecognitionChecked) {
            num++;
        }
        if (this.state.productDefectChecked) {
            num++;
        }
        if (this.state.timeOfPurchaseChecked) {
            num++;
        }

        return num;
    }

    updateFilterTypes = () => {
        let filterTypes = [];
        if (this.state.doorMovementChecked) {
            filterTypes.push("DOOR MOVEMENT");
        }
        if (this.state.lowStockChecked) {
            filterTypes.push("LOW STOCK");
        }
        if (this.state.outOfStockChecked) {
            filterTypes.push("OUT OF STOCK");
        }
        if (this.state.productRecognitionChecked) {
            filterTypes.push("PRODUCT RECOGNITION");
        }
        if (this.state.productDefectChecked) {
            filterTypes.push("PRODUCT DEFECT");
        }
        if (this.state.timeOfPurchaseChecked) {
            filterTypes.push("TIME OF PURCHASE");
        }
        this.setState({
            filterTypes: filterTypes
        }, () => {
            this.props.updateFilterTypes(this.state.filterTypes);
        });
    }

    render() {
        return (
            <React.Fragment>
                <div
                    style={{
                        position: 'relative'
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 132,
                            height: 36,
                            backgroundColor: this.state.dropdownBackgroundColor,
                            border: `${this.state.showItems ? 1 : 0}px solid #FFFFFF`,
                            borderRadius: 15,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}
                        onMouseEnter={(e) => {
                            this.setState({
                                dropdownBackgroundColor: '#404D71'
                            });
                        }}
                        onMouseLeave={(e) => {
                            this.setState({
                                dropdownBackgroundColor: '#252E54'
                            });
                        }}
                        onMouseDown={(e) => {
                            this.setState({
                                dropdownBackgroundColor: '#5E6B8D',
                                showItems: !this.state.showItems
                            });
                        }}
                        onMouseUp={(e) => {
                            this.setState({
                                dropdownBackgroundColor: '#252E54'
                            });
                        }}
                    >
                        <label style={{
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: 900,
                            fontSize: '10px',
                            lineHeight: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            textSlign: 'center',
                            letterSpacing: '0.3em',
                            color: '#FFFFFF',
                        }}>
                            TYPE: {this.areAllChecked() ? 'ALL' : this.numChecked()}
                        </label>
                    </div>
                    {
                        this.state.showItems ? (
                            <React.Fragment>
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 43,
                                        // width: 165,
                                        backgroundColor: '#252E54',
                                        border: '0.5px solid #FFFFFF',
                                        boxShadow: '0px 2px 20px rgba(160, 160, 160, 0.5)',
                                        borderRadius: '15px'
                                    }}
                                >
                                    <FilterTypesElement
                                        label={"All"}
                                        borderRadius={'15px 15px 0px 0px'}
                                        checked={this.state.allChecked}
                                        onCheck={(checked) => {
                                            this.setState({
                                                allChecked: checked,
                                                doorMovementChecked: checked,
                                                lowStockChecked: checked,
                                                outOfStockChecked: checked,
                                                productRecognitionChecked: checked,
                                                productDefectChecked: checked,
                                                timeOfPurchaseChecked: checked
                                            }, () => {
                                                this.updateFilterTypes();
                                            })
                                        }}
                                    />
                                    <FilterTypesElement
                                        label={"Door Movement"}
                                        checked={this.state.doorMovementChecked}
                                        onCheck={(checked) => {
                                            this.setState({
                                                doorMovementChecked: checked
                                            }, () => {
                                                this.setState({
                                                    allChecked: this.areAllChecked()
                                                }, () => {
                                                    this.updateFilterTypes();
                                                })
                                            });
                                        }}
                                    />
                                    <FilterTypesElement
                                        label={"Low Stock"}
                                        checked={this.state.lowStockChecked}
                                        onCheck={(checked) => {
                                            this.setState({
                                                lowStockChecked: checked
                                            }, () => {
                                                this.setState({
                                                    allChecked: this.areAllChecked()
                                                }, () => {
                                                    this.updateFilterTypes();
                                                })
                                            });
                                        }}
                                    />
                                    <FilterTypesElement
                                        label={"Out of Stock"}
                                        checked={this.state.outOfStockChecked}
                                        onCheck={(checked) => {
                                            this.setState({
                                                outOfStockChecked: checked
                                            }, () => {
                                                this.setState({
                                                    allChecked: this.areAllChecked()
                                                }, () => {
                                                    this.updateFilterTypes();
                                                })
                                            });
                                        }}
                                    />
                                    <FilterTypesElement
                                        label={"Product Recognition"}
                                        checked={this.state.productRecognitionChecked}
                                        onCheck={(checked) => {
                                            this.setState({
                                                productRecognitionChecked: checked
                                            }, () => {
                                                this.setState({
                                                    allChecked: this.areAllChecked()
                                                }, () => {
                                                    this.updateFilterTypes();
                                                })
                                            });
                                        }}
                                    />
                                    <FilterTypesElement
                                        label={"Product Defect"}
                                        checked={this.state.productDefectChecked}
                                        onCheck={(checked) => {
                                            this.setState({
                                                productDefectChecked: checked
                                            }, () => {
                                                this.setState({
                                                    allChecked: this.areAllChecked()
                                                }, () => {
                                                    this.updateFilterTypes();
                                                })
                                            });
                                        }}
                                    />
                                    <FilterTypesElement
                                        label={"Time of Purchase"}
                                        borderRadius={'0px 0px 15px 15px'}
                                        checked={this.state.timeOfPurchaseChecked}
                                        onCheck={(checked) => {
                                            this.setState({
                                                timeOfPurchaseChecked: checked
                                            }, () => {
                                                this.setState({
                                                    allChecked: this.areAllChecked()
                                                }, () => {
                                                    this.updateFilterTypes();
                                                })
                                            });
                                        }}
                                    />
                                </div>
                            </React.Fragment>
                        ) : null
                    }
                    {/* <div
                        style={{
                            position: 'absolute',
                            left: 132,
                            top: 0,
                            width: 108,
                            height: 36,
                            backgroundColor: this.state.buttonBackgroundColor,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '15px'
                        }}

                        onMouseEnter={(e) => {
                            this.setState({
                                buttonBackgroundColor: '#404D71'
                            });
                        }}

                        onMouseLeave={(e) => {
                            this.setState({
                                buttonBackgroundColor: '#252E54'
                            });
                        }}

                        onMouseDown={(e) => {
                            this.setState({
                                filterImage: 'Selected',
                                buttonBackgroundColor: '#5E6B8D'
                            })
                        }}

                        onMouseUp={(e) => {
                            this.setState({
                                filterImage: 'Rest',
                                buttonBackgroundColor: '#252E54'
                            })
                        }}

                        onClick={(e) => {
                            this.props.updateFilterTypes(this.state.filterTypes);
                        }}
                    >
                        <label
                            style={{
                                position: 'absolute',
                                left: 17,
                                top: 10,
                                width: 54,
                                height: 16,
                                fontFamily: 'Segoe UI',
                                fontStyle: 'normal',
                                fontWeight: 900,
                                fontSize: '10px',
                                lineHeight: '30px',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                letterSpacing: '0.3em',
                                color: '#FFFFFF'
                            }}
                        >
                            FILTER
                        </label>
                        <img
                            alt=''
                            src={`icons/Filter and Dropdown Icons/Filter-Icon_${this.state.filterImage}.svg`}
                            style={{
                                position: 'absolute',
                                top: 10.5,
                                left: 74,
                                width: 15,
                                height: 15
                            }}
                        />
                    </div> */}
                </div>
            </React.Fragment>
        )
    }
}

export default FilterTypes;