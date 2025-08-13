import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ItemCotizacion, InsumoCalculado } from '../types'
import { formatearMoneda } from './calculation'

interface ProductoInsumos {
  item: ItemCotizacion
  insumos: Array<{
    insumo: {
      nombre: string
      cantidadPorUnidad: number
      unidadMedida: string
    }
    cantidadTotal: number
  }>
}

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number
    }
  }
}

export const generarPDFCotizacion = (
  items: ItemCotizacion[],
  insumosPorProducto: ProductoInsumos[],
  insumosRequeridos: InsumoCalculado[],
  totalCotizacion: number
) => {
  const doc = new jsPDF()
  
  // Configuración de colores
  const colorPrimario: [number, number, number] = [52, 152, 219] // Azul
  const colorSecundario: [number, number, number] = [39, 174, 96] // Verde
  const colorNaranja: [number, number, number] = [243, 156, 18] // Naranja
  
  let yPosition = 20

  // Encabezado
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(52, 73, 94)
  doc.text('UNIMARKER', 105, yPosition, { align: 'center' })
  
  yPosition += 10
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistema de Cotizaciones', 105, yPosition, { align: 'center' })
  
  yPosition += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  // Fecha
  const fechaActual = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Fecha: ${fechaActual}`, 20, yPosition)
  
  yPosition += 20

  // Tabla de Cotización
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.text('COTIZACIÓN DE PRODUCTOS', 20, yPosition)
  
  yPosition += 10

  // Preparar datos para la tabla de cotización
  const datosTabla = items
    .filter(item => item.nombre && item.cantidad > 0)
    .map(item => [
      item.codigo,
      item.nombre,
      item.cantidad.toString(),
      formatearMoneda(item.valorUnitario),
      formatearMoneda(item.descuento),
      formatearMoneda(item.valorTotal)
    ])

  autoTable(doc, {
    startY: yPosition,
    head: [['Código', 'Producto', 'Cantidad', 'Valor Unitario', 'Descuento', 'Valor Total']],
    body: datosTabla,
    theme: 'grid',
    headStyles: {
      fillColor: colorPrimario,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 65 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  })

  yPosition = doc.lastAutoTable.finalY + 15

  // Total de la cotización
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2])
  doc.text(`TOTAL COTIZACIÓN: ${formatearMoneda(totalCotizacion)}`, 105, yPosition, { align: 'center' })
  
  yPosition += 20

  // Nueva página para insumos si es necesario
  if (yPosition > 250) {
    doc.addPage()
    yPosition = 20
  }

  // Sección de Insumos por Producto
  if (insumosPorProducto.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(colorNaranja[0], colorNaranja[1], colorNaranja[2])
    doc.text('INSUMOS POR PRODUCTO (DETALLE)', 20, yPosition)
    
    yPosition += 10

    insumosPorProducto.forEach((productoDatos) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      // Título del producto
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(231, 76, 60)
      doc.text(`${productoDatos.item.nombre} - Cantidad: ${productoDatos.item.cantidad}`, 20, yPosition)
      
      yPosition += 8

      // Tabla de insumos del producto
      const datosInsumos = productoDatos.insumos.map((insumoData) => [
        insumoData.insumo.nombre,
        insumoData.insumo.cantidadPorUnidad.toString(),
        insumoData.cantidadTotal.toString(),
        insumoData.insumo.unidadMedida
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Insumo', 'Cant. por Unidad', 'Cantidad Total', 'Unidad de Medida']],
        body: datosInsumos,
        theme: 'grid',
        headStyles: {
          fillColor: [230, 126, 34],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 40, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      })

      yPosition = doc.lastAutoTable.finalY + 15
    })
  }

  // Nueva página para resumen general si es necesario
  if (yPosition > 200) {
    doc.addPage()
    yPosition = 20
  }

  // Resumen General de Insumos
  if (insumosRequeridos.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2])
    doc.text('RESUMEN GENERAL DE INSUMOS', 20, yPosition)
    
    yPosition += 10

    const datosResumen = insumosRequeridos.map(insumoCalculado => [
      insumoCalculado.insumo.nombre,
      insumoCalculado.insumo.cantidadPorUnidad.toString(),
      insumoCalculado.cantidadTotal.toString(),
      insumoCalculado.insumo.unidadMedida
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Insumo', 'Cant. por Unidad', 'Cantidad Total Requerida', 'Unidad de Medida']],
      body: datosResumen,
      theme: 'grid',
      headStyles: {
        fillColor: colorSecundario,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' }
      },
      margin: { left: 20, right: 20 }
    })
  }

  // Pie de página en todas las páginas
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(128, 128, 128)
    doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' })
    doc.text('Generado por UniMarker - Sistema de Cotizaciones', 105, 290, { align: 'center' })
  }

  // Descargar el PDF
  const nombreArchivo = `Cotizacion_${new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`
  doc.save(nombreArchivo)
}
