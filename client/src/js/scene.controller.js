(function() {
  'use strict';

  // create new Angular Controller
  angular.module('adventure')
    .controller('SceneController', SceneController);

  // inject the angular service that handles data calls for scene data
  SceneController.$inject = ['$state', '$stateParams', 'SceneService'];

  /**
   * [SceneController creates a new scene Controller]
   * @param {Object} SceneService [Service singleton]
   */
  function SceneController($state, $stateParams, SceneService) {
    let vm = this;

    vm.currentScene = {};  // store the scene to be displayed in the View

    function getScene(id) {
      // basic validation of argument
      if (typeof(id) !== 'string' || id.length === 0) {
        console.error('Valid id required to get a scene');
        return;
      }

      SceneService.getScene(id)
        .then(function handleResponse(responseObj) {
          vm.currentScene = responseObj;
        })
        .catch(function handleError(error) {
          if (error.status === 401) {
            vm.hasError = true;
            vm.errorMessage =
              'Please log in and try again';
          } else if (error.status === 404) {
            vm.hasError = true;
            vm.errorMessage =
              'Could not find that guest by the id provided';
          } else {
            vm.hasError = true;
            vm.errorMessage = 'Unknown error from server';
          }
        });
      }

      // NOTE; testing for gameplay-branch
      vm.sceneCounter = 1;  // track current scene to display in template



      vm.changeScene = function changeScene() {
        if (vm.sceneCounter === 1) {
          vm.currentScene = {sceneText: 'Scene one shows here',
                             sceneChoice: 'option 1'};
          vm.sceneCounter++; // set to advance to the next scene
        }
        else if (vm.sceneCounter === 2) {
          vm.currentScene = {sceneText: 'Scene two shows here',
                             sceneChoice: 'option 2'};
          vm.sceneCounter--; // return to scene one the next time
        }
      };

      vm.getAllScenes = function getAllScenes() {
        SceneService.getAllScenes()
          .then(function handleResponse(responseObj) {
            vm.allScenes = responseObj;
            console.log('vm.allScenes is:', vm.allScenes);
          })
          .catch(function handleError(error) {
            if (error.status === 401) {
              vm.hasError = true;
              vm.errorMessage =
                'Please log in and try again';
            } else if (error.status === 404) {
              vm.hasError = true;
              vm.errorMessage =
                'Could not find that guest by the id provided';
            } else {
              vm.hasError = true;
              vm.errorMessage = 'Unknown error from server';
            }
          });
      };

      vm.getAllScenes();
  }
}());