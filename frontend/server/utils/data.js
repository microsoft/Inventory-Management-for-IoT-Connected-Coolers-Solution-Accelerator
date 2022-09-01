// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const fs = require('fs');

const synapseServer = process.env.SYNAPSE_SERVER || '';
const synapseClientId = process.env.SYNAPSE_CLIENT_ID || '';
const synapseTenantId = process.env.SYNAPSE_TENANT_ID || '';
const synapseClientSecret = process.env.SYNAPSE_CLIENT_SECRET || '';

class DataUtil {
    constructor() {
        this.config = {
            server: synapseServer,
            authentication: {
                type: 'azure-active-directory-service-principal-secret',
                options: {
                    clientId: synapseClientId,
                    tenantId: synapseTenantId,
                    clientSecret: synapseClientSecret
                }
            },
            options: {
                // If you are on Microsoft Azure, you need encryption:
                encrypt: true,
                database: 'ContosoCoolerDemo'
            }
        };
        this.queries = {
            aggregateViewChart: {
                statement: `SELECT PickListFulfilledTimestamp, ItemSku, SUM(ItemQuantity) FROM picklist AS a INNER JOIN picklistitem AS b ON a.PickListId = b.PickListId WHERE PickListFulfilledTimestamp > '2021-03-01' AND PickListFulfilledTimestamp < '2021-06-01' GROUP BY ItemSku, PickListFulfilledTimestamp ORDER BY ItemSku, PickListFulfilledTimestamp`,
                map: (values) => {
                    return this.mapObject({
                        fulfilledDate: this.mapDate,
                        itemSku: this.mapSku,
                        totalQuantity: this.mapNumber
                    }, values);
                }
            },
            aggregateViewInventory: {
                statement: `SELECT ItemSku, sum(ActualItemQuantity), Max(Timestamp) FROM cooleritembalance GROUP BY ItemSku`,
                map: (values) => {
                    return this.mapObject({
                        itemSku: this.mapSku,
                        totalQuantity: this.mapNumber,
                        lastCountDate: this.mapDate
                    }, values);
                }
            },
            aggregateViewCoolerCoords: {
                statement: `SELECT CoolerId, CoolerName, LocationName, LocationLatitude, LocationLongitude FROM cooler AS a INNER JOIN location AS b ON a.LocationId = b.LocationId`,
                map: (values) => {
                    return this.mapObject({
                        coolerId: this.mapId,
                        coolerName: this.mapString,
                        locationName: this.mapString,
                        locationLatitude: this.mapNumber,
                        locationLongitude: this.mapNumber
                    }, values);
                }
            },
            aggregateViewTotalDrinksSold: {
                statement: `SELECT sum(ItemQuantity), sum(ListPrice * ItemQuantity) FROM picklist AS a INNER JOIN picklistitem AS b ON a.PickListId = b.PickListId INNER JOIN item AS c ON b.ItemSku = c.ItemSku WHERE PickListFulfilledTimestamp > '2021-03-01' AND PickListFulfilledTimestamp < '2021-03-02'`,
                map: (values) => {
                    return this.mapObject({
                        itemQuantityTotal: this.mapNumber,
                        revenueTotal: this.mapNumber
                    }, values);
                }
            },
            coolerTotalDrinksSold: {
                statement: `SELECT CoolerId, sum(ItemQuantity), sum(ListPrice * ItemQuantity) FROM picklist AS a INNER JOIN picklistitem AS b ON a.PickListId = b.PickListId INNER JOIN item AS c ON b.ItemSku = c.ItemSku WHERE PickListFulfilledTimestamp > '2021-03-01' AND PickListFulfilledTimestamp < '2021-03-02' GROUP BY CoolerId`,
                map: (values) => {
                    return this.mapObject({
                        coolerId: this.mapId,
                        itemQuantityTotal: this.mapNumber,
                        revenueTotal: this.mapNumber
                    }, values);
                }
            },
            coolerInventory: {
                statement: `SELECT CoolerId, ItemSku, sum(ActualItemQuantity), Max(Timestamp) FROM cooleritembalance GROUP BY CoolerId, ItemSku`,
                map: (values) => {
                    return this.mapObject({
                        coolerId: this.mapId,
                        itemSku: this.mapSku,
                        itemInventory: this.mapNumber,
                        latestCountDate: this.mapDate
                    }, values);
                }
            },
            coolerLineChart: {
                statement: `SELECT CoolerId, PickListFulfilledTimestamp, ItemSku, SUM(ItemQuantity) FROM picklist AS a INNER JOIN picklistitem AS b ON a.PickListId = b.PickListId WHERE PickListFulfilledTimestamp > '2021-03-01' AND PickListFulfilledTimestamp < '2021-06-01' GROUP BY CoolerId, ItemSku, PickListFulfilledTimestamp ORDER BY CoolerId, ItemSku, PickListFulfilledTimestamp`,
                map: (values) => {
                    return this.mapObject({
                        coolerId: this.mapId,
                        fulfilledDate: this.mapDate,
                        itemSku: this.mapSku,
                        totalQuantity: this.mapNumber
                    }, values);
                }
            },
            coolerProjectedRestockDate: {
                statement: `SELECT [CoolerId],Max([ProjectedDateTime]) FROM [ContosoCoolerDemo].[dbo].[restockprojected] GROUP BY [CoolerId]`,
                map: (values) => {
                    return this.mapObject({
                        coolerId: this.mapId,
                        restockDate: this.mapDate
                    }, values);
                }
            }
        };
        this.queryList = [];
        this.queryIndex = 0;
        for (const [key, value] of Object.entries(this.queries)) {
            this.queryList.push({ name: key, model: value });
        }
    }

