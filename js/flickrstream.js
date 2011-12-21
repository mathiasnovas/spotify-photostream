/**

spotify-flickrstream is licensed under the terms of the ZLIB license

Copyright © 2011 The Lonely Coder 

This software is provided 'as-is', without any express or implied warranty. In no event will the authors be held liable for any damages arising from the use of this software.

Permission is granted to anyone to use this software for any purpose, including commercial applications, and to alter it and redistribute it freely, subject to the following restrictions: 
 - The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required. 
 - Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software. 
 - This notice may not be removed or altered from any source distribution.

**/

(function(){

	/**
	 * Constructor
	 *
	 * @param apiKey     API Key to flickr
	 * @param searchTerm (optional) Search term to start the stream
	 **/
	var FlickrStream = function (apiKey, searchTerm) {
		// Options
		this.options = {
			// Flickr API key
			apiKey: apiKey,

			// Amount of images to get per page
			perPage: 10,

			// The search term
			searchTerm: searchTerm
		};

		// The current page of photos
		this.page = 0;

		// List of images
		this.images = [];

		if (searchTerm)
			this.setSearchTerm(searchTerm);
	};

	FlickrStream.prototype = {

		/**
		 * Get the next image in the stream, incrementing the stream.
		 *
		 * @param callback (optional) Callback which will receive the image object
		 **/
		next: function (callback) {
			var self = this;

			if (this.images.length !== 0) {
				// Get the next images
				if (typeof callback != 'undefined')
					callback( this.images.shift() );
			} else {
				// Get the next batch of images
				this.page++;
				this.search(function () {
					if (callback)
						self.next(callback);
				});
			}
		},

		/**
		 * Reset the stream.
		 **/
		resetStream: function () {
			this.page = 0;
			this.images = [];
		},

		/**
		 * Search for images.
		 *
		 * @param callback (optional) Callback which should receive the image objects
		 **/
		search: function(callback) {
			var self = this;

			if (!this.options.searchTerm) {
				console.error('FlickrStream::search: no search term defined');
				if (callback)
					callback();
				return;
			}

			// Call flickr
			$.ajax({
				url: 'http://api.flickr.com/services/rest/',
				data: {
					api_key: this.options.apiKey,
					format: 'json',
					method: 'flickr.photos.search',
					text: this.options.searchTerm,
					per_page: this.options.perPage,
					page: this.page,
					sort: 'relevance'
				},
				crossDomain: true,
				dataType: 'jsonp',
				jsonp: 'jsoncallback',
				success: function(json) {
					// Loop around if we've reached the end
					if (json.photos.photo.length === 0) {
						self.resetStream();
						self.search(callback);
						return;
					}

					// Fill 'er up
					for(var i in json.photos.photo) {
						var entry = json.photos.photo[i];
						var image = {
							id: entry.id,
							title: entry.title,
							owner: entry.owner,
							link: 'http://www.flickr.com/photos/' + entry.owner + '/' + entry.id,
							url: {
								'default': 'http://farm' + entry.farm + '.staticflickr.com/' + entry.server + '/' + entry.id + '_' + entry.secret + '.jpg',
								thumbnail: 'http://farm' + entry.farm + '.staticflickr.com/' + entry.server + '/' + entry.id + '_' + entry.secret + '_t.jpg',
								large: 'http://farm' + entry.farm + '.staticflickr.com/' + entry.server + '/' + entry.id + '_' + entry.secret + '_b.jpg',
							}
						}

						self.images.push(image);
					}

					if (callback)
						callback();
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error('AJAX failure "' + textStatus + '" @ FlickrStream::search: ' + errorThrown);
				}
			});
		},

		/**
		 * Set the search term and reset the stream.
		 *
		 * @param searchTerm The search term
		 **/
		setSearchTerm: function (searchTerm) {
			this.options.searchTerm = searchTerm;
			this.resetStream();
		}

	}

	// Add it to the scope
	exports.FlickrStream = FlickrStream;

})();
