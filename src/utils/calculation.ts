import type { ItemCotizacion, InsumoCalculado, Insumo, Producto } from '../types'

export const redondearNumero = (numero: number, decimales: number = 2): number => {
  return Math.round(numero * Math.pow(10, decimales)) / Math.pow(10, decimales)
}

export const generarCodigoCompleto = (codigoProducto: string, codigoTalla: string, codigoColor: string): string => {
  return `${codigoProducto}${codigoTalla}${codigoColor}`
}

export const generarNombreCompleto = (nombreProducto: string, nombreTalla: string, nombreColor: string): string => {
  const partes = [nombreProducto]
  if (nombreTalla) partes.push(nombreTalla)
  if (nombreColor) partes.push(nombreColor)
  return partes.join(' ')
}

export const calcularValorTotal = (cantidad: number, valorUnitario: number, descuento: number): number => {
  const subtotal = cantidad * valorUnitario
  return redondearNumero(subtotal - descuento)
}

export const calcularTotalCotizacion = (items: ItemCotizacion[]): number => {
  const total = items.reduce((total, item) => total + item.valorTotal, 0)
  return redondearNumero(total)
}

export const formatearMoneda = (valor: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor)
}

// Cantidades de elástico por talla
const cantidadesElasticoPorTalla: Record<string, number> = {
  'XS': 0.58,
  'S': 0.60,
  'M': 0.62,
  'L': 0.64,
  'XL': 0.66,
  'XXL': 0.68,
  'XXXL': 0.70,
  'XXXXL': 0.72
}

export const obtenerCantidadElastico = (talla: string): number => {
  return cantidadesElasticoPorTalla[talla] || 0.85 // valor por defecto si no encuentra la talla
}

export const calcularInsumosRequeridos = (items: ItemCotizacion[], productos: Producto[]): InsumoCalculado[] => {
  const insumosMap = new Map<string, InsumoCalculado>()

  items.forEach(item => {
    if (item.nombre && item.cantidad > 0) {
      const producto = productos.find(p => p.nombre === item.nombre)
      if (producto && producto.insumos) {
        producto.insumos.forEach((insumo: Insumo) => {
          let cantidadPorUnidad = insumo.cantidadPorUnidad
          
          // Si es elástico y hay talla definida, usar cantidad específica por talla
          if (insumo.nombre.toUpperCase().includes('ELASTICO') && item.talla) {
            cantidadPorUnidad = obtenerCantidadElastico(item.talla)
          }
          
          const cantidadTotal = redondearNumero(cantidadPorUnidad * item.cantidad)
          const key = `${insumo.id}-${insumo.nombre}`
          
          if (insumosMap.has(key)) {
            const existing = insumosMap.get(key)!
            existing.cantidadTotal = redondearNumero(existing.cantidadTotal + cantidadTotal)
          } else {
            insumosMap.set(key, {
              insumo: {
                ...insumo,
                cantidadPorUnidad
              },
              cantidadTotal
            })
          }
        })
      }
    }
  })

  return Array.from(insumosMap.values())
}

export const obtenerInsumosPorProducto = (items: ItemCotizacion[], productos: Producto[]) => {
  return items.map(item => {
    if (item.nombre && item.cantidad > 0) {
      const producto = productos.find(p => p.nombre === item.nombre)
      if (producto && producto.insumos) {
        return {
          item,
          insumos: producto.insumos.map(insumo => {
            let cantidadPorUnidad = insumo.cantidadPorUnidad
            
            // Si es elástico y hay talla definida, usar cantidad específica por talla
            if (insumo.nombre.toUpperCase().includes('ELASTICO') && item.talla) {
              cantidadPorUnidad = obtenerCantidadElastico(item.talla)
            }
            
            return {
              insumo: {
                ...insumo,
                cantidadPorUnidad
              },
              cantidadTotal: redondearNumero(cantidadPorUnidad * item.cantidad)
            }
          })
        }
      }
    }
    return null
  }).filter(Boolean)
}