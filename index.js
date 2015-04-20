jQuery(function($){
	var $vid  = $('#vid');
	var $addr = $('#addr_html5');
	var $pd   = $('#parse_error');

	function updateId () {
		var id = $vid.val();

		var bShowError = false;
		if (!/^[a-z\d]+$/i.test(id)) {
			var ids = id.match(/id[^a-zA-Z\d]([a-zA-Z\d]+)/);
			if (ids) {
				id = ids[1];
			} else {
				bShowError = true;
			}
		}

		if (bShowError) {
			$pd.slideDown();
		} else {
			$pd.slideUp();
			$addr.attr('href', "./play.html?" + id);
		}
	}
	$vid
		.on('keyup keydown change paste', updateId)
		.on('keypress', function (e) {
			if (e.keyCode == 13) {
				$addr[0].click();
			}
		});
	updateId();
});