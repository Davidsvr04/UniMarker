import './App.css'
import { useState } from 'react'
import type { ItemCotizacion } from './types'
import { productos } from './data/productos'
import { calcularValorTotal, calcularTotalCotizacion, formatearMoneda } from './utils/calculation'

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
                <th>Descuento (%)</th>
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
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(item.id, 'cantidad', parseInt(e.target.value) || 0)}
                      className="input-cantidad"
                      min="0"
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
                      value={item.descuento}
                      onChange={(e) => actualizarItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                      className="input-descuento"
                      min="0"
                      max="100"
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
        </div>
        
        <div className="resumen">
          <div className="total-cotizacion">
            <h3>Total Cotización: {formatearMoneda(calcularTotalCotizacion(items))}</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App