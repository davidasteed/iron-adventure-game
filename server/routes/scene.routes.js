const sceneRouter = require('express').Router();
const Scene = require('../models/Scene.model.js');
const Player = require('../models/Player.model.js');

/**
 * Function getScene() retrieves current scene for that player
 * @param  {Object}   request  Request Object
 * @param  {Object}   response Response Object
 * @param  {Function} next     Advances to next Express middleware
 * @return {Object}            Data for current Scene
 */
sceneRouter.get('/:inputEmail', function getScene(request, response, next) {
  console.log('request.params.inputEmail =',request.params.inputEmail);
  if (!request.params.inputEmail ||
      typeof(request.params.inputEmail) !== 'string' ||
      request.params.inputEmail.length === 0) {
    let err = new Error('You must provide a player email ');
    err.status = 400;
    return next(err);
  }

  // last scene where we will return to the start page
  let scoreSceneId;
  let startSceneId;

  // data that will be updated while determining the next Scene
  let matchingScore;
  let thisScene;
  let returnThisScene;

  // data about the scene we returned
  let sceneReturned;

  console.log('inputEmail is', request.body.inputEmai);

  Player.find({ playerEmail: request.params.inputEmail})
    .then(function readPlayer(player) {
      if (!player) {
        let err = new Error(
          'That player does not exist, cannot load current scene!');
        err.status = 404;
        return next(err);
      }
      console.log('the current player\'s playerScene is ', player[0].playerScene);

      // return the player's current scene
      returnThisScene = player[0].playerScene;

      // Since we're loading the current scene,
      // do NOT increment the playerScore

      // So then we will obtain
      // the scene data for the player's current scene
      Scene.findById({_id: returnThisScene })
        .then(function readScene(data) {
          if (!data) {
            let err = new Error(
              'Cannot find the player\'s current scene!');
            err.status = 404;
            return next(err);
          }
          thisScene = data._id;

          // create the player's current scene data to be returned
          sceneReturned = {
            id: data._id,
            sceneImage: data.sceneImage,
            sceneText: data.sceneText,
            sceneChoices: data.sceneChoices
          };
          console.log('sceneReturned for current scene loop is', sceneReturned);
          response.json(sceneReturned);
        })
        .catch(function handleIssues(err) {
          let ourError = new Error ('Unable to search for current Scene');
          ourError.status = 500;
          next(err);
        });
      })
      .catch(function handleIssues(err) {
        let ourError = new Error ('Unable to find player');
        ourError.status = 500;
        next(err);
      });
});


/**
 * loadScene() returns the current Scene, or next Scene data
 * @param  {Object}   request  request Object
 * @param  {Object}   response response Object
 * @param  {Function} next     advances to next Express middleware
 * @return {Promise}
 */
sceneRouter.patch('/', function loadScene(request, response, next) {
  console.log('The request.body is', request.body);

  if (!request.body) {
    let err = new Error('You must provide scene and choice info');
    err.status = 400;
    return next(err);
  }

  if (!request.body.inputId || request.body.inputId.length === 0 ||
  typeof(request.body.inputId) !== 'string') {
    let err = new Error('Please provide a valid scene id');
    err.status = 400;
    next(err);
    return;
  }

  if (!request.body.inputText || request.body.inputText.length === 0 ||
  typeof(request.body.inputText) !== 'string') {
    let err = new Error('Please provide a valid scene text');
    err.status = 400;
    next(err);
    return;
  }

  if(!request.body.inputEmail ||
    Object.keys(request.body.inputEmail).length === 0) {
    let err = new Error('Please provie a valid player email');
    err.status = 400;
    next(err);
    return;
  }

  // last scene where we will return to the start page
  let endSceneId;
  let startSceneId;

  // data that will be updated while determining the next Scene
  let matchingScore;
  // let thisScene;
  let returnThisScene;

  // data about the scene we returned
  let sceneReturned;

  console.log('inputText is', request.body.inputText);

  // find the scene that contains the choiceText that the player selected
  Scene.find(
    {sceneChoices: {$elemMatch: {choiceText: request.body.inputText} } })
    .then(function readScene(data) {
      if (!data) {
        let err = new Error(
          'Cannot find scene that matches the player choice!');
        err.status = 404;
        return next(err);
      }
      console.log('The scene matching inputText is', data);

      // Set the scene to return
      returnThisScene = data[0].sceneNext;

      // look over the scene Object and obtain the matching score
      data[0].sceneChoices.forEach(function lookInSceneChoice(choice) {
        // console.log('choice in foreach is: ', choice);
        if (choice.choiceText === request.body.inputText) {
          matchingScore = choice.choiceScore;
        }
      });

      // if this scene is the last scene, reset the score to zero
      if (returnThisScene === endSceneId) {
        matchingScore = 0;
      }

      // Find the next scene and build a return Object from it
      Scene.findById( {_id: returnThisScene })
        .then(function readScene(data) {
          if (!data) {
            let err = new Error(
              'Cannot find the next scene!');
            err.status = 404;
            return next(err);
          }
          // return Object with the next scene
          sceneReturned = {
            id: data._id,
            sceneImage: data.sceneImage,
            sceneText: data.sceneText,
            sceneChoices: data.sceneChoices
          };
        })
        .catch(function handleIssues(err) {
          let ourError = new Error ('Unable to search for current Scene');
          ourError.status = 500;
          next(err);
        });

      // update the playerScene and playerScore
      Player.find({ playerEmail: request.body.inputEmail})
      .then(function readPlayer(player) {
        if (!player) {
          let err = new Error(
            'That player does not exist, cannot advance to next scene!');
          err.status = 404;
          return next(err);
        }

        console.log('before modification, the player object is: ', player);

        // create the new player Object
        let updatedPlayer = player[0];

        // Write the next scene ID and new score.
        // Note that the new score may
        // be zero if the player is leaving the last scene.
        updatedPlayer.playerScore += matchingScore;
        updatedPlayer.playerScene = returnThisScene;

        console.log('updatesPlayer contains: ', updatedPlayer);

        updatedPlayer.save(function saveproperty(err, revisedPlayer) {
          if (err) {
            let ourError = new Error ('Unable to update player!');
            ourError.status = 500;
            next(err);
          }
        });

        console.log('sceneReturned will be: ', sceneReturned);
        response.json(sceneReturned);
      })
      .catch(function handleIssues(err) {
        let ourError = new Error ('Unable to search for Scene');
        ourError.status = 500;
        next(err);
      });
    })
    .catch(function handleIssues(err) {
      let ourError = new Error (
        'Unable to search for Scene that matches the player choice!');
      ourError.status = 500;
      next(err);
    });
});

module.exports = sceneRouter;
