import React, { useState, useEffect, useRef } from 'react'
import type { Producto } from '../types'

interface ProductSearchProps {
  productos: Producto[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  productos,
  value,
  onChange,
  placeholder = "Buscar producto...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value || '')
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>(productos)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sincronizar el término de búsqueda con el valor externo
  useEffect(() => {
    if (value !== searchTerm) {
      setSearchTerm(value || '')
    }
  }, [value, searchTerm])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(productos)
    } else {
      const filtered = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, productos])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    setIsOpen(true)
    
    // Si el input está vacío, limpiar la selección
    if (term === '') {
      onChange('')
    }
  }

  const handleProductSelect = (producto: Producto) => {
    onChange(producto.nombre)
    setSearchTerm(producto.nombre)
    setIsOpen(false)
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className={`product-search ${className}`} ref={containerRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="product-search-input"
        autoComplete="off"
      />
      
      {isOpen && (
        <div className="product-search-dropdown">
          {filteredProducts.length > 0 ? (
            <div className="product-search-results">
              {filteredProducts.slice(0, 10).map((producto) => (
                <div
                  key={producto.codigo}
                  className="product-search-item"
                  onClick={() => handleProductSelect(producto)}
                >
                  <span className="product-code">{producto.codigo}</span>
                  <span className="product-name">{producto.nombre}</span>
                </div>
              ))}
              {filteredProducts.length > 10 && (
                <div className="product-search-more">
                  y {filteredProducts.length - 10} más...
                </div>
              )}
            </div>
          ) : (
            <div className="product-search-no-results">
              No se encontraron productos
            </div>
          )}
        </div>
      )}
    </div>
  )
}
