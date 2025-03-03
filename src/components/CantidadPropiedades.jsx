import React from 'react'

export default function CantidadPropiedades({propiedades}) {

  const count = propiedades.length
  console.log(count)
  return (
    <>
          <div  className='px-5 mt-4'>Propiedades disponibles: {count}</div>
    </>
  )
}
