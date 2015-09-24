'use strict';

angular.module('adminConsole.directives', [])
  .directive('formInput', function() {
    return {
      restrict: 'E',
      templateUrl: 'templates/views/partials/formInputDirective.html',
      scope: {
        label: '@',
        name: '@',
        required: '@',
        type: '@',
        property: '=',
        errors: '='
      },
      link: function(scope, iElement, iAttrs, ctrl) { 
        scope.optionalValue = iAttrs.required === 'true' ? 'required' : 'optional';
        scope.formatError = function(error) {
          if (error.rule === "required") {
            return "can't be blank";
          } else if (error.rule === "boolean" || error.rule === "date" || error.rule === "float" || 
                     error.rule === "integer" || error.rule === "text" || error.rule === "datetime" ) {
            return "" + error.data + " is not a valid " + error.rule + " value";                        
          } else {
            return error.message;
          }
        };
      }
    }
  })
  .directive('paginator', function() {
    return {
      restrict: 'E',
      templateUrl: 'templates/views/partials/paginator.html',
      transclude: true
    };
  });
