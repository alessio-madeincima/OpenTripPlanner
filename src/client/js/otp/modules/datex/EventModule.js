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
          papero: 'paperino',
          latlng: null,
          id: null,
          timeRanges: [],
          cause: null,
          effect: null,
          url: null,
          descriptionText: null
    },
    initialize: function(){
        
        this.latlng = L.latLng(this.attributes['lat'] , this.attributes['lng']);
        this.attributes['visible'] = true; 
        this.attributes['roadNumber'] = this.attributes['roadNumber'].replace("(", " (");
        this.attributes['roadName'] = this.attributes['roadName'].replace("(", " (");
        
        //locationDescription
        if(this.attributes['secondaryLocation']){
			//qualche minuscola...
			this.attributes['primaryLocation']=this.attributes['primaryLocation'].replace("Allacciamento","allacciamento").replace("Svincolo","svincolo");
			this.attributes['secondaryLocation']=this.attributes['secondaryLocation'].replace("Allacciamento","allacciamento").replace("Svincolo","svincolo");			
			this.attributes['locationDescription'] = "fra "+this.attributes['primaryLocation']+" e "+this.attributes['secondaryLocation']; 
		}else{
			this.attributes['locationDescription'] =  this.attributes['primaryLocation'];
        }
                
        //eventDirection
        if(this.attributes['direction'] == "Entrambe"){
            this.attributes['eventDirection'] = "in entrambe le direzioni.";			
        }
        else if (this.attributes['direction'] != "" && this.attributes['secondaryLocation'] != ""){
             this.attributes['eventDirection'] = "in direzione "+ this.attributes['direction']+".";
        }

        //eventTerminated
        this.attributes['terminated'] = (this.attributes['status'] == 'Terminato' ? true : false);
    
        //ritorna la riga con le date di inizio/fine a seconda dell'evento
        if(this.attributes['dob']=='LOS' || this.attributes['dob']=='PRE' || this.attributes['dob']=='ACC'|| this.attributes['dob']=='FOS')
			{this.attributes['eventDates'] =  "aggiornato alle " + this.attributes['formattedUpdateDate'];
		}
        else {
			var alDate="";
			if(this.attributes['endDate']){
				alDate= " al "+this.attributes['endDate'].replace("23:59","");
			}
			this.attributes['eventDates'] =  "dal "+this.attributes['startDate'].replace("00:00","") + alDate; 
		}
        
        
    },
    distanceTo: function(point) {
        var distance = otp.modules.datex.Utils.distance;
        return distance(this.get('x'), this.get('y'), point.lng, point.lat);
    },
    
});

