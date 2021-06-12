const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?q=";
var requestUrl = BASE_URL + "Dallas,tx,us" + "&appid=" + API_KEY;

function getApi(requestUrl) {

  fetch(requestUrl).then(function (response) {

      return response.json();

  }).then(function (data) {

    console.log(data);
    
  });
}

getApi(requestUrl);
