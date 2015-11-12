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

otp.namespace("otp.widgets");

otp.widgets.EventsCategoryWidget = 
	otp.Class(otp.widgets.Widget, {
	
	_div: null,
	
	start_button: null,
	
	end_button: null,
		 
	initialize : function(id, module) {
	    otp.configure(this, id);
	    otp.widgets.Widget.prototype.initialize.call(this, id, module, {
	        cssClass : 'otp-eventsWidget',
	        showHeader : true,
	        draggable : true,
			closeable : true,
	        transparent : true,
	        openInitially : true,
			sonOf:	'#sidebar'
	    });
	     
	    //this.hide();
	},
	
	setContentAndShow: function(events, module) {
		console.log('events è', events)
	    /*var start = startStation.toJSON(),
	        end = endStation.toJSON();

		// Fit station names to widget:
		start.name = start.name.length > 50 ? start.name.substring(0,50) + "..." : start.name;
		end.name = end.name.length > 50 ? end.name.substring(0,50) + "..." : end.name;
*/
		//$("#datex-categoriesWidget").empty();
		

                
        ich['otp-datexEventList']({
                    widgetId : this.id,
					category: 'Lavori',
         }).appendTo(this.$());

		
		events.each(function(evento, index){
			//var ev = evento.toJSON();
			if(index < 5)
		    	ich['otp-datexEventItem']({ev:evento.toJSON()}).appendTo($('#otp-datexEventList ul'));
		});
		
/*        var start_marker = module.getStationMarker(startStation);
        var end_marker = module.getStationMarker(endStation);

        $("#pickup_btn").click(function(e) {
        	e.preventDefault();
        	start_marker.openPopup();
        });

        $("#dropoff_btn").click(function(e) {
        	e.preventDefault();
        	end_marker.openPopup();
        });
        
*/        
	},

	CLASS_NAME : "otp.widgets.EventsCategoryWidget"
	 
});
