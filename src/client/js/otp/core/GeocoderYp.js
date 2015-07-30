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

otp.namespace("otp.core");

/**
 *  NB: non può funzionare per via del CORS  :-(
 * otp.core.GeocoderYp is an alternative to the otp.core.GeocoderBuiltin geocoder
 * 
 * It will add a geocoder that can make requests to the YP geocoding service 
 *
 * USAGE: Replace or add the geocoder config inside config.geocoders in config.js with:
 *
 * {
 *     name: 'GeocoderYp',
 *     className: 'otp.core.GeocoderYp',
 *     //url: 'http://example.bagurl.org/api/v0/geocode/json',
 *     //addressParam: 'address'
 * }
 *
 * NOTE: the UI can handle multiple geocoders, it offers a dropdown in that case
 *
 */

otp.core.GeocoderYp = otp.Class({
    
    initialize : function(url, addressParam) {
        this.url = url;
        this.addressParam = addressParam;
    },

    geocode : function(address, callback) {
        var adesso = $.now();
        var params = {'dv' : address, 'sito':'ac_api', 'st': 'it,ch', 'lg':'ita',
                      'opentipo':-1, 'nresout':10, 'nresac':50, '_': adesso,
                      'loclon':7.65115 , 'loclat':45.06506};
        var this_ = this;

        // Make sure to add the star at the end of the query to return more free-matching addresses
        //params[this.addressParam] = address+"*";

        $.getJSON(this.url, params)
            .done( function (data) {
                // Success: transform the data to a JSON array of objects containing lat, lng, and description fields as the client expects
                data = data.r.filter(function(r){                    
                        return r.reg == 'Piemonte';
                    
                }).map(function (r) {

                        var desc = (r.topo != undefined ? r.topo + ', ' : '')
                        desc +=    (r.fraz != undefined ? r.fraz  + ', ' : '')
                        desc +=    (r.com != undefined ? r.com +' ('+r.prov +')' : '')
                        
                        return {
                            //"description": (r.topo != undefined ? r.topo : r.fraz) + ", "+ r.com,
                            "description": desc,
                            "lat": r.lat,
                            "lng": r.lon,
                        };

                });
                callback.call(this, data);
            })
            .fail( function (err) {
                alert("Something went wrong retrieving the geocoder results from: " + this_.url + " for: " + address);
            });
    }

});
