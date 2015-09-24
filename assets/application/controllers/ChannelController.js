'use strict';

/* Controllers */

angular.module('adminConsole.controllers.ChannelControllers', ['adminConsole.services'])

  .controller('ChannelListController', ['Channel', 'Device', '$scope', '$location', '$log', 'Utilities', 'httpErrorHandler', 'data', '$route', function (Channel, Device, scope, location, log, utilities, httpErrorHandler, data, route) {
    scope.data = data;
    scope.data["selectedChannelId"] = null;
    scope.error = false;
    scope.errorMessage = null;
    scope.linkClass = utilities.linkClass;
    scope.pagination = scope.channelPagination;
    scope.instances = scope.pagination.instances;
    
    Device.query().$promise
      .then(function(results) {
        scope.devices = results;
      })
      .catch(httpErrorHandler(scope));

    scope.destroy = function (channelId) {
      Channel.delete({id: channelId}).$promise
        .then(function(results) {
          scope.pagination.refresh();
          route.reload();
        })
        .catch(httpErrorHandler(scope));
    };
    
    scope.subscribe = function (channelName, deviceId) {
      if (!deviceId || !channelName) return;
      Channel.subscribe({deviceId: deviceId, channelName: channelName}).$promise
        .then(function(result) {
          route.reload();
        })
        .catch(httpErrorHandler(scope));
    };
    
    scope.unsubscribe = function (channelName, deviceId) {
      if (!deviceId || !channelName) return;
      Channel.unsubscribe({deviceId: deviceId, channelName: channelName}).$promise
        .then(function(result) {
          route.reload();
        })
        .catch(httpErrorHandler(scope));
    };
  }])

  .controller('ChannelDetailController', ['Channel', '$scope', '$location', '$log', '$routeParams', 'Utilities', 'httpErrorHandler', '$http', function (Channel, scope, location, log, routeParams, utilities, httpErrorHandler, http) {
    scope.linkClass = utilities.linkClass;
    scope.objectId = routeParams.objectId;

    if (routeParams.objectId) {
      Channel.get({id: routeParams.objectId}).$promise
        .then(function(results) {
          scope.instance = results;
        })
        .catch(httpErrorHandler(scope));
    }
  }])

  .controller('ChannelCreateController', ['Channel', 'PaginationCache', '$scope', '$location', '$log', '$routeParams', 'Utilities', 'httpErrorHandler', '$http', function (Channel, PaginationCache, scope, location, log, routeParams, utilities, httpErrorHandler, http) {
    scope.linkClass = utilities.linkClass;
    scope.instance = {};

    scope.submit = function (instance) {
      Channel.save(instance).$promise
        .then(function(results) {
          PaginationCache.remove('channel');
          PaginationCache.remove('channelCount');
          location.path('messaging');
        })
        .catch(httpErrorHandler(scope));
    };
  }])
  
  .controller('ChannelEditController', ['Channel', '$scope', '$location', '$log', '$routeParams', 'Utilities', 'httpErrorHandler', '$http', function (Channel, scope, location, log, routeParams, utilities, httpErrorHandler, http) {
    scope.linkClass = utilities.linkClass;
    scope.objectId = routeParams.objectId;
    scope.loading = false;

    if (routeParams.objectId) {
      Channel.get({id: routeParams.objectId}).$promise
        .then(function(results) {
          scope.instance = results;
        })
        .catch(httpErrorHandler(scope));
    }

    scope.submit = function (instance) {
      Channel.update({id: routeParams.objectId}, instance).$promise
        .then(function(results) {
          location.path('messaging');
        })
        .catch(httpErrorHandler(scope));
    };

  }]);
