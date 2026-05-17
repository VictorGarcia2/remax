import React from 'react'
import { useSearchContext } from '../context/SearchContext'

export default function CantidadPropiedades() {
  const { propiedadesVisibles } = useSearchContext();
  const count = propiedadesVisibles?.length || 0;

  return (
    <div className='mt-4 mx-auto flex justify-center md:justify-start md:px-17 w-full text-[#7b7b7b]'>
      Propiedades disponibles: {count}
    </div>
  )
}
