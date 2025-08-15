import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ItemCotizacion, DatosProveedor } from '../types'
import { formatearMoneda, calcularTotalCotizacion, calcularInsumosRequeridos, obtenerInsumosPorProducto, generarNombreCompleto } from './calculation'
import { productos } from '../data/productos'

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number
  }
}

const obtenerNumeroPaginas = (doc: jsPDF): number => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).getNumberOfPages() as number
}

const convertirImagenABase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error al cargar imagen:', error)
    return ''
  }
}

export const generarPDFCotizacion = async (
  items: ItemCotizacion[], 
  datosProveedor: DatosProveedor
) => {
  const itemsValidos = items.filter(item => item.nombre && item.cantidad > 0)
  
  if (itemsValidos.length === 0) {
    throw new Error('No hay productos válidos para generar el PDF')
  }

  const doc = new jsPDF() as ExtendedJsPDF
  let yPosition = 20

  doc.setFont('helvetica', 'normal')

  try {
    const logoBase64 = await convertirImagenABase64('./UM-Logo.png')
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 15, 10, 40, 20)
    }
  } catch (error) {
    console.warn('No se pudo cargar el logo:', error)
  }

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('UNIFORMES MODA', 105, 20, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text('ORDEN DE PRODUCCIÓN', 105, 28, { align: 'center' })
  
  yPosition = 45

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DE LA ORDEN', 15, yPosition)
  yPosition += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const primeraFila = [
    `No. Orden: ${datosProveedor.numeroOrden}`,
    `Fecha: ${datosProveedor.fechaOrden}`,
    `Referencia: ${datosProveedor.referencia}`
  ]
  
  primeraFila.forEach((texto, index) => {
    doc.text(texto, 15 + (index * 65), yPosition)
  })
  yPosition += 8

  doc.text(`Confeccionista: ${datosProveedor.nombre}`, 15, yPosition)
  doc.text(`Cédula/NIT: ${datosProveedor.cedula}`, 15, yPosition + 6)
  doc.text(`Teléfono: ${datosProveedor.telefono}`, 15, yPosition + 12)
  
  doc.text(`Dirección: ${datosProveedor.direccion}`, 15, yPosition + 18)
  doc.text(`Ciudad: ${datosProveedor.ciudad}, ${datosProveedor.pais}`, 15, yPosition + 24)
  
  yPosition += 35

  doc.text(`Fecha Inicio: ${datosProveedor.fechaInicio}`, 15, yPosition + 6)
  doc.text(`Plazo Entrega: ${datosProveedor.plazoEntrega} días`, 15, yPosition + 12)
  doc.text(`Fecha Máx. Entrega: ${datosProveedor.fechaMaxEntrega}`, 15, yPosition + 18)
  
  yPosition += 30

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('PRODUCTOS SOLICITADOS', 15, yPosition)
  yPosition += 10

  const datosTabla = itemsValidos.map(item => [
    item.codigo,
    generarNombreCompleto(item.nombre, item.talla, item.color),
    item.observaciones || '-',
    item.cantidad.toString(),
    formatearMoneda(item.valorUnitario),
    formatearMoneda(item.descuento),
    formatearMoneda(item.valorTotal)
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [['Código', 'Producto', 'Observaciones', 'Cant.', 'Valor Unit.', 'Descuento', 'Total']],
    body: datosTabla,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 25 }, 
      1: { cellWidth: 45 }, 
      2: { cellWidth: 35 }, 
      3: { cellWidth: 15, halign: 'center' }, 
      4: { cellWidth: 25, halign: 'right' }, 
      5: { cellWidth: 25, halign: 'right' }, 
      6: { cellWidth: 25, halign: 'right' } 
    },
    margin: { left: 15, right: 15 }
  })

  yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : yPosition + 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL COTIZACIÓN: ${formatearMoneda(calcularTotalCotizacion(itemsValidos))}`, 105, yPosition, { align: 'center' })
  
  yPosition += 20

  if (yPosition > 250) {
    doc.addPage()
    yPosition = 20
  }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INSUMOS POR PRODUCTO', 15, yPosition)
  yPosition += 10

  const insumosPorProducto = obtenerInsumosPorProducto(itemsValidos, productos)
  
  for (const productoDatos of insumosPorProducto) {
    if (!productoDatos) continue
    
    if (yPosition > 230) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    const nombreProducto = generarNombreCompleto(
      productoDatos.item.nombre, 
      productoDatos.item.talla, 
      productoDatos.item.color
    )
    doc.text(`${nombreProducto} - Cantidad: ${productoDatos.item.cantidad}`, 15, yPosition)
    yPosition += 8

    const datosInsumosProducto = productoDatos.insumos.map(insumoData => [
      insumoData.insumo.nombre,
      insumoData.insumo.cantidadPorUnidad.toString(),
      insumoData.cantidadTotal.toString(),
      insumoData.insumo.unidadMedida
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Insumo', 'Cant. por Unidad', 'Cant. Total', 'Unidad']],
      body: datosInsumosProducto,
      theme: 'striped',
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 70 }, 
        1: { cellWidth: 30, halign: 'center' }, 
        2: { cellWidth: 30, halign: 'center' }, 
        3: { cellWidth: 25, halign: 'center' } 
      },
      margin: { left: 20, right: 15 }
    })

    yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : yPosition + 8
  }

  if (yPosition > 200) {
    doc.addPage()
    yPosition = 20
  }

  yPosition += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('RESUMEN GENERAL DE INSUMOS', 15, yPosition)
  yPosition += 10

  const insumosRequeridos = calcularInsumosRequeridos(itemsValidos, productos)
  
  const datosResumenInsumos = insumosRequeridos.map(insumoCalculado => [
    insumoCalculado.insumo.nombre,
    insumoCalculado.cantidadTotal.toString(),
    insumoCalculado.insumo.unidadMedida
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [['Insumo', 'Cant. Total Requerida', 'Unidad de Medida']],
    body: datosResumenInsumos,
    theme: 'grid',
    headStyles: {
      fillColor: [46, 204, 113],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 90 }, 
      1: { cellWidth: 50, halign: 'center' }, 
      2: { cellWidth: 40, halign: 'center' } 
    },
    margin: { left: 15, right: 15 }
  })

  const totalPaginas = obtenerNumeroPaginas(doc)
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Página ${i} de ${totalPaginas}`, 105, 290, { align: 'center' })
    doc.text(`Generado el ${new Date().toLocaleDateString('es-CO')}`, 195, 290, { align: 'right' })
  }

  const fechaActual = new Date().toISOString().split('T')[0]
  
  const nombreLimpio = datosProveedor.nombre
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 20) 
  
  const numeroOrdenLimpio = datosProveedor.numeroOrden
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 15) 
  
  const nombreArchivo = `${numeroOrdenLimpio || 'SN'}_${nombreLimpio || 'Confeccionista'}_${fechaActual}.pdf`

  doc.save(nombreArchivo)
  
  return nombreArchivo
}