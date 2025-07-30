import { useState, useEffect } from 'react';
import { 
  getDeviceType, 
  getViewportSize, 
  isTouchDevice 
} from '../utils/responsive';

export const useResponsive = () => {
  const [deviceType, setDeviceType] = useState(getDeviceType());
  const [viewportSize, setViewportSize] = useState(getViewportSize());
  const [isTouchScreen, setIsTouchScreen] = useState(isTouchDevice());

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
      setViewportSize(getViewportSize());
    };

    const handleTouchStart = () => {
      setIsTouchScreen(true);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('touchstart', handleTouchStart, { once: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return {
    deviceType,
    viewportSize,
    isTouchScreen,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isSmallScreen: deviceType === 'mobile' || deviceType === 'tablet',
  };
};
