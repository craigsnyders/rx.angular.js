  rxModule.config(function($provide) {
    /**
     * @ngdoc service
     * @name rx.$rootScope
     *
     * @requires $delegate
     *
     * @description
     * `$rootScope` decorator that extends the existing `$rootScope` service
     * with additional methods. These methods are Rx related methods, such as
     * methods to create observables or observable functions.
     */
    $provide.decorator('$rootScope', function($delegate, rx) {

      Object.defineProperties($delegate.constructor.prototype, {
        /**
           * @ngdoc property
           * @name rx.$rootScope.$toObservable
           *
           * @description
           * Provides a method to create observable methods.
           */
          '$toObservable': {
              /**
               * @ngdoc function
               * @name rx.$rootScope.$toObservable#value
               *
               * @description
               * Creates an observable from a watchExpression.
               *
               * @param {(function|string)} watchExpression A watch expression.
               * @param {boolean} objectEquality Compare object for equality.
               *
               * @return {object} Observable.
               */
              value: function(watchExpression, objectEquality) {
                  var scope = this;
                  return observableCreate(function (observer) {
                      // Create function to handle old and new Value
                      function listener (newValue, oldValue) {
                          observer.onNext({ oldValue: oldValue, newValue: newValue });
                      }

                      // Returns function which disconnects the $watch expression
                      var disposable = Rx.Disposable.create(scope.$watch(watchExpression, listener, objectEquality));

                      scope.$on('$destroy', function(){
                          disposable.dispose();
                      });

                      return disposable;
                  }).publish().refCount();
              },
              /**
               * @ngdoc property
               * @name rx.$rootScope.$toObservable#enumerable
               *
               * @description
               * Enumerable flag.
               */
              enumerable: false,
              configurable: true,
              writable: true
          },
          /**
           * @ngdoc property
           * @name rx.$rootScope.$toObservableCollection
           *
           * @description
           * Provides a method to create observable methods.
           */
          '$toObservableCollection': {
              /**
               * @ngdoc function
               * @name rx.$rootScope.$toObservableCollection#value
               *
               * @description
               * Creates an observable from a watchExpression.
               *
               * @param {(function|string)} watchExpression A watch expression.
               *
               * @return {object} Observable.
               */
              value: function(watchExpression) {
                  var scope = this;
                  return observableCreate(function (observer) {
                      // Create function to handle old and new Value
                      function listener (newValue, oldValue) {
                          observer.onNext({ oldValue: oldValue, newValue: newValue });
                      }

                      // Returns function which disconnects the $watch expression
                      var disposable = Rx.Disposable.create(scope.$watchCollection(watchExpression, listener));

                      scope.$on('$destroy', function(){
                          disposable.dispose();
                      });

                      return disposable;
                  }).publish().refCount();
              },
              /**
               * @ngdoc property
               * @name rx.$rootScope.$toObservableCollection#enumerable
               *
               * @description
               * Enumerable flag.
               */
              enumerable: false,
              configurable: true,
              writable: true
          },
          /**
           * @ngdoc property
           * @name rx.$rootScope.$toObservableGroup
           *
           * @description
           * Provides a method to create observable methods.
           */
          '$toObservableGroup': {
              /**
               * @ngdoc function
               * @name rx.$rootScope.$toObservableGroup#value
               *
               * @description
               * Creates an observable from a watchExpressions.
               *
               * @param {(function|string)} watchExpressions A watch expression.
               *
               * @return {object} Observable.
               */
              value: function(watchExpressions) {
                  var scope = this;
                  return observableCreate(function (observer) {
                      // Create function to handle old and new Value
                      function listener (newValue, oldValue) {
                          observer.onNext({ oldValue: oldValue, newValue: newValue });
                      }

                      // Returns function which disconnects the $watch expression
                      var disposable = Rx.Disposable.create(scope.$watchGroup(watchExpressions, listener));

                      scope.$on('$destroy', function(){
                          disposable.dispose();
                      });

                      return disposable;
                  }).publish().refCount();
              },
              /**
               * @ngdoc property
               * @name rx.$rootScope.$toObservableGroup#enumerable
               *
               * @description
               * Enumerable flag.
               */
              enumerable: false,
              configurable: true,
              writable: true
          },
        /**
         * @ngdoc property
         * @name rx.$rootScope.$eventToObservable
         *
         * @description
         * Provides a method to create observable methods.
         */
        '$eventToObservable': {
          /**
           * @ngdoc function
           * @name rx.$rootScope.$eventToObservable#value
           *
           * @description
           * Creates an Observable from an event which is fired on the local $scope.
           * Expects an event name as the only input parameter.
           *
           * @param {string} event name
           *
           * @return {object} Observable object.
           */
          value: function(eventName) {
            var scope = this;
            return observableCreate(function (observer) {
              function listener () {
                observer.onNext({
                  'event': arguments[0],
                  'additionalArguments': slice.call(arguments, 1)
                });
              }

              // Returns function which disconnects from the event binding
              var disposable = disposableCreate(scope.$on(eventName, listener));

              scope.$on('$destroy', function(){
                disposable.isDisposed || disposable.dispose();
              });

              return disposable;
            }).publish().refCount();
          },
          /**
           * @ngdoc property
           * @name rx.$rootScope.$eventToObservable#enumerable
           *
           * @description
           * Enumerable flag.
           */
          enumerable: false,
          configurable: true,
          writable: true
        },
        /**
         * @ngdoc property
         * @name rx.$rootScope.$createObservableFunction
         *
         * @description
         * Provides a method to create obsersables from functions.
         */
        '$createObservableFunction': {
          /**
           * @ngdoc function
           * @name rx.$rootScope.$createObservableFunction#value
           *
           * @description
           * Creates an observable from a given function.
           *
           * @param {string} functionName A function name to observe.
           * @param {function} listener A listener function that gets executed.
           *
           * @return {function} Remove listener function.
           */
          value: function(functionName, listener) {
              return rx.createObservableFunction(this, functionName, listener);
          },
          /**
           * @ngdoc property
           * @name rx.$rootScope.$createObservableFunction#enumerable
           *
           * @description
           * Enumerable flag.
           */
          enumerable: false,
          configurable: true,
          writable: true
        },
        /**
         * @ngdoc function
         * @name rx.$rootScope.$digestObservables#value
         *
         * @description
         * Digests the specified observables when they produce new values.
         * The scope variable specified by the observable's key
         *   is set to the new value.
         *
         * @param {object} obj A map where keys are scope properties
         *   and values are observables.
         *
         * @return {boolean} Reference to obj.
         */
        '$digestObservables': {
          value: function(observables) {
            var scope = this;
            return observables.map(function(observable, key) {
              return observable.digest(scope, key);
            }).publish().refCount();
          },
          /**
           * @ngdoc property
           * @name rx.$rootScope.digestObservables#enumerable
           *
           * @description
           * Enumerable flag.
           */
          enumerable: false,
          configurable: true,
          writable: true
        }
      });

      return $delegate;
    });
  });
