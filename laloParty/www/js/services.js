angular
  .module('starter.services', [])
  .factory('$localStorage', $localStorage)
  .factory('Users',Users)
  .factory('Games',Games)
  .factory('Teams',Teams)
  .factory('Auth',Auth);

function Auth(rootRef, $firebaseAuth){
  return $firebaseAuth(rootRef);
}
Auth.$inject = ['rootRef','$firebaseAuth'];


//The Users service provide the access to the user branch.
function Users(rootRef, $firebaseArray, $firebaseObject){
  var ref = new Firebase(rootRef + "users");          //This is my connection to the db
  return {
    ref: function (){
      return ref;
    },
    all: function (){
      return $firebaseArray(ref);
    },
    get: function (userId){
      return $firebaseObject(ref.child(userId));
    },
    logout: function(){
      ref.unauth();
    }
  };
}
Users.$inject = ['rootRef', '$firebaseArray', '$firebaseObject'];




//The Users service provide the access to the user branch.
function Games(rootRef, $firebaseArray, $firebaseObject){
  var ref = new Firebase(rootRef + "games");          //This is my connection to the db
  return {
    ref: function (){
      return ref;
    },
    all: function (){
      return $firebaseArray(ref);
    },
    get: function (gameId){
      return $firebaseObject(ref.child(gameId));
    }
  };
}
Games.$inject = ['rootRef', '$firebaseArray', '$firebaseObject'];




//The Users service provide the access to the user branch.
function Teams(rootRef, $firebaseArray, $firebaseObject, Users, $q){
  var ref = new Firebase(rootRef + "teams");          //This is my connection to the db
  var teamSizes = new Firebase(rootRef + "teamSizes");
  return {
    ref: function (){
      return ref;
    },
    all: function (){
      return $firebaseArray(ref.orderBychild("name"));
    },
    get: function (teamId){
      return $firebaseObject(ref.child(teamId));
    },
    subscribe: function (){
      return $firebaseArray(teamSizes.orderByValue().limitToFirst(1));
    },
    teamSizes: function(){
      return teamSizes;
    }

  };
}
Teams.$inject = ['rootRef', '$firebaseArray', '$firebaseObject', 'Users'];


function $localStorage($window){
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}
$localStorage.$inject = ['$window'];

