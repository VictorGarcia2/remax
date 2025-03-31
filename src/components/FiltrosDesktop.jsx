import React from 'react'
import Tipo from './Tipo.jsx'
import RangoDePrecio from './RangoDePrecio'

export default function FiltrosDesktop() {
  return (
    <div className='flex'>
        <Tipo/>
        <RangoDePrecio/>
    </div>
  )
}
