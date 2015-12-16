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
          latlng: null,
          id: null,
    },
    initialize: function(){

        this.latlng = L.latLng(this.get('lat') , this.get('lng'));

        this.set('visible', true);
        this.set('catVisible', true);
        this.set('filterVisible', true);
        
        this.set('roadNumber', this.get('roadNumber').replace("(", " (")  );
        this.set('roadName', this.get('roadName').replace("(", " (")  );

        //locationDescription
        if(this.get('secondaryLocation')){
			//qualche minuscola...
			this.set('primaryLocation',   this.get('primaryLocation').replace("Allacciamento","allacciamento").replace("Svincolo","svincolo")  );
			this.set('secondaryLocation', this.get('secondaryLocation').replace("Allacciamento","allacciamento").replace("Svincolo","svincolo"));
			this.set('locationDescription',  "fra "+this.get('primaryLocation')+" e "+this.get('secondaryLocation')  );
		}else{
			this.set('locationDescription', this.get('primaryLocation') );
        }

        //eventDirection
        if(this.get('direction') == "Entrambe"){
            this.set('eventDirection', "in entrambe le direzioni.");
        }
        else if (this.get('direction') != "" && this.get('secondaryLocation') != ""){
             this.set('eventDirection', "in direzione "+ this.get('direction')+"." );
        }

        //eventTerminated
        this.set('terminated', (this.get('status') == 'Terminato' ? true : false));

        //ritorna la riga con le date di inizio/fine a seconda dell'evento
        if(this.get('dob')=='LOS' || this.get('dob')=='PRE' || this.get('dob')=='ACC'|| this.get('dob')=='FOS')
			{this.set('eventDates',  "aggiornato alle " + this.get('formattedUpdateDate'));
		}
        else {
			var alDate="";
			if(this.get('endDate')){
				alDate= " al "+this.get('endDate').replace("23:59","");
			}
			this.set('eventDates',  "dal "+this.get('startDate').replace("00:00","") + alDate );
		}


    },
    distanceTo: function(point) {
        var distance = otp.modules.datex.Utils.distance;
        return distance(this.get('x'), this.get('y'), point.lng, point.lat);
    },
    toggleCatVisibility: function() {
        if (this.get('catVisible') == true)
             this.set('catVisible', false)
        else this.set('catVisible', true)
    },
    setFilterVisibility: function() {
        if (this.get('catVisible') == true)
             this.set('catVisible', false)
        else this.set('catVisible', true)
    },
});

