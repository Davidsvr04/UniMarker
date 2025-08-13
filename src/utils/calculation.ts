import type { ItemCotizacion, InsumoCalculado, Insumo, Producto } from '../types'

export const calcularValorTotal = (cantidad: number, valorUnitario: number, descuento: number): number => {
  const subtotal = cantidad * valorUnitario
  const valorDescuento = (subtotal * descuento) / 100
  return subtotal - valorDescuento
}

export const calcularTotalCotizacion = (items: ItemCotizacion[]): number => {
  return items.reduce((total, item) => total + item.valorTotal, 0)
}

export const formatearMoneda = (valor: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor)
}

export const calcularInsumosRequeridos = (items: ItemCotizacion[], productos: Producto[]): InsumoCalculado[] => {
  const insumosMap = new Map<string, InsumoCalculado>()

  items.forEach(item => {
    if (item.nombre && item.cantidad > 0) {
      const producto = productos.find(p => p.nombre === item.nombre)
      if (producto && producto.insumos) {
        producto.insumos.forEach((insumo: Insumo) => {
          const cantidadTotal = insumo.cantidadPorUnidad * item.cantidad
          const key = `${insumo.id}-${insumo.nombre}`
          
          if (insumosMap.has(key)) {
            const existing = insumosMap.get(key)!
            existing.cantidadTotal += cantidadTotal
          } else {
            insumosMap.set(key, {
              insumo,
              cantidadTotal
            })
          }
        })
      }
    }
  })

  return Array.from(insumosMap.values())
}