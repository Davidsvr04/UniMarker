import type { Producto } from '../types'

export const productos: Producto[] = [
  { 
    codigo: '01', 
    nombre: 'CUELLO V DAMA DOBLE SESGO', 
    valorUnitario: 8500,
    insumos: [
      { id: '1', nombre: 'Cierre', cantidadPorUnidad: 2, unidadMedida: 'unidades' },
      { id: '2', nombre: 'Botones', cantidadPorUnidad: 3, unidadMedida: 'unidades' },
      { id: '3', nombre: 'Tela blanca', cantidadPorUnidad: 0.5, unidadMedida: 'metros' }
    ]
  },
  { 
    codigo: '011', 
    nombre: 'CUELLO V DAMA SESGO SIMPLE', 
    valorUnitario: 11000,
    insumos: [
      { id: '1', nombre: 'Cierre', cantidadPorUnidad: 2, unidadMedida: 'unidades' },
      { id: '2', nombre: 'Botones', cantidadPorUnidad: 4, unidadMedida: 'unidades' },
      { id: '3', nombre: 'Tela blanca', cantidadPorUnidad: 0.7, unidadMedida: 'metros' }
    ]
  },
  { 
    codigo: '02', 
    nombre: 'CUELLO RUTH DAMA', 
    valorUnitario: 8500,
    insumos: [
      { id: '1', nombre: 'Cierre', cantidadPorUnidad: 2, unidadMedida: 'unidades' },
      { id: '2', nombre: 'Botones', cantidadPorUnidad: 4, unidadMedida: 'unidades' },
      { id: '3', nombre: 'Tela blanca', cantidadPorUnidad: 0.8, unidadMedida: 'metros' }
    ]
  },
  { 
    codigo: '03', 
    nombre: 'CUELLO NERU DAMA', 
    valorUnitario: 8500,
    insumos: [
      { id: '1', nombre: 'Cierre', cantidadPorUnidad: 2, unidadMedida: 'unidades' },
      { id: '2', nombre: 'Botones', cantidadPorUnidad: 3, unidadMedida: 'unidades' },
      { id: '4', nombre: 'Tela verde militar', cantidadPorUnidad: 0.5, unidadMedida: 'metros' }
    ]
  },
  { 
    codigo: '04', 
    nombre: 'CUELLO V CABALLERO BLANCO M (ITAGUI URG)', 
    valorUnitario: 8500,
    insumos: [
      { id: '1', nombre: 'Cierre', cantidadPorUnidad: 1, unidadMedida: 'unidades' },
      { id: '2', nombre: 'Botones', cantidadPorUnidad: 5, unidadMedida: 'unidades' },
      { id: '3', nombre: 'Tela blanca', cantidadPorUnidad: 0.6, unidadMedida: 'metros' }
    ]
  },
  { 
    codigo: 'Q23203', 
    nombre: 'CUELLO V CABALLERO VERDE MILITAR M (ITAGUI URG)', 
    valorUnitario: 8500,
    insumos: [
      { id: '1', nombre: 'Cierre', cantidadPorUnidad: 1, unidadMedida: 'unidades' },
      { id: '2', nombre: 'Botones', cantidadPorUnidad: 5, unidadMedida: 'unidades' },
      { id: '4', nombre: 'Tela verde militar', cantidadPorUnidad: 0.6, unidadMedida: 'metros' }
    ]
  },
  { 
    codigo: '331001', 
    nombre: 'UNIFORME MATERNO BLANCO XS (ITAGUI URG)', 
    valorUnitario: 15000,
    insumos: [
      { id: '1', nombre: 'Cierre', cantidadPorUnidad: 3, unidadMedida: 'unidades' },
      { id: '2', nombre: 'Botones', cantidadPorUnidad: 8, unidadMedida: 'unidades' },
      { id: '3', nombre: 'Tela blanca', cantidadPorUnidad: 2, unidadMedida: 'metros' },
      { id: '5', nombre: 'Hilo blanco', cantidadPorUnidad: 1, unidadMedida: 'carretes' }
    ]
  },
  { 
    codigo: '331003', 
    nombre: 'UNIFORME MATERNO BLANCO M (ITAGUI URG)', 
    valorUnitario: 15000,
    insumos: [
      { id: '1', nombre: 'Cierre', cantidadPorUnidad: 3, unidadMedida: 'unidades' },
      { id: '2', nombre: 'Botones', cantidadPorUnidad: 8, unidadMedida: 'unidades' },
      { id: '3', nombre: 'Tela blanca', cantidadPorUnidad: 2.2, unidadMedida: 'metros' },
      { id: '5', nombre: 'Hilo blanco', cantidadPorUnidad: 1, unidadMedida: 'carretes' }
    ]
  },
  { 
    codigo: '333203', 
    nombre: 'UNIFORME MATERNO VERDE MILITAR M (ITAGUI URG)', 
    valorUnitario: 15000,
    insumos: [
      { id: '1', nombre: 'Cierre', cantidadPorUnidad: 3, unidadMedida: 'unidades' },
      { id: '2', nombre: 'Botones', cantidadPorUnidad: 8, unidadMedida: 'unidades' },
      { id: '4', nombre: 'Tela verde militar', cantidadPorUnidad: 2.2, unidadMedida: 'metros' },
      { id: '6', nombre: 'Hilo verde', cantidadPorUnidad: 1, unidadMedida: 'carretes' }
    ]
  }
]