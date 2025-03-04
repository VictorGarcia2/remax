import React from 'react'

export default function CantidadPropiedades({propiedades}) {

  const count = propiedades.length
  console.log(count)
  return (
    <>
          <div  className='px-5 mt-4 text-[#7b7b7b]'>Propiedades disponibles: {count}</div>
    </>
  )
}
