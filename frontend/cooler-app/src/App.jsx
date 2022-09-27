// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
import React from 'react';
import DashboardPage from './components/DashboardPage';
import DemoPage from './components/DemoPage';
import POCPage from './components/POCPage';
import PageType from './models/PageType';
import './App.css';

// NOTE: for development only
import aggregateViewChart from './models/data/AggregateViewChart.json';
import aggregateViewCoolerCoords from './models/data/AggregateViewCoolerCoords.json';
import aggregateViewInventory from './models/data/AggregateViewInventory.json';
import aggregateViewTotalDrinksSold from './models/data/AggregateViewTotalDrinksSold.json';
import coolerInventory from './models/data/CoolerInventory.json';
import coolerLineChart from './models/data/CoolerLineChart.json';
import coolerProjectedRestockDate from './models/data/CoolerProjectedRestockDate.json';
import coolerTotalDrinksSold from './models/data/CoolerTotalDrinksSold.json';

let socket = process.env.NODE_ENV !== 'development' ? window.io() : null;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appIsDemo: true,
            appIsLoaded: false,
            currentPage: PageType.DashboardPage,
            coolers: [],
            cooler: null,
            azureMapsSubscriptionKey: null
        };
    }

    componentDidMount() {
        if (process.env.NODE_ENV === 'development') {
            const aggregate = this.mapAggregate({
                aggregateViewChart: aggregateViewChart,
                aggregateViewInventory: aggregateViewInventory,
                aggregateViewTotalDrinksSold: aggregateViewTotalDrinksSold
            });
            const coolers = this.mapCoolers({
                aggregateViewCoolerCoords: aggregateViewCoolerCoords,
                coolerInventory: coolerInventory,
                coolerLineChart: coolerLineChart,
                coolerProjectedRestockDate: coolerProjectedRestockDate,
                coolerTotalDrinksSold: coolerTotalDrinksSold
            });
            this.setState({
                appIsDemo: true,
                appIsLoaded: true,
                azureMapsSubscriptionKey: process.env.REACT_APP_AZURE_MAPS_SUBSCRIPTION_KEY,
                aggregate: aggregate,
                coolers: coolers,
                cooler: coolers[0] ? coolers[0] : null
            });
        } else {
            socket.on('connect', function () {
                console.log('connected!');
            });

            socket.on('data', (jsonData) => {
                const data = JSON.parse(jsonData);
                const aggregate = this.mapAggregate({
                    aggregateViewChart: data.data.aggregateViewChart,
                    aggregateViewInventory: data.data.aggregateViewInventory,
                    aggregateViewTotalDrinksSold: data.data.aggregateViewTotalDrinksSold
                });
                const coolers = this.mapCoolers({
                    aggregateViewCoolerCoords: data.data.aggregateViewCoolerCoords,
                    coolerInventory: data.data.coolerInventory,
                    coolerLineChart: data.data.coolerLineChart,
                    coolerProjectedRestockDate: data.data.coolerProjectedRestockDate,
                    coolerTotalDrinksSold: data.data.coolerTotalDrinksSold
                });
                if (data) {
                    this.setState({
                        appIsDemo: data.appIsDemo,
                        appIsLoaded: true,
                        azureMapsSubscriptionKey: data.azureMapsSubscriptionKey,
                        aggregate: aggregate,
                        coolers: coolers,
                        cooler: coolers[0] ? coolers[0] : null
                    });
                }
            });

            socket.emit('get data', '');
        }
    }

    switchPage = (pageType, cooler) => {
        this.setState({
            currentPage: pageType,
            cooler: cooler ? cooler : this.state.cooler,
        });
    }

    mapAggregate = (data) => {
        const aggregate = {
            originalInventory: 0,
            dietInventory: 0,
            totalDrinksSold: 0,
            totalDrinkSales: 0,
            events: []
        };
        const l = data.aggregateViewTotalDrinksSold.length;
        for(let i = 0; i < l; i++) {
            const item = data.aggregateViewTotalDrinksSold[i];
            aggregate.totalDrinksSold += item.itemQuantityTotal;
            aggregate.totalDrinkSales += item.revenueTotal;
        }
        
        const l2 = data.aggregateViewInventory.length;
        for(let i = 0; i < l2; i++) {
            const item = data.aggregateViewInventory[i];
            if(item.itemSku === 'contoso') {
                aggregate.originalInventory += item.totalQuantity;
            } else if(item.itemSku === 'diet-contoso') {
                aggregate.dietInventory += item.totalQuantity;
            }
        }

        const l3 = data.aggregateViewChart.length;
        for(let i = 0; i < l3; i++) {
            const item = data.aggregateViewChart[i];
            aggregate.events.push({
                fulfilledDate: item.fulfilledDate,
                itemSku: item.itemSku,
                totalQuantity: item.totalQuantity
            });
        }

        return aggregate;
    }

    mapCoolers = (data) => {
        const coolers = [];
        const l = data.aggregateViewCoolerCoords.length;
        for (let i = 0; i < l; i++) {
            const item = data.aggregateViewCoolerCoords[i];
            const cooler = {
                id: item.coolerId,
                title: item.coolerName,
                subTitle: item.locationName,
                position: [
                    item.locationLongitude,
                    item.locationLatitude
                ],
                isDemoCooler: i === 0 && this.state.appIsDemo,
                events: []
            };
            const l2 = data.coolerProjectedRestockDate.length;
            for (let i2 = 0; i2 < l2; i2++) {
                const item2 = data.coolerProjectedRestockDate[i2];
                if (item2.coolerId === cooler.id) {
                    cooler.RestockDate = item2.restockDate;
                }
            }

            const l3 = data.coolerInventory.length;
            for (let i3 = 0; i3 < l3; i3++) {
                const item3 = data.coolerInventory[i3];
                if (item3.coolerId === cooler.id) {
                    if (item3.itemSku === "contoso") {
                        cooler.OriginalItemInventory = item3.itemInventory;
                    } else if (item3.itemSku === "diet-contoso") {
                        cooler.DietItemInventory = item3.itemInventory;
                    }
                }
            }

            const l4 = data.coolerTotalDrinksSold.length;
            for (let i4 = 0; i4 < l4; i4++) {
                const item4 = data.coolerTotalDrinksSold[i4];
                if (item4.coolerId === cooler.id) {
                    cooler.ItemQuantityTotal = item4.itemQuantityTotal;
                    cooler.RevenueTotal = item4.revenueTotal;
                }
            }

            const l5 = data.coolerLineChart.length;
            for (let i5 = 0; i5 < l5; i5++) {
                const item5 = data.coolerLineChart[i5];
                if (item5.coolerId === cooler.id) {
                    cooler.events.push({
                        coolerId: item5.coolerId,
                        fulfilledDate: new Date(item5.fulfilledDate),
                        itemSku: item5.itemSku,
                        totalQuantity: item5.totalQuantity
                    })
                }
            }

            coolers.push(cooler);
        }

        return coolers;
    }

    render() {
        return (
            <React.Fragment>
                {
                    this.state.appIsLoaded ?
                        (
                            this.state.currentPage === PageType.DashboardPage ? (
                                <DashboardPage
                                    azureMapsSubscriptionKey={this.state.azureMapsSubscriptionKey}
                                    aggregate={this.state.aggregate}
                                    coolers={this.state.coolers}
                                    cooler={this.state.cooler}
                                    currentPage={this.state.currentPage}
                                    switchPage={this.switchPage}
                                    appIsDemo={this.state.appIsDemo}
                                />
                            ) : (
                                this.state.appIsDemo ? (
                                    <DemoPage
                                        cooler={this.state.cooler}
                                        currentPage={this.state.currentPage}
                                        switchPage={this.switchPage}
                                    />
                                ) : <POCPage
                                    cooler={this.state.cooler}
                                    currentPage={this.state.currentPage}
                                    switchPage={this.switchPage}
                                />
                            )
                        ) : null
                }
            </React.Fragment>
        )
    }
}

export default App;
