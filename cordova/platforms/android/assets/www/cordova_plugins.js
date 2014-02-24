cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.phonegap.plugins.PushPlugin/www/PushNotification.js",
        "id": "com.phonegap.plugins.PushPlugin.PushNotification",
        "clobbers": [
            "PushNotification"
        ]
    },
    {
        "file": "plugins/com.tourtrak.geoplugin/www/js/plugins/CDVInterface.js",
        "id": "com.tourtrak.geoplugin.CDVInterface",
        "clobbers": [
            "window.CDVInterface"
        ]
    },
    {
        "file": "plugins/edu.rit.se.TourTrakAndroidPlugin/assets/www/js/CDVInterface.js",
        "id": "edu.rit.se.TourTrakAndroidPlugin.CDVInterface",
        "clobbers": [
            "window.CDVAndroidInterface"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.geolocation/www/Coordinates.js",
        "id": "org.apache.cordova.geolocation.Coordinates",
        "clobbers": [
            "Coordinates"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.geolocation/www/PositionError.js",
        "id": "org.apache.cordova.geolocation.PositionError",
        "clobbers": [
            "PositionError"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.geolocation/www/Position.js",
        "id": "org.apache.cordova.geolocation.Position",
        "clobbers": [
            "Position"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.geolocation/www/geolocation.js",
        "id": "org.apache.cordova.geolocation.geolocation",
        "clobbers": [
            "navigator.geolocation"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.network-information/www/network.js",
        "id": "org.apache.cordova.network-information.network",
        "clobbers": [
            "navigator.connection",
            "navigator.network.connection"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.network-information/www/Connection.js",
        "id": "org.apache.cordova.network-information.Connection",
        "clobbers": [
            "Connection"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.phonegap.plugins.PushPlugin": "2.1.1",
    "com.tourtrak.geoplugin": "0.1.0",
    "edu.rit.se.TourTrakAndroidPlugin": "0.1.0",
    "org.apache.cordova.device": "0.2.8",
    "org.apache.cordova.geolocation": "0.3.6",
    "org.apache.cordova.console": "0.2.7",
    "org.apache.cordova.network-information": "0.2.7"
}
// BOTTOM OF METADATA
});