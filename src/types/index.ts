export interface Producto {
  codigo: string
  nombre: string
  valorUnitario: number
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