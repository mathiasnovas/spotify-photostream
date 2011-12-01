//
// flickrstream.js - Fetches a continuous stream of images from flickr
//

(function(){

	/**
	 * Constructor
	 *
	 * @param apiKey     API Key to flickr
	 * @param searchTerm (optional) Search term to start the stream
	 **/
	var FlickrStream = function (apiKey, searchTerm) {
	};

	FlickrStream.prototype = {

		/**
		 * Get the next image in the stream.
		 *
		 * @param callback The callback which will receive the image object.
		 **/
		getImage: function (callback) {
		},

		/**
		 * Reset the stream.
		 **/
		resetStream: function () {
		},

		/**
		 * Set the search term and reset the stream.
		 *
		 * @param searchTerm The search term.
		 **/
		setSearchTerm: function (searchTerm) {
		}

	}

	// Add it to the scope
	exports.FlickrStream = FlickrStream;

})();