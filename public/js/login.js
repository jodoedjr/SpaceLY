let geoData;
let planetarium;
let activeJournals;
$(document).ready(() => {
  initPage();

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
    event.preventDefault();
    // click handler for nav drawer functions
    const tar = event.target;

    //My Journal Section & Shared Journals Section
    if (tar.hasAttribute("data-journal-id")) {
      // if target has data-listName property
      if (tar.classList.contains("showList")) {
        const journalId = tar.getAttribute("data-journal-id");
        $(`*[data-journal-id=${journalId}]`).each((index, element) => {
          element.classList.remove("showList");
          element.classList.add("noShowList");
        });
        //add code to update star canvas - hide items in this list
        // if data-journal-id exists in activeJournals - remove it and re-render page
        if (activeJournals.indexOf(tar.getAttribute("data-journal-id")) > -1) {
          activeJournals.splice(
            activeJournals.indexOf(tar.getAttribute("data-journal-id")),
            1
          );
          //save active journals to local storage
          localStorage.setItem(
            "activeJournals",
            JSON.stringify(activeJournals)
          );
          //render active journal points
          reRenderPlanetarium();
          renderJournalPoints();
        }
      } else {
        const journalId = tar.getAttribute("data-journal-id");
        $(`*[data-journal-id=${journalId}]`).each((index, element) => {
          element.classList.add("showList");
          element.classList.remove("noShowList");
        });
        //add code to update star canvas - show items in this list
        //if activeJournals does not contain this journal id, add it
        if (
          activeJournals.indexOf(tar.getAttribute("data-journal-id")) === -1
        ) {
          activeJournals.push(tar.getAttribute("data-journal-id"));
          //save active journals to local storage
          localStorage.setItem(
            "activeJournals",
            JSON.stringify(activeJournals)
          );
          //render active journal points
          renderJournalPoints();
        }
      }
    }
  });
});

function initPage() {
  openNav();
  closeNav();
  localStorage.removeItem("activeJournals");
  localStorage.removeItem("activeSharedJournals");
  activeJournals = [];
  // activeJournals = JSON.parse(localStorage.getItem("activeJournals"));
  // if (activeJournals === null) {
  //   activeJournals = [];
  // }
  // activeSharedJournals = JSON.parse(
  //   localStorage.getItem("activeSharedJournals")
  // );
  // if (activeSharedJournals === null) {
  //   activeSharedJournals = [];
  // }
  //journals;//=JSON.parse(localStorage.getItem("journals"));
  //sharedJournals;//= JSON.parse(localStorage.getItem("sharedJournals"));
  //getUserJournals();
  getSharedJournals();
}
//*********************************************************************************************
////Get shared Journal data
const sharedJournalList = $("#shared-journal-list");
function getSharedJournals() {
  $.get("/api/shared-journals", data => {
    //render and populate shared journals
    sharedJournals = data; // save journal data for rendering functions
    sharedJournalList.empty(); // empty list of journals
    data.forEach(element => {
      let journalHTML = `<li style="font-size: 20px; color: ${element.color};"`;
      if (activeJournals.indexOf(String(element.id)) === -1) {
        // if this journal is not active, add the noShowList class
        journalHTML += ` 
        class="noShowList"`;
      }
      journalHTML += ` data-listName="${element.title}" data-journal-id="${element.id}">
      ${element.title}
      <i class="fas fa-plus-square add-square"></i
      ><i class="fas fa-share-square share-arrow"></i
      ><i class="far fa-times-circle delete-x"></i>
      </li>`;
      sharedJournalList.append(journalHTML);
    });
  });
  renderJournalPoints();
}

function renderJournalPoints() {
  if (activeJournals !== null) {
    //if activeJournals are stored in local storage
    const activeJournalsData = [];
    activeJournals.forEach((journalId, indexAJ) => {
      const found = sharedJournals.find(
        journal => journalId === journal.id.toString()
      );
      if (found) {
        activeJournalsData.push(found);
      } else {
        // matching id not found - remove from active journals
        activeJournals.splice(indexAJ, 1);
      }
    });
    activeJournalsData.forEach(journalData => {
      updatePlanetariumPointers(journalData);
    });
  }
}

//*********************************************************************************************
////Update planetarium location

function updatePlanetariumLocation(data) {
  planetarium = S.virtualsky({
    id: "starmap", // This should match the ID used in the DOM
    projection: "stereo",
    latitude: data.coords.latitude,
    longitude: data.coords.longitude
  });
  geoData = data;
}

function reRenderPlanetarium() {
  const data = geoData;
  planetarium = S.virtualsky({
    id: "starmap", // This should match the ID used in the DOM
    projection: "stereo",
    latitude: data.coords.latitude,
    longitude: data.coords.longitude
  });
}

function updatePlanetariumPointers(data) {
  const points = JSON.parse(data.points);
  const numFieldsPerPoint = 3; // using three of a 7 per point
  const numPoints = Object.keys(points).length / numFieldsPerPoint;
  for (let i = 0; i < numPoints; i++) {
    if (points[`point-${i}-name`] !== "") {
      planetarium.addPointer({
        ra: points[`point-${i}-ra`],
        dec: points[`point-${i}-dec`],
        label: points[`point-${i}-name`],
        //img: "",
        //url: "",
        //credit: "",
        colour: hexToRGB(data.color)
      });
    }
  }
}
const hexToRGB = hex => {
  const rgbArray = hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => "#" + r + r + g + g + b + b
    )
    .substring(1)
    .match(/.{2}/g)
    .map(x => parseInt(x, 16));
  return `rgb(${rgbArray.join()})`;
};

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
