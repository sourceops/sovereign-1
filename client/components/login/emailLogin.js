Template.emailLogin.rendered = function () {
  Session.set("loginScreen", true);

  //Give everyone a chance to not fuckup
  Session.set("invalidUsername", false);
  Session.set("invalidEmail", false);
  Session.set("invalidPassword", false);
  Session.set("shortPassword", false);
  Session.set("mismatchPassword", false);
}

Template.emailLogin.helpers({
  loginScreen: function () {
    return Session.get("loginScreen");
  },
  invalidUsername: function () {
    return Session.get("invalidUsername");
  },
  invalidEmail: function() {
    return Session.get("invalidEmail");
  },
  invalidPassword: function () {
    return Session.get("invalidPassword");
  },
  shortPassword: function () {
    return Session.get("shortPassword");
  },
  mismatchPassword: function () {
    return Session.get("mismatchPassword");
  }
});

Template.emailLogin.events({
  "click #signup": function (event) {
    Session.set("loginScreen", !Session.get("loginScreen"));
  },
  "submit #signup-new-user": function (event) {
    event.preventDefault();
    createNewUser(event.target);
  },
  "blur #signup-input": function (event) {
    switch(event.target.name) {
      case "username":
        validateUsername(event.target.value);
        break;
      case "email":
        validateEmail(event.target.value);
        break;
      case "password":
        validatePassword(event.target.value);
        if (document.getElementsByName("mismatchPassword")[0].value != '') {
          validatePasswordMatch(document.getElementsByName("mismatchPassword")[0].value, event.target.value);
        }
        break;
      case "mismatchPassword":
        validatePasswordMatch(document.getElementsByName("password")[0].value, event.target.value);
        break;
    }
  }
});


function createNewUser(data) {
  if (validateUser(data)) {
    console.log('Creating new user: ' + data.username.value);
    console.log(data.password.value);

    var fullName = data.username.value.split(' '),
        givenName = fullName[0],
        familyName = fullName[fullName.length - 1];


    var objUser = {
      username: data.username.value,
      emails: [{
        address: data.email.value,
        verified: false
      }],
      services: {
        password: data.password.value
      },
      profile: {
        firstName: givenName,
        lastName: familyName
      },
      createdAt: new Date()
    };

    if (UserContext.validate(objUser)) {
      Accounts.createUser(objUser, function(error){
        if (error) {
            console.log(error.reason); // Output error if registration fails
        } else {
            //Router.go("home"); // Redirect user if registration succeeds
        }
      });
    } else {
      check(objUser, Schema.User);
    }

  } else {
    console.log('Cannot create user');
  }
}

//Validators

function validateUser (data) {
  var val = validateUsername(data.username.value)
            + validateEmail(data.email.value)
            + validatePassword(data.password.value)
            + validatePasswordMatch(data.password.value, data.mismatchPassword.value);

  if (val >= 4) { return true } else { return false };
}

function validateUsername (username) {
  var regexp = /^[a-z,',-]+(\s)[a-z,',-]+$/i
  Session.set("invalidUsername", !regexp.test(username));
  return regexp.test(username);
}

function validateEmail (email) {
  var val = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  //TODO verify if email already exists in db

  Session.set("invalidEmail", !val.test(email));
  return val.test(email);
}

function validatePassword(pass) {
  var val = true;
  if (pass.length < 6) {
    Session.set("shortPassword", true);
    val = false;
  } else {
    Session.set("shortPassword", false);
    val = true;
  }
  if (pass.search(/[a-z]/i) < 0) {
    Session.set("invalidPassword", true);
    val = false;
  } else {
    if (pass.search(/[0-9]/) < 0) {
        Session.set("invalidPassword", true);
        val = false;
    } else {
      Session.set("invalidPassword", false);
      val = true;
    }
  }
  return val;
}

function validatePasswordMatch (passA, passB) {
  Session.set("mismatchPassword", !(passA == passB));
  return (passA == passB);
}
