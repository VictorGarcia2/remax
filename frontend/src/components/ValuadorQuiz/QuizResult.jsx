import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchContext } from "../../context/SearchContext";

// Constantes para Pipedrive (Idealmente, mover a un archivo de configuración o variables de entorno)
const PIPEDRIVE_API_KEY = "02317c5467585c4251d802ab65e0c7b9f60541ee";
const PIPEDRIVE_API_URL = "https://api.pipedrive.com/v1";

// Definición de campos personalizados para Valuador en Pipedrive
const VALUATOR_CUSTOM_FIELDS = {
  VAL_TIPO_PROPIEDAD: { name: "Tipo de Propiedad Valuada", field_type: "enum", options: ["Casa", "Departamento", "Terreno", "Otro"] },
  VAL_TAMANO_M2: { name: "Tamaño Estimado m2", field_type: "double" },
  VAL_ESTIMADO_BAJO: { name: "Valor Estimado Bajo", field_type: "double" },
  VAL_ESTIMADO_ALTO: { name: "Valor Estimado Alto", field_type: "double" },
  VAL_ESTIMADO_PROMEDIO: { name: "Valor Estimado Promedio", field_type: "double" },
  VAL_POR_M2_ESTIMADO: { name: "Valor por m2 Estimado", field_type: "double" },
  VAL_DIRECCION: { name: "Dirección Propiedad Valuada", field_type: "varchar" },
  VAL_ANTIGUEDAD: { name: "Antigüedad Estimada", field_type: "enum", options: ["Nueva", "Hasta 5 años", "5-10 años", "10-20 años", "Más de 20 años"] },
  VAL_CONDICION: { name: "Condición Estimada", field_type: "enum", options: ["Excelente", "Buena", "Regular", "Para remodelar"] },
  VAL_AMENIDADES: { name: "Amenidades Seleccionadas", field_type: "varchar" }, // Texto largo para un resumen
};

// Helper para comparar arrays (usado en ensureCustomFields)
const arraysEqual = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
};

