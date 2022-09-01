var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

const synapseServer = process.env.SYNAPSE_SERVER || '';
const synapseClientId = process.env.SYNAPSE_CLIENT_ID || '';
const synapseTenantId = process.env.SYNAPSE_TENANT_ID || '';
const synapseClientSecret = process.env.SYNAPSE_CLIENT_SECRET || '';

var config = {
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

// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information

class Test {
    constructor() {
        this.tableIndex = 0;
        this.tables = [
            {
                name: 'inventoryprojected',
                columns: [
                    'PickListFulfilledTimestamp',
                    'CoolerId',
                    'ItemSku',
                    'PredQuantity'
                ]
            },
            {
                name: 'inventorytransaction',
                columns: [
                    'TransactionId',
                    'TransactionPlannedTimestamp',
                    'TransactionCompletedTimestamp',
                    'FromCoolerId',
                    'ToCoolerId',
                    'InventoryTransactionTypeId'
                ]
            },
            {
                name: 'inventorytransactiontype',
                columns: [
                    'InventoryTransactionTypeId',
                    'InventoryTransactionTypeName',
                    'InventoryTransactionTypeDescription'
                ]
            },
            {
                name: 'inventorytransactionunserializeditem',
                columns: ['TransactionId', 'ItemSku', 'Quantity']
            },
            {
                name: 'item',
                columns: [
                    'ItemSku',
                    'ListPrice',
                    'MinimumStockQuantity',
                    'ItemName',
                    'ItemDescription',
                    'ShelfLifeDays',
                    'MinimumStorageTemperature',
                    'MaximumStorageTemperature'
                ]
            },
            {
                name: 'location',
                columns: [
                    'LocationId',
                    'LocationName',
                    'LocationLatitude',
                    'LocationLongitude'
                ]
            },
            {
                name: 'picklist',
                columns: ['PickListId', 'PickListFulfilledTimestamp', 'CoolerId']
            },
            {
                name: 'restockprojected',
                columns: ['CoolerId', 'ProjectedDateTime', 'PreviousProjectedDateTime']
            },
            {
                name: 'picklistitem',
                columns: ['PickListId', 'ItemSku', 'ItemQuantity']
            },
            {
                name: 'inventoryprojected',
                columns: [
                    'PickListFulfilledTimestamp',
                    'CoolerId',
                    'ItemSku',
                    'PredQuantity'
                ]
            },
            {
                name: 'cooler',
                columns: ['CoolerId', 'LocationId', 'CoolerName']
            },
            {
                name: 'iotinventoryaction',
                columns: ['PickTime', 'CoolerId', 'ItemSku', 'Quantity']
            },
            {
                name: 'iotinventoryaction2',
                columns: ['PickTime', 'CoolerId', 'ItemSku', 'Quantity']
            },
            {
                name: 'iotinventoryaction3',
                columns: ['PickTime', 'CoolerId', 'ItemSku', 'Quantity']
            }
        ];
    }

    executeStatement(connection, table) {
        const statement = `select Column_name from Information_schema.columns where Table_name  like '${table.name}'`;
        var request = new Request(statement, function (err) {
            if (err) {
                console.log(err);
            }
        });
        var values = [];
        request.on('row', (columns) => {
            columns.forEach((column) => {
                if (column.value !== null) {
                    values.push(column.value);
                }
            });
        });

        request.on("requestCompleted", (rowCount, more) => {
            connection.close();
            console.log("Connection closed");
            this.tables[this.tableIndex].columns = values;
            this.tableIndex++;
            if (this.tableIndex < this.tables.length) {
                this.query(this.tables[this.tableIndex]);
            } else {
                console.log(this.tables);
            }
        });
        connection.execSql(request);
    }

    query(table) {
        var connection = new Connection(config);
        connection.on('connect', (err) => {
            if (err) {
                console.log('Error: ', err)
            }
            console.log("Connected");
            this.executeStatement(connection, table);
        });

        connection.connect();
    }
}

const test = new Test();
test.query(test.tables[test.tableIndex]);
