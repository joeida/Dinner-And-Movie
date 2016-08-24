// Initialize Firebase

var $emailInput = $("#email_input");
var $passwordInput = $("#password_input");
var $signInBtn= $("#btnSignIn");
var $signOutBtn = $("#btnSignOut");
var $signUpBtn = $("#btnSignUp");


function signedInDisplay(displayName) {
    $(".form-signin").html(displayName + " is signed in");
}

function signedOutDisplay() {
    $(".form-signin").html('<h2 class="form-signin-heading">You have signed out!</h2>' +
          '<input id="email_input" type="text" class="form-control" name="username" placeholder="Email Address" required="" autofocus="" />' +
          '<input id="password_input" type="password" class="form-control" name="password" placeholder="Password" required=""/>' +    
          '<label class="checkbox">' +
            '<input type="checkbox" value="remember-me" id="rememberMe" name="rememberMe"> Remember me' +
          '</label>' +
          '<button id="btnSignIn" class="btn btn-lg btn-primary btn-block">Login</button>' +
          '<button id="btnSignUp" class="btn btn-lg btn-primary btn-block">Sign Up</button>');

}

function emailVerifyDisplay() {
    $(".form-signin").html("<h1>Please Verify Email to continue.</h2><p>If you've already verified your email, please click on the button below.</p><button id='email_confirmed' class='btn btn-lg btn-primary btn-block'>Email Confirmed</button>");
}

function toggleSignIn() {
  if (firebase.auth().currentUser) {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
  } else {
    var email = $("#email_input").val();
    var password = $("#password_input").val();
    
    if (email.length < 4) {
      alert('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    // Sign in with email and pass.
    // [START authwithemail]
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // [START_EXCLUDE]
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      // [END_EXCLUDE]
    });
    // [END authwithemail]
  }
}

function reloadPage() {
    location.reload();
}
/**
 * Handles the sign up button press.
 */
function handleSignUp() {

  var email = $("#email_input").val();
  var password = $("#password_input").val();

  console.log(email, password);

  if (email.length < 4) {
    alert('Please enter an email address.');
    return;
  }
  if (password.length < 4) {
    alert('Please enter a password.');
    return;
  }

  // Sign in with email and pass.
  // [START createwithemail]
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  }).then(function(result){
    console.log("sending Email Verification");
    sendEmailVerification();
  });
  // [END createwithemail]
}
/**
 * Sends an email verification to the user.
 */

function sendEmailVerification() {
  console.log('got email method');
  // [START sendemailverification]
  firebase.auth().currentUser.sendEmailVerification().then(function() {
    // Email Verification sent!
    // [START_EXCLUDE]
    alert('Email Verification Sent!');
    // [END_EXCLUDE]
  })
  // [END sendemailverification]
}
function sendPasswordReset() {
  var email = $("#email_input").val();
  // [START sendpasswordemail]
  firebase.auth().sendPasswordResetEmail(email).then(function() {
    // Password Reset Email Sent!
    // [START_EXCLUDE]
    alert('Password Reset Email Sent!');
    // [END_EXCLUDE]
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/invalid-email') {
      alert(errorMessage);
    } else if (errorCode == 'auth/user-not-found') {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
  // [END sendpasswordemail];
}

function addDisplayNameToUser() {
    var displayNameValue = $("#display_name_input").val();

    if (displayNameValue.length < 4) {
        alert('Please enter an display name with at least 4 characters.');
        return;
    }

    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: displayNameValue
    }).then(function(result){
        signedInDisplay(user.displayName);
    afterAuth(user.uid, user.displayName);
    })
}

function userDisplayNameCreation() {
    $(".form-signin").html('<input id="display_name_input" type="text" class="form-control" name="displayName" placeholder="Display Name" autofocus="" /><button id="btnDisplayName" class="btn btn-lg btn-primary btn-block">Choose Display Name</button> ');
}

var initApp = function() {

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log(user);
        // User is signed in.
        $("#btnSignOut").removeClass("hide");
      console.log('signed in');
      console.log(user.uid);
      console.log(user.displayName);
      console.log(user.emailVerified);
      console.log(firebase.auth().currentUser);
        user.getToken().then(function(accessToken) {

            if (!user.emailVerified) {
          console.log('verify email');
          emailVerifyDisplay();
        } else if (user.displayName !== null) {
          console.log('user found');
            signedInDisplay(user.displayName);
            afterAuth(user.uid, user.displayName);
        }   else {
          console.log('create display name');
            userDisplayNameCreation();
        }       


        });
      } else {
        // User is signed out.
      // removePlayer(uid);
      console.log('displayed signed out');
      removePlayer(user);
        signedOutDisplay();
        $("#btnSignOut").addClass("hide");
      }
    }, function(error) {
      console.log(error);
    });

    $(document).on("click", "#btnSignIn", toggleSignIn);
    $(document).on("click", "#btnSignOut", toggleSignIn);
    $(document).on("click", "#btnSignUp", handleSignUp);
    $(document).on("click", "#btnDisplayName", addDisplayNameToUser);
    $(document).on("click", "#email_confirmed", reloadPage);
}

window.onload = function() {
   initApp();
};