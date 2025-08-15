import * as XLSX from 'xlsx'
import type { ItemCotizacion, DatosProveedor } from '../types'

export function generateExcel(
  items: ItemCotizacion[],
  datosProveedor: DatosProveedor,
  total: number
) {
  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new()

  // Crear hoja de datos del proveedor
  const datosProveedorData = [
    ['DATOS DEL PROVEEDOR'],
    [''],
    ['Número de Orden:', datosProveedor.numeroOrden],
    ['Fecha de Orden:', datosProveedor.fechaOrden],
    ['Nombre:', datosProveedor.nombre],
    ['Cédula:', datosProveedor.cedula],
    ['Dirección:', datosProveedor.direccion],
    ['Teléfono:', datosProveedor.telefono],
    ['Ciudad:', datosProveedor.ciudad],
    ['País:', datosProveedor.pais],
    ['Referencia:', datosProveedor.referencia],
    ['Valor:', datosProveedor.valor],
    ['Fecha de Inicio:', datosProveedor.fechaInicio],
    ['Plazo de Entrega:', datosProveedor.plazoEntrega],
    ['Fecha Máxima de Entrega:', datosProveedor.fechaMaxEntrega]
  ]

  const wsDatosProveedor = XLSX.utils.aoa_to_sheet(datosProveedorData)
  
  // Aplicar estilos básicos (ancho de columnas)
  wsDatosProveedor['!cols'] = [
    { width: 25 }, // Columna A - Etiquetas
    { width: 30 }  // Columna B - Valores
  ]

  // Crear hoja de cotización
  const cotizacionData = [
    ['COTIZACIÓN'],
    [''],
    ['Código', 'Nombre', 'Talla', 'Color', 'Observaciones', 'Cantidad', 'Valor Unitario', 'Descuento (%)', 'Valor Total'],
    ...items.map(item => [
      item.codigo,
      item.nombre,
      item.talla,
      item.color,
      item.observaciones,
      item.cantidad,
      item.valorUnitario,
      item.descuento,
      item.valorTotal
    ]),
    [''], // Fila vacía
    ['', '', '', '', '', '', '', 'TOTAL:', total]
  ]

  const wsCotizacion = XLSX.utils.aoa_to_sheet(cotizacionData)
  
  // Aplicar estilos básicos (ancho de columnas)
  wsCotizacion['!cols'] = [
    { width: 15 }, // Código
    { width: 30 }, // Nombre
    { width: 10 }, // Talla
    { width: 20 }, // Color
    { width: 25 }, // Observaciones
    { width: 10 }, // Cantidad
    { width: 15 }, // Valor Unitario
    { width: 12 }, // Descuento
    { width: 15 }  // Valor Total
  ]

  // Agregar las hojas al libro
  XLSX.utils.book_append_sheet(workbook, wsDatosProveedor, 'Datos Proveedor')
  XLSX.utils.book_append_sheet(workbook, wsCotizacion, 'Cotización')

  // Generar el archivo Excel
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array' 
  })

  // Crear blob y descargar
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  
  // Generar nombre del archivo con fecha y número de orden
  const fecha = new Date().toLocaleDateString('es-CO').replace(/\//g, '-')
  const nombreArchivo = `Cotizacion_${datosProveedor.numeroOrden || 'SinNumero'}_${fecha}.xlsx`
  
  link.download = nombreArchivo
  link.click()
  
  // Limpiar URL
  window.URL.revokeObjectURL(url)
}
