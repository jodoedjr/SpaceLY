$(document).ready(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      updatePlanetariumLocation,
      showErrorGeolocation
    );
  } else {
    // alert user that location isn't available via geolocation
    alert("Geolocation is not supported by your browser");
  }

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

  $("#starmap").click(() => {
    // if user clicks starmap - close nav drawer
    closeNav();
  });

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

function updatePlanetariumLocation(data) {
  openNav();
  closeNav();
  //let planetarium = null;
  //planetarium =
  S.virtualsky({
    id: "starmap", // This should match the ID used in the DOM
    projection: "stereo",
    latitude: data.coords.latitude,
    longitude: data.coords.longitude
  });
}

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

/* Set the width of the side navigation to Xpx */
function openNav() {
  document.getElementById("mySidenav").style.width = "350px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}
// $(document).ready(() => {
//   // Getting references to our form and inputs
//   const loginForm = $("form.login");
//   const emailInput = $("input#email-input");
//   const passwordInput = $("input#password-input");

//   // When the form is submitted, we validate there's an email and password entered
//   loginForm.on("submit", event => {
//     event.preventDefault();
//     const userData = {
//       email: emailInput.val().trim(),
//       password: passwordInput.val().trim()
//     };

//     if (!userData.email || !userData.password) {
//       return;
//     }

//     // If we have an email and password we run the loginUser function and clear the form
//     loginUser(userData.email, userData.password);
//     emailInput.val("");
//     passwordInput.val("");
//   });

//   // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
//   function loginUser(email, password) {
//     $.post("/api/login", {
//       email: email,
//       password: password
//     })
//       .then(() => {
//         window.location.replace("/members");
//         // If there's an error, log the error
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
// });
