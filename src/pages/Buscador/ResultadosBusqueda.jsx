import React from 'react'
import SectionFooter from '../../components/SectionFooter/SectionFooter'
import HeaderResultadoBusqueda from '../../components/HeaderResultadoBusqueda'
import SearchResultadosBusqueda from '../../components/SearchResultadosBusqueda'
import CantidadPropiedades from '../../components/CantidadPropiedades'
import CardResultado from '../../components/CardResultado'

export default function ResultadosBusqueda() {
  return (
   <>
   <HeaderResultadoBusqueda/>
   <SearchResultadosBusqueda/>
   <CantidadPropiedades/>
   <CardResultado/>
   <SectionFooter/>
   </>
  )
}
