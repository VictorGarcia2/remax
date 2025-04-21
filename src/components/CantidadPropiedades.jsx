import React from 'react'

export default function CantidadPropiedades({propiedadesVisibles}) {

  const count = propiedadesVisibles.length

  return (
    <>
          <div  className=' mt-4 mx-auto flex justify-center md:justify-start md:px-17 w-full text-[#7b7b7b]'>Propiedades disponibles: {count}</div>
    </>
  )
}
