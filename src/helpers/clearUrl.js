export const clearUrl = (url) => {
  if (!url) return 'Desconhecida'

  try {
    if (url.includes('accounts.google.com') || url.includes('identifier?continue=')) {
      return 'Login Google'
    }

    if (url.includes('google.com/search')) {
      const urlObj = new URL(url)
      const search = urlObj.searchParams.get('q')
      
      if (search) {
        const formatSearch = decodeURIComponent(search.replace(/\+/g, ' '))
        return `Busca Google: '${formatSearch}'`
      }
      return 'Google Search'
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url)

      return `${urlObj.origin}/` 
    }

  } catch (error) {
    console.error('Erro ao processar limpeza de URL:', error)
  }

  return url
}