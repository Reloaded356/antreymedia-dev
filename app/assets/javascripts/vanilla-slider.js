window.onload = function () {
  slideOuter = document.getElementById('slider-outer');
  foundClass = document.getElementsByClassName('slide');
  console.log(foundClass.length);
  if (foundClass.length > 0) {
    console.log("homepage ran");
      'use strict';
      function each(e, callback) {
          var i = 0, l = e.length;
          for (; i < l; i++) {
              callback.call(e[i], i, e[i]);
          }
      }

      var slideDuration = 20000, // slide duration in ms
          pauseOnHover = true, // pause auto play on hover

          slideContainer = document.getElementById('slider-container'),
          slideOuter = document.getElementById('slider-outer'),
          slides = slideOuter.getElementsByClassName('slide'),
          slidesLen = slides.length,
          slidePercent = 100 / slidesLen,
          lastSlide = slidesLen - 1,
          slideLeft = document.getElementsByClassName('left')[0],
          slideRight = document.getElementsByClassName('right')[0],
          translateLen = slidePercent * -1,
          translateBy = 0,
          threshold = 1.3,
          i = 0,
          slideInterval;

      // slides outer container width in percent
      // equal to slides number * 100
      slideOuter.style.width = slidesLen * 100 + '%';

      // slide width
      each(slides, function (i, slide) {
          slide.style.width = slidePercent + '%';
      });

      //add active class to current slide
      function activeSlide() {
          each(slides, function (index, e) {
              e.classList.remove('active');
          });
          slides[i].classList.add('active');
      }
      activeSlide();

      function slideForward() {
          i++;
          if (i > lastSlide) {i = 0;}
          translateSlider();
      }
      function slideBackward() {
          i--;
          if (i < 0) {i = lastSlide;}
          translateSlider();
      }
      function translateSlider() {
          translateBy = i * translateLen;
          slideOuter.style.transform = 'translateX('+ translateBy +'%)';
          activeSlide();
      }
      function autoSlideInterval () {
          window.clearInterval(slideInterval);
          slideInterval = window.setInterval(slideForward, slideDuration);
      }
      autoSlideInterval();

      // next prev controls
      function setControls(control, d) {
          control.addEventListener('click', function () {
              window.clearInterval(slideInterval);
              d === -1 ? slideBackward() : slideForward();
              autoSlideInterval();
          });
      }
      setControls(slideLeft, -1);
      setControls(slideRight, 1);

      if (pauseOnHover) {
          slideContainer.addEventListener('mouseover', function () {
              window.clearInterval(slideInterval);
          });
          slideContainer.addEventListener('mouseout', function () {
              autoSlideInterval();
          });
      }

      function swipeSlide() {
          var slideLeft = slideOuter.offsetLeft,
              // translate when movedLength pass it
              slideOuterWidth = slideOuter.clientWidth,
              startPoint,
              movedLength,
              diff;

          function mouseMoveFunction(m) {
              movedLength = (m.pageX - startPoint) / slideOuterWidth * 100;
              var diff = translateBy + movedLength;
              slideOuter.style.transform = 'translate3d('+ diff +'%, 0, 0)';
          }
          slideOuter.onmousedown = function (e) {
              window.clearInterval(slideInterval);
              slideOuter.style.transition = 'all .4s ease';
              startPoint = e.pageX;
              slideOuter.addEventListener('mousemove', mouseMoveFunction);
          };
          slideOuter.onmouseup = function (e) {
              slideOuter.removeEventListener('mousemove', mouseMoveFunction);
              if (movedLength >= threshold) {
                  slideBackward();
              }
              else if (movedLength < -threshold ) {
                  slideForward();
              }
              else {
                  slideOuter.style.transform = 'translate3d('+translateBy+'%, 0, 0)';
              }
              slideOuter.style.transition = '';
              autoSlideInterval();
          };
      }
      swipeSlide();
  }
};
