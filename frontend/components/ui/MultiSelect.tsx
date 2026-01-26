/**
 * Componente MultiSelect customizado - Estética Helldivers 2
 * 
 * Select dropdown estilizado que permite seleção múltipla
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

// 2. Estilos
import './MultiSelect.css';

// ============================================================================
// TIPOS
// ============================================================================

export interface MultiSelectOption {
    value: string;
    label: string;
}

interface MultiSelectProps {
    value: string[];
    onChange: (value: string[]) => void;
    options: MultiSelectOption[];
    className?: string;
    placeholder?: string;
    label?: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export default function MultiSelect({
    value,
    onChange,
    options,
    className = '',
    placeholder,
    label,
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        let newValue: string[];
        if (value.includes(optionValue)) {
            newValue = value.filter(v => v !== optionValue);
        } else {
            newValue = [...value, optionValue];
        }
        onChange(newValue);
    };

    const getDisplayValue = () => {
        if (value.length === 0) return placeholder || 'Select...';
        if (value.length === 1) {
            const selected = options.find(opt => opt.value === value[0]);
            return selected ? selected.label : value[0];
        }
        return `${value.length} selected`;
    };

    return (
        <>
            <div ref={selectRef} className={`hd-multiselect ${className}`}>
                {label && (
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
                        {label}
                    </label>
                )}
                <button
                    type="button"
                    className="hd-multiselect__button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                >
                    <span className="hd-multiselect__value">
                        {getDisplayValue()}
                    </span>
                    <svg
                        className={`hd-multiselect__arrow ${isOpen ? 'hd-multiselect__arrow--open' : ''}`}
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
                <div ref={dropdownRef} className="hd-multiselect__dropdown">
                    {options.map((option) => {
                        const isSelected = value.includes(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                className={`hd-multiselect__option ${isSelected ? 'hd-multiselect__option--selected' : ''
                                    }`}
                                onClick={() => handleSelect(option.value)}
                                role="option"
                                aria-selected={isSelected}
                            >
                                <div className="hd-multiselect__checkbox">
                                    {isSelected && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <span>{option.label}</span>
                            </button>
                        );
                    })}
                </div>,
                document.body
            )}
        </>
    );
}
