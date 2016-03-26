Ext.require(['Ext.Leaflet']);

/*
* Controller for the Leaflet Custom Component.
* Every time the map is rendered, we check if the user is within the tour area.
* If the user is, his or her location is pulsed on the map.
*
* If geolocation fails, it retries until successful.
*
* @tofferrosen, @wlodarczyk, @eklundjoshua
*/

var filter = [];
var firstRun = 0;

Ext.define('DevCycleMobile.Map.LayerControl', {
	singleton: true,
	lc: null,
	groupsOverlay: [],
	layerRef: []
});

Ext.define('DevCycleMobile.controller.Map', {
	extend: 'Ext.app.Controller',

	config: {
		control: {
			// Reference to the Leaflet Custom Component
			'#mapview': {
				maprender: 'onMapRender',
			},
			// Action listener for handling filters
			'button[action=toggleMapFilter]': {
				tap: 'toggleFilter',
			},
		}
	},

	requires:['DevCycleMobile.Map.LayerControl'],

	/**
	* Controls the toggling of filter icon markers on leaflet map, uses a setimte to mimic
	* an asynchronous call so that the UI doesnt freeze when loading markers
	**/
	toggleFilter: function(filterType) {
		setTimeout(function()
		{
			if (filter.indexOf(filterType.id) == -1) {
				filter.push(filterType.id);
				filterType.setText('<img src="resources/icons/filters/enabled/'+filterType.id+'.png"/>');
				DevCycleMobile.app.getController('FilterMarkers').filterMap(filter);
			}
			else {
				filter.splice(filter.indexOf(filterType.id), 1);
				filterType.setText('<img src="resources/icons/filters/disabled/'+filterType.id+'.png"/>');
				DevCycleMobile.app.getController('FilterMarkers').filterMap(filter);
			}
		},50);
	},

	/**
	Called when controller is initalized - setup all variables
	**/
	init: function() {
		this.riderPosMarker = null; // user's position marker
	},

	/**
	* Function addGroup
	* This function will be called from the Group.js controller and
	* will be responsible for taking the values that were cached in
	* the GroupInfo and GroupRiderInfo store and plotting them
	* on the leaflet map. GroupInfo holds all groups that a user is
	* part of and GroupRiderInfo holds all the riders that are in the
	* associated groups that the user is a part of
	*/
	addGroup: function (groupCode, groupName) {
		var map = Ext.getCmp('mapview').map;
		//Ensure the map has been loaded
		if (map != undefined)
		{
			/**
			* Import the Rider Store - Holds this device's rider id
			* Fields:
			*	riderId
			*
			* Import the Group Store - Holds all groups that this device's rider is a part of
			* Fields:
			* 	groupName
			*	groupCode
			*
			* Import the GroupRider Store - Holds all the riders, locations, groups
			*	groupCode
			*	riderId
			*	latitude
			*	longitude
			**/
			//var riderStore = Ext.getStore("RiderInfo");
			var groupRiderStore = Ext.getStore("GroupRiderInfo");
			var groupStore = Ext.getStore("GroupInfo");
			var newGroup = L.layerGroup(); //Create a layer group

			console.log("Going to add group " + groupCode + " to the map");

			groupStore.filter('groupCode', groupCode);
			var groupRecord = groupStore.getAt(0);

			console.log("The group record to add to map was found " + groupRecord);
			var col = groupRecord.get('groupColor');

			var riderMarker = L.userMarker();
			var riderPos;

			groupRiderStore.filter('groupCode', groupCode);

			groupRiderStore.each(function (riderRecord)
			{
				/**
				* NOTE: This line needed to be added in in order to correctly
				* get the color set for the rider markers. L.userMarker holds onto
				* the previous instance for the riderRecord object in each group and then
				* gets set to the correct color "color". Adding this line forces the color
				* to be correctly set for every riderRecord, not just every record after the first
				*/
	 		    console.log("The lat and long from the store for riderId " + riderRecord.get('riderId') + " and group code " + groupCode + " is " + riderRecord.get('latitude') + " " + riderRecord.get('longitude'));

	 		    // Create the rider marker
	 			riderPos = new L.latLng(riderRecord.get('latitude'), riderRecord.get('longitude'));
	 			riderMarker = L.userMarker(riderPos, {
	 	       		color: col,
	 	        	accuracy: 10,
	 	        	pulsing: true,
	 	        	smallIcon: true,
	 	        	riderId: riderRecord.get('riderId'),
	 	        	groupCode: groupCode
	 	    	});
          
          // set the css class for the colored group dot
          riderMarker.valueOf().options.icon.options.className = 'leaflet-usermaker-' + col;

	 	    	riderMarker.bindPopup("<h1>Rider " + riderRecord.get('riderId') + "</h1> <h2><b>Group: </b> " + groupRecord.get('groupCode') + "</h2>", {offset: new L.Point(0,-20)});
	 	    	newGroup.addLayer(riderMarker);
			});

			/**
			* These parallel arrays hold reference to the group layers added so
			* they can be later removed if a user leaves that group
			**/
			DevCycleMobile.Map.LayerControl.groupsOverlay.push(newGroup);
			DevCycleMobile.Map.LayerControl.layerRef.push(groupCode);
			groupRiderStore.clearFilter(true);
			groupStore.clearFilter(true);

			/**
			* If the user joined their first group, then add the layer control icon
			* to the map, otherwise, just update the current layer control with a new
			* Group
			*/
			if(!DevCycleMobile.Map.LayerControl.lc)
			{
				DevCycleMobile.Map.LayerControl.lc = new L.control.layers(null, null);
				DevCycleMobile.Map.LayerControl.lc.addOverlay(newGroup, groupName);
				DevCycleMobile.Map.LayerControl.lc.addTo(map);

				DevCycleMobile.app.getController('Home').timerTask();
			}
			else
			{
				DevCycleMobile.Map.LayerControl.lc.addOverlay(newGroup, groupName);
				DevCycleMobile.Map.LayerControl.lc._update();
			}

			//this.updateMap();
			map._onResize();
		}
	},

	/**
	* Function: updateMap
	* Description:
	*/
	updateMap: function(group_code) {
		var map = Ext.getCmp('mapview').map;

		if(map != undefined)
		{
			var groupLayers = DevCycleMobile.Map.LayerControl.groupsOverlay;
			var refArray = DevCycleMobile.Map.LayerControl.layerRef;

			var groupStore = Ext.getStore("GroupInfo");
			var groupRiderStore = Ext.getStore("GroupRiderInfo");

			var currLayer;
			var currRider;
			var riderLat;
			var riderLong;
			var riderId;
			var record;
			var index;

			//var riderLatLong;

				index = refArray.indexOf(group_code);
				currLayer = groupLayers[index];

				//console.log("Updating map for " + group_code);
				groupRiderStore.filter('groupCode', group_code);

				currLayer.eachLayer(function (riderRecord)
				{
					riderId = riderRecord.options.riderId;
					//riderLat = riderRecord.latitude;
					//riderLong = riderRecord.longitude;
					//riderLatLong = riderRecord.getLatLng().toString();
					//console.log("Iterated over " + riderId + " for group code " + group_code + " latlong: " + riderLatLong);
					index = groupRiderStore.findExact('riderId', riderId);
					record = groupRiderStore.getAt(index);
					riderLat = record.get('latitude');
					riderLong = record.get('longitude');
					console.log("The lat and long from the store for riderId " + riderId + " and group code " + group_code + " is " + riderLat + " " + riderLong);
					riderRecord.setLatLng([riderLat, riderLong]).update();
					//riderRecord.update();
				});
				groupRiderStore.clearFilter(true);

			DevCycleMobile.Map.LayerControl.lc._update();
			map._onResize();
		}
	},

	/**
	* Function: removeGroup
	* Description: remove group takes the group code as a parameter
	* and removes the current group from the map and the layer control
	**/
	removeGroup: function (code) {
		var map = Ext.getCmp('mapview').map;
		//Ensure the map has been loaded
		if (map != undefined) {
			/**
			* These parallel arrays hold reference to all the groups added
			* to the map. They should be indexed to find the group you want
			**/
			var groupArray = DevCycleMobile.Map.LayerControl.groupsOverlay;
			var refArray = DevCycleMobile.Map.LayerControl.layerRef;
			var index = 0;

			for(var i = 0; i < refArray.length; i++)
			{
				if(refArray[i] == code)
				{
					index = i;
					break;
				}
			}

			var removeThis = groupArray[index];

			// Remove the group from the arrays
			DevCycleMobile.Map.LayerControl.groupsOverlay.splice(index, 1);
			DevCycleMobile.Map.LayerControl.layerRef.splice(index, 1);

			// Remove the group from the leaflet layer control
			DevCycleMobile.Map.LayerControl.lc.removeLayer(removeThis);
			DevCycleMobile.Map.LayerControl.lc._update();
			map.removeLayer(removeThis);
			map._onResize();
		}
	},
	/*
	* This function will be called whenever the filter for a group is selected
	* All users in that group will be plotted on the map through this function.
	*/
	mapGroups: function () {
		var map = Ext.getCmp('mapview').map;
		//Ensure the map has been loaded
		if (map != undefined) {

			this.groupStore = Ext.getStore("GroupInfo");
			this.groupRiderStore = Ext.getStore("GroupRiderInfo");
			var riderPos = new L.latLng(40.7127837, -74.00594130000002);

				// Create rider marker
				/*this.riderPosMarker = L.userMarker(riderPos, {
					accuracy: 10,
					pulsing: true
				});
				this.riderPosMarker.addTo(map);*/
				// add to map
		}
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
				this.riderPosMarker = L.userMarker();
				// Create rider marker
				this.riderPosMarker = L.userMarker(riderPos, {
					accuracy: position.coords.accuracy,
					pulsing: true,
					color: "blue"
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
			this.locationFailure, {timeout: 120000});
	}

});
