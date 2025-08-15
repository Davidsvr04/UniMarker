import './App.css'
import { useState } from 'react'
import type { ItemCotizacion, DatosProveedor } from './types'
import { productos } from './data/productos'
import { tallas } from './data/tallas'
import { colores } from './data/colores'
import { calcularValorTotal, calcularTotalCotizacion, calcularTotalesCotizacion, formatearMoneda, calcularInsumosRequeridos, obtenerInsumosPorProducto, generarCodigoCompleto, generarNombreCompleto } from './utils/calculation'
import { generarPDFCotizacion } from './utils/pdfGenerator'
import { generateExcel } from './utils/excelGenerator'

function App() {
  const [items, setItems] = useState<ItemCotizacion[]>([
    {
      id: '1',
      codigo: '',
      nombre: '',
      talla: '',
      color: '',
      observaciones: '',
      cantidad: 0,
      valorUnitario: 0,
      descuento: 0,
      valorTotal: 0
    }
  ])

  const [datosProveedor, setDatosProveedor] = useState<DatosProveedor>({
    numeroOrden: '',
    fechaOrden: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    nombre: '',
    cedula: '',
    direccion: '',
    telefono: '',
    ciudad: '',
    pais: 'Colombia',
    referencia: '',
    valor: '',
    fechaInicio: '',
    plazoEntrega: '',
    fechaMaxEntrega: ''
  })

  const actualizarDatosProveedor = (campo: keyof DatosProveedor, valor: string) => {
    setDatosProveedor(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const actualizarItem = (id: string, campo: keyof ItemCotizacion, valor: string | number) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const itemActualizado = { ...item, [campo]: valor }
          
          // Si se selecciona un producto, auto-llenar código base y valor unitario
          if (campo === 'nombre') {
            const producto = productos.find(p => p.nombre === valor)
            if (producto) {
              itemActualizado.valorUnitario = producto.valorUnitario
              // Solo actualizar código si hay producto, talla y color
              if (item.talla && item.color) {
                const tallaObj = tallas.find(t => t.nombre === item.talla)
                const colorObj = colores.find(c => c.nombre === item.color)
                if (tallaObj && colorObj) {
                  itemActualizado.codigo = generarCodigoCompleto(producto.codigo, tallaObj.codigo, colorObj.codigo)
                }
              }
            }
          }
          
          // Si se selecciona talla, actualizar código si hay producto y color
          if (campo === 'talla') {
            const tallaObj = tallas.find(t => t.nombre === valor)
            if (tallaObj && item.nombre && item.color) {
              const producto = productos.find(p => p.nombre === item.nombre)
              const colorObj = colores.find(c => c.nombre === item.color)
              if (producto && colorObj) {
                itemActualizado.codigo = generarCodigoCompleto(producto.codigo, tallaObj.codigo, colorObj.codigo)
              }
            }
          }
          
          // Si se selecciona color, actualizar código si hay producto y talla
          if (campo === 'color') {
            const colorObj = colores.find(c => c.nombre === valor)
            if (colorObj && item.nombre && item.talla) {
              const producto = productos.find(p => p.nombre === item.nombre)
              const tallaObj = tallas.find(t => t.nombre === item.talla)
              if (producto && tallaObj) {
                itemActualizado.codigo = generarCodigoCompleto(producto.codigo, tallaObj.codigo, colorObj.codigo)
              }
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
      talla: '',
      color: '',
      observaciones: '',
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

  const descargarPDF = async () => {
    const itemsConDatos = items.filter(item => item.nombre && item.cantidad > 0)
    
    if (itemsConDatos.length === 0) {
      alert('Por favor, agregue al menos un producto con cantidad antes de generar el PDF')
      return
    }

    // Validar datos básicos del proveedor
    if (!datosProveedor.nombre || !datosProveedor.numeroOrden) {
      alert('Por favor, complete al menos el número de orden y el nombre del confeccionista')
      return
    }

    try {
      const nombreArchivo = await generarPDFCotizacion(itemsConDatos, datosProveedor)
      alert(`PDF generado exitosamente: ${nombreArchivo}`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF. Por favor, inténtelo de nuevo.')
    }
  }

  const descargarExcel = () => {
    // Filtrar items con datos válidos
    const itemsConDatos = items.filter(item => 
      item.codigo && item.cantidad > 0
    )

    if (itemsConDatos.length === 0) {
      alert('Por favor, agregue al menos un producto con cantidad antes de generar el Excel')
      return
    }

    // Validar datos básicos del proveedor
    if (!datosProveedor.nombre || !datosProveedor.numeroOrden) {
      alert('Por favor, complete al menos el número de orden y el nombre del confeccionista')
      return
    }

    try {
      const { total } = calcularTotalesCotizacion(itemsConDatos)
      generateExcel(itemsConDatos, datosProveedor, total)
      alert('Excel generado y descargado exitosamente')
    } catch (error) {
      console.error('Error al generar Excel:', error)
      alert('Error al generar el Excel. Por favor, inténtelo de nuevo.')
    }
  }

  return (
    <div className="app">
      <h1>Uniformes Moda - Sistema de Cotizaciones</h1>
      
      {/* Formulario de Datos del Proveedor/Cliente */}
      <div className="cotizacion-container">
        <h2>Datos de la Orden</h2>
        
        <div className="datos-proveedor">
          <div className="fila-datos">
            <div className="campo-grupo">
              <label htmlFor="numeroOrden">Número de Orden:</label>
              <input
                id="numeroOrden"
                type="text"
                value={datosProveedor.numeroOrden}
                onChange={(e) => actualizarDatosProveedor('numeroOrden', e.target.value)}
                placeholder="Ej: ORD-2024-001"
              />
            </div>
            <div className="campo-grupo">
              <label htmlFor="referencia">Referencia:</label>
              <input
                id="referencia"
                type="text"
                value={datosProveedor.referencia}
                onChange={(e) => actualizarDatosProveedor('referencia', e.target.value)}
                placeholder="Referencia del proyecto"
              />
            </div>
          </div>

          <div className="fila-datos">
            <div className="campo-grupo">
              <label htmlFor="nombre">Nombre Confeccionista:</label>
              <input
                id="nombre"
                type="text"
                value={datosProveedor.nombre}
                onChange={(e) => actualizarDatosProveedor('nombre', e.target.value)}
                placeholder="Nombre del cliente o empresa"
              />
            </div>
            <div className="campo-grupo">
              <label htmlFor="cedula">Cédula/NIT:</label>
              <input
                id="cedula"
                type="text"
                value={datosProveedor.cedula}
                onChange={(e) => actualizarDatosProveedor('cedula', e.target.value)}
                placeholder="Número de identificación"
              />
            </div>
            <div className="campo-grupo">
              <label htmlFor="telefono">Teléfono:</label>
              <input
                id="telefono"
                type="tel"
                value={datosProveedor.telefono}
                onChange={(e) => actualizarDatosProveedor('telefono', e.target.value)}
                placeholder="Número de contacto"
              />
            </div>
          </div>

          <div className="fila-datos">
            <div className="campo-grupo campo-largo">
              <label htmlFor="direccion">Dirección:</label>
              <input
                id="direccion"
                type="text"
                value={datosProveedor.direccion}
                onChange={(e) => actualizarDatosProveedor('direccion', e.target.value)}
                placeholder="Dirección completa"
              />
            </div>
            <div className="campo-grupo">
              <label htmlFor="ciudad">Ciudad:</label>
              <input
                id="ciudad"
                type="text"
                value={datosProveedor.ciudad}
                onChange={(e) => actualizarDatosProveedor('ciudad', e.target.value)}
                placeholder="Ciudad"
              />
            </div>
            <div className="campo-grupo">
              <label htmlFor="pais">País:</label>
              <input
                id="pais"
                type="text"
                value={datosProveedor.pais}
                onChange={(e) => actualizarDatosProveedor('pais', e.target.value)}
                placeholder="País"
              />
            </div>
          </div>

          <div className="fila-datos">
            <div className="campo-grupo">
              <label htmlFor="valor">Valor:</label>
              <input
                id="valor"
                type="text"
                value={datosProveedor.valor}
                onChange={(e) => actualizarDatosProveedor('valor', e.target.value)}
                placeholder="Valor acordado"
              />
            </div>
            <div className="campo-grupo">
              <label htmlFor="fechaInicio">Fecha de Inicio:</label>
              <input
                id="fechaInicio"
                type="date"
                value={datosProveedor.fechaInicio}
                onChange={(e) => actualizarDatosProveedor('fechaInicio', e.target.value)}
              />
            </div>
            <div className="campo-grupo">
              <label htmlFor="plazoEntrega">Plazo de Entrega (días):</label>
              <input
                id="plazoEntrega"
                type="number"
                value={datosProveedor.plazoEntrega}
                onChange={(e) => actualizarDatosProveedor('plazoEntrega', e.target.value)}
                placeholder="Días"
                min="1"
              />
            </div>
            <div className="campo-grupo">
              <label htmlFor="fechaMaxEntrega">Fecha Máx. Entrega:</label>
              <input
                id="fechaMaxEntrega"
                type="date"
                value={datosProveedor.fechaMaxEntrega}
                onChange={(e) => actualizarDatosProveedor('fechaMaxEntrega', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="cotizacion-container">
        <h2>Nueva Cotización</h2>
        
        <div className="tabla-container">
          <table className="tabla-cotizacion">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Talla</th>
                <th>Color</th>
                <th>Observaciones</th>
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
                      onChange={(e) => actualizarItem(item.id, 'codigo', e.target.value)}
                      className="input-codigo"
                      placeholder="Código..."
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
                    <select
                      value={item.talla}
                      onChange={(e) => actualizarItem(item.id, 'talla', e.target.value)}
                      className="select-talla"
                    >
                      <option value="">Seleccionar talla...</option>
                      {tallas.map((talla) => (
                        <option key={talla.codigo} value={talla.nombre}>
                          {talla.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={item.color}
                      onChange={(e) => actualizarItem(item.id, 'color', e.target.value)}
                      className="select-color"
                    >
                      <option value="">Seleccionar color...</option>
                      {colores.map((color) => (
                        <option key={color.codigo} value={color.nombre}>
                          {color.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.observaciones}
                      onChange={(e) => actualizarItem(item.id, 'observaciones', e.target.value)}
                      className="input-observaciones"
                      placeholder="Observaciones..."
                    />
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
          <button onClick={descargarExcel} className="btn-excel">
            📊 Descargar Excel
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
                  {generarNombreCompleto(productoDatos?.item.nombre || '', productoDatos?.item.talla || '', productoDatos?.item.color || '')} - Cantidad: {productoDatos?.item.cantidad}
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