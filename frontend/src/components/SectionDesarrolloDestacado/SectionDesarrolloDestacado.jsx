import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaShieldAlt, FaMapMarkerAlt, FaHome, FaKey, FaCar, FaUserShield } from "react-icons/fa";

export default function SectionDesarrolloDestacado() {
  return (
    <section className="relative w-full min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-blueRemax via-blue-900 to-blue-800 overflow-hidden py-0 md:py-16">
      {/* Imagen de fondo hero */}
      <div className="absolute inset-0 z-0">
        <img src="/fotosdesarrollo/FACHADA.webp" alt="Fachada" className="w-full h-full object-cover opacity-30 scale-105 blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-blueRemax/80 via-blue-900/80 to-blue-800/90"></div>
      </div>
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center gap-6 bg-white/10 backdrop-blur-lg rounded-2xl px-8 py-12 shadow-2xl border border-white/20 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg leading-tight">TRÉBOL II</h2>
        <h3 className="text-xl md:text-2xl font-semibold text-blue-100 mb-4">Tu hogar en el corazón de Veracruz</h3>
        <p className="text-lg text-blue-50 mb-6">Descubre un desarrollo premium con ubicación privilegiada, amenidades exclusivas y la confianza de RE/MAX CIN. Vive cerca de todo, con la seguridad y calidad que tu familia merece.</p>
        <a href="/desarrollo-trebol-ii" className="inline-block bg-[#db1c2e] hover:bg-red-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blueRemax/40">Conoce Trébol II</a>
      </div>
    </section>
  );
}
