export interface Producto {
  codigo: string
  nombre: string
  valorUnitario: number
  insumos: Insumo[]
}

export interface Talla {
  codigo: string
  nombre: string
}

export interface Color {
  codigo: string
  nombre: string
}

export interface Insumo {
  id: string
  nombre: string
  cantidadPorUnidad: number
  unidadMedida: string
}

export interface DatosProveedor {
  numeroOrden: string
  fechaOrden: string
  nombre: string
  cedula: string
  direccion: string
  telefono: string
  ciudad: string
  pais: string
  referencia: string
  valor: string
  fechaInicio: string
  plazoEntrega: string
  fechaMaxEntrega: string
}

export interface ItemCotizacion {
  id: string
  codigo: string
  nombre: string
  talla: string
  color: string
  observaciones: string
  cantidad: number
  valorUnitario: number
  descuento: number
  valorTotal: number
}

export interface InsumoCalculado {
  insumo: Insumo
  cantidadTotal: number
}