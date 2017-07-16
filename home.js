var BasePage = require("../../shared/BasePage");
var topmost = require("ui/frame").topmost;
var geolocation = require("nativescript-geolocation");

var HomePage = function() {};
HomePage.prototype = new BasePage();
HomePage.prototype.constructor = HomePage;

// Place any code you want to run when the home page loads here.
HomePage.prototype.contentLoaded = function() {}

HomePage.prototype.fun = function() {
  var page = topmost().currentPage;
  var logo = page.getViewById("logo");
  logo.animate({
    rotate: 3600,
    duration: 3000
  }).then(function() {
    logo.rotate = 0;
  });
}
HomePage.prototype.enableLocationTap= function(args) {
    if (!geolocation.isEnabled()) {
        geolocation.enableLocationRequest();
    }
}

HomePage.prototype.buttonGetLocationTap=function (args) {
    var location = geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000}).
    then(function(loc) {
        if (loc) {
            console.log("Current location is: " + loc);
        }
    }, function(e){
        console.log("Error: " + e.message);
    });
}

if (typeof(Number.prototype.toRad) === "undefined")
{
	Number.prototype.toRad = function()
	{
		return this * Math.PI / 180;
	}
}

function getDistance(lat1, lon1, lat2, lon2)
{
	var a = 6378137, b = 6356752.314245,  f = 1/298.257223563;
	var L = (lon2-lon1).toRad();
	var U1 = Math.atan((1-f) * Math.tan(lat1.toRad()));
	var U2 = Math.atan((1-f) * Math.tan(lat2.toRad()));
	var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
	var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

	var lambda = L, lambdaP, iterLimit = 100;
	do
	{
		var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
		var sinSigma = Math.sqrt((cosU2*sinLambda) * (cosU2*sinLambda) + (cosU1*sinU2-sinU1*cosU2*cosLambda) * (cosU1*sinU2-sinU1*cosU2*cosLambda));
		if (sinSigma==0) return 0;

		var cosSigma = sinU1*sinU2 + cosU1*cosU2*cosLambda;
		var sigma = Math.atan2(sinSigma, cosSigma);
		var sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
		var cosSqAlpha = 1 - sinAlpha*sinAlpha;
		var cos2SigmaM = cosSigma - 2*sinU1*sinU2/cosSqAlpha;
		if (isNaN(cos2SigmaM)) cos2SigmaM = 0;
		var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
		lambdaP = lambda;
		lambda = L + (1-C) * f * sinAlpha * (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
	} while (Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit>0);

	if (iterLimit==0) return NaN

	var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
	var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
	var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
	var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
	var s = b*A*(sigma-deltaSigma);

	return s;
}

console.log( getDistance(48.154563, 17.072561, 48.154564, 17.072562) ); //     0.1337894417641191
console.log( getDistance(48.154563, 17.072561, 48.158800, 17.064064) ); //   788.4148295236967
console.log( getDistance(48.148636, 17.107558, 48.208810, 16.372477) ); // 55073.682463660065

module.exports = new HomePage();
