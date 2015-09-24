'use strict';

/* Controllers */

angular.module('adminConsole.controllers.V1PublishControllers', ['adminConsole.services'])

  .controller('V1PublishListController', ['$scope', '$location', '$route', '$log', 'Utilities', 'V1Publish', 'httpErrorHandler', 'pagination', function($scope, $location, $route, $log, Utilities, V1Publish, httpErrorHandler, pagination) {
    $scope.error = false;
    $scope.errorMessage = null;
    $scope.linkClass = Utilities.linkClass;
    $scope.instances = pagination.instances;
    $scope.pagination = pagination;

    $scope.destroy = function(instance) {
      if(confirm('Are you sure?')) {
        instance.$delete()
          .then(function(val) {
            $scope.pagination.refresh();
            $route.reload();
          })
          .catch(httpErrorHandler($scope));
      }
    };

    // If browsing away from current model, clear the pagination cache.
    $scope.$on('$routeChangeStart', function(event, current, previous){
      if (current.originalPath !== previous.originalPath) pagination.clearCache();
    });
  }])

  .controller('V1PublishDetailController', ['$scope', '$location', '$log', '$routeParams', 'Utilities', 'V1Publish', 'httpErrorHandler', function($scope, $location, $log, $routeParams, Utilities, V1Publish, httpErrorHandler) {
    $scope.linkClass = Utilities.linkClass;
    $scope.objectId = $routeParams.objectId;

    V1Publish.get({id: $routeParams.objectId}).$promise
      .then(function(val) {
        $scope.instance = val;
      })
      .catch(httpErrorHandler($scope));
  }])

  .controller('V1PublishCreateController', ['$scope', '$location', '$log', '$routeParams', 'Utilities', 'V1Publish', 'httpErrorHandler', function($scope, $location, $log, $routeParams, Utilities, V1Publish, httpErrorHandler) {
    $scope.linkClass = Utilities.linkClass;
    $scope.instance = {};
    $scope.loading = false;

    $scope.submit = function(instance) {
      $scope.loading = true;
      V1Publish.save(instance).$promise
        .then(function(val) {
          $scope.loading = false;
          $location.path('publishes/' + val.id);
        })
        .catch(httpErrorHandler($scope));
    };
  }])

  .controller('V1PublishEditController', ['$scope', '$location', '$log', '$routeParams', 'Utilities', 'V1Publish', 'httpErrorHandler', function($scope, $location, $log, $routeParams, Utilities, V1Publish, httpErrorHandler) {
    $scope.linkClass = Utilities.linkClass;
    $scope.objectId = $routeParams.objectId;
    $scope.loading = false;

    V1Publish.get({id: $routeParams.objectId}).$promise
      .then(function(val) {
        $scope.instance = val;
      })
      .catch(httpErrorHandler($scope));

    $scope.submit = function(instance) {
      V1Publish.update({id: $routeParams.objectId}, instance).$promise
        .then(function(val) {
          $scope.loading = false;
          $location.path('publishes/' + instance.id);
        })
        .catch(httpErrorHandler($scope));
    };
  }]);
