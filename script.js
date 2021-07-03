//============= Configuratrion =================================
const confuigure = () => {
  console.log("Function CAll-- Configure");
  if (localStorage.getItem("bookingRequests") === null) {
    let bookingRequests = [];
    localStorage.setItem("bookingRequests", JSON.stringify(bookingRequests));
  }
  if (localStorage.getItem("rooms") === null) {
    let rooms = {
      "Super Delux Room": {
        totalInventory: 1,
        bookedInventory: 0,
      },
      "Double Delux Room": {
        totalInventory: 1,
        bookedInventory: 0,
      },
      "Delux Room": {
        totalInventory: 1,
        bookedInventory: 0,
      },
    };
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }
  if (localStorage.getItem("slots") === null) {
    let slots = {};
    localStorage.setItem("slots", JSON.stringify(slots));
  }
};
confuigure();

//========================= Common Functionality =================================
const homeScreenMessage = (msg) => {
  document.querySelector(".home-screen-msg").textContent = msg;
};
const closeAll = () => {
  document.querySelector(".recepit").classList.add("hidden");
  document.querySelector(".show-all").classList.add("hidden");
  document.querySelector(".form-container").classList.add("hidden");
  document.querySelector(".calender").classList.add("hidden");
  homeScreenMessage("Welcome");
};

//======================== OPEN MAKE Booking ===========================
const generatecalender = (year, month, roomType) => {
  console.log("Function Call--Generate Calender");
  console.log(year, month, roomType);

  let date = new Date(year, month);
  let daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = date.toLocaleString("default", { month: "long" });
  const yearStr = date.getFullYear();
  const key = monthStr + "-" + yearStr;
  document.querySelector("#month-year").innerHTML = key;
  console.log(key);

  const slots = JSON.parse(localStorage.getItem("slots"));

  if (slots[key] === undefined) {
    console.log("Call to if");
    let monthArray = [];
    let rooms = JSON.parse(localStorage.getItem("rooms"));
    for (let i = 0; i < daysInMonth; i++) {
      monthArray.push(rooms);
    }
    slots[key] = monthArray;
    localStorage.setItem("slots", JSON.stringify(slots));
  }

  let monthArray = slots[key];

  tbl = document.querySelector("#show-calender table");
  tbl.innerHTML = `<tr>
                          <th>Sun</th>
                          <th>Mon</th>
                          <th>Tue</th>
                          <th>Wed</th>
                          <th>Thu</th>
                          <th>Fri</th>
                          <th>Sat</th>
                      </tr>`;
  const firstDay = date.getDay();
  const today = new Date();

  let dayCounter = 1;
  for (let i = 0; i < 6 && dayCounter <= daysInMonth; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      let cell = document.createElement("td");
      if ((i === 0 && j < firstDay) || dayCounter > daysInMonth) {
        let cellText = document.createTextNode("");
        cell.appendChild(cellText);
        row.appendChild(cell);
      } else {
        let cellText = document.createTextNode(dayCounter);
        cell.appendChild(cellText);

        if (month === today.getMonth() && year === today.getFullYear()) {
          if (dayCounter < today.getDate()) cell.classList.add("prev");
          else if (dayCounter === today.getDate())
            cell.classList.add("present");
        }
        let inventory = monthArray[dayCounter - 1][roomType];

        if (inventory.totalInventory > inventory.bookedInventory)
          cell.classList.add("avilable");
        else cell.classList.add("full");

        row.appendChild(cell);
        dayCounter++;
      }
    }
    tbl.appendChild(row);
  }
};

const generateRecipit = (dataObj) => {
  console.log("Function Call--Genearte Recepit");
  closeAll();
  document.querySelector("#name").textContent =
    dataObj.firstName + " " + dataObj.lastName;
  document.querySelector("#gender").textContent = dataObj.gender;
  document.querySelector("#booking_from").textContent = dataObj.fromDate;
  document.querySelector("#booking_to").textContent = dataObj.toDate;
  document.querySelector("#guest_count").textContent = dataObj.guestCount;
  document.querySelector("#room_type").textContent = dataObj.roomType;
  document.querySelector(".recepit").classList.remove("hidden");

  const closeRecepitButton = document.querySelector("#close-recepit");
  closeRecepitButton.addEventListener("click", closeAll);
};

