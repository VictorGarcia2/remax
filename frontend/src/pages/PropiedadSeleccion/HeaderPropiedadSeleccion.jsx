import React from 'react'
import { Link } from 'react-router-dom'

export default function HeaderPropiedadSeleccion() {
  return (
    <div className='flex justify-center items-center my-5'>
     <Link to={"/inicio"}>
      <img loading="lazy" className='w-30 ' src="/logos/New_RMX_Mark_R4_RGB_dark.png" alt="" />
     </Link>
    </div>
  )
}
