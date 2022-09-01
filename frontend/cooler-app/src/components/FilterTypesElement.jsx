// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';

export class FilterTypesElement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            label: this.props.label,
            borderRadius: this.props.borderRadius,
            checked: this.props.checked,
            hovering: false,
            divBackgroundColor: '#252E54'
        };
    }

    componentDidUpdate(prevProps) {
        if(
            this.props.label !== prevProps.label ||
            this.props.borderRadius !== prevProps.borderRadius,
            this.props.checked !== prevProps.checked
        ) {
            this.setState({
                label: this.props.label,
                borderRadius: this.props.borderRadius,
                checked: this.props.checked
            });
        }
    }

    render() {
        return (
            <React.Fragment>
                <div
                    style={{
                        position: 'relative',
                        width: 165,
                        height: 40,
                        backgroundColor: this.state.divBackgroundColor,
                        borderRadius: this.state.borderRadius,
                        boxSizing: '15px'
                    }}
                    
                    onMouseEnter={(e) => {
                        this.setState({
                            divBackgroundColor: '#404D71',
                            hovering: true
                        });
                    }}
                    
                    onMouseLeave={(e) => {
                        this.setState({
                            divBackgroundColor: '#252E54',
                            hovering: false
                        });
                    }}

                    onClick={(e) => {
                        this.setState({
                            checked: !this.state.checked
                        }, () => {
                            this.props.onCheck(this.state.checked);
                        });
                    }}
                >
                    <img
                        alt=""
                        src={`icons/Filter and Dropdown Icons/CheckBox_${
                            this.state.checked ? 
                            (this.state.hovering ? 'Selected-Hover' : 'Selected') : 
                            (this.state.hovering ? 'Hover' : 'Rest')
                        }.svg`}
                        style={{
                            position: 'absolute',
                            left: 11,
                            top: 11,
                            width: 18,
                            height: 18,
                            border: '1px solid #FFFFFF',
                            boxSizing: 'border-box',
                            borderRadius: '4px'
                        }}
                    />
                    <label
                        style={{
                            position: 'absolute',
                            left: 36,
                            top: 11,
                            height: 18,
                            fontFamily: 'Segoe UI',
                            fontStyle: 'normal',
                            fontWeight: '400',
                            fontSize: '12px',
                            lineHeight: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            letterSpacing: '0.05em',
                            color: '#FFFFFF',
                        }}
                    >
                        {this.state.label}
                    </label>
                </div>
            </React.Fragment>
        )
    }
}

export default FilterTypesElement;