function DataObject(form) {
  console.log("Function Call--Data Object");
  this.firstName = form.fname.value;
  this.lastName = form.lname.value;
  this.gender = form.gender.value;
  this.fromDate = form.booking_from.value;
  this.toDate = form.booking_to.value;
  this.guestCount = Number(form.guestCount.value);
  this.roomType = form.room_type.value;
}
const makeBooking = (dataObj) => {
  console.log("Function Call--maker booking");


  let fromDate = new Date(dataObj.fromDate);
  let toDate = new Date(dataObj.toDate);
  let roomType = dataObj.roomType;

  generatecalender(fromDate.getFullYear(), toDate.getFullYear(), roomType);

  const slots = JSON.parse(localStorage.getItem("slots"));
  const monthStr = fromDate.toLocaleString("default", { month: "long" });
  const yearStr = fromDate.getFullYear();
  const key = monthStr + "-" + yearStr;

  for (let i = fromDate.getDate(); i <= toDate.getDate(); i++) {
    let inventory = slots[key][i-1][roomType];

    if (inventory.totalInventory <= inventory.bookedInventory) {
      closeAll();
      homeScreenMessage("Request Denied");
      return;
    }
  }
  for (let i = fromDate.getDate(); i <= toDate.getDate(); i++) {
    slots[key][i-1][roomType].totalInventory -= 1;
    slots[key][i-1][roomType].bookedInventory += 1;
  }
  localStorage.setItem("slots", JSON.stringify(slots));
  let bookingRequests = JSON.parse(localStorage.getItem("bookingRequests"));
  bookingRequests.push(dataObj);
  localStorage.setItem("bookingRequests", JSON.stringify(bookingRequests));
  generateRecipit(dataObj);
  homeScreenMessage('Booking Successful');
};

const openForm = () => {
  console.log("Function Call-- Open Form");
  closeAll();

  document.querySelector(".form-container").classList.remove("hidden");
  document.querySelector("#reset-button").click();

  const closeFormButton = document.querySelector("#close-form");
  closeFormButton.addEventListener("click", closeAll);

  //---Input Validation
  let [fnameAllow, lnameAllow, fromDateAllow, toDateAllow] = [
    true,
    true,
    true,
    true,
  ];

  const fnameValidator = (event) => {
    const letters = /^[A-Za-z]+$/;
    if (event.target.value.match(letters)) {
      document.querySelector(".fname-error").innerHTML = "";
      fnameAllow = true;
    } else {
      document.querySelector(".fname-error").innerHTML =
        "Should Contain Only letter";
      fnameAllow = false;
    }
  };
  const lnameValidator = (event) => {
    const letters = /^[A-Za-z]+$/;
    if (event.target.value.match(letters)) {
      document.querySelector(".lname-error").innerHTML = " ";
      lnameAllow = true;
    } else {
      document.querySelector(".lname-error").innerHTML =
        "Should Contain Only letter";
      lnameAllow = false;
    }
  };
  const fromDateValidator = (event) => {
    let today = new Date();
    let fromDate = new Date(event.target.value);
    if (fromDate < today) {
      document.querySelector(".booking-from-error").innerHTML =
        "Date already passed";
      fromDateAllow = false;
    } else {
      document.querySelector(".booking-from-error").innerHTML = "";
      fromDateAllow = true;
    }
  };
  const toDateValidator = (event) => {
    let fromDate = new Date(document.querySelector("#booking-from").value);
    let toDate = new Date(event.target.value);

    if (
      toDate.getFullYear() === fromDate.getFullYear() &&
      toDate.getMonth() === fromDate.getMonth()
    )  {
      if(fromDate.getDate()<=toDate.getDate()){
        document.querySelector(".booking-to-error").innerHTML = "";
      toDateAllow = true;
      }
      else{
        document.querySelector(".booking-to-error").innerHTML =
        "To must greater than from";
      toDateAllow = false;
      }
    }
    else{
      document.querySelector(".booking-to-error").innerHTML =
        "Assumption: From and to date Must be From same Month";
      toDateAllow = false;
    }
  };

  document.querySelector("#fname").addEventListener("input", fnameValidator);
  document.querySelector("#lname").addEventListener("input", lnameValidator);
  document
    .querySelector("#booking-from")
    .addEventListener("input", fromDateValidator);
  document
    .querySelector("#booking-to")
    .addEventListener("input", toDateValidator);

  //---Form Submit Handler
  const formSubmitHandler = (event) => {
    console.log("Function Call--Form Submit HAndler");
    event.preventDefault();

    const inputValidator =
      fnameAllow && lnameAllow && toDateAllow && fromDateAllow ? true : false;

    if (inputValidator) {
      const dataObj = new DataObject(form);
      makeBooking(dataObj);
    } else {
      homeScreenMessage("Enter Valid Input");
    }
  };

  const form = document.querySelector("form");
  form.addEventListener("submit", formSubmitHandler);

  console.log("Function End--End of Open Form");
};

