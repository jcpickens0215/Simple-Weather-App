// URL vars
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const ICON_BASE_URL = "https://openweathermap.org/img/w/";

// localstorage vars
var aPreviousSearches = []; // Array to contain searches
var sCurrentSearch = "";

// Element vars
var eColSearch = $("#colSearch");
var eColInfo = $("#colInfo");
var eForecastField = $("#forecastField");
var eSearchField = $("#searchField");
var eHistoryField = $("#historyField");

// Fields for current day panel
var aeTodaysWeather = [ $("#cityField"),
                        $("#dateField"),
                        $("#iconField"),
                        $("#tempField"),
                        $("#windField"),
                        $("#humidField"),
                        $("#uvIndexField"),
                        $("#errorField") ];

// Button element vars
var eSearchButton = $("#searchBtn");
var eBurger = $(".navbar-burger");

// Init: Load all history items from local data
function initLoadHistoryFromLocalStorage() {

        // Hold formatted data for error checking (so I don't repeat myself)
        var aHistoryRetrievedFromLocalStorage = JSON.parse(localStorage.getItem("search_history"));

        // Check to see if an item existed in local storage!
        if (aHistoryRetrievedFromLocalStorage !== null) { // If we have something
    
            // Store the data into the container array
            aPreviousSearches = aHistoryRetrievedFromLocalStorage;
    
            // Display loaded history items
            populateHistoryList();
        }
}

function showAllPanels() {
    $("#main").addClass("is-fluid");
    eColInfo.removeClass("is-hidden");
    eColSearch.addClass("is-4-desktop is-3-widescreen is-fluid");
    eColInfo.addClass("is-8-desktop is-9-widescreen");
}

function initHidePanels() {
    eColInfo.addClass("is-hidden");
}

// Clear the history list
function clearHistoryListItems() {
    eHistoryField.empty();
}

// Clear all fields in the Current Day panel
function clearCurrentDayPanel() {

    aeTodaysWeather[1].text("");
    aeTodaysWeather[2].attr("style", "visibility:hidden;")
    aeTodaysWeather[3].text("");
    aeTodaysWeather[4].text("");
    aeTodaysWeather[5].text("");
    aeTodaysWeather[6].text("");
    aeTodaysWeather[7].text("");
}

// Clear out the forecast panel, to prevent doubling
function clearForecastListItems() {
    eForecastField.empty();
}

// Let's the user know if an error ocurred
function handleBadResponse(status) {

    if (status === 404) { // Handle bad search

        aeTodaysWeather[0].text("Could not find: " + eSearchField.val());
        aeTodaysWeather[7].attr("style", "display:block;");
        aeTodaysWeather[7].text("Please try again. You can search using [city name], [city name, country code], [city name, state code, country code], or [zip code]");

    } else if (status === 500) { // Handle server side error

        aeTodaysWeather[0].text("Server Error: 500");
        aeTodaysWeather[7].attr("style", "display:block;");
        aeTodaysWeather[7].text("Please try again later.");
    }
}

// Create cards for the next 5 days
function populateForecastCards(oDays) {

    // If the list already has cards, clear it
    if (eForecastField.children().length > 0) {

        clearForecastListItems();
    }

    // For each of the days passed in, create a card
    for (var index = 0; index < oDays.length; index++) {

        // Create the list item
        var eDay = $("<li>");
        eDay.addClass("column is-12-desktop is-one-fifth-widescreen");

        // Create the container
        var eBox = $("<div>");
        eBox.addClass("box content dark-trim");

        // Create the Header
        var eHeader = $("<h3>");
        eHeader.addClass("subtitle is-5 has-text-light");
        eHeader.text(moment.unix(Number(oDays[index].dt)).format("dddd MM/DD")); // Show the date

        // Icon representing weather state
        var eIcon = $("<img>");
        eIcon.attr("src", ICON_BASE_URL + oDays[index].weather[0].icon + ".png")
        eIcon.attr("alt", oDays[index].weather[0].description); // Set the alt text

        // Temperature display
        var eTemp = $("<p>");
        eTemp.text("Temp: " + oDays[index].temp.day + " °F");

        // Wind speed display
        var eWind = $("<p>");
        eWind.text("Wind: " + oDays[index].wind_speed + " MPH");

        // Humidity display
        var eHumid = $("<p>");
        eHumid.text("Humidity: " + oDays[index].humidity + "%");

        // Add data fields to container
        eBox.append(eHeader);
        eBox.append(eIcon);
        eBox.append(eTemp);
        eBox.append(eWind);
        eBox.append(eHumid);

        // Add container to list item
        eDay.append(eBox);

        // Add list item to list container
        eForecastField.append(eDay);
    }
}

// Create buttons for the history list
function populateHistoryList() {

        // If the list already has items, clear it
        if (eHistoryField.children().length > 0) {

            clearHistoryListItems();
        }

        // If the user has made a second search
        if (aPreviousSearches.length > 0) {

            // Iterate through all previous searches
            for (var index = 0; index < aPreviousSearches.length; index++) {

                // Create elements
                var eListItem = $("<li>");
                var eListLink = $("<button>");

                // Set Button attributes
                eListLink.attr("data-query", aPreviousSearches[index]);
                eListLink.text(aPreviousSearches[index]);
                eListLink.addClass("subtitle is-5 p-1 mid-tone");

                // Add the Button to the list
                eListItem.append(eListLink);
                eHistoryField.append(eListItem);
            }
        }
}

