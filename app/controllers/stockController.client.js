'use strict';

(function () {

  var exampleSocket;
  var seriesOptions = []

  function stocksUrl() { return window.location.origin + '/api/stocks' }
  // function socketUrl() { return 'wss:' + window.location.host + '/socket' }
  function socketUrl() { return 'wss://127.0.0.1:8080/socket' }

  /**
   * Create the chart when all data is loaded
   * @returns {undefined}
   */

  function createChart() {

    Highcharts.stockChart('container', {

      rangeSelector: {
        selected: 4
      },

      yAxis: {
        labels: {
          formatter: function () {
            return (this.value > 0 ? ' + ' : '') + this.value + '%';
          }
        },
        plotLines: [{
          value: 0,
          width: 2,
          color: 'silver'
        }]
      },

      plotOptions: {
        series: {
          compare: 'percent',
          showInNavigator: true
        }
      },

      tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
        valueDecimals: 2,
        split: true
      },

      series: seriesOptions
    });
  }

  function createCards(stocks) {
    let stockGroup = document.getElementById('stock-group');
    let newGroup = "";
    stocks.forEach(stock => {
      console.log(stock.ticker + ', ' + stock._id)
      let newCard = `
        <div class="card">
          <div class="card-block">
            <form action="/api/stocks/${stock._id}?_method=DELETE" method="POST">
              <button class="close" type="submit" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
              <h6>${stock.ticker}</h6>
            </form>
          </div>
        </div>`;
      newGroup += newCard;
    });
    stockGroup.innerHTML = newGroup;
  };

  function loadstocks(stocks) {
    stocks = JSON.parse(stocks);
    stocks.forEach((stock, i) => {
      seriesOptions[i] = {
        name: stock.ticker,
        data: stock.prices
      };
    });
    createCards(stocks);
    createChart();
  };

  ajaxFunctions.ready(() => {
    ajaxFunctions.ajaxRequest('GET', stocksUrl(), loadstocks, () => {});

    console.log(socketUrl());
    exampleSocket = new WebSocket(socketUrl());

    exampleSocket.onmessage = function (event) {
      var msg = event.data;
      switch(msg) {
        case 'createStock' : 
          console.log(msg);
          ajaxFunctions.ajaxRequest('GET', stocksUrl(), loadstocks, () => {});
          break;
        case 'deleteStock' : 
          console.log(msg);
          ajaxFunctions.ajaxRequest('GET', stocksUrl(), loadstocks, () => {});
          break;
      }
    }
  });

})();
