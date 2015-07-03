jQuery(function($){
	$('#sortingControls select').selectric();
	$('select').on('selectric-before-init');
});