otp.modules.datex.EventCollection =
    Backbone.Collection.extend({

    //url: otp.config.hostname + '/traffic-events?category=traffic,closure,weather,others',
    url: 'http://barrone.5t.torino.it/traffic-events?category=traffic,closure,weather,others',
    model: otp.modules.datex.EventModel,
    
    initialize: function(){
            //Backbone.eventBus.on('traffic-on', function(){alert('minchia, codeChanged!')});
            Backbone.eventBus.on('traffic-switch', this.trafficSwitch, this);
            Backbone.eventBus.on('closure-switch', this.closureSwitch, this);
            Backbone.eventBus.on('weather-switch', this.weatherSwitch, this);
            Backbone.eventBus.on('others-switch',  this.othersSwitch, this);
            
            Backbone.eventBus.on('filterEventsChanged',  this.filterEventsChanged, this);
            
            
    },
    trafficSwitch: function(){
        _.each(this.where({category: 'traffic'}), function(ev){
            ev.toggleCatVisibility();
      });
      Backbone.eventBus.trigger('rinfresca');
    },
    
    closureSwitch: function(){
        _.each(this.where({category: 'closure'}), function(ev){
            ev.toggleCatVisibility();
      });
      Backbone.eventBus.trigger('rinfresca');
    },
    
    weatherSwitch: function(){
        _.each(this.where({category: 'weather'}), function(ev){
            ev.toggleCatVisibility();
      });
      Backbone.eventBus.trigger('rinfresca');
    },
    
    othersSwitch: function(){
        _.each(this.where({category: 'others'}), function(ev){
            ev.toggleCatVisibility();
      });
      Backbone.eventBus.trigger('rinfresca');
    },
    
    filterEventsChanged: function(e){
            console.log('evento', e);
            var ftext = e.currentTarget.value;
            console.log('ftext', ftext);
            var filtered = this.filter( function(datexEvent){
                return datexEvent.get('eventDescription').indexOf(ftext) > -1
            });
            console.log('filtrati', filtered);
            this.each( function(datexEvent){
                    datexEvent.set('filterVisible', datexEvent.get('eventDescription').indexOf(ftext) > -1);
                });
            /*
            _.each(this.filter( function(datexEvent){
                    return datexEvent.get('eventDescription').indexOf(ftext) > -1
                }), function(ev){
                    ev.set('filterVisible': );
                    
            });
            */
            Backbone.eventBus.trigger('rinfresca');
    },
    
    getTraffic: function() {
      return this.where({category: 'traffic'});
    },

    getClosure: function() {
      return this.where({category: 'closure'});
    },

});
otp.modules.datex.CategoryView =
    Backbone.View.extend({
        tagName: 'div',
        className: 'lista-categorie',
        
        events: {
           "change #input-eventCategory-code" : function(){Backbone.eventBus.trigger('traffic-switch')},
           "change #input-eventCategory-chiusure" : function(){Backbone.eventBus.trigger('closure-switch')},
           "change #input-eventCategory-meteo" : function(){Backbone.eventBus.trigger('weather-switch')},
           "change #input-eventCategory-altro" : function(){Backbone.eventBus.trigger('others-switch')},
         },
    	render: function(){
    		//this.$el.html( this.template());
            this.$el.html( ich['otp-datexCategoryList']({
                    widgetId : this.id,
					code: 'Code e incidenti',
					chiusure: 'Chiusure e cantieri',
					meteo: 'Eventi atmosferici',
					altro: 'Altre informazioni'
                }) );
            return this;
	    },
});

otp.modules.datex.FilterEventsView =
    Backbone.View.extend({
        tagName: 'div',
        className: 'filtroEvt',
        
        events: {
           "keyup #input-filterEvents" : function(e){Backbone.eventBus.trigger('filterEventsChanged',e)},
         },
         render: function(){
     		//this.$el.html( this.template(this.model.toJSON()));
             this.$el.html( ich['otp-datexFilterEvents']({placeholder:'filtro eventi'})
             );
             return this;
 	    }
     });

otp.modules.datex.EventView =
    Backbone.View.extend({
        tagName: 'li',
        className: 'evento',
        events: {
            "click .dtxEvt":  function(){Backbone.eventBus.trigger('evtClicked', this.model.id)}
        },
        

    	render: function(){
    		//this.$el.html( this.template(this.model.toJSON()));
            this.$el.html( ich['otp-datexEventItem']({ev:this.model.toJSON()})
            );
            return this;
	    }
    });
