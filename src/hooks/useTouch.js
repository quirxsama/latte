import { useState, useEffect, useRef, useCallback } from 'react';
import { getGestureThresholds } from '../utils/responsive';

export const useTouch = (element, options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    onPinch,
    preventDefault = true,
  } = options;

  const [touchState, setTouchState] = useState({
    isTouching: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    direction: null,
    velocity: 0,
  });

  const touchStartTime = useRef(0);
  const longPressTimer = useRef(null);
  const initialDistance = useRef(0);
  const thresholds = getGestureThresholds();

  const calculateDistance = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const calculateVelocity = useCallback((distance, time) => {
    return time > 0 ? distance / time : 0;
  }, []);

  const getSwipeDirection = useCallback((deltaX, deltaY) => {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    touchStartTime.current = Date.now();

    setTouchState({
      isTouching: true,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      direction: null,
      velocity: 0,
    });

    // Handle multi-touch for pinch gestures
    if (e.touches.length === 2 && onPinch) {
      initialDistance.current = calculateDistance(e.touches[0], e.touches[1]);
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress(e);
      }, thresholds.longPressThreshold);
    }
  }, [preventDefault, onPinch, onLongPress, calculateDistance, thresholds.longPressThreshold]);

  const handleTouchMove = useCallback((e) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;

    setTouchState(prev => {
      const deltaX = currentX - prev.startX;
      const deltaY = currentY - prev.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const direction = getSwipeDirection(deltaX, deltaY);

      return {
        ...prev,
        currentX,
        currentY,
        deltaX,
        deltaY,
        distance,
        direction,
      };
    });

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch && initialDistance.current > 0) {
      const currentDistance = calculateDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance.current;
      onPinch({ scale, distance: currentDistance });
    }

    // Cancel long press if finger moves too much
    if (longPressTimer.current) {
      const deltaX = currentX - touchState.startX;
      const deltaY = currentY - touchState.startY;
      const moveDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (moveDistance > thresholds.tapThreshold) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, [
    preventDefault, 
    onPinch, 
    calculateDistance, 
    getSwipeDirection, 
    touchState.startX, 
    touchState.startY,
    thresholds.tapThreshold
  ]);

  const handleTouchEnd = useCallback((e) => {
    if (preventDefault) {
      e.preventDefault();
    }

    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime.current;

    setTouchState(prev => {
      const velocity = calculateVelocity(prev.distance, touchDuration);
      
      // Determine if it's a swipe
      const isSwipe = prev.distance > thresholds.swipeThreshold && velocity > thresholds.swipeVelocity;
      
      // Determine if it's a tap
      const isTap = prev.distance <= thresholds.tapThreshold && touchDuration < thresholds.longPressThreshold;

      // Handle swipe gestures
      if (isSwipe) {
        switch (prev.direction) {
          case 'left':
            onSwipeLeft && onSwipeLeft(e, { ...prev, velocity });
            break;
          case 'right':
            onSwipeRight && onSwipeRight(e, { ...prev, velocity });
            break;
          case 'up':
            onSwipeUp && onSwipeUp(e, { ...prev, velocity });
            break;
          case 'down':
            onSwipeDown && onSwipeDown(e, { ...prev, velocity });
            break;
        }
      }

      // Handle tap
      if (isTap && onTap) {
        onTap(e, prev);
      }

      return {
        ...prev,
        isTouching: false,
        velocity,
      };
    });

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Reset pinch distance
    initialDistance.current = 0;
  }, [
    preventDefault,
    calculateVelocity,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    thresholds
  ]);

  useEffect(() => {
    const targetElement = element?.current || element;
    
    if (!targetElement) return;

    targetElement.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    targetElement.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    targetElement.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

    return () => {
      targetElement.removeEventListener('touchstart', handleTouchStart);
      targetElement.removeEventListener('touchmove', handleTouchMove);
      targetElement.removeEventListener('touchend', handleTouchEnd);
      
      // Clear any pending timers
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [element, handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  return touchState;
};
