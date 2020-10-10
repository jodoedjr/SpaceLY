let geoData;
let planetarium;
//let journals;
let activeJournals;
//let sharedJournals;
//let activeSharedJournals;

$(document).ready(() => {
  initPage();

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
  $(".journal-section").click(event => {
    event.preventDefault();
    // click handler for nav drawer functions
    const tar = event.target;

    //My Journal Section & Shared Journals Section
    //if user clicks on a journal title
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
    //if user clicks on the red delete x next to a journal title
    if (tar.hasAttribute("data-journal-delete-id")) {
      $("#delete-journal-name").text(tar.getAttribute("data-journal-name"));
      $("#delete-journal-confirm").attr(
        "data-journal-delete-id",
        tar.getAttribute("data-journal-delete-id")
      );
      $("#delete-journal-modal").modal();
    }

    //edit journal when the green plus is clicked
    if (tar.hasAttribute("data-journal-edit-id")) {
      const jId = tar.getAttribute("data-journal-edit-id");
      const updateJournal = journals.find(
        element => element.id.toString() === jId
      );
      populateJournalEdit(updateJournal);
    }
  });

  //delete journal if confirmed
  $("#delete-journal-confirm").click(event => {
    if (event.target.hasAttribute("data-journal-delete-id")) {
      $.ajax({
        method: "DELETE",
        url:
          "/api/journal/" + event.target.getAttribute("data-journal-delete-id")
      })
        .then(() => {
          initPage();
        })
        .catch(err => {
          console.log(err);
        });
    }
    $("#delete-journal-name").text("");
    $("#delete-journal-confirm").removeAttr("data-journal-delete-id");
    $("#delete-journal-modal").modal("hide");
  });
});
//
//*********************************************************************************************
////Initialize page and journals
function initPage() {
  openNav();
  closeNav();
  activeJournals = JSON.parse(localStorage.getItem("activeJournals"));
  if (activeJournals === null) {
    activeJournals = [];
  }
  activeSharedJournals = JSON.parse(
    localStorage.getItem("activeSharedJournals")
  );
  if (activeSharedJournals === null) {
    activeSharedJournals = [];
  }
  //journals;//=JSON.parse(localStorage.getItem("journals"));
  //sharedJournals;//= JSON.parse(localStorage.getItem("sharedJournals"));
  getUserJournals();
  getSharedJournals();
  clearJournalForm();
}

//*********************************************************************************************
////Get Journal data
const journalList = $("#journal-list"); //ul element that holders journals
function getUserJournals() {
  $.get("/api/journal", data => {
    //render and populate user's journals
    journals = data; // save journal data for rendering functions
    journalList.empty(); // empty list of journals
    data.forEach(element => {
      let journalHTML = `<li style="font-size: 20px; color: ${element.color};"`;
      if (activeJournals.indexOf(String(element.id)) === -1) {
        // if this journal is not active, add the noShowList class
        journalHTML += ` 
        class="noShowList"`;
      }
      journalHTML += ` data-listName="${element.title}" data-journal-id="${element.id}">
      ${element.title}
      <i data-journal-edit-id="${element.id}" class="fas fa-plus-square add-square"></i>
      <i data-journal-delete-id="${element.id}" data-journal-name="${element.title}" class="far fa-times-circle delete-x"></i>
      </li>`;
      // <i class="fas fa-share-square share-arrow"></i>
      journalList.append(journalHTML);
    });
    renderJournalPoints();
  });
}

