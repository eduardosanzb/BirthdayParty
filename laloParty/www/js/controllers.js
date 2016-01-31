angular.module('starter.controllers', [])
    .controller('TeamCtrl', TeamCtrl)
    .controller('GamesCtrl', GamesCtrl)
    .controller('GuestsCtrl', GuestsCtrl)
    .controller('LoginCtrl', LoginCtrl);


function LoginCtrl($scope, Auth, Users, Teams, $state, $ionicModal, $ionicLoading, $localStorage) {

    //Modal creator for the signup template
    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal
    });
    $scope.openModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };


    // Social Login
    this.loginWithSocial = function loginWithSocial(socialNetwork) {
        $ionicLoading.show({
            template: 'Login in...'
        }); //We add a spinner to wait to get the data and write it down on the db
        Auth.$authWithOAuthPopup(socialNetwork)
            .then(function(authData) {

                Users.ref().child(authData.uid).once('value', function(dataSnapshot) {
                    if (dataSnapshot.exists()) {
                        /*The user already exist so we just are goint to fetch the info*/
                        console.log(dataSnapshot.val().uid);
                        $localStorage.setObject("user", dataSnapshot.val());
                        $localStorage.set("myId", authData.uid);
                        $state.go('tab.team');
                        $ionicLoading.hide();
                    } else {
                        /*The user in new, so lets create all the stuff*/
                        /* Strategy:
                         *   1.- Find out which team has least members
                         *   2.- Create the user object && set to DB
                         *   3.- Set in teams/teamId/members/usrId = true
                         *   4.- Increment the size in data[0].$value
                         *  Notes:
                         *    1.- If all the teams have the same size, add the user to the first team
                         */
                        Teams.subscribe().$loaded() //Step 1
                        .then(function(data) {
                            $scope.user = { //Step 2
                                provider: authData.provider,
                                name: getName(authData),
                                image: getImage(authData),
                                team: data[0].$id
                            }
                            Users.ref().child(authData.uid).set($scope.user);
                            //Steps 3 and 4
                            Teams.ref().child($scope.user.team).child("members").child(authData.uid).set(true);
                            Teams.teamSizes().child($scope.user.team).set(data[0].$value + 1);
                            $localStorage.set("myId", authData.uid);
                            $localStorage.setObject("user", $scope.user);
                        }, function(error) {
                            console.log(error);
                        });
                        $state.go('tab.team');
                        $ionicLoading.hide();
                    }
                }, function(error) {
                    console.log("Some error finding the user: " + error);
                });
            }, function(error) { //Some error with the social auth. 
                alert("Authentication Failed: " + error);
                $ionicLoading.hide();
            });
    };
    // find a suitable name based on the meta info given by each provider
    function getName(authData) {
        switch (authData.provider) {
            case 'password':
                return authData.password.email.replace(/@.*/, '');
            case 'twitter':
                return authData.twitter.displayName;
            case 'facebook':
                return authData.facebook.displayName;
            case 'github':
                return authData.github.displayName;
            case 'google':
                return authData.google.displayName;
        }
    }
    // find a suitable name based on the meta info given by each provider
    function getImage(authData) {
        switch (authData.provider) {

            case 'twitter':
                return authData.twitter.profileImageURL;
            case 'facebook':
                return authData.facebook.profileImageURL;
            case 'github':
                return authData.github.profileImageURL;
            case 'google':
                return authData.google.profileImageURL;
        }
    }
}
LoginCtrl.$inject = ['$scope', 'Auth', 'Users', 'Teams', '$state', '$ionicModal', '$ionicLoading', '$localStorage'];


/*TEAM CONTROLLER*/
function TeamCtrl($scope, $localStorage, Teams) {
  $scope.user = $localStorage.getObject("user");
  console.log($scope.user);
  $scope.myTeam = Teams.get($scope.user.team);
  //$scope.qrcodeString = $scope.user.team;
  $scope.qrcodeString = 'YOUR TEXT TO ENCODE';
  console.log($scope.qrcodeString);

}
TeamCtrl.$inject = ['$scope', '$localStorage', 'Teams'];






function GamesCtrl($scope, Games, Teams, $localStorage) {
  $scope.myteam = Teams.get($localStorage.getObject("user").team);
  $scope.games = Games.all();
}
GamesCtrl.$inject = ['$scope', 'Games', 'Teams', '$localStorage'];

function GuestsCtrl($scope, Users, $localStorage) {
  $scope.myself = $localStorage.getObject("user");
  $scope.myId = $localStorage.get("myId");
  $scope.users = Users.all();
}
GuestsCtrl.$inject = ['$scope', 'Users', '$localStorage'];