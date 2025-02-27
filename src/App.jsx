import React from 'react'

import HomeSearch from './components/SectionHome/HomeSearch'
import SectionPorque from './components/SectionPorque/SectionPorque'
import SectionVariedad from './components/SectionVariedad/SectionVariedad'
import SectionEncuentra from './components/SectionEncuentra/SectionEncuentra'
import SectionCTA from './components/SectionCTA/SectionCTA'

export default function App() {
  return (
    <>
    <HomeSearch/>
    <SectionPorque/>
    <SectionVariedad/>
    <SectionEncuentra/>
    <SectionCTA/>
    </>
  )
}