function renderJournalPoints() {
  if (activeJournals !== null) {
    //if activeJournals are stored in local storage
    const activeJournalsData = [];
    activeJournals.forEach((journalId, indexAJ) => {
      const found = journals.find(
        journal => journalId === journal.id.toString()
      );
      const foundShared = sharedJournals.find(
        journal => journalId === journal.id.toString()
      );
      if (found) {
        activeJournalsData.push(found);
      } else if (foundShared) {
        activeJournalsData.push(foundShared);
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
      </li>`;
      sharedJournalList.append(journalHTML);
    });
  });
}

// function renderSharedJournalPoints() {
//   if (activeSharedJournals !== null) {
//     //if activeJournals are stored in local storage
//     const activeJournalsData = [];
//     activeSharedJournals.forEach((journalId, indexAJ) => {
//       const found = journals.find(journal => journalId == journal.id);
//       if (found) {
//         activeJournalsData.push(found);
//       } else {
//         // matching id not found - remove from active journals
//         activeSharedJournals.splice(indexAJ, 1);
//       }
//     });
//     activeJournalsData.forEach(journalData => {
//       updatePlanetariumPointers(journalData);
//     });
//   }
// }

//*********************************************************************************************
////Populate data on journal edit modal
function populateJournalEdit(journalData) {
  //add journal name, shared, color, and point data to journal edit modal
  journalForm.attr("data-update", journalData.id);
  $("input#journal-name-input").val(journalData.title);
  $("input#shared-check").prop("checked", journalData.shared);
  $("input#journal-color").val(journalData.color);
  const pointData = JSON.parse(journalData.points);
  //destringify point data;
  $("#point-list")
    //stick the appropriate attributes in their matched inputs
    .find("input")
    .each((index, element) => {
      $(element).val(pointData[$(element).attr("id")]);
    });
  $("#JournalModalCenter").modal("show");
}

//*********************************************************************************************
////Handle Journal Add/Save - POST and PUT requests for Journals
//let numberPointsShown = 1;
const journalForm = $("form.journal");
journalForm.on("submit", event => {
  //journal modal form submit
  event.preventDefault();
  const pointObject = {};
  $("#point-list")
    .find("input")
    .each((index, element) => {
      pointObject[$(element).attr("id")] = $(element).val();
    });
  const journalData = {
    //create object with user form data
    title: $("input#journal-name-input")
      .val()
      .trim(),
    shared: $("input#shared-check").is(":checked"),
    points: JSON.stringify(pointObject),
    color: $("input#journal-color").val()
    //UserId: user.id
  };
  if (!journalData.title || !journalData) {
    return;
  }
  if (journalForm.attr("data-update") === "false") {
    //if journalForm data update attribute is false - its a new journal - post it
    $.post("/api/journal", journalData)
      .then(() => {
        $("#JournalModalCenter").modal("hide");
        getUserJournals();
        getSharedJournals();
      })
      .catch(err => {
        console.log(err);
        alert("SERVER ERROR ON POST");
      });
  }
  if (parseInt(journalForm.attr("data-update")) > -1) {
    //if journalForm data update attr is true - its an existing journal - put it
    journalData.id = parseInt(journalForm.attr("data-update"));
    $.ajax({
      method: "PUT",
      url: "/api/journal",
      data: journalData
    })
      .then(() => {
        $("#JournalModalCenter").modal("hide");
        reRenderPlanetarium();
        getUserJournals();
        getSharedJournals();
      })
      .catch(err => {
        console.log(err);
        alert("SERVER ERROR ON PUT");
      });
  }
  journalForm.attr("data-update", "false");
  //remove the update journal id number
  journalForm.trigger("reset");
  //reset the form fields when finished
});

function clearJournalForm() {
  journalForm.trigger("reset");
}

//add more points to journal

// $("#journal-add-point").on("click", () => {});

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

// const array = [
//   {
//     ra: 10.68458333,
//     dec: 41.26916667,
//     label: "M31 Andromeda Galaxy",
//     color: "rgb(255, 220, 220)"
//   },
//   {
//     ra: 23.45841667,
//     dec: 30.66019444,
//     label: "Triangulum Galaxy",
//     color: "rgb(255, 220, 220)"
//   },
//   {
//     ra: 201.365,
//     dec: 43.01916667,
//     label: "Centarus A",
//     color: "rgb(255, 220, 220)"
//   },
//   {
//     ra: 148.8883333,
//     dec: 69.06527778,
//     label: "Bode's Galaxy",
//     color: "rgb(255, 220, 220)"
//   },
//   {
//     ra: 11.8875,
//     dec: -25.28833333,
//     label: "Sculptor Galaxy",
//     color: "rgb(255, 220, 220)"
//   }
// ];
// updatePlanetariumPointers(array);
