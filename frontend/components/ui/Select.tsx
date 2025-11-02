/**
 * Componente Select customizado - Estética Helldivers 2
 * 
 * Select dropdown estilizado que permite controle total sobre a aparência
 */

'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import './Select.css';

// ============================================================================
// TIPOS
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export default function Select({
  value,
  onChange,
  options,
  className = '',
  placeholder,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        selectRef.current &&
        !selectRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    
    const updatePosition = () => {
      if (selectRef.current && dropdownRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        dropdownRef.current.style.top = `${rect.bottom + 4}px`;
        dropdownRef.current.style.left = `${rect.left}px`;
        dropdownRef.current.style.width = `${rect.width}px`;
      }
    };
    
    // Aguarda um frame para garantir que o portal está montado
    const timeoutId = setTimeout(updatePosition, 0);
    
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      <div ref={selectRef} className={`hd-select ${className}`}>
        <button
          type="button"
          className="hd-select__button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="hd-select__value">
            {selectedOption ? selectedOption.label : placeholder || 'Selecione...'}
          </span>
          <svg
            className={`hd-select__arrow ${isOpen ? 'hd-select__arrow--open' : ''}`}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9L1 4h10z" fill="currentColor" />
          </svg>
        </button>
      </div>
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div ref={dropdownRef} className="hd-select__dropdown">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`hd-select__option ${
                value === option.value ? 'hd-select__option--selected' : ''
              }`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

