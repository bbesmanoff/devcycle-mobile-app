Ext.require(['Ext.Leaflet']);

/*
* Controller for the Leaflet Custom Component.
* Every time the map is rendered, we check if the user is within the tour area.
* If the user is, his or her location is pulsed on the map.
*
* If geolocation fails, it retries until successful.
*
* @tofferrosen
*/

Ext.define('DevCycleMobile.controller.Map', {
	extend: 'Ext.app.Controller',

	config: {
		control: {
			// Reference to the Leaflet Custom Component
			'#mapview': {
				maprender: 'onMapRender',
			},
		}
	},

	/**
	Called when controller is initalize - setup all variables
	**/
	init: function() {
		this.riderPosMarker = null; // user's position marker
	},

	/**
	* Called when a user's location/position is successfully found.
	* Adds or updates the user's location on the map.
	**/
	locationSuccess: function(position) {

		var map = Ext.getCmp('mapview').map;
		var riderPos = new L.latLng(position.coords.latitude, position.coords.longitude);

		// First, make sure that rider is within bounds of the tour
		if (map.options.maxBounds.contains(riderPos)) {

			// Make sure that rider icon is not already set
			if(this.riderPosMarker === null || this.riderPosMarker === undefined){

				// Create rider marker
				this.riderPosMarker = L.userMarker(riderPos, {
					accuracy: position.coords.accuracy,
					pulsing: true
				});

				this.riderPosMarker.addTo(map); // add to map

				// center map on rider's location
				map.panTo([position.coords.latitude, position.coords.longitude], {duration: 3});

			} else {
				var currPos = new L.LatLng(position.coords.latitude, position.coords.longitude);
				this.riderPosMarker.setLatLng(currPos);
				this.riderPosMarker.setAccuracy(position.coords.accuracy);
				this.riderPosMarker.panTo(currPos);
			}

			// refresh the map
			if (map != undefined){
				map._onResize();
			}

		} // End of if - rider not in tour area so do not add to map
	},

	/**
	* Called when a user's location was not found.
	* Retries to get the user's location after 10 seconds.
	**/
	locationFailure: function(e) {

		var controller = DevCycleMobile.app.getController('DevCycleMobile.controller.Map');

		console.warn('Error(' + e.code + '): ' + e.message);
		console.warn("Trying to find user's position again.");

		// try to get the user's location again in 10 seconds
		setTimeout(function() {
			navigator.geolocation.getCurrentPosition(controller.locationSuccess,
			controller.locationFailure, {timeout: 120});
		}, 10000);
	},

	/**
	* When map is initalize, search for users location and put it on the map
	**/
	onMapRender: function() {
		console.log("On map rendered!");
	
		var map = Ext.getCmp('mapview').map;

			// refresh the map
			if (map != undefined){
				map._onResize();
			}

		// try to get the user's location
		navigator.geolocation.getCurrentPosition(this.locationSuccess,
			this.locationFailure, {timeout: 120});
	}

});
