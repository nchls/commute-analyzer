import pvt from './private';

window.init = function() {
	var directionsService = new google.maps.DirectionsService;

	console.log('directions!');

	directionsService.route({
		origin: '25 Pearl St., Portland, ME',
		destination: '354 Brown Road, Pownal, ME',
		travelMode: 'DRIVING'
	}, function(response, status) {
		console.log('response!', response);
	});
};

document.addEventListener('DOMContentLoaded', function() {
	var gmScript = document.createElement('script');
	gmScript.src = 'https://maps.googleapis.com/maps/api/js?key=' + pvt.clientKey + '&callback=init';
	document.body.appendChild(gmScript);
});
