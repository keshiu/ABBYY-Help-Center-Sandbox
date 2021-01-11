/** carousel tab-menu on visual **/
(function($,sr){
	// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
	var debounce = function (func, threshold, execAsap) {
		var timeout;
		return function debounced () {
			var obj = this, args = arguments;
			function delayed () {
				if (!execAsap)
					func.apply(obj, args);
				timeout = null;
			}
			if (timeout)
				clearTimeout(timeout);
			else if (execAsap)
				func.apply(obj, args);
			timeout = setTimeout(delayed, threshold || 200);
		};
	};
	jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');

+function () {

	function carouselMenu() {
		var tabsClass = ".responsive-tabs";
		var screen = $(tabsClass).find(".tabs-carousel-screen");
		var bar = $(tabsClass).find(".tabs-carousel-bar");
		var prev = $(tabsClass).find(".tabs-carousel-prev");
		var next = $(tabsClass).find(".tabs-carousel-next");
		var items = bar.find("li");
		var active = bar.find("li.active");
		var is = [];
		items.each(function () {
			is.push($(this).width());
		});
		var maxW = Math.max.apply(Math,is);

		if (bar && screen && items.length > 0 && bar.width() > screen.width()) {
			var pc22 = Math.round((22 * 100 / screen.width()));
			var sw = screen.width();
			var stepper = 0;
			var step = maxW * 1.2 > screen.width() ? 30 : 60; // шаг в %
			var delta = 0;
			var stepLim = 0;
			delta = Math.ceil((bar.width() * 100 / $(tabsClass).width())) - 100; // разница в процентах от screen
			stepLim = Math.floor((delta + 100) / step); // количество шагов -1
			if (delta > step && 0 < delta % step < 5 || delta < (stepLim - 1) * step) // докручиваем предел шагов, чтобы не было мелких сдвигов на краях
				stepLim --;
			//console.log("stepLim2: " + stepLim);
			if (active.index() == 0) {
				arrows("nextOnly");
				bar.css( "left", "0%");
				stepper = 0;
				edges(0);
			}
			else if (active.index() == items.length-1) {
				arrows("prevOnly");
				bar.css("left", -1 * delta + "%");
				stepper = -1 * stepLim;
				edges(-1 * delta);
			}
			else if (active.length > 0) { // центруем активный пункт
				var leftPc = Math.ceil(active.position().left * 100 / sw);
				var activeHalfWidthPc = Math.round(active.width() * 50 / sw);
				var shift = leftPc + activeHalfWidthPc - 50;

				if (shift <= 0 || shift > 0 && shift < pc22) {
					arrows("nextOnly");
					bar.css( "left", "0%");
					stepper = 0;
					edges(0);
				}
				else if (shift > delta) {
					arrows("prevOnly");
					bar.css("left", -1 * delta + "%");
					stepper = -1 * stepLim;
					edges(-1 * delta);
				}
				else {
					arrows("both");
					bar.css( "left", -1 * shift + "%");
					shift = Math.round(active.position().left * 100 / screen.width()) + Math.ceil(active.width() * 50 / screen.width()) - 50;
					edges(-1 * shift);
					stepper = (shift / step < 1) ? -1 : -1 * Math.floor(shift / step);
				}
			}

			prev.click(goPrev);
			next.click(goNext);
			screen.swiperight(goPrev);
			screen.swipeleft(goNext);
			screen.on("dragstart", function () { return false; });
			screen.on("drop", function () { return false; });
		}
		else {
			bar.css( "left", "0%");
			arrows("none");
			items.each(function () {
				$(this).toggleClass("scroll-out-left", false);
				$(this).toggleClass("scroll-out-right", false);
			});
		}

		function recalculation() {
			delta = Math.ceil((bar.width() * 100 / screen.width())) - 100; // разница в процентах от screen
			stepLim = Math.floor((delta + 100) / step); // количество шагов -1
			if (delta > step && 0 < delta % step < 5 || delta < (stepLim - 1) * step) // докручиваем предел шагов, чтобы не было мелких сдвигов на краях
				stepLim --;
		}

		function goPrev() {
			if (stepper < 0) {
				stepper ++;
				bar.css( "left", (stepper * step) + "%");
				arrows("prev");
				edges(stepper * step);
				if (stepper < 0 && Math.abs(stepper) < stepLim) {
					arrows("next");
				}
				else if (stepper == 0) {
					bar.css( "left", "0%");
					arrows("nextOnly");
					edges(0);
				}
			}
		}

		function goNext(){
			if (Math.abs(stepper) < stepLim) {
				stepper--;
				if (Math.abs(stepper) == stepLim){
					stepper = -1 * stepLim;
					arrows("prevOnly");
					bar.css("left", -1 * delta + "%");
					edges(-1 * delta);
				}
				else {
					arrows("next");
					bar.css("left", (stepper * step) + "%");
					edges(stepper * step);
					if (Math.abs(stepper) < stepLim && stepper < 0) {
						arrows("prev");
					}
				}
			}
			else if (Math.abs(stepper) == stepLim) {
				stepper = -1 * stepLim;
				arrows("prevOnly");
				bar.css("left", -1 * delta + "%");
				edges(-1 * delta);
			}
		}

		function arrows(a) {
			switch (a) {
				case "none":
					screen.css({"margin-left": "0", "margin-right": "0"});
					prev.hide();
					next.hide();
					break;
				case "both":
					screen.css({"margin-left": "22px", "margin-right": "22px"});
					prev.show();
					next.show();
					break;
				case "prev":
					screen.css({"margin-left": "22px"});
					prev.show();
					break;
				case "next":
					screen.css({"margin-right": "22px"});
					next.show();
					break;
				case "prevOnly":
					screen.css({"margin-left": "22px", "margin-right": "0"});
					prev.css('display', 'block');
					next.hide();
					break;
				case "nextOnly":
					screen.css({"margin-left": "0", "margin-right": "22px"});
					prev.hide();
					next.show();
					break;
			}
			delta = Math.ceil((bar.width() * 100 / screen.width())) - 100;
			sw = screen.width();
		}

		function edges(barShiftPc) {
			sw = screen.width();
			var itemLeft = 0;
			var shiftLeft = Math.ceil(Math.abs(barShiftPc * sw / 100));
			items.each(function () { // barShiftPc --- barShiftPc+100%
				var lPc = itemLeft;
				itemLeft += $(this).width();
				var rPc = itemLeft;
				if (lPc < shiftLeft && rPc > shiftLeft) {
					$(this).toggleClass("scroll-out-left", true);
				}
				else if (lPc < (shiftLeft + screen.width() + 52) && rPc > (shiftLeft + screen.width() - 52)) {
					$(this).toggleClass("scroll-out-right", true);
				}
				else {
					$(this).toggleClass("scroll-out-left", false);
					$(this).toggleClass("scroll-out-right", false);
				}

			});
		}
	}

	$(window).smartresize(function () {
		carouselMenu();
	});

	$(document).ready(function () {
		$(function() {
			carouselMenu();
      showOnlyForUsaLink();
		});
	});
}();

function showOnlyForUsaLink () {
  var showOnlyForUsa = $('.showOnlyForUsa');

  if (showOnlyForUsa.length) {
  	$.ajax({
    	type: 'GET',
      url: 'https://www.abbyy.com/umbraco/api/IpLocation/Get',
      success: function(data) {
      	if (!data) return;
				currentCountry = data.countryIso2Code;
        if (!currentCountry) return;
				console.log(currentCountry);
				currentCountry === "US" ? showOnlyForUsa.show() : showOnlyForUsa.hide();
      }
    });
  }
}

function checkPaginationArrows () {
  if($('.easyPaginateNav .page.current').attr('href') == $('.easyPaginateNav .first').attr('href')) {
    $('.easyPaginateNav .first').hide();
    $('.easyPaginateNav .prev').hide();
  } else {
    $('.easyPaginateNav .first').show();
    $('.easyPaginateNav .prev').show();
  }
  if($('.easyPaginateNav .page.current').attr('href') == $('.easyPaginateNav .last').attr('href')) {
    $('.easyPaginateNav .last').hide();
    $('.easyPaginateNav .next').hide();
  }
  else {
    $('.easyPaginateNav .last').show();
    $('.easyPaginateNav .next').show();
  }
}

/*
 * jQuery v1.9.1 included
*/

// ******************************
// START custom ticket field descriptions variable definitions
var custom_field_360000202709 = ' <p>ABBYY will process your information for technical support, helpdesk and troubleshooting purposes. Read more in <a href="https://www.abbyy.com/privacy/"> ABBYY&prime;s Privacy Policy... </a> <\p> ';
var custom_field_360000202709_ru = ' <p>Компания ABBYY использует предоставленные вами данные для оказания технической поддержки и устранения неполадок в ПО. Подробнее в разделе <a href="https://www.abbyy.com/privacy/"> Конфиденциальность (ENG)... </a> <\p> ';
// END custom ticket field descriptions variable definitions

/*
* jQuery easyShare plugin
* Update on 04 april 2017
* Version 1.2
*
* Licensed under GPL <http://en.wikipedia.org/wiki/GNU_General_Public_License>
* Copyright (c) 2008, St?hane Litou <contact@mushtitude.com>
* All rights reserved.
*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

(function($){
$.fn.easyPaginate = function (options) {
    var defaults = {
        paginateElement: 'li',
        hashPage: 'page',
        elementsPerPage: 10,
        effect: 'default',
        slideOffset: 200,
        firstButton: true,
        firstButtonText: '<<',
        lastButton: true,
        lastButtonText: '>>',        
        prevButton: true,
        prevButtonText: '›',        
        nextButton: true,
        nextButtonText: '‹'
    }
        
    return this.each (function (instance) {        
        
        var plugin = {};
        plugin.el = $(this);
        plugin.el.addClass('easyPaginateList');
        plugin.settings = {
            pages: 0,
            objElements: Object,
            currentPage: 1
        }
      
        var getNbOfPages = function() {
            return Math.ceil(plugin.settings.objElements.length / plugin.settings.elementsPerPage);         
        };
        
        var displayNav = function() {
            htmlNav = '<div class="easyPaginateNav">';
            
            if(plugin.settings.firstButton) {
                htmlNav += '<a href="#'+plugin.settings.hashPage+':1" title="First page" rel="1" class="first">'+plugin.settings.firstButtonText+'</a>';
            }
            
            if(plugin.settings.prevButton) {
                htmlNav += '<a href="" title="Previous" rel="" class="prev">'+plugin.settings.prevButtonText+'</a>';
            }
            
            for(i = 1;i <= plugin.settings.pages;i++) {
                htmlNav += '<a href="#'+plugin.settings.hashPage+':'+i+'" title="Page '+i+'" rel="'+i+'" class="page">'+i+'</a>';
            };
            
            if(plugin.settings.nextButton) {
                htmlNav += '<a href="" title="Next" rel="" class="next">'+plugin.settings.nextButtonText+'</a>';
            }
            
            if(plugin.settings.lastButton) {
                htmlNav += '<a href="#'+plugin.settings.hashPage+':'+plugin.settings.pages+'" title="Last page" rel="'+plugin.settings.pages+'" class="last">'+plugin.settings.lastButtonText+'</a>';
            }
            
            htmlNav += '</div>';
            plugin.nav = $(htmlNav);
            plugin.nav.css({
                'width': plugin.el.width()
            });
            plugin.el.after(plugin.nav);

            var elSelector = '#' + plugin.el.get(0).id + ' + ';
            $(elSelector + ' .easyPaginateNav a.page,'
                + elSelector + ' .easyPaginateNav a.first,'
                + elSelector + ' .easyPaginateNav a.last').on('click', function(e) {
                e.preventDefault();
                displayPage($(this).attr('rel'));
              	checkPaginationArrows();
            });

            $(elSelector + ' .easyPaginateNav a.prev').on('click', function(e) {
                e.preventDefault();
                page = plugin.settings.currentPage > 1?parseInt(plugin.settings.currentPage) - 1:1;
                displayPage(page);
              	checkPaginationArrows();
            });

            $(elSelector + ' .easyPaginateNav a.next').on('click', function(e) {
                e.preventDefault();
                page = plugin.settings.currentPage < plugin.settings.pages?parseInt(plugin.settings.currentPage) + 1:plugin.settings.pages;
                displayPage(page);
              	checkPaginationArrows();
            });
        };
        
        var displayPage = function(page, forceEffect) {
            if(plugin.settings.currentPage != page) {
                plugin.settings.currentPage = parseInt(page);
                offsetStart = (page - 1) * plugin.settings.elementsPerPage;
                offsetEnd = page * plugin.settings.elementsPerPage;
                if(typeof(forceEffect) != 'undefined') {
                    eval("transition_"+forceEffect+"("+offsetStart+", "+offsetEnd+")");
                }else {
                    eval("transition_"+plugin.settings.effect+"("+offsetStart+", "+offsetEnd+")");
                }
                
                plugin.nav.find('.current').removeClass('current');
                plugin.nav.find('a.page:eq('+(page - 1)+')').addClass('current');
                
                switch(plugin.settings.currentPage) {
                    case 1:
                        $('.easyPaginateNav a', plugin).removeClass('disabled');
                        $('.easyPaginateNav a.first, .easyPaginateNav a.prev', plugin).addClass('disabled');
                        break;
                    case plugin.settings.pages:
                        $('.easyPaginateNav a', plugin).removeClass('disabled');
                        $('.easyPaginateNav a.last, .easyPaginateNav a.next', plugin).addClass('disabled');
                        break;
                    default:
                        $('.easyPaginateNav a', plugin).removeClass('disabled');
                        break;
                }
            }
        };
        
        var transition_default = function(offsetStart, offsetEnd) {
            plugin.currentElements.hide();
            plugin.currentElements = plugin.settings.objElements.slice(offsetStart, offsetEnd).clone();
            plugin.el.html(plugin.currentElements);
            plugin.currentElements.show();
        };
        
        var transition_fade = function(offsetStart, offsetEnd) {
            plugin.currentElements.fadeOut();
            plugin.currentElements = plugin.settings.objElements.slice(offsetStart, offsetEnd).clone();
            plugin.el.html(plugin.currentElements);
            plugin.currentElements.fadeIn();
        };
        
        var transition_slide = function(offsetStart, offsetEnd) {
            plugin.currentElements.animate({
                'margin-left': plugin.settings.slideOffset * -1,
                'opacity': 0
            }, function() {
                $(this).remove();
            });
            
            plugin.currentElements = plugin.settings.objElements.slice(offsetStart, offsetEnd).clone();
            plugin.currentElements.css({
                'margin-left': plugin.settings.slideOffset,
                'display': 'block',
                'opacity': 0,
                'min-width': plugin.el.width() / 2
            });
            plugin.el.html(plugin.currentElements);
            plugin.currentElements.animate({
                'margin-left': 0,
                'opacity': 1
            });
        };
                
        var transition_climb = function(offsetStart, offsetEnd) {            
            plugin.currentElements.each(function(i) {
                var $objThis = $(this);
                setTimeout(function() {
                    $objThis.animate({
                        'margin-left': plugin.settings.slideOffset * -1,
                        'opacity': 0
                    }, function() {
                        $(this).remove();
                    });
                }, i * 200);
            });
            
            plugin.currentElements = plugin.settings.objElements.slice(offsetStart, offsetEnd).clone();
            plugin.currentElements.css({
                'margin-left': plugin.settings.slideOffset,
                'display': 'block',
                'opacity': 0,
                'min-width': plugin.el.width() / 2
            });
            plugin.el.html(plugin.currentElements);
            plugin.currentElements.each(function(i) {
                var $objThis = $(this);
                setTimeout(function() {
                    $objThis.animate({
                        'margin-left': 0,
                        'opacity': 1
                    });
                }, i * 200);
            });
        };
                 
        plugin.settings = $.extend({}, defaults, options);
        plugin.currentElements = $([]);
        plugin.settings.objElements = plugin.el.find(plugin.settings.paginateElement);
        plugin.settings.pages = getNbOfPages();
        if(plugin.settings.pages > 1) {
            plugin.el.html();
          
            // Here we go
            displayNav();
            
            page = 1;
            if(document.location.hash.indexOf('#'+plugin.settings.hashPage+':') != -1) {
                page = parseInt(document.location.hash.replace('#'+plugin.settings.hashPage+':', ''));
                if(page.length <= 0 || page < 1 || page > plugin.settings.pages) {
                    page = 1;
                }
            }
            
            displayPage(page, 'default');
          	checkPaginationArrows();
        }
    });
};
})(jQuery);

/***** hiding privacy policy field on request page *****/

function hidePrivacyField(privacyFieldVal) {
  $('.request-sidebar .request-details dt').each(function() {
    if ($(this)[0].innerHTML == privacyFieldVal) {
      $(this).hide();
      $(this).next().hide();
    }
  });
}

/***** loading products and labels *****/

function createNode(element) {
      return document.createElement(element);
  }

  function append(parent, el) {
    return parent.appendChild(el);
  }

/*function productsByLabels (articleId) {
  var toPrint;
  $.ajax({
    url: '/hc/articles/' + articleId,
    type:'GET',
    async: false,
    success: function(data) {
      var div = document.createElement('div'),
      content = $(div).append(data).find('#productsAndLabels');
      //toPrint = new Function("return " + content[0].innerHTML + ";")(); 
      toPrint = content[0].innerHTML;
    }
  });
  return new Function("return " + toPrint + ";")();
}*/

function categoryById (categoryId) {
  var toPrint;
  $.ajax({
        url: '/api/v2/help_center/' + document.documentElement.lang.toLowerCase() + '/categories/' + categoryId + '.json',
        type:'GET',
        async: false,
        success: function(data) {
      		toPrint = data.category.name;
        }
      });
  return toPrint;
}

function loadLabelsCloud(url, labelName) {
  var labelsArray = [];
  $.getJSON(url, function(data) {
    var family = data.articles,
        products = productsByLabels('360010692460');
    family.map(function(article) {
      article.label_names.forEach(function(label) {
        console.log('labels =', labels);
        if (labels.indexOf(label.toString()) < 0) {
					labels.push(label.toString());
          var li = createNode('li');
      		$(li).addClass("tag");
          if (labelName.toLowerCase() == label.replace(new RegExp("\#",'g'), '%23').toLowerCase()) {
              $(li).addClass("active");
            }
          for(i = 0; i < products.length; i++) {
            labelsArray.push(products[i].label);
            console.log('labelsArray =', labelsArray);
    			}
          var label_name = label.replace(new RegExp("\#",'g'), '%23');
          if (labelsArray.indexOf(label) > -1) {
            li.innerHTML = "<a href=\"/hc/" + document.documentElement.lang.toLowerCase() + "/articles/360010665780?label_name="+label_name+"\">"+label+"</a>";
          }
          else {
            li.innerHTML = "<a href=\"/hc/" + document.documentElement.lang.toLowerCase() + "/articles/360001579019?label_name="+label_name+"\">"+label+"</a>";
          }
          append(ulList, li);
        }
      });
          });
      var pageCount = data.page_count;
      if(pageCount > 1) {
        for (i = 2; i < pageCount+1; i++) {
          var url = '/api/v2/help_center/articles.json?page=' + i + '&per_page=100&locale=' + document.documentElement.lang.toLowerCase();
          $.getJSON(url, function (data){
            var family = data.articles;
  family.map(function(article) {
    article.label_names.forEach(function(label) {
      if (labels.indexOf(label.toString()) < 0) {
        labels.push(label.toString());
        var li = createNode('li');
        $(li).addClass("tag");
        if (labelName.toLowerCase() == label.toLowerCase()) {
          $(li).addClass("active");
        }
        var label_name = label.replace(new RegExp("\#",'g'), '%23');
        if (labelsArray.indexOf(label) > -1) {
            li.innerHTML = "<a href=\"/hc/" + document.documentElement.lang.toLowerCase() + "/articles/360010665780?label_name="+label_name+"\">"+label+"</a>";
          }
          else {
            li.innerHTML = "<a href=\"/hc/" + document.documentElement.lang.toLowerCase() + "/articles/360001579019?label_name="+label_name+"\">"+label+"</a>";
          }
        append(ulList, li);
      }
    });
  });
          });
        	}
      }
  });
}
  
  //Related articles with same labels on the right side of article < 6
  /*function sameLabelArticles_Block (identifier, articleIDs, currentArticleID) {
    var url = 'https://new-support.abbyy.com/api/v2/help_center/articles.json?label_names=' + identifier;
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    let family = data.articles;
    return family.map(function(article) {
        if(!(articleIDs.indexOf(article.id) > -1) && (article.id !== currentArticleID) && count < 5) {
        	articleIDs.push(article.id);
      		let li = createNode('li'),
          liXS = createNode('li'),
          span = createNode('span'),
          spanXS = createNode('span');
      		span.innerHTML = "<a href ="+`${article.html_url}`+">"+`${article.title}`+"</a>";
          spanXS.innerHTML = "<a href ="+`${article.html_url}`+">"+`${article.title}`+"</a>";
      		append(li, span);
      		append(ul, li);
          append(liXS, spanXS);
          append(ulXS, liXS);
          count += 1;
        }
    })
  })
  .catch(function(error) {
    console.log(error);
  });
  }*/

function articlesSameLabelRecursive(url, articleIDs) {
  $.getJSON(url, function(data) {
    var family = data.articles;
    family.map(function(article) {
        if(!(articleIDs.indexOf(article.id) > -1) && (article.id !== currentArticleID)) {
        	articleIDs.push(article.id);
      		let li = createNode('li'),
          span = createNode('span');
      		span.innerHTML = "<a href =\""+article.html_url+"\">"+article.title+"</a>";
      		append(li, span);
      		append(ul, li);
        }
    });
    if(data.next_page != null) {
      articlesSameLabelRecursive(data.next_page, articleIDs);
    } else {
      $('#labels').easyPaginate({
    		paginateElement: 'li',
    		elementsPerPage: 30,
        firstButtonText: '«',
        lastButtonText: '»',
        nextButtonText: '...',
        prevButtonText: '...'
			});
      
    }
  });
}

function loadReorderedListOfSection() {
  var count = 0;
  $("#sections-container .section-block").each(function() {
  	if (count % 2 == 0) {
      
      var row = document.createElement('div');
  		$(row).addClass('row');
      $("#sections-container").append(row);
    }
  	$("#sections-container .row:last-child").append(this);
  	count += 1;
  });
}

/*function loadRPCard(articleLabels) {
  var cardsArray = [],
  relatedPL = productsByLabels('360001928739');
  articleLabels.forEach(function(label){
    
      for(i = 0; i < relatedPL.length; i++) {
        relatedPL[i].label.forEach(function(cardLabel) {
          if(cardLabel.toLowerCase() == label.toLowerCase() && cardsArray.length < 1) {
            cardsArray.push(relatedPL[i]);
          }
        });
      }
    });
  if(cardsArray.length > 0) {
    cardsArray.forEach(function(item) {
        let div = createNode('div'),
            description = (document.documentElement.lang == 'ru') ? item.card.descriptionRU : (document.documentElement.lang == 'ja') ? item.card.descriptionJA : item.card.description,
            buttonUrl = (document.documentElement.lang == 'ru') ? item.card.buttonUrlRU : (document.documentElement.lang == 'ja') ? item.card.buttonUrlJA : item.card.buttonUrl,
            buttonText = (document.documentElement.lang == 'ru') ? item.card.buttonTextRU : (document.documentElement.lang == 'ja') ? item.card.buttonTextJA : item.card.buttonText;
        div.innerHTML = "<p class=\"rp-image\"><img src=\"" + item.card.image + "\"></p><h4>" + item.card.name + "</h4><div class=\"rp-description\"><p>" + description + "</p></div><p class=\"rp-button\"><a href=\"" + buttonUrl + "\" class=\"button button-red\" role=\"button\">" + buttonText + "</a></p>";
        $(div).addClass("productCard");
        $("#rp-cardXS").append($(div).clone());
        $("#rp-card").append(div);
    });
  } else {
    $("#relatedProducts").hide();
    $("#relatedProductsXS").hide();
  }
}*/

/** DRAFT Loading list of products info (label, title, icon, supported/deleted) **/
/*function loadProductsList () {
  var toPrint;
  $.ajax({
    url: '/hc/en-us/articles/360002016799',
    type:'GET',
    async: false,
    success: function(data) {
      var content = $('<div>').append(data).find('#productList');
      toPrint = (new Function("return " + content[0].innerHTML + ";")());
    }
  });
  return toPrint;
}*/

/** DRAFT Loading list of articles from category with specific product label from productsList **/
/*function outputArticlesListByProducts (articlesIdsFromCategory) {
  var productsList = loadProductsList();
  if (productsList.length > 0) {
  	productsList.forEach(function(productsListItem) {
      var productLabel = productsListItem.label;
      articlesIdsFromCategory.forEach(function(articleId) {
        var url = 'https://new-support.abbyy.com/api/v2/help_center/en-us/articles.json';
          fetch(url)
          .then((resp) => resp.json())
          .then(function(data) {
            let family = data.articles;
            family.map(function(article) {
              if (article.id == articleId && article.label_names.indexOf(productsListItem) > -1) {
                
              }
            })
            
          })
          .catch(function(error) {
            console.log(error);
          });
      });
    });
  }
}*/

/** NOT USED NOW articlesArray - array of Ids of articles from current category **/
/*function loadArticlesFormCategory (sectionsArray) {
  var url = 'https://new-support.abbyy.com/api/v2/help_center/en-us/articles.json',
  articlesArray = [];
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    let family = data.articles;
    family.map(function(article) {
      if (sectionsArray.indexOf(article.section_id) > -1) {
        articlesArray.push(article.id);
      }
    })
    outputArticlesListByProducts(articlesArray);
  })
  .catch(function(error) {
    console.log(error);
  });
}*/

/** NOT USED NOW sectionsArray - array of Ids of sections of current category **/
/*function loadSectionsFormCategory (categoryId) {
  var url = 'https://new-support.abbyy.com/api/v2/help_center/en-us/sections.json',
  sectionsArray = [];
  fetch(url)
  .then((resp) => resp.json())
  .then(function(data) {
    let family = data.sections;
    family.map(function(section) {
        if (section.category_id == categoryId) {
          sectionsArray.push(section.id);
        }
    })
    loadArticlesFormCategory(sectionsArray);
  })
  .catch(function(error) {
    console.log(error);
  });
}*/

/** NOT USED NOW Loading product blocks (col-sm-6: icon + header) **/
/*function loadProductBlocksCategoryPage () {
  var productsList = loadProductsList(),
      count = 0,
      sections = $('#sections-container .container');
  if (productsList.length > 0) {
  	productsList.forEach(function(productsListItem) {
      var col = document.createElement('div');
  			$(col).addClass('col-sm-6').addClass('section-item');
        col.innerHTML = "<div class=\"section-icon\"><img src=\"" + productsListItem.icon + "\"></div><div class=\"section-content\"><h3 class=\"section-title\">" + productsListItem.title + "</a></h3><ul class=\"article-list\"></ul></div>";
      if (count % 2 == 0) {
        var row = document.createElement('div');
  			$(row).addClass('row');
        $(row).append(col);
        $(sections).append(row);
      }
      else {
        sections.find('.row:last-child').append(col);
      }
      count+=1;
    });
  }
}*/

/* Load promoted articles on home page TEST*/
/*function loadPromotedFromCategoriesRecursive(url, category, article_count) {
  $.getJSON(url, function(data) {
    var family = data.articles,
    max_article_count = (category.category == 'Knowledge base') ? 11 : 3;  
    family.map(function(article) {
      if (article.promoted == true && article_count < max_article_count) {
        article_count++;
        var listItem = createNode('li');
        listItem.innerHTML = '<a href="'+article.html_url+'">'+article.name+'</a>';
        $(listItem).addClass('promoted-articles-item ' + category.info.liClass);
        $('#'+category.info.domId+' ul.promoted-articles').append(listItem);
        if($('#'+category.info.domId).css('display') == 'none') {
          $('#'+category.info.domId).show();
        }
      }
    });
    if(data.next_page != null) {
      loadPromotedFromCategoriesRecursive(data.next_page, category, article_count);
    }
  });
}*/

/** OLD load blocks with promoted articles from categories **/
function loadPromotedFromCategories() {
  var categories = [
  	{'category': 'Knowledge base', 'info': {'id': '360000005705', 'domId': 'knowledgeBasePromoted', 'liClass': ''}}, 
  	{'category': 'Documentation', 'info': {'id': '360000079589', 'domId': 'documentationPromoted', 'liClass': 'link-pdf-blue'}}, 
  	{'category': 'Downloads', 'info': {'id': '360000497619', 'domId': 'downloadsPromoted', 'liClass': 'link-download-blue'}}];
  categories.forEach(function(categoryItem) {
    var current_page = 1,
        page_count = 1,
        article_count = 0,
        max_article_count = (categoryItem.category == 'Knowledge base') ? 11 : 3;
    $.ajax({
        url: '/api/v2/help_center/' + document.documentElement.lang.toLowerCase() + '/categories/' + categoryItem.info.id + '/articles.json',
        dataType: 'json',
        async: false,
        success: function(data) {
            page_count = data.page_count;
          var articlesList = '';
        while (current_page < page_count + 1) {
          $.ajax({
              url: '/api/v2/help_center/' + document.documentElement.lang.toLowerCase() + '/categories/' + categoryItem.info.id + '/articles.json?page=' + current_page,
              dataType: 'json',
              async: false,
              success: function(data) {
              $.each(data.articles, function(idx, itm){
                if (itm.promoted == true && article_count < max_article_count) {
                  articlesList += '<li class="promoted-articles-item ' + categoryItem.info.liClass + '">';
                  articlesList += '<a href="'+itm.html_url+'">'+itm.name+'</a>';
                  articlesList += '</li>';
                  article_count++;
                }
              });
              $('#'+categoryItem.info.domId+' ul.promoted-articles').html(articlesList);
              var articlesLength = $('#'+categoryItem.info.domId+' ul.promoted-articles > li').length;
              if (articlesLength > 0) {
                $('#'+categoryItem.info.domId).show();
              }
              current_page++;
              }
          });
        }
        }
      });
  });
}

function loadArticlesSectionLabelRecursive (urlSectionArticles, divId, sectionName, sectionArticles) {
  $.getJSON(urlSectionArticles, function(data) {
    var family = data.articles;
    family.map(function(article) {
      sectionArticles.push(article);
    });
    /*if(data.next_page != null) {
      loadArticlesSectionLabelRecursive(data.next_page, divId, sectionName, sectionArticles, count);
    } else*/ if (data.next_page == null) {
      var articleUL = document.createElement('ul'),
        articleULSeeMore = document.createElement('ul'),
        divSeeMore = createNode('div'),
        divSeeMoreParent = createNode('div'),
        buttons = createNode('p'),
        liCount = 0,
        div = createNode('div');
    buttons.innerHTML = "<a href=\"#collapse" + divId + "\" class=\"button button-link button-sm button-white-blue button-see-more indent-mb-0 indent-mt-2 collapsed\" title-en=\"See All\" data-toggle=\"collapse\" data-open=\"See all\" data-close=\"Close\" aria-expanded=\"false\">See all</a>";
        $(divSeeMore).addClass("collapse text-collapse");
    $(divSeeMoreParent).addClass("hidden");
    $(divSeeMore).css("padding-top", "14px");
        divSeeMore.setAttribute("id", "collapse" + divId);
    append(divSeeMoreParent, divSeeMore);
    append(divSeeMore, articleULSeeMore);
    append(divSeeMoreParent, buttons);
      sectionArticles.forEach(function(article) {
        var li = createNode('li');
      		li.innerHTML = "<a href =\""+article.html_url+"\">"+article.title+"</a>";
      if (liCount > 2) {
        append(articleULSeeMore, li);
        $(divSeeMoreParent).removeClass("hidden");
      } else {
        append(articleUL, li);
      }
      liCount += 1;
      });
      if ($(articleUL).find('li').length > 0) {
        var h3 = createNode('h3');
      		h3.innerHTML = sectionName,
            div = createNode('div');
      $(div).addClass("col-sm-6 section-block");
      var divContent = createNode('div');
      $(divContent).addClass("section-content");
      divContent.setAttribute("id", divId);
      append(divContent, h3);
      append(divContent, articleUL);
      append(divContent, divSeeMoreParent);
      append(div, divContent);
        var sectionsRows = $("#sections-container").find('.row');
        if ($(sectionsRows).length == 0 || $(sectionsRows.lastChild).find('.section-block').length > 1) {
          var row = document.createElement('div');
  				$(row).addClass('row');
          $("#sections-container").append(row);
        }
        $("#sections-container .row:last-child").append(div);
        $('.text-collapse').on('shown.bs.collapse', function () {
        var buttonHref = $(this).attr("id");       
        var buttonText = $(".button[href='#" + buttonHref + "']").attr('data-close');
        $(".button[href='#" + buttonHref + "']").html(buttonText);
        $(".button-see-more[href='#" + buttonHref + "']").addClass('button-see-less');
        $(".button-see-more[href='#" + buttonHref + "']").removeClass('button-see-more');      
    }).on('hidden.bs.collapse', function () {
        var buttonHref = $(this).attr("id");        
        var buttonText = $(".button[href='#" + buttonHref + "']").attr('data-open');
        $(".button[href='#" + buttonHref + "']").html(buttonText);
        $(".button-see-less[href='#" + buttonHref + "']").addClass('button-see-more');
        $(".button-see-less[href='#" + buttonHref + "']").removeClass('button-see-less');
        });
    	}
      } else {
      loadArticlesSectionLabelRecursive(data.next_page, divId, sectionName, sectionArticles);
    }
    });
  
}

function loadKBSections (urlSections, label, count) {
  $.getJSON(urlSections, function(data) {
    var family = data.sections;
    family.map(function(section) {
      var articlesSectionLabel = "",
      urlSectionArticles = '/api/v2/help_center/' + document.documentElement.lang.toLowerCase() + '/sections/' + section.id + '/articles.json?label_names=' + label;
      var sectionArticles = [];
      loadArticlesSectionLabelRecursive(urlSectionArticles, section.id, section.name, sectionArticles);
    });
    });
}

function loadArticlesCategoryRecursive (url, divDOMId, divId) {
  var articlesFromCategory = [];
  $.getJSON(url, function(data) {
    var family = data.articles,
    articleUL = document.createElement('ul'),
        articleULSeeMore = document.createElement('ul'),
        divSeeMore = createNode('div'),
        divSeeMoreParent = createNode('div'),
        buttons = createNode('p'),
        liCount = 0,
        div = createNode('div');
    buttons.innerHTML = "<a href=\"#collapse" + divId + "\" class=\"button button-link button-sm button-white-blue button-see-more indent-mb-0 indent-mt-2 collapsed\" title-en=\"See All\" data-toggle=\"collapse\" data-open=\"See all\" data-close=\"Close\" aria-expanded=\"false\">See all</a>";
        $(divSeeMore).addClass("collapse text-collapse");
    $(divSeeMoreParent).addClass("hidden");
    $(divSeeMore).css("padding-top", "14px");
        divSeeMore.setAttribute("id", "collapse" + divId);
    append(divSeeMoreParent, divSeeMore);
    append(divSeeMore, articleULSeeMore);
    append(divSeeMoreParent, buttons);
    family.map(function(article) {
      let li = createNode('li');
      var liClass = (divDOMId == 'downloadsContainer') ? 'link-download-blue' : '';
      		li.innerHTML = "<a href =\""+article.html_url+"\" class=\"" + liClass  + "\">"+article.title+"</a>";
      		if (liCount > 2) {
        append(articleULSeeMore, li);
        $(divSeeMoreParent).removeClass("hidden");
      } else {
        append(articleUL, li);
      }
      liCount += 1;
    });
    if(data.next_page != null) {
      loadArticlesCategoryRecursive(data.next_page, divCategoryId, divId);
    } else {
      if ($(articleUL).find('li').length > 0) {
        $('#' + divDOMId + ' > .section-content').append(articleUL);
        $('#' + divDOMId + ' > .section-content').append(divSeeMoreParent);
        $('#ddContainer').removeClass("hidden");
        $('main').removeClass('bgwhite');
    	} else {
        $('#' + divDOMId).hide();
        $('#ddContainer > .container > .row > div:not(#' + divDOMId + ')').removeClass('col-sm-6').addClass('col-sm-12');
      }
      }
    $('.text-collapse').on('shown.bs.collapse', function () {
        var buttonHref = $(this).attr("id");       
        var buttonText = $(".button[href='#" + buttonHref + "']").attr('data-close');
        $(".button[href='#" + buttonHref + "']").html(buttonText);
        $(".button-see-more[href='#" + buttonHref + "']").addClass('button-see-less');
        $(".button-see-more[href='#" + buttonHref + "']").removeClass('button-see-more');      
    }).on('hidden.bs.collapse', function () {
        var buttonHref = $(this).attr("id");        
        var buttonText = $(".button[href='#" + buttonHref + "']").attr('data-open');
        $(".button[href='#" + buttonHref + "']").html(buttonText);
        $(".button-see-less[href='#" + buttonHref + "']").addClass('button-see-more');
        $(".button-see-less[href='#" + buttonHref + "']").removeClass('button-see-less');
        });
    });
}

function loadDDSections (categoryId, label) {
  var urlCategory = '/api/v2/help_center/' + document.documentElement.lang.toLowerCase() + '/categories/' + categoryId;
  $.getJSON(urlCategory, function(data) {
    var h3 = document.createElement('h3'),
        divDOMId = "";
    if (data.category.id == '360000079589') {
      h3.innerHTML = data.category.name;
      $('#documentationContainer > .section-content').append(h3);
      divDOMId = 'documentationContainer'
    } else if (data.category.id == '360000497619') {
      h3.innerHTML = data.category.name;
      $('#downloadsContainer > .section-content').append(h3);
      divDOMId = 'downloadsContainer';
    }
    var url = '/api/v2/help_center/' + document.documentElement.lang.toLowerCase() + '/categories/' + data.category.id + '/articles.json?label_names=' + label;
    loadArticlesCategoryRecursive(url, divDOMId, data.category.id);
    });
}

function loadProduct(label) {
  var relatedPL = productsByLabels('360010692460');
  for(i = 0; i < relatedPL.length; i++) {
          if(relatedPL[i].label.toLowerCase() == label.toLowerCase()) {
            var li = document.createElement('li'),
                h2 = document.createElement('h2');
            li.innerHTML = relatedPL[i].name;
            h2.innerHTML = relatedPL[i].name;
            $('#breadcrumbs').append(li);
            $('#title').append(h2);
          }
  }
}

/*function loadProductsTopics() {
  var urlTopics = '/api/v2/community/topics.json';
  $.getJSON(urlTopics, function(data) {
    var productFamilyCards = productsByLabels('360001928739'),
        columnsCount = 1,
        topicsFamily = data.topics.sort(function(a, b) {
    			return a.position - b.position;
				});
    productFamilyCards.forEach(function(productFamily) {
      var familyName = document.createElement('h3'),
            familyIcon = document.createElement('img'),
          	tFamilyList = document.createElement('ul');
          familyName.innerHTML = productFamily.card.family.replace(new RegExp("ABBYY ",'g'),"");
      $(familyIcon).attr('src', productFamily.card.image).attr('alt', productFamily.card.name);
      topicsFamily.map(function(topic) {
        if (topic.name.indexOf(familyName.innerHTML) == 0) {
          var productName = true;
          if ((familyName.innerHTML.indexOf('FineReader') == 0 || familyName.innerHTML.indexOf('FlexiCapture') == 0) && familyName.innerHTML.indexOf(' ') == -1) {
          if (topic.name.indexOf('FineReader Pro for Mac') > -1 || topic.name.indexOf('FlexiCapture for Invoices') > -1 || topic.name.indexOf('FineReader Engine') > -1 || topic.name.indexOf('FlexiCapture Engine') > -1 || topic.name.indexOf('FlexiCapture SDK') > -1 || topic.name.indexOf('FlexiCapture Cloud API') > -1 || topic.name.indexOf('FineReader Server') > -1) {
            productName = false;
          }
        }
          if (productName) {
          var topicName = topic.name.replace(new RegExp(familyName.innerHTML + " ",'g'),"");
          var tFamilyListItem = document.createElement('li');
          tFamilyListItem.innerHTML = "<a href=\"https://new-support.abbyy.com/hc/" + document.documentElement.lang.toLowerCase() + "/community/topics/" + topic.id + "\">" + topicName + "</a>";
                $(tFamilyList).addClass('article-list').append(tFamilyListItem);
          }
        }
      });
      if (tFamilyList.childNodes.length > 0) {
            if(columnsCount % 3 == 0 && columnsCount > 0) {
              var row = document.createElement('div');
              $(row).addClass('clearfix visible-md-block visible-lg-block');
          		$('#topicFamilyLists').append(row);
            }
        if(columnsCount % 2 == 0 && columnsCount > 0) {
              var row = document.createElement('div');
              $(row).addClass('clearfix visible-sm-block');
          		$('#topicFamilyLists').append(row);
            }
          	var col4 = document.createElement('div'),
          internalDiv = document.createElement('div'),
          iconContainer = document.createElement('p'),
          familyDescription = document.createElement('div');
          $(iconContainer).addClass('product-image').append(familyIcon);
          $(familyDescription).addClass('family-description').append(familyName).append(tFamilyList);
          	$(internalDiv).addClass('section-content').append(iconContainer).append(familyDescription);
          $(col4).addClass('col-md-4 col-sm-6').addClass('section-block').append(internalDiv)
          $('#topicFamilyLists').append(col4);
          columnsCount += 1;
            }
    });
    if(columnsCount % 3 == 0 && columnsCount > 0) {
    	var row = document.createElement('div');
      $(row).addClass('clearfix visible-md-block visible-lg-block');
      $('#topicFamilyLists').append(row);
    }
    if(columnsCount % 2 == 0 && columnsCount > 0) {
    	var row = document.createElement('div');
      $(row).addClass('clearfix visible-sm-block');
      $('#topicFamilyLists').append(row);
    }
    var col4 = document.createElement('div');
    col4.innerHTML = "<div class=\"col-md-4 col-sm-6 section-block\"><div class=\"section-content\"><p class=\"product-image\"><img src=\"https://theme.zdassets.com/theme_assets/2191466/48cf2e7a27efbf17c5f9a76d20ce44eb519019e5.svg\" alt=\"Helpfull links\"></p><div class=\"family-description\"><h3>Helpful links</h3><ul class=\"article-list\"><li><a href=\"https://new-support.abbyy.com/hc/"+ document.documentElement.lang.toLowerCase() + "/articles/360013578499\">How to set up a Support account</a></li><li><a href=\"https://new-support.abbyy.com/hc/"+ document.documentElement.lang.toLowerCase() + "/articles/360013578519\">How to contact ABBYY Support</a></li><li><a href=\"https://new-support.abbyy.com/hc/"+ document.documentElement.lang.toLowerCase() + "/articles/360013578539\">Where to find KB content</a></li></ul></div></div></div>";
    $('#topicFamilyLists').append(col4);
  });
}*/

function deleteServiceArticles (link) {
  var hiddenIds = ['360008884800', '360002235220', '360001316945', '360002235160', '360001316945', '360008929000'],
  	hiddenTitles = ['[Service article]', 'Filter by label', 'Фильтрация по тэгу', 'Community', 'Software Maintenance and Upgrade Assurance Terms', 'Страница продукта', 'Product page'],
    cutFirst = $(link)[0].href.substring($(link)[0].href.lastIndexOf('/') + 1),
    cutSecond = cutFirst.substring(0, cutFirst.indexOf('-'));
  hiddenTitles.forEach(function(item) {
    if($(link)[0].text.indexOf(item) > -1) {
      $(link).closest('li').hide();
    }
  });
  if(hiddenIds.indexOf(cutSecond) > -1) {
  	$(link).closest('li').hide();
  } 
}

/*function deleteSpecialArticles () {
  setTimeout(function(){
  if(document.getElementById('recentlyViewed') != null && $('#recentlyViewed').children.length > 0){
  $('#recentlyViewed .recent-articles ul > li > a').each(function(){
  	deleteServiceArticles(this);
  });
  }
  if(document.getElementById('sameLabelList') != null && document.getElementById('sameLabelList').hasChildNodes() && $('#sameLabelList ul').children.length > 0){
  $('#sameLabelList ul > li > a').each(function(){
  	deleteServiceArticles(this);
  });
  }
  if(document.getElementById('sameLabelListXS') != null && document.getElementById('sameLabelListXS').hasChildNodes() && $('#sameLabelListXS ul').children.length > 0){
  $('#sameLabelListXS ul > li > a').each(function(){
  deleteServiceArticles(this);
  });
  }
  },800);
}*/

function removeTagsWeDontWant () {
  var aliases = { 'environment': '360004585460', 'impact': '360004250219' },
  tagsToRemove = ['Showstopper (Affecting production deployment)'];
$("#webWidget").contents().find("[data-garden-id='dropdowns.menu']").on('DOMNodeInserted', function(e){
	var prefix = 'key:',
	envField = $("#webWidget").contents().find('div[name=\"' + prefix + aliases['environment'] + '\"]');
	if (envField[0].innerText == 'Production') {
  console.log(envField[0].innerText);
    for(var i in tagsToRemove) {
      var liTag = $("#webWidget").contents().find('li');
      $(liTag).each(function(){
        console.log("li text =", $(this)[0].textContent);
        if ($(this)[0].textContent == tagsToRemove[i]) {
          $(this).hide();
        }
      });
    }
  }
});
}

function Handler() {
  console.log("handler");
  removeTagsWeDontWant();
}
  
  function sayHi() {
    var iframe = document.getElementById('webWidget');
    console.log("sayHi");
    console.log("iframe =", iframe);
iframe.contentDocument.body.addEventListener('click', Handler);
    
}

function checkIframeLoaded() {
    // Get a handle to the iframe element
    var iframe = document.getElementById('launcher');
  if (iframe != null) {
    console.log("iframe not null");
    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    // Check if loading is complete
    if (  iframeDoc.readyState  == 'complete' ) {
      console.log('state complete');
        iframe.contentWindow.onload = function(){
            console.log("I am loaded");
        };
        afterLoading();
        return;
    } 
    window.setTimeout(checkIframeLoaded, 100);
  } else {
    console.log("frame not loaded");
    window.setTimeout(checkIframeLoaded, 100);
  }
    
}

function afterLoading(){
  console.log("I am here");
  sayHi();
}

$(document).ready(function() {

  // ******************************
// START custom ticket field JQuery TO DELETE
    //if(window.location.href.indexOf("/ru/")>0)
	//{
		//$("div.request_custom_fields_360000202709 p").html(custom_field_360000202709_ru);
	//}
	//else ($( "div.request_custom_fields_360000202709 p" ).html( custom_field_360000202709));

// END custom ticket field JQuery
// ******************************
  // social share popups
  $(".share a").click(function(e) {
    e.preventDefault();
    window.open(this.href, "", "height = 500, width = 500");
  });

  // show form controls when the textarea receives focus or backbutton is used and value exists
  var $commentContainerTextarea = $(".comment-container textarea"),
  $commentContainerFormControls = $(".comment-form-controls, .comment-ccs");

  $commentContainerTextarea.one("focus", function() {
    $commentContainerFormControls.show();
  });

  if ($commentContainerTextarea.val() !== "") {
    $commentContainerFormControls.show();
  }

  // Expand Request comment form when Add to conversation is clicked
  var $showRequestCommentContainerTrigger = $(".request-container .comment-container .comment-show-container"),
    $requestCommentFields = $(".request-container .comment-container .comment-fields"),
    $requestCommentSubmit = $(".request-container .comment-container .request-submit-comment");

  $showRequestCommentContainerTrigger.on("click", function() {
    $showRequestCommentContainerTrigger.hide();
    $requestCommentFields.show();
    $requestCommentSubmit.show();
    $commentContainerTextarea.focus();
  });

  // Mark as solved button
  var $requestMarkAsSolvedButton = $(".request-container .mark-as-solved:not([data-disabled])"),
    $requestMarkAsSolvedCheckbox = $(".request-container .comment-container input[type=checkbox]"),
    $requestCommentSubmitButton = $(".request-container .comment-container input[type=submit]");

  $requestMarkAsSolvedButton.on("click", function () {
    $requestMarkAsSolvedCheckbox.attr("checked", true);
    $requestCommentSubmitButton.prop("disabled", true);
    $(this).attr("data-disabled", true).closest("form").submit();
  });

  // Change Mark as solved text according to whether comment is filled
  var $requestCommentTextarea = $(".request-container .comment-container textarea");

  $requestCommentTextarea.on("keyup", function() {
    if ($requestCommentTextarea.val() !== "") {
      $requestMarkAsSolvedButton.text($requestMarkAsSolvedButton.data("solve-and-submit-translation"));
      $requestCommentSubmitButton.prop("disabled", false);
    } else {
      $requestMarkAsSolvedButton.text($requestMarkAsSolvedButton.data("solve-translation"));
      $requestCommentSubmitButton.prop("disabled", true);
    }
  });

  // Disable submit button if textarea is empty
  if ($requestCommentTextarea.val() === "") {
    $requestCommentSubmitButton.prop("disabled", true);
  }

  // Submit requests filter form in the request list page
  $("#request-status-select, #request-organization-select")
    .on("change", function() {
      search();
    });

  // Submit requests filter form in the request list page
  $("#quick-search").on("keypress", function(e) {
    if (e.which === 13) {
      search();
    }
  });

  function search() {
    window.location.search = $.param({
      query: $("#quick-search").val(),
      status: $("#request-status-select").val(),
      organization_id: $("#request-organization-select").val()
    });
  }

  /*$(".header-main .icon-menu").on("click", function(e) {
    e.stopPropagation();
    var menu = document.getElementById("user-nav");
    var isExpanded = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", !isExpanded);
  });*/

  /*if ($("#user-nav").children().length === 0) {
    $(".header .icon-menu").hide();
  }*/

  // Submit organization form in the request page
  $("#request-organization select").on("change", function() {
    this.form.submit();
  });

  // Toggles expanded aria to dropdown elements
  $(".dropdown-toggle:not([data-auth-action='signin'])").on("click", function(e) {
    console.log("click");
    e.preventDefault();
    e.stopPropagation();
    var isExpanded = $(this).closest(".dropdown").find('.dropdown-menu')[0].getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      var dropdownToggle = $(this);
      $('.dropdown-menu[aria-expanded="true"]').each(function(){
      	this.setAttribute('aria-expanded', 'false');
    	});
      isExpanded = false;
    }
    else {
      isExpanded = true;
    $(this).closest(".dropdown").find('.dropdown-menu')[0].setAttribute("aria-expanded", isExpanded);
    }
    
    if (isExpanded) {
      $(this).addClass("expanded-dropdown");
    } else {
    	$(this).removeClass("expanded-dropdown");
    }
  });
  
  $('body').on("click", function(e) {
    $(".dropdown-toggle").removeClass("expanded-dropdown");
    $('.dropdown-menu[aria-expanded="true"]').each(function(){
      	this.setAttribute('aria-expanded', 'false');
    	});
  });
  
  $(".collapsible-nav, .collapsible-sidebar").on("click", function(e) {
    e.stopPropagation();
    var isExpanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", !isExpanded);
  });
  
  //setup dynamic accordion//

    $('li.section').addClass('span4');

    var headers = $('.category h2')
    for (var i = 0; i < headers.length; i++) {
        var title = $(headers[i]).text(),
            flatTitle = title.replace(/[\s+\/\\]/g, '');
        $(headers[i]).siblings('section').wrapAll('<div id="' + flatTitle + '" class="panel-body collapse"><div class="accordion-inner"></div></div>');

        $(headers[i]).replaceWith('<div class="panel-heading accordion-header"><h1 class="panel-title"><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#' + flatTitle + '"><span>' + title + '</span></a></h1></div>');
        $('#' + flatTitle).prev('.panel-heading').andSelf().unwrap();
        /*if (i === 0) {
            $('#' + flatTitle).addClass('in')
        }*/

        $('.category-empty').hide();
    }
    // disable expansion
    $('.article-list li a').removeAttr('data-asynchtml-ressource');

  //output  <=10 promoted articles in block Trending topics on home page
   if(typeof $('.trending-and-downloads ul.promoted-articles').get(0) != 'undefined') {
    var _sectionArticles = $('.trending-and-downloads ul.promoted-articles');
    _sectionArticles.each(function(_aidx, _aitm) {
      var _itmCount = $(_aitm).find('li').length;
      var _allLink  = $(_aitm).prev('h3').find('a').attr('href');
      if(_itmCount > 10) {
        for(var x = (_itmCount - 1); x > 9; x--) {
          $($(_aitm).find('li')[x]).remove();
        }
      }
    });
  }
  
  var _articleVisualTitle = $('ol.breadcrumbs > li:nth-child(2) > a').html();
  $('.article-visual-title').html(_articleVisualTitle);
  
/*  $(window).on('load resize', function(e){
    win_w = $(window).width();
	if (win_w > 991) {
    $("#rightFixedColumn").affix({
          offset: {
            top: function () {
              return (this.top = $('#article-container')[0].offsetTop)
            },
            bottom: function () {
              return (this.bottom = $('footer').outerHeight(true) + $('.footer-map').outerHeight(true) + $('.help-center').outerHeight(true) + 88 + 38)
            }
          }
      });
  }
  });*/
  
  /** Hints for forms **/
  $('label + div.upload-dropzone').prev().hide(); //hiding attachments label
  $('.form-field.boolean label').on('click', function() {
    if($(this).hasClass('checked')) {
      $(this).removeClass('checked');
    }
    else {
      $(this).addClass('checked');
    }
  });
  
  var star = document.createElement('span');
  $(star).addClass('red-star');
  star.innerHTML = '*';
  $('.form-field.boolean.required label').append(star);

  /** magnific popup init **/
 var popupBlock = document.createElement('div');
  if ($('.notification .notification-text')[0] != null) {
    var text = $('.notification .notification-text')[0].innerHTML,
    header3 = ($('.notification')[0].getAttribute('class').indexOf('notification-notice') > -1) ? "<h3></h3>" : "";
    $(popupBlock)[0].innerHTML = "<div class='mfp-container mfp-inline-holder'><div class='mfp-content'><div id='popupBlock' class='white-popup-block'>" + header3 + "<p>" + text + "</p><button title='Close (Esc)' type='button' class='mfp-close' id='mfpClose'>×</button></div></div></div>";
    $(popupBlock).addClass('mfp-wrap mfp-close-btn-in mfp-auto-cursor');
    document.body.insertBefore(popupBlock, document.body.firstChild);
    var backBlock = document.createElement('div');
    $(backBlock).addClass('mfp-bg').attr('id', 'mfpBg');
    document.body.insertBefore(backBlock, document.body.firstChild);
    $('.notification').hide();
  }
  $('.mfp-wrap').on('click', function(evt){
    if(evt.target.id == "popupBlock") return;
    if(evt.target.id == "mfpClose") {
      $('.mfp-bg').hide();
      $('.mfp-wrap').hide();
      return;
    }
    if($(evt.target).closest('#popupBlock').length) return;
    $('.mfp-bg').hide();
    $('.mfp-wrap').hide();
  });
  
  if($('#relatedProducts').css('display') == 'none' || $('#sameLabelList').css('display') == 'none') {
    $('#sameLabelList').css('margin-bottom', '0');
  }
  
  $('.notification-inline.notification-error').each(function(item) {
    if($(this).css('display') != 'none') {
      $(this).closest('.form-field.required').find('input').addClass('field-error');
      $(this).closest('.form-field.required').find('textarea').addClass('field-error');
      $(this).closest('.form-field.required').find('.nesty-input').addClass('field-error');
      $(this).closest('.form-field.required.boolean').find('label').addClass('field-error');
    }
  })
  
  $('.field-error').on('focus', function(){
    $(this).removeClass('field-error').addClass('common-field');
  });
  
  if($('.notification-inline.notification-error').length > 0 && $('.notification-inline.notification-error').attr('id') != 'upload-error') {
    $('.form-field.required input:not(.field-error)').addClass('valid-data');
    $('.form-field.required textarea:not(.field-error)').addClass('valid-data');
    $('.form-field.required .nesty-input:not(.field-error)').addClass('valid-data');
    $('.form-field.required.boolean label:not(.field-error)').addClass('valid-data');
  }

  $('input.valid-data').each(function(item) {
    if($(this).attr('checked') == 'checked') {
      $(this).closest('.form-field.required.boolean').find('label').addClass('checked');
    }
  });
  
  /** Add margin-top to .related-product on right side of article **/
  if($('#sameLabelList').find('*').length != 0) {
       $('#relatedProducts').css('margin-top', '44px');
  }
  
  $('.responsive-tabs .tabs-carousel-item').each(function() {
    if($(this).attr('aria-selected') == 'true') {
      $(this).addClass('active');
    }
  });
  
  $(window).on('load resize', function(e){
    var win_w = window.innerWidth;
    if (win_w < 992) {
      $('#rightMenuContainerMD #rightHeaderMenu').appendTo('#rightMenuContainerSM');
    } else {
      $('#rightMenuContainerSM #rightHeaderMenu').appendTo('#rightMenuContainerMD');
    }
    /*if ($('main').innerHeight() < $('body').innerHeight() && $('.error-page-visual').length > 0) {
      console.log("main height =", $('main').innerHeight());
      console.log("body height =", $('body').innerHeight());
      $('main').css('height', $('body').innerHeight() - $('header').innerHeight());
      $('.error-page-visual').css('height', $('body').innerHeight() - $('header').innerHeight() - $('.footer-map').innerHeight() - $('footer').innerHeight() - $('.powered-by-zendesk').innerHeight());
    } else {
      $('main').css('height', 'auto');
    }*/
    
    $('.community-footer').closest('main').addClass('autoheight-main').css('padding-bottom', $('.community-footer').innerHeight());
    
    $('.help-center').closest('main').addClass('autoheight-main').css('padding-bottom', $('.help-center').innerHeight());
  });
  
  $(window).on('load', function(e){
  	checkPaginationArrows();
  });
  
  $.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
	}
  
  if (window.location.href.indexOf('/search?') > -1) {
     var communitySearchUrl = '/hc/api/v2/community/search.json?locale=' + document.documentElement.lang.toLowerCase() + '&query=',
        knowledgeBaseSearchUrl = '/hc/api/v2/articles/search.json?locale=' + document.documentElement.lang.toLowerCase() + '&query='
    const filterName = $.urlParam('filter_by'),
          queryName = $.urlParam('query');
    $.getJSON(knowledgeBaseSearchUrl + queryName, function(data) {
      var resultsCount = data.count;
      //$('#knowledge_base_button a').html('See all ' + resultsCount + ' knowledge base results');
    });
    $.getJSON(communitySearchUrl + queryName, function(data) {
      var resultsCount = data.count;
      //$('#community_button a').html('See all ' + resultsCount + ' community results');
    });
    if(filterName != null) {
      $('#' + filterName).removeClass('col-md-6').addClass('col-sm-12');
      $('#' + filterName + '_button').hide();
      $('#pagination').show();
      if(filterName == 'knowledge_base') {
        $('#community').hide();
      }
      else {
        $('#knowledge_base').hide();
      }
    }
  }
  
  $('a.collapsed').attr('data-toggle', 'collapse');
  
  if($('.pagination .pagination-next a').length > 0) {
  	$('.pagination .pagination-next a')[0].innerHTML = "...";
  }
  if ($('.pagination .pagination-prev a').length > 0) {
  	$('.pagination .pagination-prev a')[0].innerHTML = "...";
  }
  
  if (HelpCenter.user.role=="manager" || HelpCenter.user.role=="agent"){
 		$(".help-center div.manager_agent").show();
	}
  else {
    $(".help-center div.others").show();
  }
 if (HelpCenter.user.role=="manager" || HelpCenter.user.role=="agent" || HelpCenter.user.role=="end_user") {
 $('#communityLink').removeClass('hidden');
 }
  console.log("HelpCenter object =", HelpCenter);
  var isSMUAPremier = false;
  if (HelpCenter.user.organizations.length > 0) {
    console.log("length > 0");
    for (var i = 0; i < HelpCenter.user.organizations.length; i++) {
      for (var j = 0; j < HelpCenter.user.organizations[i].tags.length; j++) {
        if (HelpCenter.user.organizations[i].tags[j] == "smua_premier") {
          console.log("is smua_premier");
          isSMUAPremier = true;  
        }
      }
    }
    if (isSMUAPremier) {
      window.zESettings = {
              webWidget: {
                chat: {
                  suppress: false,
                  tags: 'test_true'
                },
                contactForm: {
                  suppress: false
                }
              }
            };
      zE('webWidget', 'chat:addTags', 'test_true'); 
      zE('webWidget', 'chat:removeTags', 'test_false'); 
      console.log("premier window zesettings =", window.zESettings); 
    } else {
     window.zESettings = {
              webWidget: {
                chat: {
                  suppress: true,
                  tags: 'test_false'
                }
              }
            };
      zE('webWidget', 'chat:addTags', 'test_false'); 
      zE('webWidget', 'chat:removeTags', 'test_true'); 
      console.log("all others window zesettings =", window.zESettings);
    }
  } else {
    console.log("length = 0");
    window.zESettings = {
              webWidget: {
                chat: {
                  suppress: true,
                  tags: 'test_false'
                }
              }
            };
    zE('webWidget', 'chat:addTags', 'test_false');
    zE('webWidget', 'chat:removeTags', 'test_true'); 
      console.log("all others window zesettings =", window.zESettings); 
  }
  
  var str = $('.activity-featured-lists h2.recent-activity-header').html();
  if (str != null) {
  	var lastIndex = str.lastIndexOf(" ");
		$('.activity-featured-lists h2.recent-activity-header').text(str.substring(0, lastIndex));
  }
  
  $('.blocks-item .blocks-item-description').each(function() {
    if ($(this)[0].innerHTML == "") {
      $(this).closest('.blocks-item-link').addClass('short-item');
    }
  });
  $('input[type="search"]').on('input change', function(){
    setTimeout(function() {
      if($('zd-autocomplete').length > 0) {
      $('zd-autocomplete-option').each(function(){
        if($(this)[0].innerHTML.indexOf('<zd-autocomplete-breadcrumbs> - Service category') > -1) {
          $(this).addClass('hidden');
        }
      });
    }
    }, 700);
  });
  
  $(window).on('blur',function() { 
    $('.dropdown-toggle').parent().removeClass('expanded-dropdown');
    $('.dropdown-menu').attr('aria-expanded', 'false');
  });
  
  //block expanded by default - for specifications
  $('#collapse-expanded-link').attr('aria-expanded', 'true');
  
  $('.image-popup-vertical-fit').magnificPopup({
		type: 'image',
		closeOnContentClick: true,
		mainClass: 'mfp-img-mobile',
		image: {
			verticalFit: true
		}
});
  
  $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
		disableOn: 700,
		type: 'iframe',
		mainClass: 'mfp-fade',
		removalDelay: 160,
		preloader: false,

		fixedContentPos: false
	});
  
  //expanded block by # in url - for specifications
