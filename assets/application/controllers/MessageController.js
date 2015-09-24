'use strict';

/* Controllers */

angular.module('adminConsole.controllers.MessageControllers', ['adminConsole.services'])

        .controller('MessageListController', ['Message', '$scope', '$location', '$log', 'Utilities', 'httpErrorHandler', '$http', '$route', function (Message, scope, location, log, utilities, httpErrorHandler, http, route) {
            scope.error = false;
            scope.errorMessage = null;
            scope.linkClass = utilities.linkClass;
            scope.pagination = scope.messagePagination;
            scope.instances = scope.pagination.instances;
            angular.forEach(scope.instances, function(msg){
                // Get the channel name for each message
                http.get('/api/push_notifications/channel/' + msg.receiver).then(function(response) {
                    // Set channel name
                    msg.channelName = response.data.name;
                });
            });
        }])

        .controller('MessageDetailController', ['$scope', '$location', '$log', '$routeParams', 'Utilities', 'httpErrorHandler', '$http', function (scope, location, log, routeParams, utilities, httpErrorHandler, http) {
            scope.linkClass = utilities.linkClass;
            scope.objectId = routeParams.objectId;

            if (routeParams.objectId) {
                http.get('/api/push_notifications/message/' + routeParams.objectId).
                        success(function (data, status, headers, config) {
                            scope.instance = data;
                        }).
                        error(function (data, status, headers, config) {
                            httpErrorHandler(scope);
                        });
            }
        }])

        .controller('MessageCreateController', ['Message', 'PaginationCache', 'Channel', '$scope', '$location', '$log', '$routeParams', 'Utilities', 'httpErrorHandler', '$http', 'data', '$route', function (Message, PaginationCache, Channel, scope, location, log, routeParams, utilities, httpErrorHandler, http, data, route) {
            scope.data = data;
            scope.linkClass = utilities.linkClass;
            scope.instance = {};
            
            Channel.query().$promise
              .then(function(results) {
                scope.channels = results;
              })
              .catch(httpErrorHandler(scope));
            

            scope.create = function (instance, receiver) {
              instance.receiver = receiver;
              instance.is_channel = true;
              Message.save(instance).$promise
                .then(function(results) {
                  PaginationCache.remove('message');
                  PaginationCache.remove('messageCount');
                  location.path('messaging');
                })
                .catch(httpErrorHandler(scope));
                
            };
        }])

        .controller('MessageEditController', ['$scope', '$location', '$log', '$routeParams', 'Utilities', 'httpErrorHandler', '$http', function (scope, location, log, routeParams, utilities, httpErrorHandler, http) {
            scope.linkClass = utilities.linkClass;
            scope.objectId = routeParams.objectId;

            if (routeParams.objectId) {
                http.get('/api/push_notifications/message' + routeParams.objectId).
                        success(function (data, status, headers, config) {
                            scope.instance = data;
                        }).
                        error(function (data, status, headers, config) {
                            httpErrorHandler(scope);
                        });
            }

            scope.submit = function (instance) {
                http.put('/api/push_notifications/message/' + routeParams.objectId, instance).
                        success(function (data, status, headers, config) {
                            scope.instance = data;
                            location.path('messaging');
                        }).
                        error(function (data, status, headers, config) {
                            httpErrorHandler(scope);
                        });
            };

        }]);