// Función para asegurar que existan los campos personalizados en Pipedrive
const ensureCustomFields = async (fieldsDefinition) => {
  try {
    const fieldsResponse = await fetch(
      `${PIPEDRIVE_API_URL}/dealFields?api_token=${PIPEDRIVE_API_KEY}`
    );
    if (!fieldsResponse.ok) {
      const errorData = await fieldsResponse.json();
      console.error('Error al obtener campos de Pipedrive:', errorData);
      throw new Error(`Error al obtener campos de Pipedrive: ${errorData.error || fieldsResponse.statusText}`);
    }
    const existingFields = await fieldsResponse.json();
    const customFieldIds = {};

    for (const [key, field] of Object.entries(fieldsDefinition)) {
      const existingField = existingFields.data?.find(f => f.name === field.name);
      if (existingField) {
        if (field.field_type === "enum" && field.options &&
            (!existingField.options || !arraysEqual(existingField.options.map(o => o.label), field.options))) {
          // Opcional: Actualizar opciones si difieren. Por simplicidad, se omite aquí pero se puede agregar.
          console.warn(`Campo enum ${field.name} existe pero las opciones pueden diferir. Usando campo existente.`);
        }
        customFieldIds[key] = existingField.key;
      } else {
        const payload = { name: field.name, field_type: field.field_type };
        if (field.field_type === "enum" && field.options) {
          payload.options = field.options.map(opt => ({ label: opt }));
        }
        const createResponse = await fetch(
          `${PIPEDRIVE_API_URL}/dealFields?api_token=${PIPEDRIVE_API_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
        );
        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          console.error(`Error al crear campo ${field.name}:`, errorData);
          throw new Error(`Error al crear campo ${field.name}: ${errorData.error || createResponse.statusText}`);
        }
        const newField = await createResponse.json();
        if (newField.success) {
          customFieldIds[key] = newField.data.key;
        } else {
          throw new Error(`Error al crear campo ${field.name}: ${newField.error || 'Error desconocido'}`);
        }
      }
    }
    return customFieldIds;
  } catch (error) {
    console.error("Error al verificar/crear campos personalizados para valuador:", error);
    toast.error("Error configurando campos en Pipedrive. Intente más tarde.");
    throw error;
  }
};

// Lista de posibles propietarios (copiada de Reclutamiento.jsx, idealmente en un util)
const OWNER_MATCHES = [
  { type: 'name', value: 'veronica' },
  { type: 'name', value: 'verónica' },
  { type: 'email', value: 'adm.remaxrna@gmail.com' },
  { type: 'email', value: 'remaxcincoleccion@gmail.com' }
];

const findOwnerInPipedrive = async (apiKey) => {
  try {
    const usersResponse = await fetch(`${PIPEDRIVE_API_URL}/users?api_token=${apiKey}`);
    if (!usersResponse.ok) throw new Error('Error al obtener usuarios de Pipedrive');
    const usersData = await usersResponse.json();
    let owner = null;
    for (const match of OWNER_MATCHES) {
      owner = usersData.data.find(user => 
        match.type === 'email' ? user.email?.toLowerCase() === match.value.toLowerCase() : user.name?.toLowerCase().includes(match.value.toLowerCase())
      );
      if (owner) break;
    }
    if (!owner) owner = usersData.data.find(user => user.active_flag && (user.role_id === 1 || user.is_admin));
    if (!owner) owner = usersData.data.find(user => user.active_flag);
    if (!owner && usersData.data.length > 0) owner = usersData.data[0];
    return owner;
  } catch (error) {
    console.error('Error al buscar propietario en Pipedrive:', error);
    // No lanzar error aquí, permitir que el deal se cree sin owner si es necesario
    return null; 
  }
};


const QuizResult = ({ estimatedValue, contactInfo, quizAnswers, onReset, onComplete: originalOnComplete }) => {
  const { valor } = useSearchContext();
  const [hasSentToPipedrive, setHasSentToPipedrive] = useState(false); // Nuevo estado
  const [downloadProgress, setDownloadProgress] = useState(0); // Progreso de descarga PDF

  if (!estimatedValue) {
    return <div className="text-center py-8">Cargando resultado de la valuación...</div>;
  }

  // Función para formatear valores monetarios
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const sendValuationToPipedrive = async () => {
    if (!quizAnswers) {
      toast.error("No hay datos del cuestionario para enviar.");
      return;
    }
    if (hasSentToPipedrive) { 
        toast.info("La información ya fue enviada previamente.");
        if(originalOnComplete) originalOnComplete();
        return;
    }

    const toastId = toast.loading("Enviando información a Pipedrive...");

    try {
      // 1. Asegurar campos personalizados
      const customFields = await ensureCustomFields(VALUATOR_CUSTOM_FIELDS);

      // 2. Crear o encontrar persona
      let personId;
      // Intenta buscar por email primero
      const searchPersonResponse = await fetch(
        `${PIPEDRIVE_API_URL}/persons/search?term=${encodeURIComponent(contactInfo.email)}&fields=email&exact_match=true&api_token=${PIPEDRIVE_API_KEY}`
      );
      
      if (searchPersonResponse.ok) {
        const searchResult = await searchPersonResponse.json();
        if (searchResult.data && searchResult.data.items.length > 0) {
          personId = searchResult.data.items[0].item.id;
        }
      }

      if (!personId) {
        const personPayload = {
          name: contactInfo.name,
          email: [{ value: contactInfo.email, primary: true }],
          phone: [{ value: contactInfo.phone, primary: true }],
          visible_to: 3 
        };
        const personResponse = await fetch(
          `${PIPEDRIVE_API_URL}/persons?api_token=${PIPEDRIVE_API_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(personPayload) }
        );
        if (!personResponse.ok) {
          const errorData = await personResponse.json();
          throw new Error(`Error al crear persona: ${errorData.error || 'Error desconocido'}`);
        }
        const personData = await personResponse.json();
        personId = personData.data.id;
      }

      // 3. Encontrar propietario del Deal
      const owner = await findOwnerInPipedrive(PIPEDRIVE_API_KEY);

      // 4. Crear Deal
      const dealPayload = {
        title: `Valuación de Propiedad para ${contactInfo.name}`,
        person_id: personId,
        ...(owner && owner.id && { user_id: owner.id }), // Asignar owner si se encontró
        stage_id: 1, // ID del primer stage del pipeline (ajustar si es necesario)
        status: "open",
        visible_to: 3,
        [customFields.VAL_TIPO_PROPIEDAD]: quizAnswers.propertyType,
        [customFields.VAL_TAMANO_M2]: estimatedValue.size,
        [customFields.VAL_ESTIMADO_BAJO]: estimatedValue.low,
        [customFields.VAL_ESTIMADO_ALTO]: estimatedValue.high,
        [customFields.VAL_ESTIMADO_PROMEDIO]: estimatedValue.average,
        [customFields.VAL_POR_M2_ESTIMADO]: estimatedValue.valuePerSqMeter,
        [customFields.VAL_DIRECCION]: quizAnswers.address || 'No especificada',
        [customFields.VAL_ANTIGUEDAD]: quizAnswers.age,
        [customFields.VAL_CONDICION]: quizAnswers.condition,
        [customFields.VAL_AMENIDADES]: quizAnswers.amenities ? quizAnswers.amenities.join(', ') : 'Ninguna',
      };

      const dealResponse = await fetch(
        `${PIPEDRIVE_API_URL}/deals?api_token=${PIPEDRIVE_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dealPayload) }
      );

      if (!dealResponse.ok) {
        const errorData = await dealResponse.json();
        throw new Error(`Error al crear deal: ${errorData.error || 'Error desconocido'}`);
      }
      const dealData = await dealResponse.json();

      // 5. Crear Nota con todos los detalles
      let noteContent = "Resumen de Valuación:\n";
      noteContent += `Tipo de Propiedad: ${quizAnswers.propertyType}\n`;
      noteContent += `Tamaño Estimado: ${estimatedValue.size} m²\n`;
      noteContent += `Antigüedad: ${quizAnswers.age}\n`;
      noteContent += `Condición: ${quizAnswers.condition}\n`;
      noteContent += `Dirección: ${quizAnswers.address || 'No especificada'}\n`;
      if (quizAnswers.bedrooms) noteContent += `Recámaras: ${quizAnswers.bedrooms}\n`;
      if (quizAnswers.bathrooms) noteContent += `Baños: ${quizAnswers.bathrooms}\n`;
      if (quizAnswers.parkingSpaces) noteContent += `Estacionamientos: ${quizAnswers.parkingSpaces}\n`;
      if (quizAnswers.amenities && quizAnswers.amenities.length > 0) {
        noteContent += `Amenidades: ${quizAnswers.amenities.join(', ')}\n`;
      }
      noteContent += `\n--- Estimación de Valor ---\n`;
      noteContent += `Rango: ${formatCurrency(estimatedValue.low)} - ${formatCurrency(estimatedValue.high)}\n`;
      noteContent += `Promedio: ${formatCurrency(estimatedValue.average)}\n`;
      noteContent += `Valor por m²: ${formatCurrency(estimatedValue.valuePerSqMeter)}\n`;
      noteContent += `\n--- Información de Contacto ---\n`;
      noteContent += `Nombre: ${contactInfo.name}\n`;
      noteContent += `Email: ${contactInfo.email}\n`;
      noteContent += `Teléfono: ${contactInfo.phone}\n`;
      
      const notePayload = {
        content: noteContent,
        deal_id: dealData.data.id,
      };

      await fetch(
        `${PIPEDRIVE_API_URL}/notes?api_token=${PIPEDRIVE_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(notePayload) }
      );
      // No se maneja error de nota críticamente para no fallar todo el proceso si solo la nota falla.

      toast.update(toastId, { render: "¡Información enviada a Pipedrive con éxito!", type: "success", isLoading: false, autoClose: 5000 });
      setHasSentToPipedrive(true); // Marcar como enviado con éxito
      if(originalOnComplete) originalOnComplete(); 

    } catch (error) {
      console.error("Error enviando a Pipedrive:", error);
      toast.update(toastId, { render: `Error al enviar a Pipedrive: ${error.message}`, type: "error", isLoading: false, autoClose: 7000 });
      // No se resetea hasSentToPipedrive a false aquí para evitar bucles de reintento automático con useEffect.
      // El usuario puede reintentar manualmente con el botón.
    }
  };
  
  useEffect(() => {
    if (quizAnswers && estimatedValue && contactInfo && !hasSentToPipedrive) {
      sendValuationToPipedrive(); 
    }
  }, [quizAnswers, estimatedValue, contactInfo, hasSentToPipedrive]); // Dependencias actualizadas


  const handleContactAdvisor = () => {
    if (!hasSentToPipedrive) {
        sendValuationToPipedrive(); 
    } else {
        toast.info("La información ya fue enviada. Un asesor se pondrá en contacto.");
        if(originalOnComplete) originalOnComplete();
    }
  };

  // Función para descargar el PDF
  const descargarPDF = async () => {
    setDownloadProgress(0);
    try {
      // Validar datos requeridos
      if (!quizAnswers.propertyType || !quizAnswers.size) {
        throw new Error("Faltan datos requeridos para generar el PDF");
      }

      // Construir el payload asegurando todos los campos requeridos
      const locationData = quizAnswers.location || {};
      const address =
        typeof locationData === "object"
          ? locationData.fullAddress || locationData.address || ""
          : locationData;
      const payload = {
        direccion: address,
        tipo: quizAnswers.propertyType || "",
        metros: Number(quizAnswers.size) || 0,
        bedrooms: Number(quizAnswers.bedrooms) || 0,
        bathrooms: Number(quizAnswers.bathrooms) || 0,
        age: quizAnswers.age || "",
        condition: quizAnswers.condition || "",
        amenities: quizAnswers.amenities || [],
        contact_info: quizAnswers.contactInfo || {},
        valor_estimado: estimatedValue.average || 0,
        valor_m2: estimatedValue.valuePerSqMeter || 0,
        colonia: quizAnswers.colonia || "",
        ciudad: quizAnswers.ciudad || "",
        estado: quizAnswers.estado || "",
        comparables: estimatedValue.comparables || [],
        estadisticas: estimatedValue || {}
      };
      
      console.log("Enviando petición para PDF:", payload);
      console.log("URL del PDF:", 'http://127.0.0.1:8000/reporte_pdf');
      
      // Probar diferentes URLs para el PDF
      const pdfUrls = [
        'http://127.0.0.1:8000/reporte_pdf',
        'http://127.0.0.1:8000/reporte_pdf',
        'http://127.0.0.1:8000/reporte_pdf'
      ];
      
      let response = null;
      let lastError = null;
      
      for (const url of pdfUrls) {
        try {
          console.log("Probando URL:", url);
          response = await fetch(url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/pdf'
            },
            body: JSON.stringify(payload)
          });
          
          console.log("Respuesta PDF:", response.status, response.statusText, "para URL:", url);
          
          if (response.ok) {
            console.log("¡URL exitosa:", url);
            break;
          } else {
            lastError = `Error ${response.status} para URL: ${url}`;
          }
        } catch (error) {
          console.error("Error para URL:", url, error);
          lastError = `Error de red para URL: ${url} - ${error.message}`;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`No se pudo generar PDF. Último error: ${lastError}`);
      }
      
      // --- Progreso de descarga ---
      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      const reader = response.body.getReader();
      let received = 0;
      let chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) setDownloadProgress(Math.round((received / total) * 100));
      }
      const blob = new Blob(chunks, { type: 'application/pdf' });
      if (blob.size === 0) {
        throw new Error("El PDF generado está vacío");
      }
      setDownloadProgress(100);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_inmueble.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      setDownloadProgress(0);
      console.error("Error completo al generar PDF:", error);
      alert(`Error al generar el PDF: ${error.message}`);
    }
  };

  return (
    <div className="text-center animate-fadeIn">
      {/* Mensaje destacado según si hay comparables */}
      {estimatedValue.comparables && estimatedValue.comparables.length > 0 ? (
        <div className="mb-6 sm:mb-8">
          <div className="inline-block p-2 sm:p-3 bg-green-100 rounded-full mb-3 sm:mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-800 mb-2">¡Valuación basada en datos reales de tu zona!</h3>
          <p className="text-sm sm:text-base text-green-700">El cálculo se realizó usando propiedades similares de la base de datos.</p>
        </div>
      ) : (
        <div className="mb-6 sm:mb-8">
          <div className="inline-block p-2 sm:p-3 bg-yellow-100 rounded-full mb-3 sm:mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-800 mb-2">Estimación basada en comparables reales de tu zona.</h3>
          <p className="text-sm sm:text-base text-yellow-700">El valor mostrado es una estimación basada en promedios generales.</p>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-8 rounded-xl shadow-sm mb-6 sm:mb-8">
        <p className="text-gray-700 mb-2 sm:mb-3 font-medium text-sm sm:text-base">El valor estimado de tu propiedad es:</p>
        <p className="text-3xl sm:text-4xl font-bold text-[#003da4] mb-2 sm:mb-3">
        {formatCurrency(estimatedValue.low)} - {formatCurrency(estimatedValue.high)}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 text-left">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Valor por m²</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-800">
              {estimatedValue.valuePerSqMeter.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Superficie</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-800">{estimatedValue.size} m²</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
        <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">Información de contacto</h4>
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-sm sm:text-base text-gray-700">{contactInfo.name}</p>
          </div>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm sm:text-base text-gray-700">{contactInfo.email}</p>
          </div>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-sm sm:text-base text-gray-700">{contactInfo.phone}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-2 sm:ml-3 text-left">
            <h5 className="text-sm sm:text-md font-medium text-blue-800">Próximos pasos</h5>
            <p className="text-xs sm:text-sm text-blue-700 mt-1">
              Un asesor inmobiliario especializado se pondrá en contacto contigo en las próximas 24 horas para brindarte una valuación más precisa y personalizada de tu propiedad.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
        <button
          onClick={onReset}
          className={`px-4 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-opacity-80 transition-colors font-medium flex items-center justify-center text-sm sm:text-base ${
            valor === "comercial" ? "bg-redRemax text-white" : "bg-blueRemax text-white"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reiniciar Valuación
        </button>
        <button
          onClick={handleContactAdvisor} // Modificado para llamar a la nueva función wrapper
          className={`px-4 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-opacity-80 transition-colors font-medium flex items-center justify-center shadow-md text-sm sm:text-base ${
            valor === "comercial" ? "bg-redRemax text-white" : "bg-blueRemax text-white"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Contactar Asesor
        </button>
      </div>
      <button onClick={descargarPDF} className="mt-4 rounded-lg px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700">
        Descargar PDF del reporte premium
      </button>
      {/* Barra de progreso de descarga PDF */}
      {downloadProgress > 0 && downloadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${downloadProgress}%` }}
          ></div>
          <span className="text-xs text-gray-700">{downloadProgress}%</span>
        </div>
      )}
    </div>
  );
};

QuizResult.propTypes = {
  estimatedValue: PropTypes.shape({
    low: PropTypes.number.isRequired,
    high: PropTypes.number.isRequired,
    average: PropTypes.number.isRequired,
    valuePerSqMeter: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired
  }).isRequired,
  contactInfo: PropTypes.object.isRequired,
  quizAnswers: PropTypes.object.isRequired, // Asegúrate de que esto se pase como prop desde ValuadorQuiz.jsx
  onReset: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default QuizResult;