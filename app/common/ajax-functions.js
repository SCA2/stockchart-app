'use strict';

var appUrl = window.location.origin;

var ajaxFunctions = {

  ready: function ready (fn) {
    if(typeof fn !== 'function') { return; }
    if(document.readyState === 'complete') { return fn(); }
    document.addEventListener('DOMContentLoaded', fn, false);
  },

  ajaxRequest: function ajaxRequest (method, url, successCB, failureCB) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        successCB(xmlhttp.response);
      } else if(xmlhttp.readyState === 4 && xmlhttp.status === 0) {
        failureCB();
      }
    };

    xmlhttp.open(method, url, true);
    xmlhttp.send();
  }
};