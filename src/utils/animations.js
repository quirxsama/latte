import anime from 'animejs/lib/anime.es.js';
import { ANIMATION_CONFIG } from '../constants/spotify';

// 3D Card Animation Utilities
export const create3DCardEffect = (element, options = {}) => {
  const {
    perspective = 1000,
    rotateX = 15,
    rotateY = 15,
    scale = 1.05,
    duration = ANIMATION_CONFIG.DURATION.FAST,
    easing = ANIMATION_CONFIG.EASING.EASE_OUT
  } = options;

  if (!element) return null;

  // Set initial 3D properties
  element.style.transformStyle = 'preserve-3d';
  element.style.perspective = `${perspective}px`;

  const handleMouseMove = (e) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateXValue = (mouseY / rect.height) * rotateX;
    const rotateYValue = -(mouseX / rect.width) * rotateY;

    anime({
      targets: element,
      rotateX: rotateXValue,
      rotateY: rotateYValue,
      scale: scale,
      duration: duration,
      easing: easing,
    });
  };

  const handleMouseLeave = () => {
    anime({
      targets: element,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: duration,
      easing: easing,
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  // Return cleanup function
  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};

// Staggered entrance animation for multiple elements
export const animateStaggeredEntrance = (elements, options = {}) => {
  const {
    delay = 100,
    duration = ANIMATION_CONFIG.DURATION.NORMAL,
    easing = ANIMATION_CONFIG.EASING.EASE_OUT,
    translateY = 50,
    opacity = [0, 1],
    scale = [0.8, 1]
  } = options;

  if (!elements || elements.length === 0) return null;

  return anime({
    targets: elements,
    opacity: opacity,
    translateY: [translateY, 0],
    scale: scale,
    duration: duration,
    delay: anime.stagger(delay),
    easing: easing,
  });
};

// Smooth scroll animation
export const animateScrollTo = (target, options = {}) => {
  const {
    duration = ANIMATION_CONFIG.DURATION.SLOW,
    easing = ANIMATION_CONFIG.EASING.EASE_IN_OUT,
    offset = 0
  } = options;

  let targetPosition;
  
  if (typeof target === 'number') {
    targetPosition = target;
  } else if (typeof target === 'string') {
    const element = document.querySelector(target);
    if (!element) return null;
    targetPosition = element.offsetTop + offset;
  } else if (target instanceof Element) {
    targetPosition = target.offsetTop + offset;
  } else {
    return null;
  }

  return anime({
    targets: document.documentElement,
    scrollTop: targetPosition,
    duration: duration,
    easing: easing,
  });
};

// Floating animation for elements
export const createFloatingAnimation = (element, options = {}) => {
  const {
    translateY = 10,
    duration = 3000,
    direction = 'alternate',
    easing = 'easeInOutSine'
  } = options;

  if (!element) return null;

  return anime({
    targets: element,
    translateY: [-translateY, translateY],
    duration: duration,
    direction: direction,
    loop: true,
    easing: easing,
  });
};

// Pulse animation for active elements
export const createPulseAnimation = (element, options = {}) => {
  const {
    scale = [1, 1.1],
    duration = 1000,
    direction = 'alternate',
    easing = 'easeInOutQuad'
  } = options;

  if (!element) return null;

  return anime({
    targets: element,
    scale: scale,
    duration: duration,
    direction: direction,
    loop: true,
    easing: easing,
  });
};

// Ripple effect animation
export const createRippleEffect = (element, event, options = {}) => {
  const {
    color = 'rgba(29, 185, 84, 0.3)',
    duration = 600,
    easing = 'easeOutQuart'
  } = options;

  if (!element || !event) return null;

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: ${color};
    transform: scale(0);
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
  `;

  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);

  return anime({
    targets: ripple,
    scale: [0, 1],
    opacity: [1, 0],
    duration: duration,
    easing: easing,
    complete: () => {
      ripple.remove();
    }
  });
};

// Morphing animation between states
export const createMorphAnimation = (element, fromState, toState, options = {}) => {
  const {
    duration = ANIMATION_CONFIG.DURATION.NORMAL,
    easing = ANIMATION_CONFIG.EASING.EASE_IN_OUT
  } = options;

  if (!element) return null;

  // Set initial state
  Object.assign(element.style, fromState);

  return anime({
    targets: element,
    ...toState,
    duration: duration,
    easing: easing,
  });
};

// Parallax scroll effect
export const createParallaxEffect = (elements, options = {}) => {
  const {
    speed = 0.5,
    direction = 'vertical'
  } = options;

  if (!elements || elements.length === 0) return null;

  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    
    elements.forEach((element, index) => {
      const rate = scrolled * speed * (index + 1);
      
      if (direction === 'vertical') {
        element.style.transform = `translateY(${rate}px)`;
      } else {
        element.style.transform = `translateX(${rate}px)`;
      }
    });
  };

  window.addEventListener('scroll', handleScroll);

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

// Loading animation utilities
export const createLoadingAnimation = (element, options = {}) => {
  const {
    type = 'spin',
    duration = 1000,
    easing = 'linear'
  } = options;

  if (!element) return null;

  switch (type) {
    case 'spin':
      return anime({
        targets: element,
        rotate: '1turn',
        duration: duration,
        easing: easing,
        loop: true,
      });
    
    case 'pulse':
      return anime({
        targets: element,
        scale: [1, 1.2, 1],
        duration: duration,
        easing: easing,
        loop: true,
      });
    
    case 'bounce':
      return anime({
        targets: element,
        translateY: [0, -20, 0],
        duration: duration,
        easing: easing,
        loop: true,
      });
    
    default:
      return null;
  }
};

// Intersection Observer animation trigger
export const createIntersectionAnimation = (elements, animationFn, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px'
  } = options;

  if (!elements || elements.length === 0 || typeof animationFn !== 'function') {
    return null;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animationFn(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold,
    rootMargin
  });

  elements.forEach(element => {
    observer.observe(element);
  });

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
};
