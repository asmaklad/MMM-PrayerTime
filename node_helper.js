/* Magic Mirror
 * Node Helper: MMM-PrayerTime
 *
 * By Slamet PS/slametps@gmail.com
 * This is an optional helper that will be loaded by the node script. The node helper and module script can communicate with each other using an integrated socket system.
 * The node helper (node_helper.js) is a Node.js script that is able to do some backend task to support your module.
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var async = require('async');
var exec = require('child_process').exec;

module.exports = NodeHelper.create({
  // Subclass start method.
  start: function () {
    console.log("Starting node_helper.js for MMM-PrayerTime.");
  },

  async getMPT(payload) {
    try {
      console.log(this.name + ": 0-getMPT " + payload.url + " for " + payload.whichDay  );
      const response = await fetch(payload.url);      
      const result = await response.json();
      console.log(this.name + ": 1-getMPT " + JSON.stringify(response) + " - " + JSON.stringify(result) + " for " + payload.whichDay);
      if (!response.ok) {
        console.error(this.name + ": Network response was not ok", response.statusText);
        return;
      } else if (result?.data?.timings) {
        result.whichDay = payload.whichDay; 
        console.log(`${this.name}: 2-getMPT ${JSON.stringify(result)}`);  
        this.sendSocketNotification('MPT_RESULT', result);
      } else {
        console.error(this.name + ": 3-getMPT");
      }
    } catch (error) {
      console.error(this.name + ": Error fetching data", error);
    }
  },

  socketNotificationReceived: function (notification, payload) {
    console.log(this.name + " node helper received a socket notification: " + notification + " - Payload: " + JSON.stringify(payload));
    if (notification === 'GET_MPT') {
      this.getMPT(payload);
    }
    if (notification == "PLAY_ADZAN") {
      var adzanSound = 'adzan.mp3';
      if (payload.occasion) {
        if (payload.occasion == "FAJR") {
          adzanSound = 'adzan-fajr.mp3';
        }
        else if (payload.occasion == "IMSAK") {
          adzanSound = 'imsak.mp3';
        }
      }
      var adzanCmd = '/usr/bin/omxplayer  modules/MMM-PrayerTime/res/' + adzanSound + ' &';
      async.parallel([
        async.apply(exec, adzanCmd)
      ],
        function (err, res) {
        });
    }
  },
});
