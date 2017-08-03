'use strict';

(function () {

  var exampleSocket;

  var seriesOptions = []
      // seriesCounter = 0,
      // names = ['MSFT', 'AAPL', 'GOOG'];

  function stocksUrl() { return window.location.origin + '/api/stocks' }
  function socketUrl() { return 'ws:' + window.location.host + '/socket' }
// "ws://www.example.com/socketserver", "protocolOne"

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

  // $.each(names, function (i, name) {
  //   $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=' + name.toLowerCase() + '-c.json&callback=?',    function (data) {
  //     console.log(data)
  //     seriesOptions[i] = {
  //       name: name,
  //       data: data
  //     };

  //     // As we're loading the data asynchronously, we don't know what order it will arrive. So
  //     // we keep a counter and create the chart when all the data is loaded.
  //     seriesCounter += 1;

  //     if (seriesCounter === names.length) {
  //       createChart();
  //     }
  //   });
  // });

  function loadstocks(stocks) {
    stocks = JSON.parse(stocks);
    stocks.forEach((stock, i) => {
      seriesOptions[i] = {
        name: stock.ticker,
        data: stock.prices
      };
    });

    createChart();
  }

  ajaxFunctions.ready(() => {
    ajaxFunctions.ajaxRequest('GET', stocksUrl(), loadstocks, () => {});

    exampleSocket = new WebSocket(socketUrl());

    exampleSocket.onmessage = function (event) {
      console.log(event.data);
      var msg = JSON.parse(event.data);
      switch(msg.type) {
        case 'createStock' : 
          ajaxFunctions.ajaxRequest('GET', stocksUrl(), loadstocks, () => {});
          break;
        case 'deleteStock' : 
          ajaxFunctions.ajaxRequest('GET', stocksUrl(), loadstocks, () => {});
          break;
      }
    }
  });

})();
