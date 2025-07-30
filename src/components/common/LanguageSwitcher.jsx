import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { UI_CONFIG } from '../../constants/spotify';

const SwitcherContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const SwitcherButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: ${UI_CONFIG.SPACING.SM} ${UI_CONFIG.SPACING.MD};
  color: ${UI_CONFIG.COLORS.WHITE};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.SM};
  transition: all 0.3s ease;
  min-width: 80px;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  .flag {
    font-size: 1.1rem;
  }

  .arrow {
    font-size: 0.7rem;
    transition: transform 0.3s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${UI_CONFIG.SPACING.XS};
  background: var(--color-background-secondary);
  backdrop-filter: blur(15px);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-large);
  z-index: 1000;
  min-width: 120px;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
  transition: all 0.3s ease;
  transform-origin: top right;
`;

const LanguageOption = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 8px 16px;
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text)'};
  font-size: 0.9rem;
  font-weight: ${props => props.active ? 600 : 500};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-align: left;

  &:first-child {
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }

  &:only-child {
    border-radius: 12px;
  }

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-primary);
  }

  .flag {
    font-size: 1.1rem;
  }

  .check {
    margin-left: auto;
    color: var(--color-primary);
    font-size: 0.8rem;
  }
`;

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  },
  {
    code: 'tr',
    name: 'Türkçe',
    flag: '🇹🇷',
    nativeName: 'Türkçe'
  }
];

const LanguageSwitcher = ({ className }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    console.log('Changing language to:', languageCode);
    i18n.changeLanguage(languageCode);
    setIsOpen(false);

    // Save to localStorage
    localStorage.setItem('latte_language', languageCode);
    console.log('Language changed, current language:', i18n.language);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('[data-language-switcher]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <SwitcherContainer className={className} data-language-switcher>
      <SwitcherButton
        onClick={toggleDropdown}
        $isOpen={isOpen}
        title={`Current language: ${currentLanguage.nativeName}`}
      >
        <span className="flag">{currentLanguage.flag}</span>
        <span className="code">{currentLanguage.code.toUpperCase()}</span>
        <span className="arrow">▼</span>
      </SwitcherButton>

      <DropdownMenu $isOpen={isOpen}>
        {languages.map((language) => (
          <LanguageOption
            key={language.code}
            active={language.code === i18n.language}
            onClick={() => handleLanguageChange(language.code)}
            title={`Switch to ${language.nativeName}`}
          >
            <span className="flag">{language.flag}</span>
            <span className="name">{language.nativeName}</span>
            {language.code === i18n.language && (
              <span className="check">✓</span>
            )}
          </LanguageOption>
        ))}
      </DropdownMenu>
    </SwitcherContainer>
  );
};

export default LanguageSwitcher;
