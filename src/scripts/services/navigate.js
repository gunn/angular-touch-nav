'use strict';

var forEach = angular.forEach;

angular.module('ngTouchNav')

  //expose $navigate service inside views
  .run(function($rootScope, $navigate, $location) {
    $rootScope.$navigate = $navigate;
    $rootScope.$redraw = function performRedraw() {
      document.body.removeChild(document.body.appendChild(document.createElement('style')));
    };

    $rootScope.$on('$locationChangeSuccess', function () {
      $navigate.handleBrowserNavigation($location.path());
    });
  })

  .provider('$navigate', function() {

    this.$get = function($location, $timeout, $rootScope) {

      var self = this;
      this.history = [];
      this.historyIndex = 0;

      this.defaultAnimation = 'animation-slide';
      this.animation = this.defaultAnimation;

      setTimeout(function() {
        self.history.push({path: $location.path(), animation: null});
      });

      this.indexForPath = function (path) {
        for (var i = 0; i < this.history.length; i++) {
          if (this.history[i].path == path) {
            return i;
          }
        }
      };

      this.handleBrowserNavigation = function (path) {
        var currentItem = this.history[this.historyIndex];
        if (currentItem && currentItem.path != path) {
          // We didn't get here via $navigate.path(path)
          var index = this.indexForPath(path);

          if (index!=undefined && index!=this.historyIndex) {
            // We've been here before
            var reverse = index < this.historyIndex;
            this.setAnimation(currentItem.animation || this.defaultAnimation, reverse);

            if (reverse) this.historyIndex--;
            else         this.historyIndex++;
          }
        }
      };

      this.setAnimation = function(animation, reverse) {
        if(animation) {
          if(reverse) {
            self.animation = animation + ' ng-reverse';
          } else {
            self.animation = animation;
          }
        }
        return self.animation;
      };

      this.path = function(path, animation, reverse) {
        // console.warn('$navigate.path', arguments, this.history);
        if(typeof animation === 'boolean') {
          reverse = animation;
          animation = null;
        }
        this.setAnimation(animation || this.defaultAnimation, reverse);
        $location.path(path);

        if (reverse) {
          this.historyIndex--;
        } else {
          // Mimic browser behaviour of removing forward-history on normal navigation
          while (this.history.length > this.historyIndex+1) {
            this.history.pop();
          }

          this.historyIndex++;

          this.history.push({
            path: path,
            animation: animation
          });
        }
      };

      this.search = function(search, paramValue, animation, reverse) {
        // console.warn('$navigate.search', arguments);
        this.setAnimation(animation || this.defaultAnimation, reverse);
        $location.search(search, paramValue);
      };

      this.back = function() {
        if(this.history.length < 2) {
          return;
        }
        var animation = this.history[this.historyIndex].animation;
        var item = this.history[this.historyIndex - 1];
        if(item.path) {
          this.path(item.path, animation, true);
        }
      };

      return this;

    };

  });
