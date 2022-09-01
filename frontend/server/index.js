// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
const express = require('express');
const expressApp = express();
const httpServer = require('http').Server(expressApp);
const io = require('socket.io')(httpServer);
const DataUtil = require('./utils/data');

const port = process.env.PORT || '3000';
const azureMapsSubscriptionKey = process.env.AZURE_MAPS_SUBSCRIPTION_KEY || '';

let appIsDemo = true;
if (process.env.APP_IS_DEMO) {
    appIsDemo = process.env.APP_IS_DEMO === "true" ? true : false;
}

const dataUtil = new DataUtil();
if (!appIsDemo) {
    setInterval(() => {
        dataUtil.updateData();
    }, 300000);
}

expressApp.use(express.static('build'));
expressApp.use(express.static('build/icons'));
expressApp.use(express.static('build/images'));
expressApp.use(express.static('build/static'));
expressApp.use(express.static('build/videos'));

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('get data', (msg) => {
        console.log(`get data: ${msg}`);
        const data = dataUtil.getData();
        io.emit('data', JSON.stringify({
            azureMapsSubscriptionKey: azureMapsSubscriptionKey,
            appIsDemo: appIsDemo,
            data: data ? data : {
                aggregateViewChart: data.aggregateViewChart,
                aggregateViewCoolerCoords: data.aggregateViewCoolerCoords,
                aggregateViewInventory: data.aggregateViewInventory,
                aggregateViewTotalDrinksSold: data.aggregateViewTotalDrinksSold,
                coolerInventory: data.coolerInventory,
                coolerLineChart: data.coolerLineChart,
                coolerProjectedRestockDate: data.coolerProjectedRestockDate,
                coolerTotalDrinksSold: data.coolerTotalDrinksSold
            }
        }));
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

httpServer.listen(port, () => {
    console.log(`listening on *:${port}`);
});

expressApp.get('/', (req, res) => {
    res.sendFile('build/index.html');
});