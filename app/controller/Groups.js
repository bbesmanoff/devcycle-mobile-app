Ext.require(['Ext.Leaflet']);

/*
 * Controller for the Groups component
 * Users can join, create, or view/remove themselves from a specified
 * tour group (aka, affinity group).
 *
 * @ WLODARCZYK, @ EKLUND
*/

// CONSTANTS
var CODE_MIN = 3;
var CODE_MAX = 7;
var NAME_MAX = 30;
var numGroups = 0;
var colorArray = ["red", "green", "orange", "purple"];


Ext.define('Group', {
	singleton: true,
	currentColorIndex: 0,
	joinedGroups: ["init"]
});

Ext.define('DevCycleMobile.controller.Groups', {
	extend: 'Ext.app.Controller',

	config: {
		// ACTION HANDLERS
		control: {
			'button[action=join]': {
				tap: 'joinGroup'
			},
			'button[action=create]': {
				tap: 'createGroup'
			},
			'button[action=remove]': {
				tap: 'removeGroup'
			},
			'button[action=suggest]': {
				tap: 'suggestCode'
			}
		}
	},

	/*init: function() {
		this.tourInfo = Ext.getStore("TourInfo").first();	// tour info
	},*/
	/**
	* Chooses a color based on what colors have already been used.
	*/
	chooseAColor: function() {
		var color;
	
		if(Group.currentColorIndex == (colorArray.length))
		{
			Group.currentColorIndex = 0;
		}
		color = colorArray[Group.currentColorIndex];
		Group.currentColorIndex = Group.currentColorIndex + 1;
		
		return color;
	},
	/**
	* function: cacheGroup
	* Description: This function will cache a group on the clients device
	* 
	* @param code : The group code for the group you'd like to cache
	* @param name : The name of the group you'd like to cache
	*/
	cacheGroup: function(code, name, action) {
		console.log("Made it into cache group");
		this.groupStore = Ext.getStore("GroupInfo");
		var groupColor = this.chooseAColor();

		var newGroup = new DevCycleMobile.model.Group({
			groupCode: code,
			groupName: name,
			groupColor: groupColor
		});

		this.groupStore.filter('groupCode', code);
		if(this.groupStore.getCount() == 0)
		{
			this.groupStore.add(newGroup);
			Group.joinedGroups.push(code);
		}
		else
		{
			console.log("Group already exists");
		}
		this.groupStore.clearFilter(true);
		this.groupStore.sync();
		
		if(action == "join")
		{
			//Get all the riders in the group and populate them in the store
			DevCycleMobile.app.getController('Groups').populateGroupRiderStore(code, name);
		}
	},

	/**
	* function: cacheGroupRiders
	* Description: This function will cache riders that are associated 
	* with a group on the local clients store.
	* 
	* @param code : The group code for the group you'd like to cache
	* @param ridersArray : an array consisting of all riders that you want
	* to be associated with that group
	*/
	cacheGroupRiders: function(code, rider, latitude, longitude) {
		this.groupRiderStore = Ext.getStore("GroupRiderInfo");
	
		console.log("Caching rider" + rider + "for code " + code);
		var newGroupRider = new DevCycleMobile.model.GroupRider({
			groupCode: code,
			riderId: rider,
			latitude: latitude,
			longitude: longitude
		});
		this.groupRiderStore.add(newGroupRider);
		this.groupRiderStore.sync();
	},

	/**
	* function clearStore
	* Description: Clears a specified store
	*
	*/
	clearStore: function(store_name) {
		this.groupRiderStore = Ext.getStore("GroupRiderInfo");
		this.groupStore = Ext.getStore("GroupInfo");

		if(store_name == "group") 
		{
			this.groupStore.removeAll(true);
			this.groupStore.sync();
		}
		else if(store_name == "groupRider")
		{
			this.groupRiderStore.removeAll(true);
			this.groupRiderStore.sync();
		}
	},

	clearGroupStore: function(group_code) {
		var groupStore = Ext.getStore("GroupInfo");

		var match = groupStore.findExact("groupCode", group_code);
		groupStore.removeAt(match);
		groupStore.sync();
		
		var joinArray = Group.joinedGroups;
		var index = 0;

		for(var i = 0; i < joinArray.length; i++)
		{
			if(joinArray[i] == group_code)
			{
				index = i;
				break;
			}
		}
		Group.joinedGroups.splice(index, 1);
		DevCycleMobile.app.getController('Groups').clearGroupRiderStore(group_code);	

	},

	clearGroupRiderStore: function(group_code) {
		var groupRiderStore = Ext.getStore("GroupRiderInfo");

		groupRiderStore.filter("groupCode", group_code);

		groupRiderStore.removeAll();
		groupRiderStore.clearFilter(true);
		groupRiderStore.sync({
			callback: Ext.getCmp('myGroupsList').refresh
		});
		DevCycleMobile.app.getController('Map').removeGroup(group_code);
	},

	// Populates the group rider store which 
	// holds all the riders from the server
	populateGroupRiderStore: function(group_code, group_name) {
		var groupRiderStore = Ext.getStore("GroupRiderInfo");
		this.tourInfo = Ext.getStore("TourInfo").first();	// tour info

		var riderStore = Ext.getStore("RiderInfo");
		this.tourInfo = Ext.getStore("TourInfo").first();	// tour info

		var riderRecord = riderStore.first();
		var thisRiderId = riderRecord.get("riderId");


		//Send a get request to the server which will join the given group
		Ext.data.JsonP.request({
	        url: this.tourInfo.data.dcs_url + "/get_location_data/" + group_code + "/",
	        type: "GET",
	        callbackKey: "callback",
	        callback: function(data, result)
	        {
	        	if(data)
	        	{
	        		if(result[0].success == "true")
	                {
		        		for(var i = 1; i<result.length; i++)
	                    {
	                    	console.log("in populate result[i].riderId " + result[i].riderId);
							DevCycleMobile.app.getController('Groups').cacheGroupRiders(group_code, result[i].riderId, result[i].latitude, result[i].longitude);	        			
		        		}
		        		DevCycleMobile.app.getController('Map').addGroup(group_code, group_name);
		        	}
		        	else
		        	{
		        		// Alert there is no location data to get and add that group to the 
		        		// layer control
		        		console.log("No location data to get yet");
		        		DevCycleMobile.app.getController('Map').addGroup(group_code, group_name);
		        	}	

	        	}
	        	else
	        	{
	        		alert("Could not reach the server. Please check your connection");
	        	}

	        }
	    });
	},

	updateGroups: function() {
		this.groupRiderStore = Ext.getStore("GroupRiderInfo");
		this.groupStore = Ext.getStore("GroupInfo");

		this.groupStore.each(function (record) {

		var group_code = record.get("groupCode");
		var group_name = record.get("groupName");
		console.log("Going to update " + group_code);
		DevCycleMobile.app.getController('Groups').updateJSONPRequest(group_code, group_name);

		
		}); //End of this.groupStore each method
		//DevCycleMobile.app.getController('Map').updateMap();
	},

	updateJSONPRequest: function(group_code, group_name) {
		this.tourInfo = Ext.getStore("TourInfo").first();	// tour info

		console.log("Updating JSONP Request for " + group_code);
		Ext.data.JsonP.request({
		        url: this.tourInfo.data.dcs_url + "/get_location_data/" + group_code + "/",
		        type: "GET",
		        callbackKey: "callback",
		        callback: function(data, result)
		        {
		        	if(data)
		        	{
		        		if(result[0].success == "true")
		                {
			        		DevCycleMobile.app.getController('Groups').updateGroupRiderStore(group_code, group_name, result);	        			
			        	}
			        	else
			        	{
			        		// No need to do anything here, if there is no location data for any users no need to
			        		// update the map
			        		console.log("No location data for group yet" + group_code);
			        		//alert(result[0].message);
			        	}	

		        	}
		        	else
		        	{
		        		alert("Could not reach the server. Please check your connection");
		        	}

		        }
		});
		//DevCycleMobile.app.getController('Map').updateMap();
	},
	// DevCycleMobile.app.getController('Groups').updateGroupRiderStore
	// Whenever the timer task needs to update rider's positions
	// This function will get called. 
	updateGroupRiderStore: function(group_code, group_name, result) {
		var groupRiderStore = Ext.getStore("GroupRiderInfo");

		groupRiderStore.filter("groupCode", group_code);

		var rider;
		var latitude;
		var longitude;
		var record;
		var recordIndex;

		for(var i = 1; i<result.length; i++)
		{
			rider = result[i].riderId;
			latitude = result[i].latitude;
			longitude = result[i].longitude;

			recordIndex = groupRiderStore.findExact('riderId', rider);
			if(recordIndex == -1)
			{
				this.cacheGroupRiders(group_code, rider, latitude, longitude); 
				recordIndex = groupRiderStore.findExact('riderId', rider);
			}
			record = groupRiderStore.getAt(recordIndex);
			
			record.set('latitude', latitude);
			record.set('longitude', longitude);
			record.dirty = true; 
			record.commit();
		}
		groupRiderStore.clearFilter(true);
		DevCycleMobile.app.getController('Map').updateMap(group_code);

	},

	// Adds user to specified group
	joinGroup: function() {
		
		var groupRiderStore = Ext.getStore("GroupRiderInfo");
		var groupStore = Ext.getStore("GroupInfo");
		var riderStore = Ext.getStore("RiderInfo");
		this.tourInfo = Ext.getStore("TourInfo").first();	// tour info

		var riderRecord = riderStore.first();
		var thisRiderId = riderRecord.get("riderId");
		//var thisRiderId = 1;

		console.log("THE RIDER ID IS " + thisRiderId);
	
		var groupCode = Ext.getCmp('join_group_code').getValue().toUpperCase();
		if(groupCode != '' && groupCode.length >=CODE_MIN && groupCode.length <=CODE_MAX)
		{

			if(Group.joinedGroups.indexOf(groupCode) == -1)
			{
				//Send a get request to the server which will join the given group
				Ext.data.JsonP.request({
	                url: this.tourInfo.data.dcs_url + "/join_group/" + groupCode + "/" + thisRiderId + "/",
	                type: "GET",
	                callbackKey: "callback",
	                callback: function(data, result)
	                {
	                  	// Successful response from the server
	               		if(data)
	                    {
			                if(result[0].success == "true")
			                {
									// Cache the group in local storage
									DevCycleMobile.app.getController('Groups').cacheGroup(groupCode, result[1].name, "join");
									alert("Joined group successfully!");
									Ext.getCmp('join_group_code').setValue("");
							}
							else
							{
								alert(result[0].message);
							}
	                	}
	                	else
	                	{                                    
	 	               		alert("Could not reach the server. Please check your connection");
	                	}                                
	             	} 
	            	}); //End of JSONP Request
	            }
	            else
	            {
	            	alert('You are already part of this group');
	            }
		}
		else 
		{
			alert('Error: Invalid Group Format (Must be 3-7 characters)');
		}		
	},
	
	suggestCode: function() {
		var groupName = Ext.getCmp('group_name').getValue();
		var groupCode;
		if (groupName.length < 3) {
			groupCode = 'BNY';
		} else {
			groupCode = groupName.replace(/\s/g, '').substring(0,3);
		}		
		var randomCode = Math.floor(Math.random() * (9999 - 1000)) + 1000;
		Ext.getCmp('create_group_code').setValue(groupCode.toUpperCase() + randomCode);
	},
	
	// Handles creating a group based on provided user input, sends it off to postGroup 
	createGroup: function() {			
		this.tourInfo = Ext.getStore("TourInfo").first();	// tour info

		//Ext.getCmp('load-indicator').show();
		var groupName = Ext.getCmp('group_name').getValue();
		var groupCode = Ext.getCmp('create_group_code').getValue();
		
		var riderStore = Ext.getStore("RiderInfo");
		var riderRecord = riderStore.first();
		var thisRiderId = riderRecord.get("riderId");

		var canCreateGroup = false;
		if(groupName !== '' && groupName.length <= NAME_MAX) {
			var reg = new RegExp('^\\w{' + CODE_MIN + ',' + CODE_MAX + '}$');
			var validCode = reg.test(groupCode);
			if(groupCode === '') {
				// generate random code
				groupCode = Math.random().toString(36).slice(2).substring(0,3);
				Ext.getCmp('create_group_code').setValue(groupCode.toUpperCase());
				canCreateGroup = true;
			} else if(validCode) {
				canCreateGroup = true;
			} else {
				alert('Error: Customized group code must be between 3 and 7 alphanumeric characters');
			}

			if (canCreateGroup) {
				// Check the code to see if it's in use first
				groupCode = groupCode.toUpperCase();
				Ext.data.JsonP.request({
		    	url: this.tourInfo.data.dcs_url + "/check_code/" + groupCode + "/",
		        type: "GET",
		        callbackKey: "callback",
		        callback: function(data, result)
			    {
			          	// Successful response from the server
			        	if(data)
			            {
			            	// True means that it's avail
					        if(result[0].success == "true")
					        {
					        	var upperGroupCode = groupCode.toUpperCase();
					        	// Create the group now. This was placed in another funciton
					        	// otherwise javascript will run it asynchronously
					        	DevCycleMobile.app.getController('Groups').createGroupAction(upperGroupCode, groupName);
					        }
							else
							{
								var upperGroupCode = groupCode.toUpperCase();
								alert("Code " + upperGroupCode + " already exists");
							}
						}
						else
						{
							alert("Could not reach the server. Please check your connection");
						}
				}
				});
			}

			
		}
		else {
			alert('Error: Please enter a valid group name (MAX: 30 characters)');
		}		
		//Ext.getCmp('load-indicator').hide();
	},

	/**
	* funciton created outside of createGroup because
	* of javascript asynchronously checking the code and
	* creating the group.
	*/
	createGroupAction: function(groupCode, groupName) {

		this.tourInfo = Ext.getStore("TourInfo").first();	// tour info

		var riderStore = Ext.getStore("RiderInfo");
		var riderRecord = riderStore.first();
		var thisRiderId = riderRecord.get("riderId");

		 // Create the group if it is an avail code
		 Ext.Ajax.request({
		 	url: this.tourInfo.data.dcs_url + "/create_group/",
			method: "POST",
			scope: this,
			params: {
				name: groupName,
				rider_id: thisRiderId,
				aff_code: groupCode,
			},
			success: function(response){
				DevCycleMobile.app.getController('Groups').cacheGroup(groupCode, groupName, "join");
				alert("Succesfully Created & Joined Group!\n"+groupCode+": "+groupName+"\nPlease see the My Groups tab");
				Ext.getCmp('create_group_code').setValue("");
				Ext.getCmp('group_name').setValue("");
			},
			failure: function(response){
				console.log("Failed creating group")	
			},
		});

	},

	checkCode: function(groupCode) {
		console.log("In check code");
		var returnStatus = false;
		groupCode = groupCode.toUpperCase();
		//Check the group code with the server to ensure it can exist
		Ext.data.JsonP.request({
	    	url: this.tourInfo.data.dcs_url + "/check_code/" + groupCode + "/",
	        type: "GET",
	        callbackKey: "callback",
	        callback: function(data, result)
	        {
	          	// Successful response from the server
	        	if(data)
	            {
			        if(result[0].success == "true")
			        {
			        	returnStatus = true;
			        }
					else
					{
						alert(result[0].message);
					}
				}
				else
				{
					alert("Could not reach the server. Please check your connection");
				}
				console.log("Returning " + returnStatus);
				return returnStatus;
			}
		});
		
	},	
	// Removes user from specified group 
	removeGroup: function() {
		this.tourInfo = Ext.getStore("TourInfo").first();	// tour info

		var groupInfoStore = Ext.getStore("GroupInfo");
		var groupRiderInfoStore = Ext.getStore("GroupRiderInfo");
		var riderStore = Ext.getStore("RiderInfo");
		var riderRecord = riderStore.first();
		var thisRiderId = riderRecord.get("riderId");
		//var thisRiderId = 1;
		
		// Gets group that is highlighted within my groups list
		var selectedGroup = Ext.getCmp('myGroupsList').getSelection();
		var groupCode = selectedGroup[0].get("groupCode");
	
	
		//Send a get request to the server which will join the given group
		Ext.data.JsonP.request({
	    	url: this.tourInfo.data.dcs_url + "/leave_group/" + groupCode + "/" + thisRiderId + "/",
	        type: "GET",
	        callbackKey: "callback",
	        callback: function(data, result)
	        {
	        	if(data)
	        	{
	        		if(result[0].success == "true")
	        		{
	        			DevCycleMobile.app.getController('Groups').clearGroupStore(groupCode);	
	        		}
	        		else
	        		{
	        			alert(result[0].message);
	        		}
	        	}
	        	else
	        	{
	        		alert("Could not reach the server. Please check your connection");
	        	}

	        }
	    }); //End of JSONP Request
	}
});

