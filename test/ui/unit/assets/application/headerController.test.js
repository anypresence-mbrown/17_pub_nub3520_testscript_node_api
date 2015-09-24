'use strict';


/**
 * returns instances of mocked user services
 * @param mockType type of mocked instance (failingInstance or successfulInstance)
 * @returns {Function} a userService function
 */
function userServiceMockFactory(mockType) {
  if(mockType == "failingInstance"){
    return function () {
      return {
        login: function(){
          return false;
        }
      };
    };
  }
  if(mockType == "successfulInstance"){
    return function () {
      return {
        login: function(){
          return true;
        },
        isLoggedIn: function(){
          return "isLoggedInOK";
        },
        getCurrentUser: function(){
          return "getCurrentUserOK";
        }
      };
    };
  }
}

describe('Unit Tests for HeaderController', function () {

  var HeaderController;
  var scope;
  var UserService;

  beforeEach(module('adminConsole.controllers', function($provide){
    $provide.value("UserService", userServiceMockFactory('successfulInstance'));
  }));

  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HeaderController = $controller('HeaderController', {
      $scope: scope
    });
  }));

  it('should match isLoggedIn value coming from UserService', function () {
    expect(scope.isLoggedIn).toBe(userServiceMockFactory('successfulInstance').isLoggedIn);
  });

  it('should match getCurrentUser value coming from UserService', function () {
    expect(scope.getCurrentUser).toBe(userServiceMockFactory('successfulInstance').getCurrentUser);
  });

});
