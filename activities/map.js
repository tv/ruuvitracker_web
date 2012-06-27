
define([
    'underscore'
  , 'activity'
  , 'intent'
  , 'leaflet'
  , 'collections/trackers'
  , 'hbs!tmpls/map/index'
], function(_, Activity, Intent, Leaflet, Trackers) {
    "use strict";

    var mapActivity = Activity.extend();

    mapActivity.uid = 'mapActivity';
    mapActivity.template = 'map/index';

    mapActivity._markers = [];

    mapActivity.show = function(intent) {
        if (!this.rendered) {
            this.loading();
            this.render({}, function() {
                this.show(intent);
            });
        } else {
            //
        }
    };

    mapActivity.registerIntent('map:show', mapActivity.show);

    mapActivity.initMap = function() {
        if (this.map) {
            throw "Map already initialized!";
        }

        var center = new Leaflet.LatLng(60.168564, 24.941111);

        var cloudmade = new Leaflet.TileLayer(
            'http://{s}.tile.cloudmade.com/b1e35f2aca4f49899b04ab9e89ae3b18/997/256/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
                }
            );

        var mm = new Leaflet.TileLayer(
            'http://tiles.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.jpg', {
                attribution: 'Maanmittauslaitos'
              , maxZoom: 18
            }
        );

        var map = this.map = new Leaflet.Map(
            this.sel('.map-container')[0],
            {
              layers: [
                  cloudmade
                , mm
              ]
            }
        );
        var layersControl = new Leaflet.Control.Layers({
            "CloudMade": cloudmade
          , "Maanmittauslaitos": mm
        });

        map.addControl(layersControl);

        this.trackers = new Trackers();

        this.trackers.on('reset', function(e) {
            console.log('tracker updated');
            Intent.create('map:loadEvents').send();

            /*me.timer = setInterval(function() {
                Intent.create('map:loadEvents').send();
            }, 5000);*/

        });

        var me = this;
        this.map.on("load", function() {
            me.trackers.fetchWithSettings();
        });

        map.setView(center, 13);

        return true;
    };

    mapActivity.onRender(mapActivity.initMap);

    mapActivity.loadEvents = function() {
        if (!this.trackers || this.trackers.length === 0) {
            return;
        }

        var me = this;
        this.trackers.each(function(tracker) {
            console.log('tracker::loadEvents', tracker);
            tracker.get('events').on('reset', function(events) {
                console.log('tracker::events', events);

                var points = [];
                events.each(function(ev) {
                    var ll = new Leaflet.LatLng(
                        ev.get('location').latitude
                      , ev.get('location').longitude
                    );
                    points.push(ll);

                    tracker.lastPoint = ll;
                });

                if (tracker.path === undefined) {
                    tracker.path = new Leaflet.Polyline(points, {color: 'red'});

                    me.map.addLayer(tracker.path);
                } else {
                    tracker.path.setLatLngs(points);
                }
            });

            tracker.get('events').fetch({
                data: {
                    maxResults: 10
                }
            });
        });

    };
    mapActivity.registerIntent('map:loadEvents', mapActivity.loadEvents);

    return mapActivity;
});
