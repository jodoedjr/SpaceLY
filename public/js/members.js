let user;
let planetarium;
$(document).ready(() => {
  // This file just does a GET request to figure out which user is logged in
  // and updates the HTML on the page
  $.get("/api/user_data").then(data => {
    user = data;
    $(".member-name").text(data.email);
  });

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
  $("#starmap").click(() => {
    // if user clicks starmap - close nav drawer
    closeNav();
  });

  $(".panel-collapse").on("show.bs.collapse", () => {
    // un-collapse nav drawer sections
    $(this)
      .siblings(".panel-heading")
      .addClass("active");
  });

  $(".panel-collapse").on("hide.bs.collapse", () => {
    // un-collapse nav draw sections
    $(this)
      .siblings(".panel-heading")
      .removeClass("active");
  });
  //*********************************************************************************************
  //// Handle Nav Drawer Clicks
  $("#mySidenav").click(event => {
    event.preventDefault();
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
        const array = [
          {
            ra: 10.68458333,
            dec: 41.26916667,
            label: "M31 Andromeda Galaxy",
            color: "rgb(255, 220, 220)"
          },
          {
            ra: 23.45841667,
            dec: 30.66019444,
            label: "Triangulum Galaxy",
            color: "rgb(255, 220, 220)"
          },
          {
            ra: 201.365,
            dec: 43.01916667,
            label: "Centarus A",
            color: "rgb(255, 220, 220)"
          },
          {
            ra: 148.8883333,
            dec: 69.06527778,
            label: "Bode's Galaxy",
            color: "rgb(255, 220, 220)"
          },
          {
            ra: 11.8875,
            dec: -25.28833333,
            label: "Sculptor Galaxy",
            color: "rgb(255, 220, 220)"
          }
        ];
        updatePlanetariumPointers(array);
      }
    }

    // if (tar.id === "add-journal") {
    //   // add show form for creating new journal
    //   $("#nameEntry").css("display", "block");
    // }
    // if (tar.id === "save-journal-name") {
    //   // add a new journal to user list!
    //   let newJournalName = $("input#journal-name-input").val();
    //   if (newJournalName === "") {
    //     newJournalName = `Journal #${$("#list-holder").children.length}`;
    //   }
    //   $("#nameEntry").css("display", "none");
    //   alert(newJournalName);
    //   //post new journal name to server!
    //   //ADD CODE
    //   //get user journals from server and repopulate
    // }
    // if (tar.id === "cancel-journal-name") {
    //   $("input#journal-name-input").val("");
    //   $("#nameEntry").css("display", "none");
    // }
  });
});

//*********************************************************************************************
////Handle Journal Add
//let numberPointsShown = 1;
const journalForm = $("form.journal");
journalForm.on("submit", event => {
  event.preventDefault();
  const pointObject = {};
  $("#point-list")
    .children("input")
    .each(() => {
      pointObject[$(this).attr("id")] = $(this).val();
    });
  const journalData = {
    title: $("input#journal-name-input")
      .val()
      .trim(),
    shared: $("input#shared-check").is(":checked:"),
    points: JSON.stringify(pointObject),
    color: $("input#journal-color").val(),
    UserId: user.id
  };
  console.log(journalData);
  if (!journalData.title || !journalData) {
    return;
  }

  $.post("/api/journal", journalData)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
});

//add more points to journal
$("#journal-add-point").on("click", () => {
  console.log("here");
  //   $("#journal-form-group").append
  //   <input
  //   style="display:none"
  //   type="textarea"
  //   class="form-control"
  //   id="point-5-name"
  //   placeholder="5: Name"
  // />
  // <input
  //   style="display:none"
  //   type="textarea"
  //   class="form-control"
  //   id="point-5-ra"
  //   placeholder="5: Right Ascension Degrees"
  // />
  // <input
  //   style="display:none"
  //   type="textarea"
  //   class="form-control"
  //   id="point-5-dec"
  //   placeholder="5: Declination Degrees"
  // />
});

//*********************************************************************************************
////Update planetarium location

function updatePlanetariumLocation(data) {
  openNav();
  closeNav();
  planetarium = S.virtualsky({
    id: "starmap", // This should match the ID used in the DOM
    projection: "stereo",
    latitude: data.coords.latitude,
    longitude: data.coords.longitude
  });
}

function updatePlanetariumPointers(data) {
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    planetarium.addPointer({
      ra: element.ra,
      dec: element.dec,
      label: element.label,
      //img: "",
      //url: "",
      //credit: "",
      colour: element.color
    });
  }
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
