/**
 * Componente CachedImage
 * 
 * Componente de imagem que usa cache do localStorage para evitar requisições HTTP
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { getCachedImageUrl, cacheImage, getCacheKey } from '@/utils/images';

// ============================================================================
// TIPOS
// ============================================================================

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallback?: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente de imagem com cache automático do localStorage
 * 
 * Verifica o cache primeiro e só faz requisição HTTP se não encontrar no cache
 */
export default function CachedImage({
  src,
  fallback,
  alt,
  ...props
}: CachedImageProps) {
  console.log('📸 CachedImage renderizado:', { src, fallback: !!fallback });
  
  // Ref para o elemento img para detectar quando carregou
  const imgRef = useRef<HTMLImageElement>(null);
  
  // CRÍTICO: Verifica cache ANTES de qualquer renderização
  // Se não encontrar cache, inicia com string vazia para evitar que navegador veja URL HTTP
  const [imageSrc, setImageSrc] = useState<string>(() => {
    console.log('🔍 useState inicial:', { src, fallback: !!fallback });
    
    // Se não tem src, usa fallback
    if (!src) {
      console.log('⚠️ Sem src, usando fallback');
      return fallback || '';
    }
    
    // CRÍTICO: Verifica cache ANTES de renderizar
    // Se estiver no cache, usa base64 imediatamente (ZERO requisições HTTP)
    const cached = getCachedImageUrl(src);
    if (cached) {
      console.log('✅ Cache encontrado no useState!');
      return cached; // Retorna base64 - navegador não faz requisição HTTP
    }
    
    // IMPORTANTE: Se não está no cache, retorna vazio inicialmente
    // Isso evita que o navegador veja <img src="http://..." /> e inicie requisição HTTP
    // O useEffect vai verificar o cache novamente e definir a URL apropriada
    console.log('❌ Cache não encontrado no useState, retornando vazio');
    return ''; // Retorna vazio - useEffect vai definir após verificar cache
  });
  
  console.log('📸 Estado atual:', { imageSrc: imageSrc.substring(0, 50), src });

  // CRÍTICO: Verifica cache e define URL apropriada
  // Este useEffect roda ANTES da primeira renderização da tag <img>
  // Garantindo que se estiver em cache, usa base64, senão só então usa URL HTTP
  useEffect(() => {
    console.log('🔄 useEffect URL - INÍCIO:', { src, imageSrc: imageSrc?.substring(0, 50), fallback: !!fallback });
    
    if (!src) {
      console.log('⚠️ Sem src no useEffect URL');
      if (fallback && imageSrc !== fallback) {
        setImageSrc(fallback);
      }
      return;
    }
    
    // CRÍTICO: Verifica cache ANTES de definir qualquer URL
    // Se estiver no cache, usa base64 imediatamente (evita requisição HTTP)
    const cached = getCachedImageUrl(src);
    console.log('🔍 Verificando cache no useEffect URL:', { cached: !!cached, imageSrc });
    
    if (cached) {
      // Está no cache - usa base64
      console.log('✅ Cache encontrado no useEffect URL, usando base64');
      if (imageSrc !== cached) {
        setImageSrc(cached);
      }
      return; // Não precisa fazer nada mais - já está usando cache
    }
    
    // Se não está no cache e imageSrc está vazio (estado inicial),
    // define URL original APENAS APÓS confirmar que não está em cache
    // Isso garante que o navegador não vê URL HTTP antes do cache ser verificado
    if (imageSrc === '' || (!imageSrc.startsWith('data:') && imageSrc !== src)) {
      console.log('⏳ Definindo URL HTTP após confirmar que não está em cache');
      // Usa um pequeno delay para garantir que cache foi verificado completamente
      // Isso evita race condition onde navegador vê URL HTTP antes do cache ser verificado
      const timeoutId = setTimeout(() => {
        // Verifica cache uma última vez antes de usar URL HTTP
        const finalCheck = getCachedImageUrl(src);
        console.log('🔍 Verificação final:', { finalCheck: !!finalCheck });
        
        if (finalCheck) {
          console.log('✅ Cache encontrado na verificação final!');
          setImageSrc(finalCheck);
        } else {
          console.log('❌ Sem cache, definindo URL HTTP:', src);
          // Só então define URL HTTP - navegador vai fazer requisição
          setImageSrc(src);
          
          // IMPORTANTE: O cache será feito pelo useEffect que observa imgRef.onload
          // Isso garante que usamos a própria imagem renderizada (já carregada)
        }
      }, 0); // setTimeout 0 garante execução após renderização
      
      return () => clearTimeout(timeoutId);
    }
  }, [src, fallback, imageSrc]);

  // CRÍTICO: Detecta quando a imagem foi carregada para cachear
  useEffect(() => {
    console.log('🔄 useEffect CACHE - INÍCIO:', { src, imageSrc: imageSrc?.substring(0, 50), hasRef: !!imgRef.current });
    
    // Se não tem src ou está usando base64 (já em cache), não precisa cachear
    if (!src || imageSrc.startsWith('data:') || !imageSrc) {
      console.log('⚠️ Não precisa cachear (já em cache ou sem src)');
      return;
    }
    
    // Aguarda um pouco para garantir que o ref está disponível
    const timeoutId = setTimeout(() => {
      const img = imgRef.current;
      if (!img) {
        console.log('⚠️ imgRef ainda não disponível');
        return;
      }
      
      console.log('🖼️ Imagem encontrada:', {
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        src: img.src,
      });
      
      // Função para cachear
      const cacheImageNow = async () => {
        console.log('🔄 Iniciando cache para:', src);
        
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) throw new Error('Sem contexto 2D');
          
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          
          const cacheKey = getCacheKey(src);
          if (!cacheKey) {
            console.warn('⚠️ getCacheKey retornou vazio');
            return;
          }
          
          localStorage.setItem(cacheKey, JSON.stringify({
            url: src,
            dataUrl,
            timestamp: Date.now(),
            size: dataUrl.length,
          }));
          
          const total = Object.keys(localStorage).filter(k => k.includes('helldivers_image_cache')).length;
          console.log('✅ Imagem cacheada!', { key: cacheKey, total });
        } catch (error: any) {
          console.error('❌ Erro ao cachear:', error.message);
          try {
            await cacheImage(src);
            console.log('✅ Cacheado via fetch');
          } catch (e: any) {
            console.error('❌ Falhou também via fetch:', e.message);
          }
        }
      };
      
      // Se já carregou, cacheia agora
      if (img.complete && img.naturalWidth > 0) {
        console.log('✅ Imagem já carregada, cacheando agora');
        cacheImageNow();
        return;
      }
      
      // Senão, espera carregar
      console.log('⏳ Esperando imagem carregar...');
      const onLoad = () => {
        console.log('✅ Imagem carregou, cacheando');
        cacheImageNow();
      };
      
      img.addEventListener('load', onLoad);
      img.addEventListener('error', () => console.error('❌ Erro ao carregar imagem'));
      
      return () => {
        img.removeEventListener('load', onLoad);
      };
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [imageSrc, src]);
  
  // CRÍTICO: Não renderiza <img> até ter uma URL definida
  // Isso garante que o navegador nunca vê URL HTTP antes do cache ser verificado
  if (!imageSrc) {
    // Retorna um placeholder transparente para manter layout
    // Ou null se preferir não ocupar espaço
    return (
      <img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
        alt={alt || ''}
        style={{ opacity: 0, width: props.width, height: props.height }}
        {...props}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      loading="lazy"
      crossOrigin="anonymous"
      {...props}
    />
  );
}



