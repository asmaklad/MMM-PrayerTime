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
	start: function() {
		console.log("Starting node_helper.js for MMM-PrayerTime.");
	},

  getPTonline(url){
    // new Date(Date.now())
    Log.info(this.name + ": Fetching prayer times from " + url);
    todayRequest=new XMLHttpRequest();
		todayRequest.open("GET", url, true);
		todayRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
          resultToday = JSON.parse(this.responseText);
          Log.info(self.name + ": Prayer times received: " + JSON.stringify(resultToday.data.timings));
          self.todaySchedule = resultToday.data.timings;
          // debug/testing only
          //self.todaySchedule = {"Fajr":"04:30", "Dhuhr":"12:00", "Asr":"16:14", "Maghrib":"18:00", "Isha":"20:50", "Imsak":"04:20"};
          nbRes++;
          if (nbRes == nbReq)
            self.processSchedule();
				} else {
					Log.error(self.name + ": got HTTP status-" + this.status);
          retry = true;
				}
			}
		};
		todayRequest.send();
    return(todayRequest);

    // fetch(url)
    //   .then(response => response.json())
    //   .then(data => {
    //     this.sendSocketNotification("PT_RESULT", data);
    //   })
    //   .catch(error => {
    //     console.error("Error fetching prayer times:", error);
    //   });
  },

  getPTOffline(){
    var ptData = require('./prayer-time.json');
    this.sendSocketNotification("PT_RESULT", ptData);
  },

	socketNotificationReceived: function(notification, payload) {
    console.log(this.name + " node helper received a socket notification: " + notification + " - Payload: " + payload);
    if (notification == "PLAY_ADZAN") {
      var adzanSound = 'adzan.mp3';
      if (payload.occasion) {
        if (payload.occasion=="FAJR") {
          adzanSound = 'adzan-fajr.mp3';
        }
        else if (payload.occasion=="IMSAK") {
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
