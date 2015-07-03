//number of properties to display per page
var settings = {
    itemsPerPage: 32
};

if (!jQuery.fn.inventoryList) {
    jQuery.fn.inventoryList = function(opt, arg1) {

        if (Array.isArray(opt)) {

            var db = opt;
            var ourDom = jQuery(this);

            ourDom.data("db", db);
        } else if (opt == "update") {
            var db = jQuery(this).data("db");
            return updateList(jQuery(this), db, arg1);
        }
    };
}

function updateList(inventoryElement, db, filterOptions) {

    //gather properties based on selected filter options for Tenancy and Property Type
    inventoryElement.empty();
    var matchingProperties = [];
    var pendingProperties = [];
    for (var i = 0; i < db.length; ++i) {
        var property = db[i];
        if (propertyMatches(filterOptions, property))
            matchingProperties.push(property);
    //separate pending from available

    for (var x = 0; x < matchingProperties.length; ++x) {
        if (matchingProperties[x].statusValue == 'pending'){

            pendingProperties.push(matchingProperties[x]);
            matchingProperties.splice(x, 1);
        }
    }

    }

    //sort gathered properties (see above) by selected Sort By option

    switch (filterOptions.sortBy) {
        case "status":
        {
            matchingProperties.sort(function(a, b) {
                return b.statusValue < a.statusValue;
            });
        };
        break;
        case "date":
        {
            matchingProperties.sort(function(a, b) {
                return b.date > a.date ? 1 : b.date < a.date ? -1 : 0;
            });
            pendingProperties.sort(function(a, b) {
                return b.date > a.date ? 1 : b.date < a.date ? -1 : 0;
            });
        };
        break;
        case "views":
        {
            matchingProperties.sort(function(a, b) {
                return parseInt(b.views) - parseInt(a.views);
            });
            pendingProperties.sort(function(a, b) {
                return parseInt(b.views) - parseInt(a.views);
            });
        };
        break;
        case "tenant_asc":
        {
            matchingProperties.sort(function(a, b) {
                return a.title.localeCompare(b.title);
            });
            pendingProperties.sort(function(a, b) {
                return a.title.localeCompare(b.title);
            });
        };
        break;
        case "tenant_desc":
        {
            matchingProperties.sort(function(a, b) {
                return b.title.localeCompare(a.title);
            });
            pendingProperties.sort(function(a, b) {
                return b.title.localeCompare(a.title);
            });
        };
        break;
        case "price_up":
        {
            matchingProperties.sort(function(a, b) {
                return parseInt(a.price) - parseInt(b.price);
            });
            pendingProperties.sort(function(a, b) {
                return parseInt(a.price) - parseInt(b.price);
            });
        };
        break;
        case "price_down":
        {
            matchingProperties.sort(function(a, b) {
                return parseInt(b.price) - parseInt(a.price);
            });
            pendingProperties.sort(function(a, b) {
                return parseInt(b.price) - parseInt(a.price);
            });
        };
        break;
        case "cap_up":
        {
            matchingProperties.sort(function(a, b) {
                /* Place Null values at the end */
                if (a.capRate == ''){
                    a.capRate = 999;
                }
                if (b.capRate == ''){
                    b.capRate = 999;
                }
                    return a.capRate - b.capRate;
            });
            pendingProperties.sort(function(a, b) {
                /* Place Null values at the end */
                if (a.capRate == ''){
                    a.capRate = 999;
                }
                if (b.capRate == ''){
                    b.capRate = 999;
                }
                    return a.capRate - b.capRate;
            });
        };
        break;
        case "cap_down":
        {
            matchingProperties.sort(function(a, b) {
                if (a.capRate == 999){
                    a.capRate = '';
                }
                if (b.capRate == 999){
                    b.capRate = '';
                }
                return b.capRate - a.capRate;
            });
            pendingProperties.sort(function(a, b) {
                if (a.capRate == 999){
                    a.capRate = '';
                }
                if (b.capRate == 999){
                    b.capRate = '';
                }
                return b.capRate - a.capRate;
            });
        };
        break;
        case "state":
        {
            matchingProperties.sort(function(a, b) {
                return a.state.localeCompare(b.state);
            });
            pendingProperties.sort(function(a, b) {
                return a.state.localeCompare(b.state);
            });
        };
        break;
        case "near":
        {
            matchingProperties.sort(function(a, b) {
                    // a[distance] = Math.sqrt( Math.pow( user_lat - a.latitude, 2 ) + Math.pow( user_long - a.longitude, 2 ) );
                    // b[distance] = Math.sqrt( Math.pow( user lat - b.latitude, 2 ) + Math.pow( user_long - b.longitude, 2 ) );
                    // alert(a.longitude);
                    return b.distance - a.distance;
                });
            pendingProperties.sort(function(a, b) {
                    // a[distance] = Math.sqrt( Math.pow( user_lat - a.latitude, 2 ) + Math.pow( user_long - a.longitude, 2 ) );
                    // b[distance] = Math.sqrt( Math.pow( user lat - b.latitude, 2 ) + Math.pow( user_long - b.longitude, 2 ) );
                    // alert(a.longitude);
                    return b.distance - a.distance;
                });
        };
        break;
    }

    //Append pending to available array
    matchingProperties = matchingProperties.concat(pendingProperties);


    //append gathered properties to the DOM
    var propertyElements = new Array();
    for (var iprop = 0; iprop < matchingProperties.length; iprop++) {
        propertyElements.push(createPropertyElement(matchingProperties[iprop]));
    }

    var itemsPerPage = settings.itemsPerPage;
    var paginationControlsDiv = jQuery("#paginationControls");
    paginationControlsDiv.empty();
    var paginator = new Paginator(itemsPerPage, inventoryElement, paginationControlsDiv, propertyElements);

    //Place pending at end
    // matchingProperties = matchingProperties.sort(function(a,b){ //Reorder to display 'pending' properties last
    // 	return b.status - a.status;
    // });

    return matchingProperties.length;
}

