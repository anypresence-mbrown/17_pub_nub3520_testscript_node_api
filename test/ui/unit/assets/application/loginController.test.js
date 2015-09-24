'use strict';


/**
 * returns instances of mocked user services for login controller
 * @param mockType type of mocked instance (failingInstance or successfulInstance)
 * @returns {Function} a userService function
 */
function userService(mockType) {
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
        }
      };
    };
  }
}

/**
 * Unit tests for LoginController.
 */
describe('Unit Tests for LoginController', function () {

  var LoginController;
  var scope;
  var UserService;

  beforeEach(module('adminConsole.controllers', function($provide){
    $provide.value("UserService", userService('successfulInstance'));
  }));

  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LoginController = $controller('LoginController', {
      $scope: scope
    });
  }));

  it('scope.error must be initialized to false', function () {
    expect(scope.error).toBe(false);
  });

  it('scope.errorMessage must be initialized to null', function () {
    expect(scope.errorMessage).toBe(null);
  });

  it('scope.loading must be initialized to false', function () {
    expect(scope.loading).toBe(false);
  });

  it('scope.instance must be an empty array', function () {
    expect(typeof scope.instance).toBe("object");
  });

  it('scope.login must be a function', function () {
    var typeOfLogin = typeof scope.login;
    expect(typeOfLogin).toBe("function");
  });

  it('scope.login must be a function', function () {
    var typeOfLogin = typeof scope.login;
    expect(typeOfLogin).toBe("function");
  });

  it('should be false when if no error thrown after execution of login function', function () {
    expect(scope.error).toBe(false);
  });

});
