import './App.css'
import { useState } from 'react'
import type { ItemCotizacion } from './types'
import { productos } from './data/productos'
import { calcularValorTotal, calcularTotalCotizacion, formatearMoneda, calcularInsumosRequeridos, obtenerInsumosPorProducto } from './utils/calculation'
import { generarPDFCotizacion } from './utils/pdfGenerator'

function App() {
  const [items, setItems] = useState<ItemCotizacion[]>([
    {
      id: '1',
      codigo: '',
      nombre: '',
      cantidad: 0,
      valorUnitario: 0,
      descuento: 0,
      valorTotal: 0
    }
  ])

  const actualizarItem = (id: string, campo: keyof ItemCotizacion, valor: string | number) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const itemActualizado = { ...item, [campo]: valor }
          
          // Si se selecciona un producto, auto-llenar código y valor unitario
          if (campo === 'nombre') {
            const producto = productos.find(p => p.nombre === valor)
            if (producto) {
              itemActualizado.codigo = producto.codigo
              itemActualizado.valorUnitario = producto.valorUnitario
            }
          }
          
          // Recalcular valor total cuando cambie cantidad, valor unitario o descuento
          if (['cantidad', 'valorUnitario', 'descuento'].includes(campo)) {
            itemActualizado.valorTotal = calcularValorTotal(
              itemActualizado.cantidad,
              itemActualizado.valorUnitario,
              itemActualizado.descuento
            )
          }
          
          return itemActualizado
        }
        return item
      })
    )
  }

  const agregarItem = () => {
    const nuevoItem: ItemCotizacion = {
      id: Date.now().toString(),
      codigo: '',
      nombre: '',
      cantidad: 0,
      valorUnitario: 0,
      descuento: 0,
      valorTotal: 0
    }
    setItems([...items, nuevoItem])
  }

  const eliminarItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const insumosRequeridos = calcularInsumosRequeridos(items, productos)
  const insumosPorProducto = obtenerInsumosPorProducto(items, productos)

  const descargarPDF = () => {
    const itemsConDatos = items.filter(item => item.nombre && item.cantidad > 0)
    
    if (itemsConDatos.length === 0) {
      alert('Por favor, agregue al menos un producto con cantidad antes de generar el PDF')
      return
    }

    generarPDFCotizacion(
      items,
      insumosPorProducto.filter((item): item is NonNullable<typeof item> => item !== null),
      insumosRequeridos,
      calcularTotalCotizacion(items)
    )
  }

  return (
    <div className="app">
      <h1>UniMarker - Sistema de Cotizaciones</h1>
      
      <div className="cotizacion-container">
        <h2>Nueva Cotización</h2>
        
        <div className="tabla-container">
          <table className="tabla-cotizacion">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Valor Unitario</th>
                <th>Descuento ($)</th>
                <th>Valor Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      value={item.codigo}
                      readOnly
                      className="input-codigo"
                    />
                  </td>
                  <td>
                    <select
                      value={item.nombre}
                      onChange={(e) => actualizarItem(item.id, 'nombre', e.target.value)}
                      className="select-producto"
                    >
                      <option value="">Seleccionar producto...</option>
                      {productos.map((producto) => (
                        <option key={producto.codigo} value={producto.nombre}>
                          {producto.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.cantidad === 0 ? '' : item.cantidad}
                      onChange={(e) => actualizarItem(item.id, 'cantidad', parseInt(e.target.value) || 0)}
                      className="input-cantidad"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.valorUnitario}
                      onChange={(e) => actualizarItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                      className="input-valor"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.descuento === 0 ? '' : item.descuento}
                      onChange={(e) => actualizarItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                      className="input-descuento"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td className="valor-total">
                    {formatearMoneda(item.valorTotal)}
                  </td>
                  <td>
                    <button
                      onClick={() => eliminarItem(item.id)}
                      className="btn-eliminar"
                      disabled={items.length === 1}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="acciones">
          <button onClick={agregarItem} className="btn-agregar">
            + Agregar Producto
          </button>
          <button onClick={descargarPDF} className="btn-pdf">
            📄 Descargar PDF
          </button>
        </div>
        
        <div className="resumen">
          <div className="total-cotizacion">
            <h3>Total Cotización: {formatearMoneda(calcularTotalCotizacion(items))}</h3>
          </div>
        </div>
      </div>

      {/* Insumos por Producto - Vista Detallada */}
      <div className="cotizacion-container">
        <h2>Insumos por Producto (Vista Detallada)</h2>
        
        {insumosPorProducto.length > 0 ? (
          <div className="insumos-detallados">
            {insumosPorProducto.map((productoDatos, index) => (
              <div key={index} className="producto-insumos">
                <h3 className="producto-titulo">
                  {productoDatos?.item.nombre} - Cantidad: {productoDatos?.item.cantidad}
                </h3>
                <table className="tabla-insumos-detalle">
                  <thead>
                    <tr>
                      <th>Insumo</th>
                      <th>Cantidad por Unidad</th>
                      <th>Cantidad Total</th>
                      <th>Unidad de Medida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productoDatos?.insumos.map((insumoData, insumoIndex) => (
                      <tr key={insumoIndex}>
                        <td className="nombre-insumo">{insumoData.insumo.nombre}</td>
                        <td className="cantidad-unitaria">{insumoData.insumo.cantidadPorUnidad}</td>
                        <td className="cantidad-total">{insumoData.cantidadTotal}</td>
                        <td className="unidad-medida">{insumoData.insumo.unidadMedida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <p className="sin-insumos">Selecciona productos para ver el detalle de insumos</p>
        )}
      </div>

      {/* Tabla de Insumos Requeridos - Resumen General */}
      <div className="cotizacion-container">
        <h2>Resumen General de Insumos</h2>
        
        {insumosRequeridos.length > 0 ? (
          <div className="tabla-container">
            <table className="tabla-insumos">
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Cantidad por Unidad</th>
                  <th>Cantidad Total Requerida</th>
                  <th>Unidad de Medida</th>
                </tr>
              </thead>
              <tbody>
                {insumosRequeridos.map((insumoCalculado, index) => (
                  <tr key={index}>
                    <td className="nombre-insumo">{insumoCalculado.insumo.nombre}</td>
                    <td className="cantidad-unitaria">{insumoCalculado.insumo.cantidadPorUnidad}</td>
                    <td className="cantidad-total">{insumoCalculado.cantidadTotal}</td>
                    <td className="unidad-medida">{insumoCalculado.insumo.unidadMedida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sin-insumos">Selecciona productos para ver los insumos requeridos</p>
        )}
      </div>
    </div>
  )
}

export default App