import React from 'react'

export default function CantidadPropiedades({propiedadesVisibles}) {

  const count = propiedadesVisibles.length

  return (
    <>
          <div  className='px-17 mt-4 text-[#7b7b7b]'>Propiedades disponibles: {count}</div>
    </>
  )
}
