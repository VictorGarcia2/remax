import React, { useState } from "react";
import { useSearchContext } from "../context/SearchContext";

export default function LimpiarFiltro({ setlimpiar }) {
    const { valor } = useSearchContext(); // Obtener el valor del contexto

    const handle = ()=>{
        setlimpiar(true)
    }
  return (
    <>
      <div className="flex flex-col   ">
        <button
        typeof="button"
          onClick={handle}
          type="button"
          className={`${
            valor === "comercial" ? "text-redRemax hover:bg-redRemax border-redRemax focus:ring-red-200" : "text-blueRemax hover:bg-blueRemax border-blueRemax focus:ring-blue-200"
          } hover:text-white border focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
        >
          Limpiar
        </button>
      </div>
    </>
  );
}
