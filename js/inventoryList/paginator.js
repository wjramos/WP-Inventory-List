////////////////////////////////////////////////////////////////////////////////
// class Paginator
/**
  * @constructor
  */
function Paginator(itemsPerPage, itemContainer, paginationControlsContainer, items) {
    Object.apply(this, arguments); //base constructor

	this.itemsPerPage = itemsPerPage;
	this.itemContainer = itemContainer;
	this.paginationControlsContainer = paginationControlsContainer;
	this.items = items;
	this.numPages = Math.ceil(items.length / this.itemsPerPage);
	this.currPage = 0;
	this.pageControls = new Array();

	for(var i = 0; i < items.length; i++)
		items[i].addClass(Paginator.paginatorItemClass);

	if(this.numPages > 1){this.setupControls()}
	this.displayPage(0);
}

Paginator.prototype = Object.create(Object.prototype);
Paginator.prototype.constructor = Paginator;
Paginator.paginatorItemClass = "paginatorItem";
Paginator.numPageControls = 8;

Paginator.prototype.setupControls = function() {
	//this.paginationControlsContainer.empty();
	var thisobj = this;
	var pageBack = jQuery("<a href='#properties'>");
	pageBack.append("<");
	pageBack.addClass("pageBack");
	pageBack.click(function() {
		thisobj.checkPageControls(thisobj.currPage -1);
		thisobj.displayPage(thisobj.currPage -1);
	});
	this.paginationControlsContainer.append(pageBack);
	this.pageBack = pageBack;

	for(i = 0; i < Paginator.numPageControls && i < this.numPages; ++i) {
		var pageControl = this.createPageControl(i);
		this.paginationControlsContainer.append(pageControl);
		this.pageControls.push({ pageNum: i, control: pageControl });
	}

	var pageNext = jQuery("<a href='#properties'>");
	pageNext.addClass("pageNext");
	pageNext.append(">");
	pageNext.click(function() {
		thisobj.checkPageControls(thisobj.currPage +1);
		thisobj.displayPage(thisobj.currPage +1);
	});
	this.paginationControlsContainer.append(pageNext);
	this.pageNext = pageNext;
}

Paginator.prototype.checkPageControls = function(newActivePage) {
	if(newActivePage < 0 || newActivePage >= this.numPages) return;
	if(newActivePage < this.pageControls[0].pageNum)
		this.scrollPageNums(-1);
	else if(newActivePage > this.pageControls[this.pageControls.length-1].pageNum)
		this.scrollPageNums(1);
}

Paginator.prototype.scrollPageNums = function(delta) {
	if(delta == 1) {
		var newPageNum = this.pageControls[this.pageControls.length-1].pageNum + 1;
		this.pageControls[0].control.remove();
		this.pageControls.splice(0, 1);
		var newPageControl = this.createPageControl(newPageNum);
		newPageControl.insertBefore(this.pageNext);
		this.pageControls.push({ pageNum: newPageNum, control: newPageControl });
	}
	else if(delta == -1) {
		var newPageNum = this.pageControls[0].pageNum - 1;
		this.pageControls[this.pageControls.length-1].control.remove();
		this.pageControls.splice(this.pageControls.length-1, 1);
		var newPageControl = this.createPageControl(newPageNum);
		newPageControl.insertAfter(this.pageBack);
		this.pageControls.splice(0, 0, { pageNum: newPageNum, control: newPageControl });
	}
}

Paginator.prototype.createPageControl = function(i) {
	var thisobj = this;
	var pageControl = jQuery("<a href='#properties'>");
	pageControl.attr("id", "pageControl_" + i.toString());
	pageControl.addClass("pageControl");
	pageControl.append((i + 1).toString());
	pageControl.click(function(pageNum) {
		return function() { thisobj.displayPage(pageNum) };
	}(i));
	return pageControl;
}

Paginator.prototype.displayPage = function(pageNum) {
	//console.log("In displayPage(" + pageNum.toString() + ")");
	jQuery(".selectedPage").css("border", "");
	jQuery(".selectedPage").removeClass("selectedPage");
	jQuery("." + Paginator.paginatorItemClass).detach();
	if(pageNum < 0 || pageNum >= this.numPages)
		pageNum = this.currPage;
	var start = pageNum * this.itemsPerPage;
	for(var i = start; i < start + this.itemsPerPage && i < this.items.length; ++i) {
		this.itemContainer.append(this.items[i]);
	}
	jQuery("#pageControl_" + pageNum.toString()).addClass("selectedPage");
	//jQuery("#pageControl_" + pageNum.toString()).css("border", "solid 1px #000");
	this.currPage = pageNum;
}
