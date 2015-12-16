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
	module : null,

	initialize : function(id, module) {
	    otp.configure(this, id);
		this.module = module;
	    otp.widgets.Widget.prototype.initialize.call(this, id, module, {
	        cssClass : 'otp-eventsWidget',
	        showHeader : false,
	        draggable : false,
			closeable : false,
	        transparent : true,
	        openInitially : true,
			sonOf:	'#sidebar'
	    });

		categoryView = new otp.modules.datex.CategoryView();
		categoryView.render().$el.appendTo(this.$());
		
		filterEventsView = new otp.modules.datex.FilterEventsView();
		filterEventsView.render().$el.appendTo(this.$());
		
	},

	setContentAndShow: function(events, module) {
		//console.log('numero eventi:', events.length)
		eventListView = new otp.modules.datex.EventListView({collection: events})	
		eventListView.rinfresca().$el.appendTo(this.$());
	
	},

	CLASS_NAME : "otp.widgets.EventsCategoryWidget"

});