var elementIdToScroll =  window.location.hash;
if(window.location.hash != ''){
  $(".collapse.in").removeClass("in");
  $("a[aria-expanded='true']").attr('aria-expanded', 'false');
  $(elementIdToScroll).addClass("in");
  $("a[href='" + elementIdToScroll + "']").first().attr('aria-expanded', 'true');
   $('html,body').animate({scrollTop: $(elementIdToScroll).offset().top - 70},'slow');
} 
  
  // for all text openers with text change
$('.text-collapse').on('shown.bs.collapse', function () {
        var buttonHref = $(this).attr("id");       
        var buttonText = $(".button[href='#" + buttonHref + "']").attr('data-close');
        $(".button[href='#" + buttonHref + "']").html(buttonText);
        $(".button-see-more[href='#" + buttonHref + "']").addClass('button-see-less');
        $(".button-see-more[href='#" + buttonHref + "']").removeClass('button-see-more');       
    }).on('hidden.bs.collapse', function () {
        var buttonHref = $(this).attr("id");        
        var buttonText = $(".button[href='#" + buttonHref + "']").attr('data-open');
        $(".button[href='#" + buttonHref + "']").html(buttonText);
        $(".button-see-less[href='#" + buttonHref + "']").addClass('button-see-more');
        $(".button-see-less[href='#" + buttonHref + "']").removeClass('button-see-less');
        });
  var notDefaultLanguage = window.location.href.indexOf('/en-us') == -1;
var isArticle = window.location.href.indexOf('/articles/') > -1;
var isErrorPage = $(".error-page").length > 0;

if ( isArticle && notDefaultLanguage && isErrorPage ) {
    var newURL = window.location.href.replace(/(.*\/hc\/)([\w-]+)(\/.*)/, "$1en-us$3");
    window.location.href =  newURL;
}
  
$(window).load(function(){ checkIframeLoaded();});
});

/***** $(document).ready END *****/