otp.modules.datex.EventListView =
        Backbone.View.extend({
            tagName: 'ul',
            className: 'lista-eventi',
            //tagName: 'ul',
            //className: 'eventi',
            initialize: function() {
                this.collection.on('reset', this.render, this);
                Backbone.eventBus.on('rinfresca', this.rinfresca, this);
            },
            
            render: function(){
                this.collection.each(function(evt){    
                    if (evt.get('visible') && evt.get('catVisible')  && evt.get('filterVisible')) {
            			var eventView = new otp.modules.datex.EventView({ model: evt });
            			this.$el.append(eventView.render().el);
                    }
            	  }, this);
                return this;
            },
            
            rinfresca: function(){
                //console.log(this.collection.length)
                $('.lista-eventi').remove('');
                this.$el.empty();
                this.render().$el.appendTo($('#otp-eventsWidget'));
                return this;
            },
            
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

    trafficEventsWidget   : null,

    events    : null,
    eventLookup :   { },
    //eventsLayer   : null,
    
    trafficLayerGroup : null,
    closureLayerGroup : null,
    weatherLayerGroup : null,
    othersLayerGroup  : null,
    
    
    tagliatelLayer : null,

    initialize : function(webapp) {
        otp.modules.Module.prototype.initialize.apply(this, arguments);
        this.icons = new otp.modules.planner.IconFactory();
        Backbone.eventBus = _.extend({}, Backbone.Events);
        
        
        Backbone.eventBus.on('traffic-switch', this.trafficSwitchMap, this);
        Backbone.eventBus.on('closure-switch', this.closureSwitchMap, this);
        Backbone.eventBus.on('weather-switch', this.weatherSwitchMap, this);
        Backbone.eventBus.on('others-switch',  this.othersSwitchMap, this);
        
        Backbone.eventBus.on('evtClicked',  function(evid){
            this.markers[evid].openPopup();
        }, this);
        
        
        console.log('EventModule initialized');
        
    },
    /**
     * Called when the module is made active for the first time.
     */
    activate : function() {
        console.log('EventModule activated');
        if(this.activated) return;
        this.initEvents();
        //this.eventsLayer = new L.LayerGroup();
        this.trafficLayerGroup = new L.LayerGroup();
        this.closureLayerGroup = new L.LayerGroup();
        this.weatherLayerGroup = new L.LayerGroup();
        this.othersLayerGroup  = new L.LayerGroup();
        
        
        this.tagliatelLayer = new L.tileLayer.wms("http://172.21.9.6:8180/geoserver/gwc/service/wms?&configuration=optima&", {
                                        layers: 'optima:rlin_tre_fore0_cache',
                                        format: 'image/png',
                                        transparent: true,
                                        version: '1.1.0',
                                        //attribution: "myattribution",
                                    });
        this.tagliatelLayer.setZIndex(100);

        this.trafficEventsWidget = new otp.widgets.EventsCategoryWidget('otp-eventsWidget', this);

        var this_ = this;
        setInterval(function() {
            this_.reloadEvents();
        }, 3000*1000);//raf *10
    },

    /**
     * Called when the module is selected as active by the user. When the module
     * is selected for the first time, the call to selected() follows the calls
     * to activate() and restore().
     */
    selected : function() {
        this.moduleSelected = true;
        var lmap = this.webapp.map.lmap;
        lmap.addLayer(this.trafficLayerGroup);
        lmap.addLayer(this.closureLayerGroup);
        lmap.addLayer(this.weatherLayerGroup);
        lmap.addLayer(this.othersLayerGroup);
        
        //this.refresh();
        this.webapp.map.lmap.on('dragend zoomend', $.proxy(this.refresh, this));
        this.webapp.map.lmap.addLayer(this.tagliatelLayer);

        this.trafficEventsWidget.show();
        this.trafficEventsWidget.setContentAndShow(this.events, this);
    },


    /**
     * Called when the module loses focus due to another being selected as
     * active by the user.
     */
    deselected : function() {
        this.moduleSelected = false;
        var lmap = this.webapp.map.lmap;
        //lmap.removeLayer(this.eventsLayer);
        lmap.removeLayer(this.trafficLayerGroup);
        lmap.removeLayer(this.closureLayerGroup);
        lmap.removeLayer(this.weatherLayerGroup);
        lmap.removeLayer(this.othersLayerGroup);
        
        lmap.removeLayer(this.tagliatelLayer);
        this.trafficEventsWidget.hide();
    },

    onResetEvents : function(events) {
        this.resetEventMarkers();
    },

    resetEventMarkers : function() {
        this.events.each(function(event) {
            if (event.get('catVisible'))
                this.setEventMarker(event);
        }, this);
    },
/*
    clearEventMarkers : function() {
        _.each(_.keys(this.markers), function(eventId) {
            this.removeEventMarker(eventId);
        s}, this);
    },
*/
    getEventMarker : function(event) {
        if (event instanceof Backbone.Model)
            return this.markers[event.id];
        else
            return this.markers[event];
    },
/*
    removeEventMarker : function(event) {
        var marker = this.getEventMarker(event);
        if (marker)
            this.eventsLayer.removeLayer(marker);
    },
*/
    addEventMarker : function(event, title, icon) {
        var eventData = event.toJSON(),
            marker;
        icon = icon || this.icons.getEventMarker(eventData);

        //console.log(event);
        marker = new L.Marker(new L.LatLng(eventData.lat, eventData.lng), {icon: icon});
        this.markers[event.id] = marker;
        //this.eventsLayer.addLayer(marker);
        if(event.get('category') == 'traffic')
            this.trafficLayerGroup.addLayer(marker);
        else if (event.get('category') == 'closure')
            this.closureLayerGroup.addLayer(marker);
        else if (event.get('category') == 'weather')
            this.weatherLayerGroup.addLayer(marker);
        else if (event.get('category') == 'others')
            this.othersLayerGroup.addLayer(marker);
            
        
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
        clazz = this;
        this.events.fetch({
            success: function(){
                clazz.refresh()
            },
            reset: true});
    },

    constructEventInfo : function(title, event) {
        name=event.eventDescription;

        header0 = name.indexOf(' ')>0 ? name.substring(0,name.indexOf(' ')+1):name;
    	header1 = name.indexOf(' ')>0 ? name.substring(name.indexOf(' ')):'';

    	info = '<h5 class="event"><span>'+header0+'</span>'+header1+'</h5>';
        info += event.primaryLocation
        return info;
    },
    
    trafficSwitchMap : function(){
        var lmap = this.webapp.map.lmap;
        if( lmap.hasLayer(this.trafficLayerGroup)  ){
            lmap.removeLayer(this.trafficLayerGroup);
        } else lmap.addLayer(this.trafficLayerGroup);
    },
    closureSwitchMap : function(){
        var lmap = this.webapp.map.lmap;
        if( lmap.hasLayer(this.closureLayerGroup)  ){
            lmap.removeLayer(this.closureLayerGroup);
        } else lmap.addLayer(this.closureLayerGroup);
    },
    weatherSwitchMap : function(){
        var lmap = this.webapp.map.lmap;
        if( lmap.hasLayer(this.weatherLayerGroup)  ){
            lmap.removeLayer(this.weatherLayerGroup);
        } else lmap.addLayer(this.weatherLayerGroup);
    },
    othersSwitchMap : function(){
        var lmap = this.webapp.map.lmap;
        if( lmap.hasLayer(this.othersLayerGroup)  ){
            lmap.removeLayer(this.othersLayerGroup);
        } else lmap.addLayer(this.othersLayerGroup);
    },
    
    //refresh event markers based on zoom level
    refresh : function() {
        this.filterEventsOnMapBounds();
        this.trafficEventsWidget.setContentAndShow(this.events, this);
    	var lmap = this.webapp.map.lmap;
        //console.log('markers', this.markers);
        /*
        if(this.moduleSelected){
        	 if( lmap.getZoom() < 8){
                 console.log('togli stazioni'); 
                 if( lmap.hasLayer(this.trafficLayerGroup)  ){
                  lmap.removeLayer(this.trafficLayerGroup);
                 }
                 if( lmap.hasLayer(this.closureLayerGroup)  ){
                  lmap.removeLayer(this.closureLayerGroup);
                 }
                 if( lmap.hasLayer(this.weatherLayerGroup)  ){
                  lmap.removeLayer(this.weatherLayerGroup);
                 }
                 if( lmap.hasLayer(this.othersLayerGroup)  ){
                  lmap.removeLayer(this.othersLayerGroup);
                 }
        	 }
        	 if(lmap.getZoom() >= 8   &&  lmap.getZoom() < 16){
        		 console.log('metti stazioni piccole');
                 if( !lmap.hasLayer(this.trafficLayerGroup)){
        		    lmap.addLayer(this.trafficLayerGroup);
                 }
                 if( !lmap.hasLayer(this.closureLayerGroup)){
                    lmap.addLayer(this.closureLayerGroup);
                 }
                 if( !lmap.hasLayer(this.weatherLayerGroup)){
                    lmap.addLayer(this.weatherLayerGroup);
                 }
                 if( !lmap.hasLayer(this.othersLayerGroup)){
                    lmap.addLayer(this.othersLayerGroup);
                 }

        	 }
        	 if(lmap.getZoom() >= 16  ){
        		 console.log('icone grandi');
        	 }
             
        }*/
    },
    filterEventsOnMapBounds: function() {
            var bb = this.webapp.map.lmap.getBounds();
            this.events.each(function(event) {
                if (bb.contains(event.latlng))
                     event.set('visible', true)
                else event.set('visible', false)
            });

    },


    CLASS_NAME : "otp.modules.datex.EventModule"
});