    getData() {
        const data = {
            aggregateViewChart: [],
            aggregateViewCoolerCoords: [],
            aggregateViewInventory: [],
            aggregateViewTotalDrinksSold: [],
            coolerInventory: [],
            coolerLineChart: [],
            coolerProjectedRestockDate: [],
            coolerTotalDrinksSold: []
        };

        try {
            const aggregateViewChart = fs.readFileSync('./data/AggregateViewChart.json');
            if (aggregateViewChart) {
                data.aggregateViewChart = JSON.parse(aggregateViewChart);
            }

            const aggregateViewCoolerCoords = fs.readFileSync('./data/AggregateViewCoolerCoords.json');
            if (aggregateViewCoolerCoords) {
                data.aggregateViewCoolerCoords = JSON.parse(aggregateViewCoolerCoords);
            }

            const aggregateViewInventory = fs.readFileSync('./data/AggregateViewInventory.json');
            if (aggregateViewInventory) {
                data.aggregateViewInventory = JSON.parse(aggregateViewInventory);
            }

            const aggregateViewTotalDrinksSold = fs.readFileSync('./data/AggregateViewTotalDrinksSold.json');
            if (aggregateViewTotalDrinksSold) {
                data.aggregateViewTotalDrinksSold = JSON.parse(aggregateViewTotalDrinksSold);
            }

            const coolerInventory = fs.readFileSync('./data/CoolerInventory.json');
            if (coolerInventory) {
                data.coolerInventory = JSON.parse(coolerInventory);
            }

            const coolerLineChart = fs.readFileSync('./data/CoolerLineChart.json');
            if (coolerLineChart) {
                data.coolerLineChart = JSON.parse(coolerLineChart);
            }

            const coolerProjectedRestockDate = fs.readFileSync('./data/CoolerProjectedRestockDate.json');
            if (coolerProjectedRestockDate) {
                data.coolerProjectedRestockDate = JSON.parse(coolerProjectedRestockDate);
            }

            const coolerTotalDrinksSold = fs.readFileSync('./data/CoolerTotalDrinksSold.json');
            if (coolerTotalDrinksSold) {
                data.coolerTotalDrinksSold = JSON.parse(coolerTotalDrinksSold);
            }
        } catch (err) {
            console.error(err)
        }

        return data;
    }

    updateData() {
        this.queryIndex = 0;
        this.executeQuery(this.queryList[this.queryIndex]);
    }

    executeStatement(connection, query) {
        const request = new Request(query.model.statement, (err) => {
            if (err) {
                console.log(err);
            }
        });
        const results = [];
        request.on('row', (columns) => {
            const values = [];
            let nullCount = 0;
            columns.forEach((column) => {
                if (column.value === null) {
                    values.push('');
                    nullCount++;
                } else {
                    values.push(column.value);
                }
            });
            // NOTE: don't use all null value rows
            if (nullCount < values.length) {
                results.push(query.model.map(values));
            }
        });

        request.on("requestCompleted", (rowCount, more) => {
            connection.close();
            console.log("Connection closed");
            try {
                let name = this.queryList[this.queryIndex].name;
                name = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
                fs.writeFileSync(`data/${name}.json`, JSON.stringify(results));
            } catch (err) {
                console.error(err);
            }
            this.queryIndex++;
            if (this.queryIndex < this.queryList.length) {
                this.executeQuery(this.queryList[this.queryIndex]);
            }
        });
        connection.execSql(request);
    }

    executeQuery(query) {
        var connection = new Connection(this.config);
        connection.on('connect', (err) => {
            if (err) {
                console.log('Error: ', err)
            }
            console.log("Connected");
            console.log(this.queryList[this.queryIndex]);
            this.executeStatement(connection, query);
        });

        connection.connect();
    }

    mapObject(obj, values) {
        let index = 0;
        for (const [key, value] of Object.entries(obj)) {
            obj[key] = value(values[index]);
            index++;
        }
        return obj;
    }

    mapDate(value) {
        return new Date(value);
    }

    mapNumber(value) {
        if (value) {
            if (value === '') {
                return -1;
            } else {
                return +value;
            }
        }
        return -1;
    }

    mapString(value) {
        return value ? value : '';
    }

    mapId(value) {
        return value === '' ? 0 : +value;
    }

    mapSku(value) {
        return value === 'cdc_00' ? 'diet-contoso' : 'contoso';
    }
}

module.exports = DataUtil;