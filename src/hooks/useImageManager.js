import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// Cache de imagens em memória para evitar recarregamentos
const imageCache = new Map()
const imageLoadingStatus = new Map()

export const useImageManager = (images = [], productId = null) => {
  const [loadedImages, setLoadedImages] = useState([])
  const [imageErrors, setImageErrors] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef(null)
  const initializedRef = useRef(false)

  // Função para validar URL de imagem
  const isValidImageUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') return false

    // Verificar se é uma URL válida
    try {
      new URL(url)
      return true
    } catch {
      // Se não for URL completa, verificar se é um caminho relativo válido
      return url.startsWith('/') || url.startsWith('./') || url.startsWith('../')
    }
  }, [])

  // Processar imagens uma única vez usando useMemo
  const processedImages = useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) return []

    return images
      .map((img, index) => {
        let url = null
        let description = `Imagem ${index + 1}`
        let type = 'unknown'

        // Diferentes formatos possíveis
        if (typeof img === 'string') {
          url = img
          type = 'string'
        } else if (img && typeof img === 'object') {
          url = img.url || img.anexo || img.src || img.link
          description = img.descricao || img.description || img.alt || description
          type = img.tipo || img.type || 'object'
        }

        // Validar URL
        if (!isValidImageUrl(url)) {
          console.warn(`❌ URL de imagem inválida encontrada:`, url)
          return null
        }

        return {
          id: `${productId || 'img'}_${index}`,
          url,
          description,
          type,
          index,
          originalData: img
        }
      })
      .filter(Boolean) // Remove itens nulos
  }, [images, productId, isValidImageUrl])

  // Função para verificar se uma imagem pode ser carregada
  const validateImage = useCallback((imageUrl) => {
    return new Promise((resolve) => {
      // Verificar cache primeiro
      if (imageCache.has(imageUrl)) {
        const cached = imageCache.get(imageUrl)
        if (cached.status === 'loaded') {
          resolve({ success: true, url: imageUrl, fromCache: true })
          return
        } else if (cached.status === 'error') {
          resolve({ success: false, url: imageUrl, error: 'Cached error', fromCache: true })
          return
        }
      }

      // Verificar se já está sendo carregada
      if (imageLoadingStatus.has(imageUrl)) {
        const checkStatus = () => {
          const status = imageLoadingStatus.get(imageUrl)
          if (status === 'loaded') {
            resolve({ success: true, url: imageUrl })
          } else if (status === 'error') {
            resolve({ success: false, url: imageUrl, error: 'Loading failed' })
          } else {
            setTimeout(checkStatus, 100)
          }
        }
        checkStatus()
        return
      }

      // Marcar como carregando
      imageLoadingStatus.set(imageUrl, 'loading')

      const img = new Image()

      const cleanup = () => {
        img.onload = null
        img.onerror = null
        img.onabort = null
      }

      const handleLoad = () => {
        cleanup()
        imageLoadingStatus.set(imageUrl, 'loaded')
        imageCache.set(imageUrl, { status: 'loaded', timestamp: Date.now() })
        resolve({ success: true, url: imageUrl })
      }

      const handleError = () => {
        cleanup()
        imageLoadingStatus.set(imageUrl, 'error')
        imageCache.set(imageUrl, { status: 'error', timestamp: Date.now() })
        resolve({ success: false, url: imageUrl, error: 'Failed to load' })
      }

      img.onload = handleLoad
      img.onerror = handleError
      img.src = imageUrl
    })
  }, [])

  // Função principal para carregar imagens
  const loadImages = useCallback(async (imagesToLoad) => {
    if (!imagesToLoad || imagesToLoad.length === 0) {
      setLoadedImages([])
      setIsLoading(false)
      initializedRef.current = true
      return
    }

    // Evitar recarregamentos desnecessários
    if (initializedRef.current && loadedImages.length > 0) {
      return
    }

    setIsLoading(true)

    try {
      console.log(`🖼️ Carregando ${imagesToLoad.length} imagens...`)

      // Carregar todas as imagens simultaneamente
      const results = await Promise.allSettled(
        imagesToLoad.map(img => validateImage(img.url))
      )

      // Processar resultados
      const successfulImages = []
      const failedUrls = new Set()

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulImages.push({
            ...imagesToLoad[index],
            loaded: true,
            fromCache: result.value.fromCache || false
          })
        } else {
          const originalImage = imagesToLoad[index]
          failedUrls.add(originalImage.url)
          console.warn(`❌ Falha ao carregar imagem: ${originalImage.url}`)
        }
      })

      // Atualizar estados apenas se houve mudança
      setLoadedImages(prev => {
        const isSame = prev.length === successfulImages.length &&
          prev.every((img, i) => img.url === successfulImages[i]?.url)
        return isSame ? prev : successfulImages
      })

      setImageErrors(prev => {
        const isSame = prev.size === failedUrls.size &&
          [...prev].every(url => failedUrls.has(url))
        return isSame ? prev : failedUrls
      })

      console.log(`✅ ${successfulImages.length}/${imagesToLoad.length} imagens carregadas com sucesso`)

    } catch (error) {
      console.error('❌ Erro durante carregamento de imagens:', error)
      setLoadedImages([])
      setImageErrors(new Set(imagesToLoad.map(img => img.url)))
    } finally {
      setIsLoading(false)
      initializedRef.current = true
    }
  }, [validateImage, loadedImages.length])

  // Effect para carregar imagens quando mudarem
  useEffect(() => {
    // Reset quando as imagens mudarem completamente
    if (processedImages.length === 0) {
      setLoadedImages([])
      setImageErrors(new Set())
      setIsLoading(false)
      initializedRef.current = true
      return
    }

    // Verificar se as imagens realmente mudaram
    const currentUrls = loadedImages.map(img => img.url).sort()
    const newUrls = processedImages.map(img => img.url).sort()
    const hasChanged = currentUrls.length !== newUrls.length ||
      currentUrls.some((url, i) => url !== newUrls[i])

    if (hasChanged || !initializedRef.current) {
      initializedRef.current = false
      loadImages(processedImages)
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [processedImages, loadImages]) // Removido loadedImages da dependência

  // Função para recarregar uma imagem específica
  const reloadImage = useCallback(async (imageUrl) => {
    console.log(`🔄 Recarregando imagem: ${imageUrl}`)

    // Remover do cache
    imageCache.delete(imageUrl)
    imageLoadingStatus.delete(imageUrl)

    // Remover dos erros
    setImageErrors(prev => {
      const newErrors = new Set(prev)
      newErrors.delete(imageUrl)
      return newErrors
    })

    // Encontrar a imagem na lista atual
    const imageToReload = processedImages.find(img => img.url === imageUrl)
    if (imageToReload) {
      const result = await validateImage(imageUrl)
      if (result.success) {
        setLoadedImages(prev => {
          const index = prev.findIndex(img => img.url === imageUrl)
          if (index >= 0) {
            const newImages = [...prev]
            newImages[index] = { ...imageToReload, loaded: true }
            return newImages
          } else {
            return [...prev, { ...imageToReload, loaded: true }]
          }
        })
      } else {
        setImageErrors(prev => new Set([...prev, imageUrl]))
      }
    }
  }, [processedImages, validateImage])

  // Função para limpar cache de imagens
  const clearImageCache = useCallback(() => {
    imageCache.clear()
    imageLoadingStatus.clear()
    console.log('🧹 Cache de imagens limpo')
  }, [])

  // Função para obter estatísticas das imagens
  const getImageStats = useCallback(() => {
    return {
      total: processedImages?.length || 0,
      loaded: loadedImages.length,
      failed: imageErrors.size,
      loading: isLoading,
      cacheSize: imageCache.size,
      loadingImages: imageLoadingStatus.size
    }
  }, [processedImages, loadedImages, imageErrors, isLoading])

  // Retornar interface do hook
  return {
    // Estados
    loadedImages,
    imageErrors,
    isLoading,

    // Funções
    reloadImage,
    clearImageCache,
    getImageStats,

    // Utilitários
    hasImages: loadedImages.length > 0,
    hasErrors: imageErrors.size > 0,
    isValidImageUrl
  }
}

// Hook simplificado para uma única imagem
export const useSingleImage = (imageUrl, productId = null) => {
  const [image, setImage] = useState(null)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const loadingRef = useRef(false)

  const processedImageUrl = useMemo(() => {
    if (!imageUrl) return null

    // Extrair URL de diferentes formatos
    if (typeof imageUrl === 'string') {
      return imageUrl
    } else if (imageUrl && typeof imageUrl === 'object') {
      return imageUrl.url || imageUrl.anexo || imageUrl.src || imageUrl.link
    }

    return null
  }, [imageUrl])

  const loadSingleImage = useCallback(async (url) => {
    if (!url || loadingRef.current) return

    // Verificar cache primeiro
    if (imageCache.has(url)) {
      const cached = imageCache.get(url)
      if (cached.status === 'loaded') {
        setImage({ url, fromCache: true })
        setHasError(false)
        setIsLoading(false)
        return
      } else if (cached.status === 'error') {
        setImage(null)
        setHasError(true)
        setIsLoading(false)
        return
      }
    }

    setIsLoading(true)
    setHasError(false)
    loadingRef.current = true

    try {
      const img = new Image()

      await new Promise((resolve, reject) => {
        img.onload = () => {
          imageCache.set(url, { status: 'loaded', timestamp: Date.now() })
          resolve()
        }
        img.onerror = () => {
          imageCache.set(url, { status: 'error', timestamp: Date.now() })
          reject(new Error('Failed to load image'))
        }
        img.src = url
      })

      setImage({ url, fromCache: false })
      setHasError(false)
    } catch (error) {
      console.warn(`❌ Falha ao carregar imagem: ${url}`)
      setImage(null)
      setHasError(true)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [])

  const reloadImage = useCallback(() => {
    if (!processedImageUrl) return

    // Limpar cache e tentar novamente
    imageCache.delete(processedImageUrl)
    imageLoadingStatus.delete(processedImageUrl)
    setHasError(false)
    loadSingleImage(processedImageUrl)
  }, [processedImageUrl, loadSingleImage])

  useEffect(() => {
    if (processedImageUrl) {
      loadSingleImage(processedImageUrl)
    } else {
      setImage(null)
      setHasError(false)
      setIsLoading(false)
    }
  }, [processedImageUrl, loadSingleImage])

  return {
    image,
    hasError,
    isLoading,
    reloadImage
  }
}

// Função utilitária para limpar cache global de imagens
export const clearGlobalImageCache = () => {
  imageCache.clear()
  imageLoadingStatus.clear()
  console.log('🧹 Cache global de imagens limpo')
}