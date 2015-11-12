/* This program is free software: you can redistribute it and/or
   modify it under the terms of the GNU Lesser General Public License
   as published by the Free Software Foundation, either version 3 of
   the License, or (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>. 
*/

otp.namespace("otp.modules.datex");

otp.modules.datex.EventModel = 
    Backbone.Model.extend({
    
    defaults: {
          id: null,
          timeRanges: [],
          cause: null,
          effect: null,
          url: null,
          descriptionText: null
    },
    distanceTo: function(point) {
        var distance = otp.modules.datex.Utils.distance;
        return distance(this.get('x'), this.get('y'), point.lng, point.lat);
    }
});

otp.modules.datex.EventCollection = 
    Backbone.Collection.extend({
    
    url: otp.config.hostname + '/traffic-events',
    model: otp.modules.datex.EventModel,
    
    sync: function(method, model, options) {
        options.dataType = 'json';
        options.data = options.data || {};
        if(otp.config.routerId !== undefined) {
            options.data.routerId = otp.config.routerId;
        }
        //Sends wanted translation to server
        options.data.locale = otp.config.locale.config.locale_short;
        return Backbone.sync(method, model, options);
    },
    /*
    parse: function(rawData, options) {
        return _.filter(rawData.events, function(event){
                return event.bikesAvailable != 0 ||  event.spacesAvailable != 0 ;
        });
    }*/

});

otp.modules.datex.Utils = {
    distance : function(x1, y1, x2, y2) {
        return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    }    
};

/* main class */

