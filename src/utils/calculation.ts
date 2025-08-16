import type { ItemCotizacion, InsumoCalculado, Insumo, Producto } from '../types'

export const redondearNumero = (numero: number, decimales: number = 2): number => {
  return Math.round(numero * Math.pow(10, decimales)) / Math.pow(10, decimales)
}

export const generarCodigoCompleto = (codigoProducto: string, codigoColor: string, codigoTalla: string): string => {
  return `${codigoProducto}${codigoColor}${codigoTalla}`
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

export const calcularTotalesCotizacion = (items: ItemCotizacion[]) => {
  const total = items.reduce((total, item) => total + item.valorTotal, 0)
  
  return {
    total
  }
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

export const productoTieneSesgo = (producto: Producto): boolean => {
  return producto.insumos.some(insumo => 
    insumo.nombre.toUpperCase().includes('SESGO')
  )
}

export const calcularInsumosRequeridos = (items: ItemCotizacion[], productos: Producto[]): InsumoCalculado[] => {
  const insumosMap = new Map<string, InsumoCalculado>()
  const marquillasPorTalla = new Map<string, number>()

  items.forEach(item => {
    if (item.nombre && item.cantidad > 0) {
      const producto = productos.find(p => p.nombre === item.nombre)
      if (producto && producto.insumos) {
        producto.insumos.forEach((insumo: Insumo) => {
          let cantidadPorUnidad = insumo.cantidadPorUnidad
          let nombreInsumo = insumo.nombre
          
          // Si es elástico y hay talla definida, usar cantidad específica por talla
          if (insumo.nombre.toUpperCase().includes('ELASTICO') && item.talla) {
            cantidadPorUnidad = obtenerCantidadElastico(item.talla)
          }
          
          // Si es sesgo y hay color de sesgo definido, concatenar el color al nombre
          if (insumo.nombre.toUpperCase().includes('SESGO') && item.colorSesgo) {
            nombreInsumo = `${insumo.nombre} ${item.colorSesgo}`
          }

          // Si es cordón (cordon o cordon decorativo) y hay color del uniforme, concatenar el color
          if ((insumo.nombre.toUpperCase().includes('CORDON')) && item.color) {
            nombreInsumo = `${insumo.nombre} - ${item.color}`
          }

          // Si es cierre (cualquier tipo) y hay color del uniforme, concatenar el color
          if (insumo.nombre.toUpperCase().startsWith('CIERRE') && item.color) {
            nombreInsumo = `${insumo.nombre} - ${item.color}`
          }

          // Manejo especial para marquillas - separarlas por talla
          if (insumo.nombre.toUpperCase().includes('MARQUILLA') && item.talla) {
            const keyMarquilla = `${insumo.nombre} TALLA ${item.talla}`
            const cantidadTotal = redondearNumero(cantidadPorUnidad * item.cantidad)
            
            if (marquillasPorTalla.has(keyMarquilla)) {
              marquillasPorTalla.set(keyMarquilla, marquillasPorTalla.get(keyMarquilla)! + cantidadTotal)
            } else {
              marquillasPorTalla.set(keyMarquilla, cantidadTotal)
            }
            
            // También crear entrada en el mapa principal para marquillas por talla
            const keyMarquillaTalla = `${insumo.id}-${keyMarquilla}`
            if (insumosMap.has(keyMarquillaTalla)) {
              const existing = insumosMap.get(keyMarquillaTalla)!
              existing.cantidadTotal = redondearNumero(existing.cantidadTotal + cantidadTotal)
            } else {
              insumosMap.set(keyMarquillaTalla, {
                insumo: {
                  ...insumo,
                  nombre: keyMarquilla,
                  cantidadPorUnidad
                },
                cantidadTotal
              })
            }
          } else {
            // Para todos los demás insumos (no marquillas)
            const cantidadTotal = redondearNumero(cantidadPorUnidad * item.cantidad)
            const key = `${insumo.id}-${nombreInsumo}`
            
            if (insumosMap.has(key)) {
              const existing = insumosMap.get(key)!
              existing.cantidadTotal = redondearNumero(existing.cantidadTotal + cantidadTotal)
            } else {
              insumosMap.set(key, {
                insumo: {
                  ...insumo,
                  nombre: nombreInsumo,
                  cantidadPorUnidad
                },
                cantidadTotal
              })
            }
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
            let nombreInsumo = insumo.nombre
            
            // Si es elástico y hay talla definida, usar cantidad específica por talla
            if (insumo.nombre.toUpperCase().includes('ELASTICO') && item.talla) {
              cantidadPorUnidad = obtenerCantidadElastico(item.talla)
            }
            
            // Si es sesgo y hay color de sesgo definido, concatenar el color al nombre
            if (insumo.nombre.toUpperCase().includes('SESGO') && item.colorSesgo) {
              nombreInsumo = `${insumo.nombre} ${item.colorSesgo}`
            }

            // Si es cordón (cordon o cordon decorativo) y hay color del uniforme, concatenar el color
            if ((insumo.nombre.toUpperCase().includes('CORDON')) && item.color) {
              nombreInsumo = `${insumo.nombre} - ${item.color}`
            }

            // Si es cierre (cualquier tipo) y hay color del uniforme, concatenar el color
            if (insumo.nombre.toUpperCase().startsWith('CIERRE') && item.color) {
              nombreInsumo = `${insumo.nombre} - ${item.color}`
            }

            // Para marquillas, agregar la talla al nombre
            if (insumo.nombre.toUpperCase().includes('MARQUILLA') && item.talla) {
              nombreInsumo = `${insumo.nombre} TALLA ${item.talla}`
            }
            
            return {
              insumo: {
                ...insumo,
                nombre: nombreInsumo,
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