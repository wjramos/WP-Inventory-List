var updateTimeout = null;
function update() {
	if(updateTimeout)
		clearTimeout(updateTimeout);
	updateTimeout = setTimeout(function() { //prevent re-entry and user-clickyness
		var resultCount = jQuery("#propertyList").inventoryList("update", getFilterOptions());
		//display default message if no properties were found for the selected filters
		if(resultCount == 0) {
			// console.log("hiding propertyList");
			jQuery("#propertyList").hide();
			jQuery("#noResultsMsg").show();
		}
		else {
			// console.log("showing propertyList");
			jQuery("#propertyList").show();
			jQuery("#noResultsMsg").hide();
		}
	}, 100);
}

function getFilterOptions() {
	return {
		listingStatus: jQuery('.tabs a.active').attr('id'),
		tenancyType: jQuery('#tenancyType').val(),
		propertyType: jQuery('#propertyType').val(),
		sortBy: jQuery('#sortBy').val()
	}
}