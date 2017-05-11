if ('#{is_home_page}') {
  window.onload = function() {
    var activeSlide, autoSlideInterval, each, i, lastSlide, pauseOnHover, setControls, slideBackward, slideContainer, slideDuration, slideForward, slideInterval, slideLeft, slideOuter, slidePercent, slideRight, slides, slidesLen, swipeSlide, threshold, translateBy, translateLen, translateSlider;
    each = function(e, callback) {
      var i, l;
      i = 0;
      l = e.length;
      while (i < l) {
        callback.call(e[i], i, e[i]);
        i++;
      }
    };
    activeSlide = function() {
      each(slides, function(index, e) {
        e.classList.remove('active');
      });
      slides[i].classList.add('active');
    };
    slideForward = function() {
      var i;
      i++;
      if (i > lastSlide) {
        i = 0;
      }
      translateSlider();
    };
    slideBackward = function() {
      var i;
      i--;
      if (i < 0) {
        i = lastSlide;
      }
      translateSlider();
    };
    translateSlider = function() {
      var translateBy;
      translateBy = i * translateLen;
      slideOuter.style.transform = 'translateX(' + translateBy + '%)';
      activeSlide();
    };
    autoSlideInterval = function() {
      var slideInterval;
      window.clearInterval(slideInterval);
      slideInterval = window.setInterval(slideForward, slideDuration);
    };
    setControls = function(control, d) {
      control.addEventListener('click', function() {
        window.clearInterval(slideInterval);
        if (d === -1) {
          slideBackward();
        } else {
          slideForward();
        }
        autoSlideInterval();
      });
    };
    swipeSlide = function() {
      var diff, mouseMoveFunction, movedLength, slideLeft, slideOuterWidth, startPoint;
      slideLeft = slideOuter.offsetLeft;
      slideOuterWidth = slideOuter.clientWidth;
      startPoint = void 0;
      movedLength = void 0;
      diff = void 0;
      mouseMoveFunction = function(m) {
        var diff;
        movedLength = (m.pageX - startPoint) / slideOuterWidth * 100;
        diff = translateBy + movedLength;
        slideOuter.style.transform = 'translate3d(' + diff + '%, 0, 0)';
      };
      slideOuter.onmousedown = function(e) {
        window.clearInterval(slideInterval);
        slideOuter.style.transition = 'all .4s ease';
        startPoint = e.pageX;
        slideOuter.addEventListener('mousemove', mouseMoveFunction);
      };
      slideOuter.onmouseup = function(e) {
        slideOuter.removeEventListener('mousemove', mouseMoveFunction);
        if (movedLength >= threshold) {
          slideBackward();
        } else if (movedLength < -threshold) {
          slideForward();
        } else {
          slideOuter.style.transform = 'translate3d(' + translateBy + '%, 0, 0)';
        }
        slideOuter.style.transition = '';
        autoSlideInterval();
      };
    };
    'use strict';
    slideDuration = 20000;
    pauseOnHover = true;
    slideContainer = document.getElementById('slider-container');
    slideOuter = document.getElementById('slider-outer');
    slides = slideOuter.getElementsByClassName('slide');
    slidesLen = slides.length;
    slidePercent = 100 / slidesLen;
    lastSlide = slidesLen - 1;
    slideLeft = document.getElementsByClassName('left')[0];
    slideRight = document.getElementsByClassName('right')[0];
    translateLen = slidePercent * -1;
    translateBy = 0;
    threshold = 1.3;
    i = 0;
    slideInterval = void 0;
    slideOuter.style.width = slidesLen * 100 + '%';
    each(slides, function(i, slide) {
      slide.style.width = slidePercent + '%';
    });
    activeSlide();
    autoSlideInterval();
    setControls(slideLeft, -1);
    setControls(slideRight, 1);
    if (pauseOnHover) {
      slideContainer.addEventListener('mouseover', function() {
        window.clearInterval(slideInterval);
      });
      slideContainer.addEventListener('mouseout', function() {
        autoSlideInterval();
      });
    }
    swipeSlide();
  };
}
