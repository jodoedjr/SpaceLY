$(document).ready(() => {
  //*********************************************************************************************
  ////Login Logic
  //Getting references to our form and inputs
  const userForm = $("form.user");
  const emailInput = $("input#email-input-log");
  const passwordInput = $("input#password-input-log");

  // When the form is submitted, we validate there's an email and password entered
  userForm.on("submit", event => {
    event.preventDefault();
    const userData = {
      email: emailInput.val().trim(),
      password: passwordInput.val().trim()
    };

    if (!userData.email || !userData.password) {
      return;
    }
    loginUser(userData.email, userData.password);
    emailInput.val("");
    passwordInput.val("");
  });

  // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(email, password) {
    $.post("/api/login", {
      email: email,
      password: password
    })
      .then(() => {
        window.location.replace("/members");
      })
      .catch(err => {
        // If there's an error, log the error
        console.log(err);
      });
  }
  //*********************************************************************************************
  ////Signup Logic
  // Getting references to our form and input
  const signUpForm = $("form.signup");
  const emailInputSign = $("input#email-input-sign");
  const passwordInputSign = $("input#password-input-sign");

  // When the signup button is clicked, we validate the email and password are not blank
  signUpForm.on("submit", event => {
    event.preventDefault();
    const userData = {
      email: emailInputSign.val().trim(),
      password: passwordInputSign.val().trim()
    };

    if (!userData.email || !userData.password) {
      return;
    }
    // If we have an email and password, run the signUpUser function
    signUpUser(userData.email, userData.password);
    emailInputSign.val("");
    passwordInputSign.val("");
  });

  // Does a post to the signup route. If successful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(email, password) {
    $.post("/api/signup", {
      email: email,
      password: password
    })
      .then(() => {
        window.location.replace("/members");
        // If there's an error, handle it by throwing up a bootstrap alert
      })
      .catch(handleLoginErr);
  }

  function handleLoginErr(err) {
    $("#alert .msg").text(err.responseJSON);
    $("#alert").fadeIn(500);
  }
  //*********************************************************************************************
  ////Update user location, if possible
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      updatePlanetariumLocation,
      showErrorGeolocation
    );
  } else {
    // alert user that location isn't available via geolocation
    alert("Geolocation is not supported by your browser");
  }
  //*********************************************************************************************
  //// Control Nav Drawer
  $(".panel-collapse").on("show.bs.collapse", function() {
    // un-collapse nav drawer sections
    $(this)
      .siblings(".panel-heading")
      .addClass("active");
  });

  $(".panel-collapse").on("hide.bs.collapse", function() {
    // un-collapse nav draw sections
    $(this)
      .siblings(".panel-heading")
      .removeClass("active");
  });

  $("#starmap").click(() => {
    // if user clicks starmap - close nav drawer
    closeNav();
  });
  //*********************************************************************************************
  //// Handle Nav Drawer Clicks
  $("#mySidenav").click(event => {
    // click handler for nav drawer functions
    const tar = event.target;

    //My Journal Section
    if (tar.hasAttribute("data-listName")) {
      // if target has data-listName property
      if (tar.classList.contains("showList")) {
        tar.classList.remove("showList");
        //add code to update star canvas - hide items in this list
      } else {
        tar.classList.add("showList");
        //add code to update star canvas - show items in this list
      }
    }

    if (tar.id === "add-journal") {
      // add show form for creating new journal
      $("#nameEntry").css("display", "block");
    }
    if (tar.id === "save-journal-name") {
      // add a new journal to user list!
      let newJournalName = $("input#journal-name-input").val();
      if (newJournalName === "") {
        newJournalName = `Journal #${$("#list-holder").children.length}`;
      }
      $("#nameEntry").css("display", "none");
      //post new journal name to server!
      //ADD CODE
      //get user journals from server and repopulate
    }
    if (tar.id === "cancel-journal-name") {
      $("input#journal-name-input").val("");
      $("#nameEntry").css("display", "none");
    }
  });
});
//*********************************************************************************************
////Update planetarium location
function updatePlanetariumLocation(data) {
  openNav();
  closeNav();
  S.virtualsky({
    id: "starmap", // This should match the ID used in the DOM
    projection: "stereo",
    latitude: data.coords.latitude,
    longitude: data.coords.longitude
  });
}
////Show geolocation errors
function showErrorGeolocation(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}
//*********************************************************************************************
////Open and close the nav drawer
/* Set the width of the side navigation to Xpx */
function openNav() {
  document.getElementById("mySidenav").style.width = "350px";
}
/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}
