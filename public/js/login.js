$(document).ready(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      updatePlanetariumLocation,
      showErrorGeolocation
    );
  } else {
    // alert user that location isn't available via geolocation
    // consider converting these alerts to toasts, or providing an initial prompt asking the user to allow app to access geolocation
    alert("Geolocation is not supported by your browser");
  }

  $("#starmap").click(event => {
    console.log(event);
    closeNav();
  });
});

function updatePlanetariumLocation(data) {
  openNav();
  closeNav();
  let planetarium = null;
  planetarium = S.virtualsky({
    id: "starmap", // This should match the ID used in the DOM
    projection: "stereo",
    latitude: data.coords.latitude,
    longitude: data.coords.longitude
  });
  console.log(planetarium);
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

/* Set the width of the side navigation to 250px */
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
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
