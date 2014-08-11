(function(){
	"use strict";

	/**
	 * Constructor
	 *
	 * @param string apiKey API Key to last.fm
	 **/
	var LastFMSource = function (apiKey) {
		// API key
		this.apiKey = apiKey;
	};

	LastFMSource.prototype.search = function (searchTerm, callback) {
		if (typeof searchTerm == "undefined") {
			console.error("No search term defined");
			if (callback)
				callback();
			return;
		}

		var request = new XMLHttpRequest(),
			url = "http://ws.audioscrobbler.com/2.0/",
			params = {
				api_key: this.apiKey,
				format: "json",
				method: "artist.getinfo",
				artist: searchTerm,
				callback: "jsonLastFMApi"
			},
			query = "";
		for (var key in params) {
			query += (query != "" ? "&" : "?") + encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
		}


		request.onreadystatechange = function () {
			function jsonLastFMApi(json) {
				return json;
			};

			if (this.readyState == 4 && this.status == 200 ) {
				var json = eval(this.responseText),
					artist,
					image = {};

				if (!json.artist) {
					console.warn("No artist found in Last.FM");
					if (callback) {
						callback();
					}
				}

				artist = json.artist;

				console.log("Fetched 1 image from Last.FM");

				image.title = artist.name;
				image.id = artist.mbid;
				image.link = artist.url;
				image.url = "";

				if (artist.image.length) {
					var temp = artist.image.pop();
					image.url = temp["#text"];
				}

				if (callback) {
					callback([image]);
				}
			}
		};
		request.addEventListener("error", function() {
			console.error(this.responseText);
		}, false);
		request.open("GET", url + query, true);
		request.send();
	};

	// Add it to the scope
	exports.LastFMSource = LastFMSource;

})();
