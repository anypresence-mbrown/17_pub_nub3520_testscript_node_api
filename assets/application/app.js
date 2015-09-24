'use strict';


// Declare app level module which depends on filters, and services
angular.module('adminConsole', [
  'ngRoute',
  'adminConsole.services',
  'adminConsole.controllers',
  'adminConsole.controllers.AnalyticsControllers',
  'adminConsole.controllers.DeviceControllers',
  'adminConsole.controllers.MessageControllers',
  'adminConsole.controllers.ChannelControllers',
  'adminConsole.controllers.V1PublishControllers',
  'adminConsole.directives'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/index', { templateUrl: 'templates/views/partials/mainIndex.html', controller: 'MainIndexController' });
  $routeProvider.when('/sign_in', { templateUrl: 'templates/views/partials/signIn.html', controller: 'LoginController' });
  $routeProvider.when('/sign_out', { template: '', controller: 'LogoutController' });
  $routeProvider.when('/publishes', {templateUrl: 'templates/views/partials/publishes/index.html', controller: 'V1PublishListController', resolve: {
    pagination: ['PaginationService', 'V1Publish', function(PaginationService, model) {
      var service = new PaginationService({model: model, modelName: 'publishes', route: '/api/publishes', supportsServerPagination: false});
      return service.paginate();
    }]
  }});
  $routeProvider.when('/publishes/index', {templateUrl: 'templates/views/partials/publishes/index.html', controller: 'V1PublishListController'});
  $routeProvider.when('/publishes/new', {templateUrl: 'templates/views/partials/publishes/create.html', controller: 'V1PublishCreateController'});
  $routeProvider.when('/publishes/:objectId/edit', {templateUrl: 'templates/views/partials/publishes/edit.html', controller: 'V1PublishEditController'});
  $routeProvider.when('/publishes/:objectId', {templateUrl: 'templates/views/partials/publishes/show.html', controller: 'V1PublishDetailController'});
  $routeProvider.when('/messaging', { templateUrl: 'templates/views/partials/messaging/index.html', controller: 'MessagingIndexController', resolve: {
    channelPagination: ['PaginationService', 'Channel', function(PaginationService, model) {
        var service = new PaginationService({model: model, limit: 5, pageParamName: 'channelPage', modelName: 'channel', route: '/api/push_notifications/channel', supportsServerPagination: true});
        return service.paginate();
      }],
    devicePagination: ['PaginationService', 'Device', function(PaginationService, model) {
      var service = new PaginationService({model: model, limit: 5, pageParamName: 'devicePage', modelName: 'device', route: '/api/push_notifications/device', supportsServerPagination: true});
      return service.paginate();
    }],
    messagePagination: ['PaginationService', 'Message', function(PaginationService, model) {
      var service = new PaginationService({model: model, limit: 5, pageParamName: 'messagePage', modelName: 'message', route: '/api/push_notifications/message', supportsServerPagination: true });
      return service.paginate();
    }]
  }});
  $routeProvider.when('/documentation', { templateUrl: 'templates/views/partials/documentation/documentation.html', controller: 'MainIndexController'});
  $routeProvider.when('/messaging/device/index', { templateUrl: 'templates/views/partials/messaging/device/index_device.html', controller: 'DeviceListController'});
  $routeProvider.when('/messaging/device/new', { templateUrl: 'templates/views/partials/messaging/device/create_device.html', controller: 'DeviceCreateController'});
  $routeProvider.when('/messaging/device/:objectId/edit', { templateUrl: 'templates/views/partials/messaging/device/edit_device.html', controller: 'DeviceEditController'});
  $routeProvider.when('/messaging/device/:objectId', { templateUrl: 'templates/views/partials/messaging/device/show_device.html', controller: 'DeviceDetailController'});
  $routeProvider.when('/messaging/channel/index', { templateUrl: 'templates/views/partials/messaging/channel/index_channel.html', controller: 'ChannelListController'});
  $routeProvider.when('/messaging/channel/new', { templateUrl: 'templates/views/partials/messaging/channel/create_channel.html', controller: 'ChannelCreateController'});
  $routeProvider.when('/messaging/channel/:objectId/edit', { templateUrl: 'templates/views/partials/messaging/channel/edit_channel.html', controller: 'ChannelEditController'});
  $routeProvider.when('/messaging/channel/:objectId', { templateUrl: 'templates/views/partials/messaging/channel/show_channel.html', controller: 'ChannelDetailController'});
  $routeProvider.when('/messaging/message/index', { templateUrl: 'templates/views/partials/messaging/message/index_message.html', controller: 'MessageListController'});
  $routeProvider.when('/messaging/message/new', { templateUrl: 'templates/views/partials/messaging/message/create_message.html', controller: 'MessageCreateController'});
  $routeProvider.when('/messaging/message/:objectId/edit', { templateUrl: 'templates/views/partials/messaging/message/edit_message.html', controller: 'MessageEditController'});
  $routeProvider.when('/messaging/message/:objectId', { templateUrl: 'templates/views/partials/messaging/message/show_message.html', controller: 'MessageDetailController'});
  $routeProvider.when('/analytics', { templateUrl: 'templates/views/partials/analytics/analytics.html', controller: 'AnalyticsMainController' });
  $routeProvider.otherwise({redirectTo: '/index'});
}]).config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('ResponseInterceptor');
}]).run(['$rootScope', '$location', 'UserService', function($rootScope, $location, UserService) {
  $rootScope.$on('$locationChangeStart', function(event, next, current) {
    if ( UserService.getCurrentUser() == null ) {
      // Only redirect to sign in page if not already going there
      if ( next.templateUrl !== "templates/views/partials/signIn.html" ) {
        $location.path( "sign_in" );
      }
    }
  });
}]).factory('data', function(){
            return {
                selectedDeviceId: '',
                selectedChannelId: ''
            };
        });
