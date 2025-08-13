export interface Producto {
  codigo: string
  nombre: string
  valorUnitario: number
  insumos: Insumo[]
}

export interface Insumo {
  id: string
  nombre: string
  cantidadPorUnidad: number
  unidadMedida: string
}

export interface ItemCotizacion {
  id: string
  codigo: string
  nombre: string
  cantidad: number
  valorUnitario: number
  descuento: number
  valorTotal: number
}

export interface InsumoCalculado {
  insumo: Insumo
  cantidadTotal: number
}