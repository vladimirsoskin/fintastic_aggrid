import React, {useEffect, useState} from "react";

import {AgGridReact, AgGridColumn} from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import "./styles.css";
import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import accounts from "./accounts.json";

function aggregate(params) {
    const values = params.values;
    const aggr = values.reduce((res, value) => {
            if (typeof value === "number") {
                return {
                    "sum": res.sum + value,
                    "count": ++res.count
                }
            } else {
                return res;
            }
        },
        {sum: 0, count: 0});

    return {
        sum: Math.round(aggr.sum),
        count: aggr.count,
        avg: aggr.count === 0 ? 0 : Math.round(aggr.sum / aggr.count)
    }
}

function sumRounded(params) {
    return aggregate(params).sum;
}

function avgRounded(params) {
    return aggregate(params).avg;
}

function countRounded(params) {
    return aggregate(params).count;
}

function getMonthName(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}.${month < 10 ? "0" + month : month}`;
}

function getMonthList(values, dateAttr) {
    const list = values.reduce((res, value) => {
        const newMonth = getMonthName(value[dateAttr]);
        if (res.every(currentMonth => currentMonth !== newMonth))
            res.push(newMonth);

        return res;
    }, []);
    return list.sort();
}

function numberFormatter(params) {
    return Intl.NumberFormat().format(params.value);
}

function monthValueGetter(params, month) {
    if (getMonthName(params.data.date) === month) {
        return params.data.ARR;
    } else {
        return 0;
    }
}

export default function App() {
    const [rowData, setRowData] = useState([]);
    const [monthList, setMonthList] = useState([]);
    useEffect(() => {
        setMonthList(getMonthList(accounts, "date"));
        setRowData(accounts);
    }, []);

    // const [gridColumnApi, setGridColumnApi] = useState(null);

    function sortByArrDesc(gridColumnApi) {
        gridColumnApi.applyColumnState({
            state: [{
                colId: 'ARR',
                sort: 'desc',
            }],
            defaultState: {sort: null},
        });
    }

    function onGridReady(params) {
        // setGridApi(params.api);
        // setGridColumnApi(params.columnApi);
        sortByArrDesc(params.columnApi);
    }

    return (
        <div className="App">
            <div id="myGrid"
                 style={{
                     height: "100%",
                     width: "100%",
                 }}
                 className="ag-theme-alpine">
                <AgGridReact
                    defaultColDef={{
                        flex: 1,
                        minWidth: 150,
                        filter: true,
                        sortable: true,
                        resizable: true,
                    }}
                    autoGroupColumnDef={{
                        headerName: "ARR per owners",
                        field: "OwnerName",
                        minWidth: 250,
                        cellRenderer: "agGroupCellRenderer",
                        // cellRendererParams: { footerValueGetter: "Total (" + x + ")" },
                    }}
                    onGridReady={onGridReady}
                    sideBar={true}
                    rowData={rowData}
                    suppressAggFuncInHeader={true}
                    aggFuncs={{
                        sum: sumRounded,
                        count: countRounded,
                        avg: avgRounded,
                    }}
                >
                    <AgGridColumn field="region" rowGroup={true} hide={true}/>
                    <AgGridColumn field="tier" rowGroup={true} hide={true}/>
                    <AgGridColumn field="industry" rowGroup={true} hide={true}/>
                    <AgGridColumn headerName="Total" marryChildren={true}>
                        <AgGridColumn
                            field="ARR"
                            headerName="ARR"
                            aggFunc="sum"
                            type="numericColumn"
                            enableValue={true}
                            allowedAggFuncs={["sum", "avg", "count", "min", "max"]}
                            valueFormatter={numberFormatter}
                        />
                    </AgGridColumn>
                    <AgGridColumn headerName="By months" marryChildren={true}>
                        {monthList.map(month =>
                            <AgGridColumn
                                field="ARR"
                                headerName={month}
                                aggFunc="sum"
                                type="numericColumn"
                                enableValue={true}
                                allowedAggFuncs={["sum", "avg", "count", "min", "max"]}
                                valueFormatter={numberFormatter}
                                key={month}
                                valueGetter={(params) => monthValueGetter(params, month)}
                            />)}
                    </AgGridColumn>
                </AgGridReact>
            </div>
        </div>
    );
}