otp.modules.datex.EventCollection = 
    Backbone.Collection.extend({
    
    url: otp.config.hostname + '/traffic-events?category=traffic,closure,weather,others',
    model: otp.modules.datex.EventModel,
    /*
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
    */
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
    moduleSelected: null, //raf var di stato

    categoriesWidget   : null,
    
    events    : null,    
    eventLookup :   { },
    eventsLayer   : null,
    tagliatelLayer : null, 
     
    initialize : function(webapp) {
        otp.modules.Module.prototype.initialize.apply(this, arguments);
        this.icons = new otp.modules.planner.IconFactory();
        console.log('EventModule initialized');
        //this.addWidget(this.categoriesWidget);
        //this.templateFiles.push('otp/modules/planner/planner-templates.html');
    },
    
    activate : function() {
        console.log('EventModule activated');
        if(this.activated) return;
        //otp.modules.planner.PlannerModule.prototype.activate.apply(this);
        //this.mode = "WALK,BICYCLE_RENT";
        this.initEvents();
        this.eventsLayer = new L.LayerGroup();
        this.tagliatelLayer = new L.tileLayer.wms("http://172.21.9.6:8180/geoserver/gwc/service/wms?&configuration=optima&", {
                                        layers: 'optima:rlin_tre_fore0_cache',
                                        format: 'image/png',
                                        transparent: true,
                                        version: '1.1.0',
                                        //attribution: "myattribution",
                                    });
        this.tagliatelLayer.setZIndex(100);
        
        //raf aagiungo il layer in funzione del livello di zoom
        //this.addLayer("Bike Stations", this.eventsLayer);
        //this.webapp.map.lmap.on('dragend zoomend', $.proxy(this.refresh, this));
        
        this.categoriesWidget = new otp.widgets.EventsCategoryWidget('otp-eventsWidget', this);
        //this.categoriesWidget.setContentAndShow(this.events, this);
        //this.categoriesWidget.show();
        

        var this_ = this;
        setInterval(function() {
            this_.reloadEvents();
        }, 20000);//raf *10
        
        
        //this.initOptionsWidget();
        
        //this.defaultQueryParams.mode = "WALK,BICYCLE_RENT";
        //this.optionsWidget.applyQueryParams(this.defaultQueryParams);
       
    },
    
    /**
     * Called when the module is selected as active by the user. When the module
     * is selected for the first time, the call to selected() follows the calls
     * to activate() and restore().
     */

    selected : function() {
        //raf aagiungo il layer in funzione del livello di zoom
        //this.addLayer("Bike Stations", this.eventsLayer);
        this.moduleSelected = true;
        this.refresh();
        this.webapp.map.lmap.on('dragend zoomend', $.proxy(this.refresh, this));
        this.categoriesWidget.show();
        /*
        this.webapp.map.lmap.addLayer(new L.tileLayer.wms("http://172.21.9.6:8180/geoserver/gwc/service/wms?&configuration=optima&", {
                                        layers: 'optima:rlin_tre_fore0_cache',
                                        format: 'image/png',
                                        transparent: true,
                                        version: '1.1.0',
                                        //attribution: "myattribution",
                                        }) , 'traffico');
        */
        this_ = this;
        //setTimeout(function() {
                this_.webapp.map.lmap.addLayer(this_.tagliatelLayer);
        //}, 300);
        
        
    },
     

    /**
     * Called when the module loses focus due to another being selected as
     * active by the user.
     */
        
    deselected : function() {
        //raf aagiungo il layer in funzione del livello di zoom
        //this.addLayer("Bike Stations", this.eventsLayer);
        
        //this.webapp.map.lmap.off('dragend zoomend');
        this.moduleSelected = false;
        var lmap = this.webapp.map.lmap;
        lmap.removeLayer(this.eventsLayer);
        lmap.removeLayer(this.tagliatelLayer);
        this.categoriesWidget.hide();
        
        
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
        
        this.events.fetch({reset: true});
    },

    reloadEvents : function(events) {
        this.events.fetch({reset: true});
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
        this.filterEventsOnMapBounds();
        this.categoriesWidget.setContentAndShow(this.events, this);
    	 var lmap = this.webapp.map.lmap;
         if(this.moduleSelected){
        	 if( lmap.getZoom() < 8   && lmap.hasLayer(this.eventsLayer)  ){
                  lmap.removeLayer(this.eventsLayer);
        		 console.log('togli stazioni');
        	 }
        	 if(lmap.getZoom() >= 8   &&  lmap.getZoom() < 16 && !lmap.hasLayer(this.eventsLayer)){
        		 lmap.addLayer(this.eventsLayer);
                 
        		/* this.events.each(function(event) {
        			 setStationMarker(event, 'no-title', this.icons.getMedium(eventData));
        		 });*/
        		 
        		 console.log('metti stazioni piccole');
        	 }
        	 if(lmap.getZoom() >= 16  ){
        		 console.log('icone grandi');
        	 }
        }
    },
    filterEventsOnMapBounds: function() {
            var bb = this.webapp.map.lmap.getBounds();
            this.events.each(function(event) {
                if (bb.contains(event.latlng))
                     event.attributes['visible'] = true
                else event.attributes['visible'] = false
            });
        
    },
    
                
    CLASS_NAME : "otp.modules.datex.EventModule"
});
