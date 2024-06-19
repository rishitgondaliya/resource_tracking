var app = angular.module('digitalResourceApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
      template : "<h1>hello<h1>"
    })
    .when("/upload_marks", {
      templateUrl : "html/upload_marks.html"
    })
    .when("/upload_documents", {
      templateUrl : "html/upload_documents.html"
    });
  });