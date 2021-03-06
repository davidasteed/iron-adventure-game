(function() {
  'use strict';

  angular.module('adventure')
    .factory('SceneService', SceneService);

  SceneService.$inject = ['$http', '$state'];

  /**
   * Creates a new SceneService
   * @param {Function} $http  Makes Ajax calls
   * @return {Object}         The service's API methods
   */
  function SceneService($http, $state) {
    let currentScene = {};

    /**
     * Function getCurrentScene() returns the current scene
     * @return {Object} current scene Object
     */
    function getCurrentScene() {
      return currentScene;
    }

    /**
     * Function getScene() returns current scene for a player
     * @param  {String} inputEmail Player email
     * @return {Promise}
     */
    function getScene(inputEmail) {
      return $http({
        url: '/api/scenes/',
        method: 'get',
        header: {
          'Content-Type': 'application/json'
        },
        params: {inputEmail: inputEmail}
      })
      .then(function handleResponse(responseObj) {
        currentScene = responseObj.data;
        console.info('SceneService wrote currentScene as', currentScene);
        $state.go('game');
      });
    }

    /**
     * Function loadScene() advances to the next scene
     * @param  {String} inputId    Current scene
     * @param  {String} inputText  Player choice
     * @param  {String} inputEmail Player email
     * @return {Promise}
     */
    function loadScene(inputId, inputText, inputEmail) {
      return $http({
        url: '/api/scenes/',
        method: 'patch',
        header: {
          'Content-Type': 'application/json'
        },
        data: angular.toJson({
          inputId: inputId,
          inputText: inputText,
          inputEmail: inputEmail
        })
      })
      .then(function handleResponse(responseObj) {

        // route the View to the end template if the player has reached
        // the last Scene
        if (responseObj.data.isLastScene === true) {
          currentScene = responseObj.data;
          console.log('CURRENT SCENE', currentScene);
          $state.go('end');
        }
        currentScene = responseObj.data;
        return responseObj;
      });
    }

    return {
      getCurrentScene: getCurrentScene,
      getScene: getScene,
      loadScene: loadScene
    };
  }
}());
