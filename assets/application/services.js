'use strict';

/* Services */

var adminServices = angular.module('adminConsole.services', ['ngResource', 'ngCookies']);

adminServices.factory('V1Publish', ['$resource',
    function($resource) {
        return $resource('/api/v1/publishes/:id', { id: '@id' }, {'update': { method: 'PUT' }, 'save': {method: 'POST', url:'/api/v1/publishes', isArray:false}});
    }
]);


adminServices.factory('Channel', ['$resource', function($resource) {
  return $resource('/api/push_notifications/channel/:id', { id: '@id' }, {
    'update': {method: 'PUT', url: '/api/push_notifications/channel/:id'},
    'subscribe': {method: 'POST', url: '/api/push_notifications/channel/subscribe'},
    'unsubscribe': {method: 'POST', url: '/api/push_notifications/channel/unsubscribe'},
    'findDeviceChannels': {method: 'GET', url: '/api/push_notifications/device/:id/channel', isArray: true}
  });
}]);

adminServices.factory('Device', ['$resource', function($resource) {
  return $resource('/api/push_notifications/device/:id', { id: '@id' }, {
    'update': {method: 'PUT', url: '/api/push_notifications/device/:id'}
  });
}]);

adminServices.factory('Message', ['$resource', function($resource) {
  return $resource('/api/push_notifications/message/:id', { id: '@id' }, {
    'update': {method: 'PUT', url: 'api/push_notifications/device/:id'}
  });
}]);

adminServices.factory('PaginationCache', ['$cacheFactory', function($cacheFactory) {
  return $cacheFactory('paginationCache');
}]);

adminServices.factory('PaginationService', ['$q', '$route', '$location', '$http', 'PaginationCache', function($q, $route, $location, $http, paginationCache) {
  function Service(options) {
    this.supportsServerPagination = options.supportsServerPagination === undefined ? true : options.supportsServerPagination;
    this.limit = options.limit || 10;
    this.model = options.model;
    this.modelName = options.modelName;
    this.route = options.route;
    this.pageParamName = options.pageParamName || 'page';
  }

  Service.prototype.slicePage = function(page, collection) {
    var startIndex = (page - 1) * this.limit;
    var coll = collection.slice(startIndex, startIndex + this.limit);
    return coll;
  };

  Service.prototype.paginate = function() {
    var self = this;
    var deferred = $q.defer();

    var countKey = this.modelName + 'Count';
    var modelKey = this.modelName;

    var pagination = {
      service: this,
      page: parseInt($route.current.params[this.pageParamName]) || 1,
      modelName: this.modelName,
      refresh: function() {
        this.clearCache();
        $location.search(self.pageParamName, null);
      },
      clearCache: function() {
        paginationCache.remove(countKey);
        paginationCache.remove(modelKey);
        return this;
      },
      nextPage: function() {
        var maxPage = this.totalPages[this.totalPages.length - 1];
        if (this.page + 1 > maxPage) return;
        $location.search(self.pageParamName, this.page + 1);
      },
      prevPage: function() {
        if (this.page !== 1) {
          $location.search(self.pageParamName, this.page - 1);
        }
      },
      setPage: function(pageNumber) {
        $location.search(self.pageParamName, pageNumber);
      }
    };

    var offset = (pagination.page - 1) * this.limit;
    if (this.supportsServerPagination) {
      var promises = [];
      promises.push(this.model.query({limit: this.limit, offset: offset}).$promise);
      if (paginationCache.get(countKey)) {
        pagination.count = paginationCache.get(countKey);
      } else {
        promises.push($http.get(this.route, {params: {scope: 'count'}}));
      }

      $q.all(promises)
        .then(function(results) {
          if (!pagination.count) pagination.count = results[1].data[0];

          paginationCache.put(countKey, pagination.count);
          pagination.instances = results[0];
          var pageCount = Math.ceil(pagination.count / self.limit);

          // Make a range to iterate across in the view/controller
          pagination.totalPages = [];
          for(var i = 1; i <= pageCount; i++) {
            pagination.totalPages.push(i);
          }

          deferred.resolve(pagination);
        })
        .catch(function(err) {
          deferred.reject(err);
        });
    }
    else {
      if (paginationCache.get(countKey) && paginationCache.get(modelKey)) {
        var collection = paginationCache.get(modelKey);
        pagination.instances = self.slicePage(pagination.page, collection);
        pagination.count = paginationCache.get(countKey);
        var pageCount = Math.ceil(pagination.count / self.limit);
        pagination.totalPages = [];
        for(var i = 1; i <= pageCount; i++) {
          pagination.totalPages.push(i);
        }

        deferred.resolve(pagination);
      } else {
        this.model.query().$promise
          .then(function(results) {
            paginationCache.put(countKey, results.length);
            paginationCache.put(modelKey, results);
            pagination.instances = self.slicePage(pagination.page, results);

            pagination.count = results.length;
            var pageCount = Math.ceil(pagination.count / self.limit);
            pagination.totalPages = [];
            for(var i = 1; i <= pageCount; i++) {
              pagination.totalPages.push(i);
            }

            deferred.resolve(pagination);
          })
          .catch(function(err) {
            deferred.reject(err);
          });
      }
    }

    return deferred.promise;
  };

  return Service;
}]);


