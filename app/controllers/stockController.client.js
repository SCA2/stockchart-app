'use strict';

(function () {

  var bars = document.querySelectorAll('.bar');

  function voteUrl(bar) {
    return window.location.origin + '/api/bars/' + bar.id + '/patrons';
  }

  function loginUrl() {
    return window.location.origin + '/login';
  }

  ajaxFunctions.ready(() => {
    bars.forEach(bar => {
      bar.writePatronCount = function(patronCount) {
        patronCount = JSON.parse(patronCount);
        bar.innerHTML = patronCount + ' Going';
      };
      bar.login = function() {
        console.log('redirect to login');
        window.location.assign(loginUrl())
      };
      ajaxFunctions.ajaxRequest('GET', voteUrl(bar), bar.writePatronCount, bar.login);
    })
  });

  bars.forEach((bar) => {
    bar.addEventListener('click', function (event) {
      event.preventDefault();
      ajaxFunctions.ajaxRequest('POST', voteUrl(bar), bar.writePatronCount, bar.login);
    }, false);
  });

})();
