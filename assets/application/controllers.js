'use strict';

/* Controllers */

angular.module('adminConsole.controllers', ['adminConsole.services'])
  .controller('LoginController', ['$scope', '$location', 'UserService', function($scope, $location, UserService) {
    $scope.error = false;
    $scope.errorMessage = null;
    $scope.loading = false;
    $scope.instance = {};
    $scope.login = function(instance) {
      $scope.loading = true;
      UserService.login(instance, function(err) {
        if (!err) {
          $location.path('index');
        } else {
          $scope.loading = false;
          $scope.error = true;
          $scope.errorMessage = err;
        }
      });
    };
  }])
  .controller('LogoutController', ['$scope', '$location', 'UserService', function($scope, $location, UserService) {
    UserService.logout(function(err) {
      $location.path('sign_in');
    });
  }])
  .controller('MainIndexController', ['$scope','$http', 'httpErrorHandler', function($scope, $http, $httpErrorHandler) {
    $http.get('api/info', { params: {version: 'v1'} }).error(function () {
      $httpErrorHandler($scope);
    });
    $http.get('admin/objectCounts').success(function(data) {
      $scope.objectCounts = data;
    });
  }])
  .controller('MessagingIndexController', ['$scope', 'channelPagination', 'devicePagination', 'messagePagination', function($scope, channelPagination, devicePagination, messagePagination) {
    $scope.channelPagination = channelPagination;
    $scope.devicePagination = devicePagination;
    $scope.messagePagination = messagePagination;
  }])
  .controller("HeaderController", ['$scope', '$location', 'UserService', function($scope, $location, UserService) {
    $scope.isLoggedIn = UserService.isLoggedIn;
    $scope.getCurrentUser = UserService.getCurrentUser;
  }]);