adminServices.factory('SessionService', ['$cookies',
  function($cookies) {
    return {
      clearSession: function() {
        delete $cookies['sails.sid'];
        delete $cookies['adminConsole.currentUser'];
      },
      setCurrentUser: function(userId) {
        $cookies['adminConsole.currentUser'] = userId;
      },
      currentUser: function() {
        return $cookies['adminConsole.currentUser'];
      },
      sessionExists: function() {
        return (typeof $cookies['sails.sid'] !== 'undefined' && $cookies['sails.sid'] !== null);
      }
    };
  }
]);

//
// regarding the $timeout calls below:
//
//   in order to get the freshest copy of the sails.sid cookie,
//   we need to wait 100 milliseconds before accessing it after a
//   request is made using $http.  for whatever reason, angularjs
//   refreshes the stored cookies using it's own timeout function, which
//   runs every 100 milliseconds, rather than refreshing them immediately
//   when they are received. this means that the cookies may not have been
//   refreshed if we access them immediately inside a '.succes' or '.error'
//   method.  if we wait 100 milliseconds, our timeout is guaranteed to
//   fire after the cookies have been set, and the sails.sid cookie should
//   be the freshest value.
//
// for reference, see the following links:
//
//   google group discussion:  https://groups.google.com/forum/#!msg/angular/yc8tODmDm18/X8KYFGlW0QkJ
//   github code snippet:  https://github.com/angular/angular.js/blob/1bb33cccbe12bda4c397ddabab35ba1df85d5137/src/ngCookies/cookies.js#L58-L66
//   github code snippet:  https://github.com/angular/angular.js/blob/1bb33cccbe12bda4c397ddabab35ba1df85d5137/src/ng/browser.js#L102
//

adminServices.factory('UserService', ['$http', '$timeout', 'SessionService',
  function($http, $timeout, SessionService) {
    return {
      login: function(credentials, next) {
        $http.post('/auth/admin/callback', credentials)
          .success(function(data, status, headers) {
            // see comment above for purpose of this timeout
            $timeout(function() {
              if (!SessionService.sessionExists()) {
                SessionService.clearSession();
                next("Unable to extract session id");
              } else {
                SessionService.setCurrentUser(data.email);
                next();
              }
            }, 100);
          }).error(function(data, status) {
            SessionService.clearSession();
            if (status === 401) {
              next('Invalid email/password combination');
            } else {
              next('Unexpected error encountered. HTTP status ' + status + '; data ' + JSON.stringify(data));
            }
          });
      },
      isLoggedIn: function() {
        var current = SessionService.currentUser();
        return (typeof current !== 'undefined' && current !== null);
      },
      getCurrentUser: function() {
        return SessionService.currentUser();
      },
      logout: function(next) {
        $http.post('/auth/signout')
          .success(function(data,status) {
            // see comment above for purpose of this timeout
            $timeout(function() {
              SessionService.clearSession();
              next();
            }, 100);
          }).error(function(data, status) {
            // see comment above for purpose of this timeout
            $timeout(function() {
              SessionService.clearSession();
              next('Failed to invoke signout');
            }, 100);
          });
      }
    };
  }
]);

adminServices.factory('ResponseInterceptor', [ '$q', '$location', 'SessionService',
  function($q, $location, SessionService) {
    return {
      responseError: function(rejection) {
        if ((rejection.status === 401 || rejection.status === 403) && $location.path !== '/sign_in') {
          SessionService.clearSession();
          $location.path('/sign_in');
        }
        // do something on error
        return $q.reject(rejection);
      }
    };
  }
]);

adminServices.factory('Utilities', [ '$location',
  function($location) {
    return {
      linkClass: function(path) {
        return $location.path().substr(0, path.length) === path ? 'active' : '';
      }
    };
  }
]);

adminServices.factory('httpErrorHandler', ['$log', function($log) {
  return function(scope) {
    return function(response) {
      $log.error('Received from server: status ' + response.status + ', data ' + response.data);
      scope.loading = false;
      scope.error = true;
      if(response.data && response.data.error === 'E_VALIDATION') {
        scope.errorMessage = 'Invalid attributes.';
      } else {
        scope.errorMessage = "An unexpected error was encountered.  Response from server was " + response.status;
      }
    };
  }
}]);

adminServices.value('version', '0.1');
