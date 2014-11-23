/**
 * Leaflet.UserMarker v1.0
 * 
 * Author: Jonatan Heyman <http://heyman.info>
 * 
 * Change Notes: 
 * Edited: Team Centri-Pedal Motion RIT 2014
 *         added other supported colors defined in leaflet.usermarker.css 
 *         for leaflet-usermarkers
 *
 */

(function(window) {
    var icon = L.divIcon({
        className: "leaflet-usermarker",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
        labelAnchor: [11, -3],
        html: ''
    });
    var iconPulsing = L.divIcon({
        className: "leaflet-usermarker",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
        labelAnchor: [11, -3],
        html: '<i class="pulse"></i>'
    });
    
    var iconSmall = L.divIcon({
        className: "leaflet-usermarker-small",
        iconSize: [17, 17],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10],
        labelAnchor: [3, -4],
        html: ''
    });
    var iconPulsingSmall = L.divIcon({
        className: "leaflet-usermarker-small",
        iconSize: [17, 17],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10],
        labelAnchor: [3, -4],
        html: '<i class="pulse"></i>'
    });
    var circleStyle = {
        stroke: true,
        color: "#03f",
        weight: 3,
        opacity: 0.5,
        fillOpacity: 0.15,
        fillColor: "#03f",
        clickable: false
    };

    L.UserMarker = L.Marker.extend({
        options: {
            pulsing: false,
            smallIcon: false,
            accuracy: 0,
            circleOpts: circleStyle,
            color: 'blue',
            riderId: null,
            groupCode: null
        },

        initialize: function(latlng, options) {
            options = L.Util.setOptions(this, options);
            
            this.setPulsing(this.options.pulsing);
            this._accMarker = L.circle(latlng, this.options.accuracy, this.options.circleOpts);
        
            this.setColor(this.options.color);
            // call super
            L.Marker.prototype.initialize.call(this, latlng, this.options);
        
            this.on("move", function() {
                this._accMarker.setLatLng(this.getLatLng());
            }).on("remove", function() {
                this._map.removeLayer(this._accMarker);
            });
        },
    
        setPulsing: function(pulsing) {
            this._pulsing = pulsing;
            
            if (this.options.smallIcon) {
                this.setIcon(!!this._pulsing ? iconPulsingSmall : iconSmall);
            } else {
                this.setIcon(!!this._pulsing ? iconPulsing : icon);
            }
        },

        /**
        * setColor function added by Team Centri-Pedal RIT 2014
        *
        * Description: This function will set other preset colors 
        * defined in leaflet.usermarker.css for leaflet-usermarkers
        */
        setColor: function(color) {

            //Default color is blue so don't need to do anything
            if(color != "blue")
            {       
                icon = L.divIcon({
                    className: "leaflet-usermarker-" + color,
                    iconSize: [34, 34],
                    iconAnchor: [17, 17],
                    popupAnchor: [0, -20],
                    labelAnchor: [11, -3],
                    html: ''
                });
                
                iconPulsing = L.divIcon({
                    className: "leaflet-usermarker-" + color,
                    iconSize: [34, 34],
                    iconAnchor: [17, 17],
                    popupAnchor: [0, -20],
                    labelAnchor: [11, -3],
                    html: '<i class="pulse"></i>'
                });
                            
                iconSmall = L.divIcon({
                    className: "leaflet-usermarker-small-" + color,
                    iconSize: [17, 17],
                    iconAnchor: [9, 9],
                    popupAnchor: [0, -10],
                    labelAnchor: [3, -4],
                    html: ''
                });

                iconPulsingSmall = L.divIcon({
                    className: "leaflet-usermarker-small-" + color,
                    iconSize: [17, 17],
                    iconAnchor: [9, 9],
                    popupAnchor: [0, -10],
                    labelAnchor: [3, -4],
                    html: '<i class="pulse"></i>'
                            });
                circleStyle = {
                    stroke: true,
                    color: "#03f",
                    weight: 3,
                    opacity: 0.5,
                    fillOpacity: 0.15,
                    fillColor: "#03f",
                    clickable: false
                };
            }
            // If a color that is not supported is specified
            // OR if it is specified as "blue", then set it to blue
            else 
            {
                icon = L.divIcon({
                    className: "leaflet-usermarker",
                    iconSize: [34, 34],
                    iconAnchor: [17, 17],
                    popupAnchor: [0, -20],
                    labelAnchor: [11, -3],
                    html: ''
            });
                
            iconPulsing = L.divIcon({
                className: "leaflet-usermarker",
                iconSize: [34, 34],
                iconAnchor: [17, 17],
                popupAnchor: [0, -20],
                labelAnchor: [11, -3],
                html: '<i class="pulse"></i>'
            });
                            
           iconSmall = L.divIcon({
                className: "leaflet-usermarker-small",
                iconSize: [17, 17],
                iconAnchor: [9, 9],
                popupAnchor: [0, -10],
                labelAnchor: [3, -4],
                html: ''
           });

           iconPulsingSmall = L.divIcon({
                className: "leaflet-usermarker-small",
                iconSize: [17, 17],
                iconAnchor: [9, 9],
                popupAnchor: [0, -10],
                labelAnchor: [3, -4],
                html: '<i class="pulse"></i>'
            });
                circleStyle = {
                    stroke: true,
                    color: "#03f",
                    weight: 3,
                    opacity: 0.5,
                    fillOpacity: 0.15,
                    fillColor: "#03f",
                    clickable: false
                };
            }
        },
    
        setAccuracy: function(accuracy)	{
            this._accuracy = accuracy;
            if (!this._accMarker) {
                this._accMarker = L.circle(this._latlng, accuracy, this.options.circleOpts).addTo(this._map);
            } else {
                this._accMarker.setRadius(accuracy);
            }
        },
    
        onAdd: function(map) {
            // super
            L.Marker.prototype.onAdd.call(this, map);
            this._accMarker.addTo(map);
        }
    });

    L.userMarker = function (latlng, options) {
        return new L.UserMarker(latlng, options);
    };
})(window);