import type { ItemCotizacion, Producto, InsumoCalculado, Insumo } from '../types'

// Interfaz para insumos compactos
interface InsumoCompacto {
  tipo: 'normal' | 'marquillas' | 'marquilla-compacta'
  nombre: string
  cantidadPorUnidad?: number
  cantidadTotal: number
  unidadMedida?: string
  tallasData?: { [talla: string]: number }
  tallas?: string[]
  data?: string
}

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
  'XS': 0.60,
  'S': 0.62,
  'M': 0.64,
  'L': 0.66,
  'XL': 0.68,
  'XXL': 0.70,
  'XXXL': 0.72,
  'XXXXL': 0.74
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
  const marquillasPorTalla = new Map<string, Map<string, number>>()
  
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

          // Manejo especial para marquillas - agrupar por tipo y talla
          if (insumo.nombre.toUpperCase().includes('MARQUILLA') && item.talla) {
            const tipoMarquilla = insumo.nombre.toUpperCase().includes('CAMISA') ? 'MARQUILLA CAMISA' : 'MARQUILLA PANTALON'
            
            if (!marquillasPorTalla.has(tipoMarquilla)) {
              marquillasPorTalla.set(tipoMarquilla, new Map())
            }
            
            const tallasMap = marquillasPorTalla.get(tipoMarquilla)!
            const cantidadTotal = redondearNumero(cantidadPorUnidad * item.cantidad)
            
            if (tallasMap.has(item.talla)) {
              tallasMap.set(item.talla, tallasMap.get(item.talla)! + cantidadTotal)
            } else {
              tallasMap.set(item.talla, cantidadTotal)
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

  // Agregar las marquillas agrupadas por talla
  marquillasPorTalla.forEach((tallasMap, tipoMarquilla) => {
    const key = `marquilla-${tipoMarquilla}`
    const tallasArray = Array.from(tallasMap.entries()).sort()
    const nombreCompleto = `${tipoMarquilla} (${tallasArray.map(([talla, cantidad]) => `${talla}: ${cantidad}`).join(', ')})`
    const totalCantidad = Array.from(tallasMap.values()).reduce((sum, cant) => sum + cant, 0)
    
    insumosMap.set(key, {
      insumo: {
        id: 'marquilla',
        nombre: nombreCompleto,
        cantidadPorUnidad: 1,
        unidadMedida: 'unidades'
      },
      cantidadTotal: totalCantidad
    })
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
          insumos: producto.insumos
            .map(insumo => {
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

// Nueva función para agrupar insumos de manera compacta
export const agruparInsumosCompacto = (insumos: InsumoCalculado[]): InsumoCompacto[] => {
  const insumosCompactos: InsumoCompacto[] = []
  const marquillasData: { [key: string]: { [talla: string]: number } } = {}
  const insumosAgrupados: { [key: string]: { cantidadTotal: number, cantidadPorUnidad: number, unidadMedida: string } } = {}

  insumos.forEach(insumoCalculado => {
    const nombre = insumoCalculado.insumo.nombre.toUpperCase()

    // Procesar marquillas
    if (nombre.includes('MARQUILLA')) {
      // Extraer el tipo base de marquilla (CAMISA o PANTALON)
      let tipoBase = 'MARQUILLA'
      if (nombre.includes('PANTALON')) {
        tipoBase = 'MARQUILLA PANTALON'
      } else if (nombre.includes('CAMISA')) {
        tipoBase = 'MARQUILLA CAMISA'
      } else
        tipoBase = 'MARQUILLA'

      // Si es una marquilla con formato compacto ya procesado, no procesarla de nuevo
      if (nombre.includes('(') && nombre.includes(':')) {
        insumosCompactos.push({
          tipo: 'marquilla-compacta',
          nombre: tipoBase,
          data: nombre,
          cantidadTotal: insumoCalculado.cantidadTotal,
          unidadMedida: insumoCalculado.insumo.unidadMedida
        })
        return
      }

      // Extraer talla del nombre (formato: "MARQUILLA CAMISA TALLA M")
      const tallasMatch = nombre.match(/TALLA\s+(\w+)/)
      if (tallasMatch) {
        const talla = tallasMatch[1]
        
        if (!marquillasData[tipoBase]) {
          marquillasData[tipoBase] = {}
        }
        
        if (marquillasData[tipoBase][talla]) {
          marquillasData[tipoBase][talla] += insumoCalculado.cantidadTotal
        } else {
          marquillasData[tipoBase][talla] = insumoCalculado.cantidadTotal
        }
        return
      }
    }

    // Para todos los demás insumos (incluyendo BOLSA, ETIQUETA CARTON, etc.), agruparlos por nombre
    const nombreOriginal = insumoCalculado.insumo.nombre
    if (insumosAgrupados[nombreOriginal]) {
      insumosAgrupados[nombreOriginal].cantidadTotal += insumoCalculado.cantidadTotal
    } else {
      insumosAgrupados[nombreOriginal] = {
        cantidadTotal: insumoCalculado.cantidadTotal,
        cantidadPorUnidad: insumoCalculado.insumo.cantidadPorUnidad,
        unidadMedida: insumoCalculado.insumo.unidadMedida
      }
    }
  })

  // Definir el orden de prioridad para los insumos
  const ordenPrioridad = [
    'MARQUILLA CAMISA',
    'MARQUILLA PANTALON', 
    'BANDERA CAMISA',
    'BANDERA PANTALON',
    'TELA',
    'ELASTICO',
    'BOLSA',
    'ETIQUETA CARTON'
  ]

  // Agregar marquillas agrupadas por talla (con prioridad)
  const marquillasOrdenadas = ['MARQUILLA CAMISA', 'MARQUILLA PANTALON']
  marquillasOrdenadas.forEach(tipoMarquilla => {
    if (marquillasData[tipoMarquilla]) {
      const tallasObj = marquillasData[tipoMarquilla]
      const tallas = Object.keys(tallasObj).sort()
      const totalCantidad = Object.values(tallasObj).reduce((sum, cant) => sum + cant, 0)
      
      insumosCompactos.push({
        tipo: 'marquillas',
        nombre: tipoMarquilla,
        tallasData: tallasObj,
        tallas: tallas,
        cantidadTotal: totalCantidad,
        unidadMedida: 'unidades'
      })
    }
  })

  // Crear un array temporal para ordenar los insumos normales
  const insumosNormalesArray = Object.entries(insumosAgrupados).map(([nombre, data]) => ({
    tipo: 'normal' as const,
    nombre: nombre,
    cantidadPorUnidad: data.cantidadPorUnidad,
    cantidadTotal: data.cantidadTotal,
    unidadMedida: data.unidadMedida
  }))

  // Ordenar los insumos normales según la prioridad definida
  insumosNormalesArray.sort((a, b) => {
    const nombreA = a.nombre.toUpperCase()
    const nombreB = b.nombre.toUpperCase()
    
    // Buscar la posición en el orden de prioridad
    let posicionA = ordenPrioridad.findIndex(item => nombreA.includes(item))
    let posicionB = ordenPrioridad.findIndex(item => nombreB.includes(item))
    
    // Si no se encuentra en la lista de prioridad, asignar una posición alta
    if (posicionA === -1) posicionA = 999
    if (posicionB === -1) posicionB = 999
    
    // Si tienen la misma prioridad, ordenar alfabéticamente
    if (posicionA === posicionB) {
      // Para cordones, ordenar por color
      if (nombreA.includes('CORDON') && nombreB.includes('CORDON')) {
        return nombreA.localeCompare(nombreB)
      }
      return a.nombre.localeCompare(b.nombre)
    }
    
    return posicionA - posicionB
  })

  // Agregar los insumos normales ordenados
  insumosCompactos.push(...insumosNormalesArray)

  return insumosCompactos
}