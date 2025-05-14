import React, { useState } from "react";
export default function LimpiarFiltro({ setlimpiar }) {

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
          className="text-blueRemax hover:text-white border border-blueRemax hover:bg-blueRemax focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Limpiar
        </button>
      </div>
    </>
  );
}
