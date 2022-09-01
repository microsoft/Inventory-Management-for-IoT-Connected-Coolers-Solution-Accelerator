// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React, { Component } from 'react';

export class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            azureMapsSubscriptionKey: this.props.azureMapsSubscriptionKey,
            coolers: this.props.coolers,
            appIsDemo: this.props.appIsDemo
        };

        window.map = null;
        this.switchPage = this.switchPage.bind(this);
        window.switchPage = this.switchPage;
        window.loadMap = this.loadMap;
    }

    switchPage(page, cooler) {
        this.props.switchPage(page, cooler);
    }

    createCustomHTMLMarker = (cooler, appIsDemo) => {
        const div = document.createElement('div');
        div.style = "visibility: hidden;width: 245px;height: 56px;background: #0078D4;border: 3px solid #0078D4;box-sizing: border-box;box-shadow: 0px 0px 15px #0078D4;border-radius: 100px;";
        
        const titleLabel = document.createElement('label');
        titleLabel.style = "position:absolute;left: 49px;top: 13px;font-family: 'Segoe UI';font-style: normal;font-weight: 700;font-size: 10px;line-height: 8px;letter-spacing: 0.05em;color: #FFFFFF;";
        titleLabel.innerText = cooler.title;
        div.appendChild(titleLabel);
        
        const subTitleLabel = document.createElement('label');
        subTitleLabel.style = "position:absolute;left: 49px;top: 24px;font-family: 'Segoe UI';font-style: normal;font-weight: 600;font-size: 9px;line-height: 9px;letter-spacing: 0.05em;color: #DFDFDF;";
        subTitleLabel.innerText = `${cooler.subTitle}`;
        div.appendChild(subTitleLabel);
        
        const restockDateLabel = document.createElement('label');
        restockDateLabel.style = "position:absolute;left: 49px;top: 34px;font-family: 'Segoe UI';font-style: normal;font-weight: 600;font-size: 9px;line-height: 9px;letter-spacing: 0.05em;color: #DFDFDF;";
        restockDateLabel.innerText = `Exp. restock date (ERD): ${new Date(cooler.RestockDate).toLocaleDateString()}`;
        div.appendChild(restockDateLabel);

        const image = document.createElement('img');
        image.style = "visibility: visible;position:absolute;left: 12px;top: 11px;width: 11.5;height: 18.6;";
        image.src = "icons/Map Icons/Cooler-Map-Icon_Rest.svg";
        image.title = !appIsDemo || cooler.isDemoCooler ? 'Click to navigate to Cooler Page' : '';
        image.onmouseenter = (e) => {
            e.target.parentNode.style.visibility = 'visible';
        }
        image.onmouseleave = (e) => {
            e.target.parentNode.style.visibility = 'hidden';
            e.target.style.visibility = 'visible';
        }
        image.onmousedown = (e) => {
            e.target.src = "icons/Map Icons/Cooler-Map-Icon_Press-selected.svg";
            e.target.parentNode.style.visibility = 'hidden';
            e.target.style.visibility = 'visible';
        };
        image.onmouseup = (e) => {
            e.target.src = "icons/Map Icons/Cooler-Map-Icon_Rest.svg";
        };
        image.onclick = (e) => {
            if (!appIsDemo || cooler.isDemoCooler) {
                window.switchPage('CoolerPage', cooler);
            }
        }
        div.appendChild(image);

        return div;
    }

    loadMap(azureMapsSubscriptionKey, coolers, appIsDemo, createCustomHTMLMarker) {
        window.map = new window.atlas.Map('myMap', {
            center: [-122.129375, 47.644075],
            style: 'grayscale_dark',
            zoom: 14.5,
            language: 'en-US',
            authOptions: {
                authType: 'subscriptionKey',
                subscriptionKey: azureMapsSubscriptionKey
            }
        });

        const l = coolers.length;
        for (let i = 0; i < l; i++) {
            const cooler = coolers[i];

            const marker = new window.atlas.HtmlMarker({
                color: 'DodgerBlue',
                text: 'C',
                position: cooler.position,
                htmlContent: createCustomHTMLMarker(cooler, appIsDemo),
                pixelOffset: [122.5, 0]
            });

            window.map.markers.add(marker);
        }
    }

    componentDidMount() {
        if (window.map === null && this.props.azureMapsSubscriptionKey !== null) {
            window.loadMap(
                this.state.azureMapsSubscriptionKey,
                this.state.coolers,
                this.state.appIsDemo,
                this.createCustomHTMLMarker
            );
        }
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.azureMapsSubscriptionKey !== prevProps.azureMapsSubscriptionKey ||
            this.props.coolers !== prevProps.coolers,
            this.props.appIsDemo !== prevProps.appIsDemo
        ) {
            this.setState({
                azureMapsSubscriptionKey: this.props.azureMapsSubscriptionKey,
                coolers: this.props.coolers,
                appIsDemo: this.props.appIsDemo
            }, () => {
                if (window.map === null && this.props.azureMapsSubscriptionKey !== null) {
                    window.loadMap(
                        this.state.azureMapsSubscriptionKey,
                        this.state.coolers,
                        this.state.appIsDemo
                    );
                }
            });
        }
    }

    render() {
        return (
            <React.Fragment>
                <div
                    id="myMap"
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: this.props.width,
                        height: this.props.height,
                        borderRadius: 20
                    }}
                >
                </div>
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: this.props.width,
                        height: this.props.height,
                        borderRadius: 20,
                        backgroundColor: 'rgb(5, 19, 140, 0.2)',
                        pointerEvents: 'none'
                    }}
                >
                </div>
            </React.Fragment>
        )
    }
}

export default Map;