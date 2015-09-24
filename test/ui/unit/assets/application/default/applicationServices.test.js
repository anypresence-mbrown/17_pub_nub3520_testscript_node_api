describe('Unit Test for the Angular Services', function () {

    var UserService;
    var $http;
    var $timeout;
    var SessionService;
    var $cookies;
    var ResponseInterceptor;
    var $location;
    var $q;
    var Utilities;
    var httpErrorHandler;
    var $log;
    var $scope;

    var mockedUser = function(){
        return "an user";
    };

    /* loads application -aka module- */
    beforeEach(function () {
        module('adminConsole');
    });

    /* inject every single dependency required to run defined tests */
    beforeEach(inject(function (_UserService_, _$http_, _$timeout_, _SessionService_, _$cookies_, _ResponseInterceptor_, _$location_, _$q_, _Utilities_, _httpErrorHandler_, _$log_, _$rootScope_) {
        UserService = _UserService_;
        $http = _$http_;
        $timeout = _$timeout_;
        SessionService = _SessionService_;
        $cookies = _$cookies_;
        ResponseInterceptor = _ResponseInterceptor_;
        $location = _$location_;
        $q = _$q_;
        Utilities = _Utilities_;
        httpErrorHandler = _httpErrorHandler_;
        $log = _$log_;
        $scope = _$rootScope_;

    }));


    describe('Tests for UserService service', function () {

        it('UserService::getCurrentUser::should return the user provided by SessionService when exists', function () {
            spyOn(SessionService, 'currentUser').andCallFake(function () {
                return mockedUser();
            });
            var currentUser = UserService.getCurrentUser();
            expect(currentUser).toBe("an user");
        });

        it('UserService::getCurrentUser::should return false if it does not exists a current user', function () {
            expect(UserService.getCurrentUser()).toBeFalsy();
        });

        it('UserService::isLoggedIn::should return true in if it exists a current user', function () {
            spyOn(SessionService, 'currentUser').andCallFake(function () {
                return mockedUser();
            });
            var isLoggedIn = UserService.isLoggedIn();
            expect(isLoggedIn).toBeTruthy();
        });

        it('UserService::isLoggedIn::should return false if it does not exists a current user', function () {
            expect(UserService.isLoggedIn()).toBeFalsy();
        });

        it('UserService::login::should', function () {
            expect(UserService.isLoggedIn()).toBeFalsy();
        });

    });

    describe('Tests for ResponseInterceptor service', function () {
        it('should call location service if rejection status is 401 and location path is not defined', function () {
            spyOn($location, 'path');
            spyOn(SessionService, 'clearSession');

            ResponseInterceptor.responseError({status:401});

            expect($location.path).toHaveBeenCalled();
            expect(SessionService.clearSession).toHaveBeenCalled();
        });

        it('should call location service if location path is /sign_in', function () {
            spyOn($location, 'path').andCallFake(function(){
                return '/not_sign_in_path';
            });
            spyOn(SessionService, 'clearSession');

            ResponseInterceptor.responseError({status:401});

            expect($location.path).toHaveBeenCalled();
            expect(SessionService.clearSession).toHaveBeenCalled();
        });

        it('should call rejection service if code is not 401', function(){
            spyOn($q, 'reject');

            ResponseInterceptor.responseError(500);

            expect($q.reject).toHaveBeenCalled();
        });

        it('should call rejection service if code is 401, but location path is /sign_in', function(){
            spyOn($q, 'reject');
            spyOn($location, 'path').andCallFake(function(){
                return '/sign_in';
            });

            ResponseInterceptor.responseError(500);

            expect($q.reject).toHaveBeenCalled();
        });


        it('should call rejection service if code is an empty object', function(){
            spyOn($q, 'reject');
            spyOn($location, 'path').andCallFake(function(){
                return '/sign_in';
            });

            ResponseInterceptor.responseError({});

            expect($q.reject).toHaveBeenCalled();
        });

    });

    describe('Tests for Utilities service', function () {
        it('Utilities::linkClass::should return an empty string if beginning of location path does not match provided path', function () {
            spyOn($location, 'path').andCallFake(function(){
                return '/sign_in';
            });
            var result = Utilities.linkClass('/sign_out');

            expect($location.path).toHaveBeenCalled();
            expect(result).toBe('');
        });

        it('Utilities::linkClass::should return "active" string if provided path is an empty string', function () {
            spyOn($location, 'path').andCallFake(function(){
                return '/sign_in';
            });
            var result = Utilities.linkClass('');

            expect($location.path).toHaveBeenCalled();
            expect(result).toBe('active');
        });

        it('Utilities::linkClass::should return "active" string if provided path is sign_in', function () {
            spyOn($location, 'path').andCallFake(function(){
                return '/sign_in';
            });
            var result = Utilities.linkClass('/sign_in');

            expect($location.path).toHaveBeenCalled();
            expect(result).toBe('active');
        });
    });

    describe('Tests for HTTP error handler service', function () {
        it('httpErrorHandler::should call log service', function () {
            spyOn($log, 'error');
            httpErrorHandler($scope)({});
            expect($log.error).toHaveBeenCalled();
        });

        it('httpErrorHandler::should set loading scope variable to false', function () {
            httpErrorHandler($scope)({});
            expect($scope.loading).toBe(false);
        });

        it('httpErrorHandler::should set error scope variable to true', function () {
            httpErrorHandler($scope)({});
            expect($scope.error).toBe(true);
        });

        it('httpErrorHandler::should set "Invalid attributes." in errorMessage scope variable if its an E_VALIDATION error', function () {
            httpErrorHandler($scope)({data : { error : 'E_VALIDATION' }});
            expect($scope.errorMessage).toBe("Invalid attributes.");
        });

        it('httpErrorHandler::should set a generic error message in errorMessage scope variable if its not an E_VALIDATION error', function () {
            httpErrorHandler($scope)({status: "errorValue"});
            expect($scope.errorMessage).toBe("An unexpected error was encountered.  Response from server was errorValue");
        });
    });

    describe('Tests for SessionService service', function () {
        it('SessionService::clearSession::should clean up sails id and current user values from cookie', function () {
            $cookies['sails.sid'] = "someValue";
            $cookies['adminConsole.currentUser'] = "someValue";

            SessionService.clearSession();

            expect($cookies['sails.sid']).toBe(undefined);
            expect($cookies['adminConsole.currentUser']).toBe(undefined);
        });

        it('SessionService::setCurrentUser::should set current user value in cookie with the provided value', function () {
            SessionService.setCurrentUser("Juan");
            expect($cookies['adminConsole.currentUser']).toBe("Juan");
        });

        it('SessionService::sessionExists::should return false if the sails id session is undefined', function () {
            $cookies['sails.sid'] = undefined;
            var result = SessionService.sessionExists();
            expect(result).toBe(false);
        });

        it('SessionService::sessionExists::should return false if the sails id session is null', function () {
            $cookies['sails.sid'] = null;
            var result = SessionService.sessionExists();
            expect(result).toBe(false);
        });

        it('SessionService::sessionExists::should return true if the sails id session is not null or undefined', function () {
            $cookies['sails.sid'] = 1234;
            var result = SessionService.sessionExists();
            expect(result).toBe(true);
        });

        it('SessionService::currentUser::should return the currently defined user', function () {
            $cookies['adminConsole.currentUser'] = "Juan";
            var result = SessionService.currentUser();
            expect(result).toBe("Juan");
        });
    });

});
