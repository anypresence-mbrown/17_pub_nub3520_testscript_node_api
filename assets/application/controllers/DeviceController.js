'use strict';

/* Controllers */

angular.module('adminConsole.controllers.DeviceControllers', ['adminConsole.services'])
  .controller('DeviceListController', ['Device', '$scope', '$location', '$log', 'Utilities', 'httpErrorHandler', 'data', '$route', function (Device, scope, location, log, utilities, httpErrorHandler, data, route) {
      scope.data = data;
      scope.error = false;
      scope.errorMessage = null;
      scope.linkClass = utilities.linkClass;
      scope.pagination = scope.devicePagination;
      scope.instances = scope.pagination.instances;

      scope.destroy = function (deviceId) {
        Device.delete({id: deviceId}).$promise
          .then(function(results) {
            scope.pagination.refresh();
            route.reload();
          })
          .catch(httpErrorHandler(scope));
      };
  }])

  .controller('DeviceDetailController', ['Device', 'Channel', '$scope', '$location', '$log', '$routeParams', 'Utilities', 'httpErrorHandler', '$http', function (Device, Channel, scope, location, log, routeParams, utilities, httpErrorHandler, http) {
      scope.linkClass = utilities.linkClass;
      scope.objectId = routeParams.objectId;

      var device;
      if (routeParams.objectId) {
        Device.get({id: routeParams.objectId}).$promise
          .then(function(results) {
            device = results;
          })
          .then(function() {
            return Channel.findDeviceChannels({id: routeParams.objectId}).$promise;
          })
          .then(function(channels) {
            device.channels = channels;
            scope.instance = device;
          })
          .catch(httpErrorHandler(scope));
      }
  }])

  .controller('DeviceCreateController', ['Device', 'PaginationCache', '$scope', '$location', '$log', '$routeParams', 'Utilities', 'httpErrorHandler', '$http', '$route', function (Device, PaginationCache, scope, location, log, routeParams, utilities, httpErrorHandler, http, route) {
      scope.linkClass = utilities.linkClass;
      scope.instance = {provider_name: 'Apple'};
      scope.submit = function (instance) {
          scope.loading = true;
          Device.save(instance).$promise
            .then(function(results) {
              PaginationCache.remove('device');
              PaginationCache.remove('deviceCount');
              location.path('messaging');
            })
            .catch(httpErrorHandler(scope));
      };
  }])

  .controller('DeviceEditController', ['Device', '$scope', '$location', '$log', '$routeParams', 'Utilities', 'httpErrorHandler', '$http', '$route', function (Device, scope, location, log, routeParams, utilities, httpErrorHandler, http) {
      scope.linkClass = utilities.linkClass;
      scope.objectId = routeParams.objectId;

      if (routeParams.objectId) {
          Device.get({id: routeParams.objectId}).$promise
            .then(function(results) {
              scope.instance = results;
            })
            .catch(httpErrorHandler(scope));
      }

      scope.submit = function (instance) {
          Device.update({id: routeParams.objectId}, instance).$promise
            .then(function(results) {
              scope.instance = results;
              location.path('messaging');
            })
            .catch(httpErrorHandler(scope));
      };
  }]);
