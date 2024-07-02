
import jQuery from 'jquery';

(function($) {
    "use strict";
  
      jQuery(document).ready(function(){
        
       
    
          var $window = $(window),
          $body = $('body');
  
        //   (function () {
        //       var $ltn__utilizeToggle = $('.ltn__utilize-toggle'),
        //           $ltn__utilize = $('.ltn__utilize'),
        //           $ltn__utilizeOverlay = $('.ltn__utilize-overlay'),
        //           $mobileMenuToggle = $('.mobile-menu-toggle');
        //       $ltn__utilizeToggle.on('click', function (e) {
        //           e.preventDefault();
        //           var $this = $(this),
        //               $target = $this.attr('href');
        //           $body.addClass('ltn__utilize-open');
        //           $($target).addClass('ltn__utilize-open');
        //           $ltn__utilizeOverlay.fadeIn();
        //           if ($this.parent().hasClass('mobile-menu-toggle')) {
        //               $this.addClass('close');
        //           }
        //       });
        //       $('.ltn__utilize-close, .ltn__utilize-overlay').on('click', function (e) {
        //           e.preventDefault();
        //           $body.removeClass('ltn__utilize-open');
        //           $ltn__utilize.removeClass('ltn__utilize-open');
        //           $ltn__utilizeOverlay.fadeOut();
        //           $mobileMenuToggle.find('a').removeClass('close');
        //       });
        //   })();
  


  
 
          
  
 
  
  
  
  
      });
      function mobileltn__utilizeMenu() {
        var $ltn__utilizeNav = $('.ltn__utilize-menu, .overlay-menu'),
            $ltn__utilizeNavSubMenu = $ltn__utilizeNav.find('.sub-menu');

        /*Add Toggle Button With Off Canvas Sub Menu*/
        $ltn__utilizeNavSubMenu.parent().prepend('<span class="menu-expand"></span>');

        /*Category Sub Menu Toggle*/
        $ltn__utilizeNav.on('click', 'li a, .menu-expand', function (e) {
            var $this = $(this);
            if ($this.attr('href') === '#' || $this.hasClass('menu-expand')) {
                e.preventDefault();
                if ($this.siblings('ul:visible').length) {
                    $this.parent('li').removeClass('active');
                    $this.siblings('ul').slideUp();
                    $this.parent('li').find('li').removeClass('active');
                    $this.parent('li').find('ul:visible').slideUp();
                } else {
                    $this.parent('li').addClass('active');
                    $this.closest('li').siblings('li').removeClass('active').find('li').removeClass('active');
                    $this.closest('li').siblings('li').find('ul:visible').slideUp();
                    $this.siblings('ul').slideDown();
                }
            }
        });
    }
    mobileltn__utilizeMenu();
    

    $(function() {
        $('a.page-scroll').bind('click', function(event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 1500, 'easeInOutExpo');
            event.preventDefault();
        });
    });
 
 
    // $(document).ready(function(){

    //     // helpful variables
    //     var slider = $('.slider');
    //     var sliderInner = slider.find('.slider-inner');
    //     var sliderOrigin = slider.find('.slider-origin');
    //     var sliderItems = slider.find('.slider-item');
    //     var itemsLength = sliderItems.length;
    //     var calcDeg = 270 / itemsLength;
    //     var clickDown = false;
    //     var mouseMove = false;
    //     var moveFrom = null;
    //     var moveTo = null; // Corrected variable name
    //     var extraDeg = 0;
    //     var currentItem = sliderItems.eq(0);
    
    //     // slider origin width & height = half of item height
    //     sliderOrigin.width(sliderItems.outerHeight() / 2);
    //     sliderOrigin.height(sliderItems.outerHeight() / 2);
        
    //     // slider inner width & height = item height * 3.5
    //     sliderInner.width(sliderItems.outerHeight()*3.5);
    //     sliderInner.height(sliderItems.outerHeight()*3.5);
    
    //     var sliderInnerWidth = sliderInner.outerWidth();
    //     var sliderInnerOffset = sliderInner.offset();
    
    //     sliderOrigin.css('margin-top',(sliderInner.height() / 2) - (sliderOrigin.height() / 2));
        
    //     // calc rotation positioning
    //     function rotationPosition(exceptIndex){
    //         exceptIndex = exceptIndex | 0;
    //         var i = 1;
    //         sliderItems.each(function(e){
    //             var $this = $(this);
    //             extraDeg = exceptIndex > itemsLength/2? 360: 0;
    //             if(e === exceptIndex){
    //                 $this.addClass('active').css('transform', 'rotate('+extraDeg+'deg)');
    //             }else{
    //                 $this.css('transform', 'rotate('+((i*calcDeg)+45)+'deg)');
    //                 i++;
    //             }
    //         });
    //     }rotationPosition();
    
    
    //     // click event on item
    //     var clickedItemIndex = null;
    //     function sliderItemsClickEvent(){
    
    //         sliderItems.mousedown(function(e){
    //             if(clickedItemIndex == null && e.which == 1){
    //                 clickedItemIndex = $(this).index();
    //             }
    //         });
    //         sliderItems.mouseup(function(){
    //             var $this = $(this);
    //             if(clickedItemIndex === $this.index()){
    //                 currentItem = $this;
    //                 pushIndex($this.index());
    //             }
    //         });
    //     }sliderItemsClickEvent();
    
    //     // push index of the activated item
    //     function pushIndex(index){
    //         sliderItems.removeClass('active');
    //         rotationPosition(index);
    //     }
    
    //     // clickDown = true if mousedown on slider
    //     sliderInner.mousedown(function(e){
    //         clickDown = true;
    //         moveFrom = e.pageX;
    //     });
    
    
    //     // clickDown = false if mouseup on any place in the page
    //     $(document).mouseup(function(e){
    //         clickDown = false;
    //         setTimeout(function(){ clickedItemIndex = null; }, 505);
    //         // setTimeout(function(){clickDown = false;}, 505);
    //         if(mouseMove){
    //             mouseMove = false;
    //             moveTo = e.pageX; // Corrected variable name
    //             swipe(moveFrom, moveTo);
    //         }
    //     });
    
    
    //     // calc mouse move on sliderInner div
    //     sliderInner.mousemove(function(e){
    //         if(clickDown){
    //             if(!mouseMove){mouseMove = true;}
    //             var offsetX = e.pageX - sliderInnerOffset.left;
    //             var move = moveFrom - sliderInnerOffset.left;
    //             var motionDeg = ((offsetX - move)/sliderInnerWidth) * (calcDeg*2);
    //             extraDeg = currentItem.index() > itemsLength/2? 360:0; 
    //             sliderInner.find('.slider-item.active').css('transform', 'rotate('+(motionDeg+extraDeg)+'deg)');
    //         }
    //     });
    
    //     function swipe(from, to){
    //         var distance = Math.abs(from - to); // mouse move distance
    //         var rightDir = from < to;
    //         if(distance > sliderInnerWidth/4){
    //             navigate();
    //         }else{
    //             currentItem.css('transform', 'rotate('+(currentItem.index() > itemsLength/2? 360:0)+'deg)');
    //         }
    
    //         function navigate(){
    //             if(rightDir){
    //                 var nextIndex = currentItem.next().index();
    //                 pushIndex(nextIndex != -1? nextIndex:  0);
    //             }else{
    //                 var prevIndex = currentItem.prev().index();
    //                 pushIndex( prevIndex != -1? prevIndex:  sliderItems.length -1);
    //             }
    //             currentItem = sliderInner.find('.slider-item.active');
    //         }
    
    //     }
    // });
    
    
  })(jQuery);

  