otp.modules.datex.EventModule = 
    otp.Class(otp.modules.Module, {
    
    //moduleName  : _tr("Bike Share Planner"),
    moduleName  : "Eventi di traffico",

    categoriesWidget   : null,
    
    events    : null,    
    eventLookup :   { },
    eventsLayer   : null,
     
    initialize : function(webapp) {
        otp.modules.Module.prototype.initialize.apply(this, arguments);
        this.icons = new otp.modules.planner.IconFactory();
        console.log('EventModule initialized');
        //this.addWidget(this.categoriesWidget);
        //this.templateFiles.push('otp/modules/planner/planner-templates.html');
    },
    
    activate : function() {
        if(this.activated) return;
        //otp.modules.planner.PlannerModule.prototype.activate.apply(this);
        //this.mode = "WALK,BICYCLE_RENT";
        this.initEvents();
        this.eventsLayer = new L.LayerGroup();
        //raf aagiungo il layer in funzione del livello di zoom
        //this.addLayer("Bike Stations", this.eventsLayer);
        this.webapp.map.lmap.on('dragend zoomend', $.proxy(this.refresh, this));
        /*
        this.categoriesWidget = new otp.widgets.EventsCategoryWidget(this.id+"-categoriesWidget", this, {
            title : _tr('Trip Options'),     sonOf: '#sidebar',
        });
        */
        this.categoriesWidget = new otp.widgets.EventsCategoryWidget('otp-eventsWidget', this);
        //this.categoriesWidget.setContentAndShow(this.events, this);
        //this.categoriesWidget.show();
        
        

        var this_ = this;
        setInterval(function() {
            this_.reloadEvents();
        }, 300000);//raf *10
        
        
        //this.initOptionsWidget();
        
        //this.defaultQueryParams.mode = "WALK,BICYCLE_RENT";
        //this.optionsWidget.applyQueryParams(this.defaultQueryParams);
       
    },
/*    
    initOptionsWidget : function() {
        this.optionsWidget = new otp.widgets.tripoptions.TripOptionsWidget(
            'otp-'+this.id+'-optionsWidget', this, {
                title : _tr('Trip Options'),     
            }
        );

        if(this.webapp.geocoders && this.webapp.geocoders.length > 0) {
            this.optionsWidget.addControl("locations", new otp.widgets.tripoptions.LocationsSelector(this.optionsWidget, this.webapp.geocoders), true);
            this.optionsWidget.addVerticalSpace(12, true);
        }
                
        //this.optionsWidget.addControl("time", new otp.widgets.tripoptions.TimeSelector(this.optionsWidget), true);
        //this.optionsWidget.addVerticalSpace(12, true);
        
        
        //var modeSelector = new otp.widgets.tripoptions.ModeSelector(this.optionsWidget);
        //this.optionsWidget.addControl("mode", modeSelector, true);

        this.optionsWidget.addControl("triangle", new otp.widgets.tripoptions.BikeTriangle(this.optionsWidget));

        this.optionsWidget.addControl("biketype", new otp.widgets.tripoptions.BikeType(this.optionsWidget));

        this.optionsWidget.autoPlan = true;

        this.optionsWidget.addSeparator();
        this.optionsWidget.addControl("submit", new otp.widgets.tripoptions.Submit(this.optionsWidget));
    },
*/    
/*
    planTripStart : function() {
        this.resetEventMarkers();
    },
*/    
/*    processPlan : function(tripPlan, restoring) {
        var itin = tripPlan.itineraries[0];
        var this_ = this;
        
      //raf vedi itinWidget
        if(this.itinWidget == null) {
            this.itinWidget = new otp.widgets.ItinerariesWidget(this.id+"-itinWidget", this);
        }
        if(restoring && this.restoredItinIndex) {
            this.itinWidget.show();
            this.itinWidget.updateItineraries(tripPlan.itineraries, tripPlan.queryParams, this.restoredItinIndex);
            this.restoredItinIndex = null;
        } else  {
            this.itinWidget.show();
            this.itinWidget.updateItineraries(tripPlan.itineraries, tripPlan.queryParams);
        }
                                
        this.drawItinerary(itin);
        
        if(tripPlan.queryParams.mode === 'WALK,BICYCLE_RENT'  &&   itin.itinData.legs.length > 1  ) { // bikeshare trip   && not only foot leg
            var rentedBikeLegs= _.filter(itin.itinData.legs, function(leg){
                    return leg.rentedBike;
            });
            var eventFrom = rentedBikeLegs[0].from;
            eventFrom.lng = eventFrom.lon;//add lng property as subsequent functions read that
            var eventTo = rentedBikeLegs[rentedBikeLegs.length-1].to;
            eventTo.lng = eventTo.lon;
            var start_and_end_events = this.processEvents(eventFrom,eventTo );

        }
        else { // "my own bike" trip
           	this.resetEventMarkers();
        }	

        //this.resultsWidget.show();
        //this.resultsWidget.newItinerary(itin);
                    
        if(start_and_end_events !== undefined && tripPlan.queryParams.mode === 'WALK,BICYCLE_RENT') {
            if(start_and_end_events['start'] && start_and_end_events['end']) {
           	    this.bikeeventsWidget.setContentAndShow(
           	        start_and_end_events['start'], 
           	        start_and_end_events['end'],
           	        this);
           	    this.bikeeventsWidget.show();
           	}
           	else
           	    this.bikeeventsWidget.hide();
        }
       	else {
       	    this.bikeeventsWidget.hide();
       	}
    },
*/    
/*    noTripFound : function() {
        this.resultsWidget.hide();
    },
*/        
    
    onResetEvents : function(events) {
        this.resetEventMarkers();
        this.categoriesWidget.setContentAndShow(this.events, this);
    },
    
    resetEventMarkers : function() {
        this.events.each(function(event) {
            this.setEventMarker(event);
        }, this);
    },

    clearEventMarkers : function() {
        _.each(_.keys(this.markers), function(eventId) {
            this.removeEventMarker(eventId);
        s}, this);
    },
    
    getEventMarker : function(event) {
        if (event instanceof Backbone.Model)
            return this.markers[event.id];
        else
            return this.markers[event];
    },
    
    removeEventMarker : function(event) {
        var marker = this.getEventMarker(event);
        if (marker)
            this.eventsLayer.removeLayer(marker);
    },
    
    addEventMarker : function(event, title, icon) {
        var eventData = event.toJSON(),
            marker;
        icon = icon || this.icons.getEventMarker(eventData);
        
        //console.log(event);
        marker = new L.Marker(new L.LatLng(eventData.lat, eventData.lng), {icon: icon});
        this.markers[event.id] = marker;
        this.eventsLayer.addLayer(marker);
        marker.bindPopup(this.constructEventInfo(title, eventData));
    },
    
    setEventMarker : function(event, title, icon) {
        var marker = this.getEventMarker(event);
        if (!marker)
            marker = this.addEventMarker(event, title, icon);
        else {
            this.updateEventMarker(marker, event, title, icon);
        }
    },
    
    updateEventMarker : function(marker, event, title, icon) {
        var eventData = event.toJSON();
        
        marker.setIcon(icon || this.icons.getEventMarker(eventData));

        marker.bindPopup(this.constructEventInfo(title, eventData));
    },
    
    initEvents : function() {
        this.markers = {};
        this.events = new otp.modules.datex.EventCollection();
        this.events.on('reset', this.onResetEvents, this);
        
        this.events.fetch();
    },

    reloadEvents : function(events) {
        this.events.fetch();
    },
            
    constructEventInfo : function(title, event) {
        name=event.eventDescription;
    	
        header0 = name.indexOf(' ')>0 ? name.substring(0,name.indexOf(' ')+1):name;
    	header1 = name.indexOf(' ')>0 ? name.substring(name.indexOf(' ')):'';
    	
    	info = '<h5 class="event"><span>'+header0+'</span>'+header1+'</h5>';
        info += event.primaryLocation
        return info;
    },
    //refresh event markers based on zoom level
    refresh : function() {
    	var lmap = this.webapp.map.lmap;
    	 if( lmap.getZoom() < 12   && lmap.hasLayer(this.eventsLayer)  ){
              lmap.removeLayer(this.eventsLayer);
    		 console.log('togli stazioni');
    	 }
    	 if(lmap.getZoom() >= 12   &&  lmap.getZoom() < 16 && !lmap.hasLayer(this.eventsLayer)){
    		 lmap.addLayer(this.eventsLayer);
    		/* this.events.each(function(event) {
    			 setStationMarker(event, 'no-title', this.icons.getMedium(eventData));
    		 });*/
    		 
    		 console.log('metti stazioni piccole');
    	 }
    	 if(lmap.getZoom() >= 16  ){
    		 console.log('icone grandi');
    	 }
    },
                
    CLASS_NAME : "otp.modules.datex.BikeShareModule"
});
