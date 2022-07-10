/* global Module */

/* Magic Mirror 2
 * Module: MMM-Chart
 * 
 * Developed by Erik Pettersson
 * Evghenii Marinescu https://github.com/MarinescuEvghenii/
 * Partly based on dynchart module by Chris van Marle
 * Daniel Habenicht
 * MIT Licensed.
 */
 
Module.register("MMM-Chart",{

	requiresVersion: "2.1.0",
	//var graph = [],
	// Default module config.
	defaults: {
        width       : 200,
        height      : 200,
        chartConfig : {},
        dataTransformer: (data) => data,
        refreshInterval: 60 * 1000
	},

	// Get the Module CSS.
	// getStyles: function() {
	// 	return ["MMM-Chart.css"];
	// },
	
	// Get the needed scripts to make graphs.
	getScripts: function() {
		return [
			// Used to create the actual chart.
			this.file('node_modules/chart.js/dist/chart.min.js'),
			this.file('node_modules/luxon/build/global/luxon.js'),
			this.file('node_modules/chartjs-adapter-luxon/dist/chartjs-adapter-luxon.min.js'),
			// this.file('node_modules/chartjs-adapter-moment/dist/chartjs-adapter-moment.min.js'),
			// this.file('node_modules/moment/dist/moment.js'),
			// Used to handle the mouse and touch interactions.
			this.file('node_modules/hammerjs/hammer.min.js'),
			// Used for interaction with the graph to be able to zoom and pan.
			// this.file('node_modules/chartjs-plugin-zoom/chartjs-plugin-zoom.min.js')
		]
	},
	
	// Starting up.
	start: function() {
		Log.info("Starting module: " + this.name);
        this.config = Object.assign({}, this.defaults, this.config);
		this.chartData = {labels: [], datasets: [] }
		this.config.identifier = this.identifier;
		
		if (typeof this.config.url === 'undefined' || this.config.url === null) {
			Log.error('URL not defined in ' + this.name + ' on graph ' + this.config.name + '.');
		}
		
		// Triggers the get data.
		this.getData();
        self = this
        setInterval(function () {
            self.getData();
          }, this.config.refreshInterval);
	},

	// Request the graph data.
	getData: function () {
		this.sendSocketNotification('GET_GRAPH_DATA', {identifier: this.identifier, config: this.config});
	},

	// Getting the graph data from helper (all MMM-Chart modules get it).
    socketNotificationReceived: function (notification, payload) {
        if (
          notification === "GRAPH_DATA_RESULT" &&
          payload.identifier === this.identifier
        ) {
				// Parsing the JSON data to an array.
				var newData = this.config.dataTransformer(payload.data);
                var labels = newData.map(date => date.x);

				// Update the graphs.
				if(this.myChart !== 'undefined') {
                    this.myChart.data.labels = labels;
                    this.myChart.data.datasets.forEach((dataset) => {
                        dataset.data = newData;
                    });
                    // Updating the chart.
                    this.myChart.update();
                }
		}
	},
	

    getDom: function() {
        // Create wrapper element
        const wrapperEl = document.createElement("div");
        wrapperEl.setAttribute("style", "position: relative; display: inline-block;");

        // Create chart canvas
        const chartEl  = document.createElement("canvas");        

        // Init chart.js
        this.myChart = new Chart(chartEl.getContext("2d"), this.config.chartConfig);
		
        // Set the size
        chartEl.width  = this.config.width;
        chartEl.height = this.config.height;
        chartEl.setAttribute("style", "display: block;");
        
        // Append chart
        wrapperEl.appendChild(chartEl);

		return wrapperEl;
	}
});