//========================= OPEN CALENDER ===============================\

const openCalender = () => {
  console.log("Function Call--Open Calender");
  closeAll();
  document.querySelector(".calender").classList.remove("hidden");

  let today = new Date();
  let roomTypeDropDown = document.querySelector(".calender #room-type");
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let currentRoomType = roomTypeDropDown.value;
  generatecalender(currentYear, currentMonth, currentRoomType);

  const nextMonthHandler = () => {
    console.log("Function Call-- Next Month Handler");
    let temp = new Date(currentYear, currentMonth + 1);
    currentYear = temp.getFullYear();
    currentMonth = temp.getMonth();
    generatecalender(currentYear, currentMonth, currentRoomType);
  };
  const prevMonthHandler = () => {
    console.log("Function Call-- Prev Month Handler");
    if (
      !(currentMonth === today.getMonth() && currentYear == today.getFullYear())
    ) {
      let temp = new Date(currentYear, currentMonth - 1);
      currentYear = temp.getFullYear();
      currentMonth = temp.getMonth();
      generatecalender(currentYear, currentMonth, currentRoomType);
    }
  };
  const roomTypeHandler = (event) => {
    console.log("function call-- Room Type Handler");
    currentRoomType = event.target.value;
    generatecalender(currentYear, currentMonth, currentRoomType);
  };

  const closeCalenderButton = document.querySelector("#close-calender");
  closeCalenderButton.addEventListener("click", closeAll);

  const nextMonthButton = document.querySelector("#next-month");
  nextMonthButton.addEventListener("click", nextMonthHandler);

  const prevMonthButton = document.querySelector("#prev-month");
  prevMonthButton.addEventListener("click", prevMonthHandler);

  roomTypeDropDown.addEventListener("input", roomTypeHandler);

  console.log("Function End -- Close Calender");
};

//========================= OPEN SHOW ALL================================


const getHtmlString = (bookingArray) => {
  console.log("Function Call--Get HTML String");
  let HTMLstr = `
          <table>
              <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Bookimg From</th>
                  <th>Booking To</th>
                  <th>Number of Guest</th>
                  <th>Type Of Room</th>
              </tr>`;

  for (let i = 0; i < bookingArray.length; i++) {
    HTMLstr += `
          <tr>
              <td>${
                bookingArray[i].firstName + " " + bookingArray[i].lastName
              }</td>
              <td>${bookingArray[i].gender}</td>
              <td>${bookingArray[i].fromDate}</td>
              <td>${bookingArray[i].toDate}</td>
              <td>${bookingArray[i].guestCount}</td>
              <td>${bookingArray[i].roomType}</td>
          </tr>`;
  }

  HTMLstr += `</table>`;
  return HTMLstr;
};
const sortByFirstName = () => {
  console.log("Function Call-- Sort by First Name ");
};

const openShowAll = () => {
  console.log("Function Call--open Show All");
  closeAll();
  document.querySelector(".show-all").classList.remove("hidden");

  const closeShowAllButton = document.querySelector("#close-show-all");
  closeShowAllButton.addEventListener("click", closeAll);

  const bookingArray = JSON.parse(localStorage.getItem("bookingRequests"));

  document.querySelector("#show_all_list").innerHTML =
    bookingArray.length === 0
      ? "<h1>Zero Requests</h1>"
      : getHtmlString(bookingArray);

  const sortByFirstNameButton = document.querySelector("#sortByFirstName");
  sortByFirstNameButton.addEventListener("click", sortByFirstName);

  const sortByPriceButton = document.querySelector("#sortByPrice");
  sortByPriceButton.addEventListener("click", sortByPrice);

  console.log("Function End-- Show All");
};

//================== Home Page Functionality ============================
const makeEntryButton = document.querySelector("#make-booking");
makeEntryButton.addEventListener("click", openForm);

const checkAvalButton = document.querySelector("#check-avalibilty");
checkAvalButton.addEventListener("click", openCalender);

const showAllButton = document.querySelector("#show-all");
showAllButton.addEventListener("click", openShowAll);
