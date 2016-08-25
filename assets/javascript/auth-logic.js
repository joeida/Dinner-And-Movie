// Initialize Firebase

userId = '';

function signedInDisplay() {
	$(".form-signin").html("<h6>You are signed in</h6><button type='submit' class='waves-effect waves-light red lighten-3 btn col s12' id='btnSignOut'>Log Out</button>");
}

function signedOutDisplay() {
  $(".form-signin").html('<h1> Welcome! </h1>' +
            '<div class="input-field col s6">' +
            '<form>' +
            '<label class="active" for="username">Email Address</label></label>' +
            '<input id="email_input" type="text" class="validate">' +
            '</div>' +
            '<div class="input-field col s6">' +
            '<label class="active" for="password">Password</label>' +
            '<input id="password_input" type="password" class="validate">' +
            '</div>' +
            '<button type="submit" class="waves-effect waves-light red lighten-3 btn col s12" id="btnSignIn">Log In</button>' +
            '<button type="submit" class="waves-effect waves-light red lighten-3 btn col s12" id="btnSignUp">Sign Up</button>' +
            '<button type="submit" class="waves-effect waves-light red lighten-3 btn col s12 hide" id="btnSignOut">Log Out</button>' +
            '</form>' +
            '</div>' +
            '</div>'
            );
}

function signedOutDisplayEmail() {
  $(".form-signin").html('<h1> Welcome! </h1>' +
            '<div class="input-field col s6">' +
            '<form>' +
            '<label class="active" for="username">Email Address</label></label>' +
            '<input id="email_input" type="text" class="validate">' +
            '</div>' +
            '<div class="input-field col s6">' +
            '<label class="active" for="password">Password</label>' +
            '<input id="password_input" type="password" class="validate">' +
            '</div>' +
            '<button type="submit" class="waves-effect waves-light red lighten-3 btn col s12" id="btnSignIn">Log In</button>' +
            '<button type="submit" class="waves-effect waves-light red lighten-3 btn col s12 hide" id="btnSignOut">Log Out</button>' +
            '</form>' +
            '</div>' +
            '</div>'
            );
}

function emailVerifyDisplay() {
	// $(".form-signin").html("<h1>Please Verify Email to continue.</h2><p>If you've already verified your email, please click on the button below.</p><button id='email_confirmed' class='btn btn-lg btn-primary btn-block'>Email Confirmed</button>");
  $(".form-signin").html("<h2>Please Verify Email to continue.</h2><p>If you've already verified your email, please click on the button below.</p><button id='email_confirmed' type='submit' class='waves-effect waves-light red lighten-3 btn col s12'>Email Confirmed</button><button type='submit' class='waves-effect waves-light red lighten-3 btn col s12' id='btnSignOut'>Log Out</button>");
}

function appPageLoad() {
  sessionStorage.setItem("appPageLoaded", "true");
  window.location = "file:///Users/joeida/Bootcamp/Project/Dinner-And-Movie/app.html";
}

function loginPageLoad() {
  sessionStorage.setItem("appPageLoaded", "false");
    window.location = "file:///Users/joeida/Bootcamp/Project/Dinner-And-Movie/index.html";
}

function toggleSignIn() {
  if (firebase.auth().currentUser) {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
    loginPageLoad();
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
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(response) {
      appPageLoad();
    })
    .catch(function(error) {
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

var initApp = function() {

	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	  	console.log(user);
	    // User is signed in.
	    $("#btnSignOut").removeClass("hide");
      console.log(user.emailVerified);
	    user.getToken().then(function(accessToken) {

	    	if (!user.emailVerified) {
          console.log('verify email');
          emailVerifyDisplay();
        } else {
          console.log('user found');
          userId = user.uid;
        	signedInDisplay();
        }   	


	  	});
	  } else {
	    // User is signed out.
      console.log('displayed signed out');
	    signedOutDisplay();
	    $("#btnSignOut").addClass("hide");
	  }
	}, function(error) {
	  console.log(error);
	});

	$(document).on("click", "#btnSignIn", toggleSignIn);
	$(document).on("click", "#btnSignOut", toggleSignIn);
	$(document).on("click", "#btnSignUp", handleSignUp);
	$(document).on("click", "#email_confirmed", signedOutDisplayEmail);
}

window.onload = function() {
   initApp();
};