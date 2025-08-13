import type { ItemCotizacion } from '../types'

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