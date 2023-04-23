const express = require("express");
const axios = require("axios");

let data = "";

const app = express();

function formatDataAPI1(obj) {
  let responseData = {
    singleDay: {},
    fiveDay: [],
  };
  let keys = ["weather","temperature","feelsLike","minTemp","maxTemp","humidity","windSpeed","windDir","sunrise","sunset","cityName","date"];
  let values = [];
  values.push(obj.weather[0].main);
  values.push(obj.main.temp);
  values.push(obj.main.feels_like);
  values.push(obj.main.temp_min);
  values.push(obj.main.temp_max);
  values.push(obj.main.humidity);
  values.push(obj.wind.speed);
  values.push(obj.wind.deg);
  values.push(obj.sys.sunrise);
  values.push(obj.sys.sunset);
  values.push(obj.name);
  values.push(obj.dt);

  for (var i = 0; i < keys.length; i++) {
    responseData.singleDay[keys[i]] = values[i];
  }

  return responseData;
}

function formatDataAPI2(responseData, arr) {
  let keys = ["date","cloudCoverAvg","humidityAvg","sunriseTime","sunsetTime","temperatureAvg","visibilityAvg","windDirectionAvg","windGustAvg","windSpeedAvg"];

  arr.forEach((ele) => {
    let obj = {};
    let values = [];
    values.push(ele.time);
    values.push(ele.values.cloudCoverAvg);
    values.push(ele.values.humidityAvg);
    values.push(ele.values.sunriseTime);
    values.push(ele.values.sunsetTime);
    values.push(ele.values.temperatureAvg);
    values.push(ele.values.visibilityAvg);
    values.push(ele.values.windDirectionAvg);
    values.push(ele.values.windGustAvg);
    values.push(ele.values.windSpeedAvg);

    for (var i = 0; i < keys.length; i++) {
      obj[keys[i]] = values[i];
    }
    responseData.fiveDay.push(obj);
  });

  return responseData;
}

app.get("/getWeather", async (req, res) => {
  const city = req.query.city;

  //singleDay API call [60 calls/minute]
  const API_KEY1 = "<YOUR_API_KEY>";
  const r = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${API_KEY1}`
  );
  //   console.log(r.data);

  let responseData = formatDataAPI1(r.data);
//   console.log(responseData);

  //weekly forcast [500 call/day]
  const API_KEY2 = "<YOUR_API_KEY>";
  const r2 = await axios.get(
    `https://api.tomorrow.io/v4/weather/forecast?location=${city}&timesteps=1d&units=metric&apikey=${API_KEY2}`
  );

  responseData = formatDataAPI2(responseData, r2.data.timelines.daily);
//   console.log(responseData);
  res.send(responseData);
});

const port = process.env.PORT || 5000;

app.listen(port , () => {
  console.log(`running 2 on port ${port}`);
});
