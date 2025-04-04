import React from 'react'
import Tipo from './Tipo.jsx'
import RangoDePrecio from './RangoDePrecio.jsx'
import Operacion from './Operacion.jsx'
import Sector from './Sector.jsx'


export default function FiltrosDesktop() {
  return (
    <div className='flex px-17 gap-2 items-center justify-start '>
        <RangoDePrecio/>
        <Operacion/>
        <Sector/>
        <Tipo/>
    </div>
  )
}
