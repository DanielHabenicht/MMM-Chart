const { json } = require('express');
var NodeHelper = require('node_helper');
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));


module.exports = NodeHelper.create ({
	start: function () {
        console.log("Starting node helper: " + this.name);
	},
	//Subclass socketNotificationReceived received.
	socketNotificationReceived: function(notification, payload) {
        var self = this;
        console.log("Chart: notification received");
		if (notification === 'GET_GRAPH_DATA') {
            
             
        let fetches = [fetch(payload.config.url, payload.config.fetchOptions)]
        if(payload.config.urls){
            fetches = payload.config.urls.map(url => fetch(url, payload.config.fetchOptions))
        }
        Promise.all(fetches)
    .then(async (responses) => {
        let jsonData = {}
        for (const response of responses) {
            // Success
            if (Math.floor(response.status / 100) === 2) {
                let json = await response.json();
                jsonData = {...jsonData, ...json};
                // console.debug(jsonData)
            }
        };
        self.sendSocketNotification("GRAPH_DATA_RESULT", {
            identifier: payload.identifier,
            data: jsonData
        });
        console.debug("Chart send notification")
    })
    .catch((error) => {
              console.error(error);
              // Error
              self.sendSocketNotification("GRAPH_DATA_RESULT", {
                identifier: payload.identifier,
                error: true
              });
              console.error(self.name + " error:", error);
            });
		}
	}
});
