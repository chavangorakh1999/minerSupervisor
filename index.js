require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
var cron = require("node-cron");
const SSH = require("simple-ssh");
const arr = [];
const servers = {
  server1: process.env.Server1host,
  X: process.env.Server2host,
  server3: process.env.Server3host,
  server4: process.env.Server4host,
  server5: process.env.Server5host,
};
function ssh(host) {
  console.log("inside the system");
  var ssh = new SSH({
    host: host,
    user: process.env.user,
    pass: process.env.pass,
  });
  // execute the df -h command to find out disk utilization
  ssh
    .exec("sh miner.sh", {
      out: function (stdout) {
        arr.unshift("<p>"+stdout+"</p>");
      },
    })
    .start();
}

const getWorkers = async () => {
  axios
    .get(
      "https://api.nanopool.org/v1/eth/user/0x85b1057d2a6ed2ca9efd794250d08f5db44be958"
    )
    .then(
      await function (response) {
        // handle success
        const workers = response.data.data.workers;
        var perCycle="";
        workers.forEach((worker) => {
          perCycle+=worker.hashrate+" ";
          if (worker.hashrate === "0.0") {
            const downServer = servers[worker.id];
            ssh(downServer);
            perCycle+=downServer+" ";
          }
        });
        arr.unshift("<p>"+perCycle+"</p>");
      }
    )
    .catch(function (error) {
      // handle error
      console.log(error);
    });
};

cron.schedule("*/1 * * * *", () => {
  arr.unshift("<p>"+"runing a task in 1 minutes"+"</p>");
  getWorkers();
});

// const printData="";

app.get("/", (req, res) => {
  console.log(arr);
  res.send(arr);
});

app.listen(3000, (req, res) => {
  console.log("Server listening at port 3000");
});
