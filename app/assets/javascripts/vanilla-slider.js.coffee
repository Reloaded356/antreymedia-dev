if '#{is_home_page}'

  window.onload = ->

    each = (e, callback) ->
      i = 0
      l = e.length
      while i < l
        callback.call e[i], i, e[i]
        i++
      return

    #add active class to current slide

    activeSlide = ->
      each slides, (index, e) ->
        e.classList.remove 'active'
        return
      slides[i].classList.add 'active'
      return

    slideForward = ->
      i++
      if i > lastSlide
        i = 0
      translateSlider()
      return

    slideBackward = ->
      i--
      if i < 0
        i = lastSlide
      translateSlider()
      return

    translateSlider = ->
      translateBy = i * translateLen
      slideOuter.style.transform = 'translateX(' + translateBy + '%)'
      activeSlide()
      return

    autoSlideInterval = ->
      window.clearInterval slideInterval
      slideInterval = window.setInterval(slideForward, slideDuration)
      return

    # next prev controls

    setControls = (control, d) ->
      control.addEventListener 'click', ->
        window.clearInterval slideInterval
        if d == -1 then slideBackward() else slideForward()
        autoSlideInterval()
        return
      return

    swipeSlide = ->
      slideLeft = slideOuter.offsetLeft
      slideOuterWidth = slideOuter.clientWidth
      startPoint = undefined
      movedLength = undefined
      diff = undefined

      mouseMoveFunction = (m) ->
        `var diff`
        movedLength = (m.pageX - startPoint) / slideOuterWidth * 100
        diff = translateBy + movedLength
        slideOuter.style.transform = 'translate3d(' + diff + '%, 0, 0)'
        return

      slideOuter.onmousedown = (e) ->
        window.clearInterval slideInterval
        slideOuter.style.transition = 'all .4s ease'
        startPoint = e.pageX
        slideOuter.addEventListener 'mousemove', mouseMoveFunction
        return

      slideOuter.onmouseup = (e) ->
        slideOuter.removeEventListener 'mousemove', mouseMoveFunction
        if movedLength >= threshold
          slideBackward()
        else if movedLength < -threshold
          slideForward()
        else
          slideOuter.style.transform = 'translate3d(' + translateBy + '%, 0, 0)'
        slideOuter.style.transition = ''
        autoSlideInterval()
        return

      return

    'use strict'
    slideDuration = 20000
    pauseOnHover = true
    slideContainer = document.getElementById('slider-container')
    slideOuter = document.getElementById('slider-outer')
    slides = slideOuter.getElementsByClassName('slide')
    slidesLen = slides.length
    slidePercent = 100 / slidesLen
    lastSlide = slidesLen - 1
    slideLeft = document.getElementsByClassName('left')[0]
    slideRight = document.getElementsByClassName('right')[0]
    translateLen = slidePercent * -1
    translateBy = 0
    threshold = 1.3
    i = 0
    slideInterval = undefined
    # slides outer container width in percent
    # equal to slides number * 100
    slideOuter.style.width = slidesLen * 100 + '%'
    # slide width
    each slides, (i, slide) ->
      slide.style.width = slidePercent + '%'
      return
    activeSlide()
    autoSlideInterval()
    setControls slideLeft, -1
    setControls slideRight, 1
    if pauseOnHover
      slideContainer.addEventListener 'mouseover', ->
        window.clearInterval slideInterval
        return
      slideContainer.addEventListener 'mouseout', ->
        autoSlideInterval()
        return
    swipeSlide()
    return
