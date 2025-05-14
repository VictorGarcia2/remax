import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export default function WhatsAppModal({ isOpen, onClose, propiedadId }) {
  if (!isOpen) return null;

  const handleWhatsAppClick = () => {
    const mensaje = `Estoy interesado en esta propiedad: ${window.location.origin}/propiedades/seleccion/${propiedadId}`;
    const whatsappLink = `https://wa.me/5212292696629?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-end">
          <FontAwesomeIcon
            icon={faXmark}
            size="2xl"
            className="cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="flex justify-center">
          <img
            className="max-w-[200px]"
            src="/logos/New_RMX_Mark_R4_RGB_dark.png"
            alt="Logo"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Envíanos un mensaje por WhatsApp
        </h1>
        <p className="text-gray-600 text-center">
          Si estás interesado en esta propiedad, envíanos un mensaje.
        </p>
        <div className="flex justify-center">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-blueRemax text-white rounded-lg shadow-sm hover:bg-blueRemax/80 transition-colors duration-200"
            onClick={handleWhatsAppClick}
          >
            <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
            <span className="text-sm sm:text-base md:text-lg">
              Contactar por WhatsApp
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}