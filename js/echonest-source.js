(function(){
	"use strict";

	/**
	 * Constructor
	 *
	 * @param string apiKey API Key to echo nest.
	 **/
	var EchoNestSource = function (apiKey) {
		// API key
		this.apiKey = apiKey;
	};

	EchoNestSource.prototype.search = function (searchTerm, callback) {
		if (typeof searchTerm == "undefined") {
			console.error("No search term defined");
			if (callback)
				callback();
			return;
		}

		var request = new XMLHttpRequest(),
			url = "http://developer.echonest.com/api/v4/artist/images",
			params = {
				api_key: this.apiKey,
				format: "jsonp",
				name: searchTerm,
				results: 10,
				callback: "jsonpCallback"
			},
			query = "";
		for (var key in params) {
			query += (query != "" ? "&" : "?") + encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
		}


		request.onreadystatechange = function () {
			function jsonpCallback(json) {
				return json;
			};

			if (this.readyState == 4 && this.status == 200 ) {
				var json = eval(this.responseText),
					images = [],
					image,
					i;

				if (!json.response || !json.response.images || !json.response.images.length) {
					console.warn("No artist found in Last.FM");
					if (callback) {
						callback();
					}
				}

				console.log("Fetched " + json.response.images.length + " images from The Echo Nest");

				for (i = 0; i < json.response.images.length; i++) {
					image = {
						title: searchTerm,
						id: "",
						link: "",
						url: json.response.images[i].url
					}

					images.push(image);
				}

				if (callback) {
					callback(images);
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
	exports.EchoNestSource = EchoNestSource;

})();
