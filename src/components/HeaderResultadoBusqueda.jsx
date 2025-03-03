import React from 'react'
import { Link } from 'react-router'

export default function HeaderResultadoBusqueda() {
  return (
    <div className='flex justify-center items-center my-10'>
     <Link to={"/"}>
      <img className='w-30 ' src="logos/New_RMX_Mark_R4_RGB_dark.png" alt="" />
     </Link>
    </div>
  )
}