function propertyMatches(filterOptions, property) {
    if (filterOptions.listingStatus != "null") { //the quotes around null are intentional: they are merely DOM values representing a default select list value
        if ((filterOptions.listingStatus == 'available' && property.statusValue != 'pending') || (filterOptions.listingStatus == 'sold')) { //Make 'pending' show up when 'available' is selected
            if (property.statusValue != filterOptions.listingStatus) {
                return false;
            }
        }
    }


    var hasType = function(property, typeName) {
        var propertyArray = property[typeName + "s"];
        for (var i = 0; i < propertyArray.length; ++i) {
            if (propertyArray[i] == filterOptions[typeName]) {
                return true;
            }
        }
        return false;
    }

    if (filterOptions.propertyType != "null") { //see "null" note above
        if (!hasType(property, "propertyType"))
            return false;
    }
    if (filterOptions.tenancyType != "null") { //see "null" note above
        if (!hasType(property, "tenancyType"))
            return false;
    }

    return true;
}

function createPropertyElement(property) {
    var propertyOuter = jQuery("<div class='listing'>");
    var propertyInner = jQuery("<div class='cellpadding'>");
    var propertyThumbnail = jQuery("<div class='image'>");

    // if(property.views > 0){
    // 	var propertyViews = jQuery("<div class='views'>");
    // 	if(property.views == 1)
    // 		propertyViews.append(property.views.toString() + ' View');
    // 	else if(property.views > 1)
    // 		propertyViews.append(property.views.toString() + ' Views');
    // }

    propertyThumbnail.append('<a href="' + property.permalink.toString() + '"><img src="' + property.thumbnail.toString() + '" />' + (property.views > 0 ? '<div class="views">' + (property.views > 1 ? property.views.toString() + ' Views' : property.views.toString() + ' View') + '</div>' : '') + '</a>');

    // propertyThumbnail.append(propertyViews);

    var propertyInfo = jQuery('<a href="' + property.permalink.toString() + '" class="content">');

    propertyInfo.append('<h3>' + property.title.toString() + '</h3>');

    if (property.city !== '' || property.state !== '') {
        var propertyLocation = jQuery('<p>');
        if (property.city !== '')
            propertyLocation.append(property.city.toString());
        if (property.city !== '' && property.state !== '')
            propertyLocation.append(', ');
        if (property.state !== '')
            propertyLocation.append(property.state.toString());
    }

    propertyInfo.append(propertyLocation);

    if (property.price !== '' || property.capRate !== '') {
        var propertyPrice = jQuery('<p>');
        if (property.price !== '')
            propertyPrice.append(accounting.formatMoney(property.price).toString());
        if (property.capRate !== '' && property.capRate !== 999) {
            propertyPrice.append(' (');
            propertyPrice.append(property.capRate.toString());
            propertyPrice.append('% Cap)');
        }
    }

    propertyInfo.append(propertyPrice);

    var propertyStatus = jQuery('<p class="highlight">');
    propertyStatus.append(property.statusLabel.toString());

    propertyInfo.append(propertyStatus);

    propertyInner.append(propertyThumbnail);
    propertyInner.append(propertyInfo);
    propertyOuter.append(propertyInner);
    return propertyOuter;
}
