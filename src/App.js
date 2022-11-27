import React, { useState, useEffect } from "react";
import ReactTable from 'react-table-6';
import "react-table-6/react-table.css";
import fetch from './api/customerData';
import "./App.css";
import _ from 'lodash';

const App = () => {
  const [transactionData, setTransactionData] = useState(null);

  const columns = [
    {
      Header: 'Customer',
      accessor: 'name'
    },
    {
      Header: 'Month',
      accessor: 'month'
    },
    {
      Header: "# of Transactions",
      accessor: 'numTransactions'
    },
    {
      Header: 'Reward Points',
      accessor: 'points'
    }
  ];

  const totalsByColumns = [
    {
      Header: 'Customer',
      accessor: 'name'
    },
    {
      Header: 'Points',
      accessor: 'points'
    }
  ];

  const getPointsCalculation = (data) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pointsPerTransaction = data.map(transaction => {
      let points = 0;
      if (transaction.amt > 0 && transaction.amt > 100) {
        let over100 = transaction.amt - 100;
        points += over100 * 2;
        if (over100 > 50) {
          points = points + (over100 - 50);

        }
      }
      const month = new Date(transaction.transactionDt).getMonth();
      return { ...transaction, points, month };
    });

    let byCustomer = {};
    let totalPointsByCustomer = {};
    pointsPerTransaction.forEach(pointsData => {
      let { custid: customerid, name, month, points } = pointsData;
      if (!byCustomer[customerid]) {
        byCustomer[customerid] = [];
      }

      if (!totalPointsByCustomer[customerid]) {
        totalPointsByCustomer[name] = 0;
      }
      totalPointsByCustomer[name] += points;
      if (byCustomer[customerid][month]) {
        byCustomer[customerid][month].points += points;
        byCustomer[customerid][month].monthNumber = month;
        byCustomer[customerid][month].numTransactions++;
      }

      else {
        byCustomer[customerid][month] = {
          custid: customerid,
          name,
          monthNumber: month,
          month: months[month],
          numTransactions: 1,
          points
        }
      }
    });

    let total = [];
    for (var customerKey in byCustomer) {
      byCustomer[customerKey].forEach(cRow => {
        total.push(cRow);
      });
    }

    let totalByCustomer = [];
    for (customerKey in totalPointsByCustomer) {
      totalByCustomer.push({
        name: customerKey,
        points: totalPointsByCustomer[customerKey]
      });
    }
    return {
      summaryByCustomer: total,
      pointsPerTransaction,
      totalPointsByCustomer: totalByCustomer
    };
  };

  const getCustomerTransactions = (row) => {
    let byCustMonth = _.filter(transactionData.pointsPerTransaction, (tRow) => {
      return row.original.custid === tRow.custid && row.original.monthNumber === tRow.month;
    });
    //console.log("byCustMonth", byCustMonth);
    return byCustMonth;
  };

  useEffect(() => {
    fetch().then((data) => {
      const results = getPointsCalculation(data);
      setTransactionData(results);
    })
  }, []);

  if (transactionData == null) {
    return <div>Loading...</div>;
  }
  return transactionData == null ?
    <div>Loading...</div>
    :
    <div>
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Points Rewards System Totals by Customer Months</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={transactionData.summaryByCustomer}
              defaultPageSize={5}
              columns={columns}
              SubComponent={row => {
                return (
                  <div>
                    {getCustomerTransactions(row).map(transaction => {
                      console.log(transaction)
                      return <div className="container">
                        <div className="row">
                          <div className="col-8">
                            <strong>Transaction Date:</strong> {transaction.transactionDt} - <strong>$</strong>{transaction.amt} - <strong>Points: </strong>{transaction.points}
                          </div>
                        </div>
                      </div>
                    })}
                  </div>
                )
              }}
            />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Points Rewards System Totals By Customer</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <ReactTable
              data={transactionData.totalPointsByCustomer}
              columns={totalsByColumns}
              defaultPageSize={5}
            />
          </div>
        </div>
      </div>
    </div>
    ;
}

export default App;