// Use latitude and longitude from last call to get 5 day forecast data
function getForecast(lat, lon) {

    // Construct the request URL
    var sRequestSecondary = BASE_URL + "onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + API_KEY;

    // Attempt second call
    fetch(sRequestSecondary).then(function (response) {

        return response.json();

    }).then(function (data) {

        var nUV = Number(data.current.uvi);
        var sBackColor;

        // Set background color of UV element based on number
        if (nUV > 8) { // severe

            sBackColor = "has-background-danger";
        } else if (nUV > 3) { // Moderate

            sBackColor = "has-background-warning";
        } else { // Favorable

            sBackColor = "has-background-info";
        }

        // Clear the UV color before setting it
        aeTodaysWeather[6].removeClass("has-background-info");
        aeTodaysWeather[6].removeClass("has-background-warning");
        aeTodaysWeather[6].removeClass("has-background-danger");

        // Populate main fields
        aeTodaysWeather[1].text("(" + moment.unix(Number(data.current.dt)).format("MM/DD") + ")"); // Date
        aeTodaysWeather[2].attr("src", ICON_BASE_URL + data.daily[0].weather[0].icon + ".png"); // Weather icon
        aeTodaysWeather[2].attr("alt", data.current.weather[0].description); // Set the alt text
        aeTodaysWeather[2].attr("style", "visibility:visible;"); // Show the icon
        aeTodaysWeather[3].text(data.current.temp + " °F"); // Temperature (Choose temp by time?)
        aeTodaysWeather[4].text(data.current.wind_speed + " MPH"); // Wind Speed
        aeTodaysWeather[5].text(data.current.humidity + "%"); // Humidity
        aeTodaysWeather[6].text(nUV); // UV index
        aeTodaysWeather[6].addClass(sBackColor);

        // Only send the next 5 days to populateForecastCards
        var aFiveDays = data.daily.slice(1, 6); // I tested this parameter set with jsfiddle
        populateForecastCards(aFiveDays);
    });
}

// Used to get latitude and longitude from city search
function getWeather(request) {

    // Hide the error field
    aeTodaysWeather[7].attr("style", "display:none;");

    // Attempt search of OWM server
    fetch(request).then(function (response) {

        // If bad response
        if (response.status > 400) {

            // Clear everything
            clearCurrentDayPanel()
            clearForecastListItems();

            // Write error to screen
            handleBadResponse(response.status);
        }

        return response.json();

    }).then(function (data) { 

        if (Number(data.cod) < 300) { // If there's something in data
            aeTodaysWeather[0].text(data.name + ", " + data.sys.country); // City name

            // If this isn't the first search
            if (sCurrentSearch !== "") {

                // Check for duplicates
                if (!aPreviousSearches.includes(sCurrentSearch)) {

                    // If no duplicates, add to array
                    aPreviousSearches.push(sCurrentSearch);
                }
            }

            // Set the current search element
            sCurrentSearch = data.name;

            // Display previous searches
            populateHistoryList();

            // Save search history to localstorage
            if (!aPreviousSearches.includes(sCurrentSearch)) {

                var sDataToSave; // Declare container string

                // If this is not the first search
                if (aPreviousSearches.length > 0) {

                    // Add the current search to the previous searches
                    aPreviousSearches.push(sCurrentSearch);

                    // Sort the array
                    aPreviousSearches.sort();

                    // Convert array to string
                    sDataToSave = JSON.stringify(aPreviousSearches); 

                } else { // If this is the first string

                    sDataToSave = '["' + sCurrentSearch + '"]'; // Save first search
                }

                // Save the data
                localStorage.setItem("search_history", sDataToSave); 
            }

            // Get 5 day forecast
            getForecast(data.coord.lat, data.coord.lon); 
        }
    });
}

function makeSearchRequest() {
    
    // Get the text from the search bar
    var sCityInput = eSearchField.val();
    eSearchField.val(""); // Clear the search bar

    // Construct the request URL
    var sRequest = BASE_URL + "weather?appid=" + API_KEY + "&units=imperial&q=" + sCityInput;
    getWeather(sRequest); // Get data from OWM
    showAllPanels();
}

// Initial function calls
initHidePanels();
initLoadHistoryFromLocalStorage();

// When the user clicks the "Search" button, use the text in the search field
// to get the weather from the API call
eSearchButton.click(makeSearchRequest);

// When a history list item button is clicked
eHistoryField.click(function (event) {

    // What was clicked?
    var eClickedElement = event.target; // ! NOT a jQuery object!

    // Make sure it's a button being clicked
    if (eClickedElement.tagName === "BUTTON") {

        // Get city name from Button
        var sPreviousSearch = eClickedElement.getAttribute("data-query");

        // Construct the request URL
        var sRequest = BASE_URL + "weather?appid=" + API_KEY + "&units=imperial&q=" + sPreviousSearch;
        getWeather(sRequest); // Get data from OWM
        showAllPanels();
    }
});

// Check for click events on the navbar burger icon
eBurger.click(function() {

    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    eBurger.toggleClass("is-active");
    $("#history").toggleClass("is-active");
});
