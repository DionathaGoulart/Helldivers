/**
 * Componente PassiveSelect
 * 
 * Select customizado para seleção de passivas com modal de múltipla seleção
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useState, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';

// 2. Contextos e Hooks customizados
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { useModal } from '@/hooks';

// 3. Componentes
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// 4. Utilitários e Constantes
import { Z_INDEX } from '@/constants';
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName, getTranslatedEffect } from '@/lib/i18n';

// 5. Tipos
import type { PassiveOption } from '@/lib/types/armory-page';

interface PassiveSelectProps {
  passives: PassiveOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

/**
 * Componente para seleção de passivas com modal
 */
export default function PassiveSelect({
  passives,
  selectedIds,
  onChange,
}: PassiveSelectProps) {
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(selectedIds);

  const { isOpen, open, close } = useModal({
    closeOnEscape: true,
    preventScroll: true,
    onClose: () => {
      setTempSelectedIds(selectedIds);
    },
  });

  const handleOpenModal = () => {
    setTempSelectedIds(selectedIds);
    open();
  };

  // Otimização: useCallback para manter a referência da função estável
  const handleTogglePassive = useCallback((id: number) => {
    setTempSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  }, []);

  const handleApply = () => {
    onChange(tempSelectedIds);
    close();
  };

  const handleClear = () => {
    setTempSelectedIds([]);
    onChange([]);
    close();
  };

  const handleCancel = () => {
    setTempSelectedIds(selectedIds);
    close();
  };

  const selectedPassives = passives.filter((p) => selectedIds.includes(p.id));

  return (
    <>
      <div className="hd-select">
        <button
          type="button"
          onClick={handleOpenModal}
          className="hd-select__button w-full"
        >
          <span className="hd-select__value truncate">
            {selectedPassives.length > 0
              ? selectedPassives.length === 1
                ? getTranslatedName(selectedPassives[0], isPortuguese())
                : t('armory.selectedPassives', { count: selectedPassives.length })
              : t('armory.allPassives')}
          </span>
          <svg
            className="hd-select__arrow"
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

      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
          style={{ zIndex: 10000000 }}
          onClick={(e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="w-full max-w-3xl h-[90vh] flex flex-col"
          >
            <Card className="w-full h-full flex flex-col p-0 overflow-hidden" glowColor="cyan">
              {/* Header */}
              <div className="shrink-0 p-3 md:p-6 border-b-2 border-[#3a4a5a] bg-[rgba(26,35,50,0.98)] backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <h3 className="text-base md:text-xl font-bold uppercase tracking-wider font-['Rajdhani'] text-[#00d9ff]">
                    {t('armory.selectPassives')}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {tempSelectedIds.length > 0 && (
                  <p className="text-xs md:text-sm text-gray-400 font-['Rajdhani']">
                    {t('armory.selectedPassives', { count: tempSelectedIds.length })}
                  </p>
                )}
              </div>

              {/* Content - área rolável */}
              <div
                className="flex-1 overflow-y-scroll overflow-x-hidden p-3 md:p-6"
                style={{ maxHeight: 'calc(90vh - 240px)', minHeight: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  {passives.map((passive) => (
                    <PassiveOptionItem
                      key={passive.id}
                      passive={passive}
                      isSelected={tempSelectedIds.includes(passive.id)}
                      onToggle={handleTogglePassive}
                      isPortuguese={isPortuguese()}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 md:p-6 border-t-2 border-[#3a4a5a] flex items-center justify-between gap-2 md:gap-4 shrink-0 bg-[rgba(26,35,50,0.98)] backdrop-blur-sm">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={tempSelectedIds.length === 0}
                  size="sm"
                >
                  {t('armory.clear')}
                </Button>
                <div className="flex gap-2 md:gap-3">
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleApply} size="sm">
                    {t('armory.apply')} ({tempSelectedIds.length})
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface PassiveOptionItemProps {
  passive: PassiveOption;
  isSelected: boolean;
  onToggle: (id: number) => void;
  isPortuguese: boolean;
}

/**
 * Item individual da lista de passivas (Memoizado para performance)
 */
const PassiveOptionItem = memo(({ passive, isSelected, onToggle, isPortuguese }: PassiveOptionItemProps) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(passive.id)}
      className={`p-3 md:p-5 border-2 rounded-lg transition-all text-left flex items-start gap-2 md:gap-4 hover:border-[#00d9ff] ${isSelected
        ? 'border-[#00d9ff] bg-[rgba(0,217,255,0.1)]'
        : 'border-[#3a4a5a] bg-[rgba(26,35,50,0.3)]'
        }`}
    >
      <div
        className={`shrink-0 w-5 h-5 mt-0.5 border-2 rounded flex items-center justify-center transition-colors ${isSelected
          ? 'border-[#00d9ff] bg-[#00d9ff]'
          : 'border-[#3a4a5a] bg-transparent'
          }`}
      >
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <img
        src={passive.image || getDefaultImage('passive')}
        alt={getTranslatedName(passive, isPortuguese)}
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== getDefaultImage('passive')) {
            target.src = getDefaultImage('passive');
          }
        }}
        className="w-16 h-16 md:w-20 md:h-20 object-cover shrink-0 border-2 border-[#3a4a5a] [clip-path:polygon(0_0,calc(100%-4px)_0,100%_4px,100%_100%,0_100%)]"
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm md:text-base font-semibold text-white mb-1 md:mb-2 font-['Rajdhani']">
          {getTranslatedName(passive, isPortuguese)}
        </div>
        <div className="text-xs md:text-sm text-gray-400 leading-relaxed">
          {getTranslatedEffect(passive, isPortuguese)}
        </div>
      </div>
    </button>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to ensure strict equality where it matters
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.passive.id === nextProps.passive.id &&
    prevProps.isPortuguese === nextProps.isPortuguese
  );
});

