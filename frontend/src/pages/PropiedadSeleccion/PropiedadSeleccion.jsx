import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import SectionFooter from "../../components/SectionFooter/SectionFooter.jsx";
import HeaderPropiedadSeleccion from "./HeaderPropiedadSeleccion.jsx";
import { Dropdown } from "../../components/Dropdown.jsx";
import { X, Share2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Paginacion from "../../components/Pagination.jsx";
import axios from "axios";
import { useParams } from "react-router";
/* import propierties from "/src/APi/propiedades.json"; */
import { ShareButtons } from "../../components/ShareButtons.jsx";
import { toast } from "react-toastify";
import { useSearchContext } from "../../context/SearchContext";
import Breadcrumbs from "../../components/Breadcrumbs.jsx";

const CUSTOM_FIELDS = {
  PROPIEDAD_ID: {
    name: "ID Propiedad",
    field_type: "text"
  },
  DIRECCION: {
    name: "Dirección",
    field_type: "text"
  },
  TIPO_PROPIEDAD: {
    name: "Tipo de Propiedad",
    field_type: "text"
  },
  PRECIO: {
    name: "Precio",
    field_type: "monetary"
  }
};

// Función para verificar y crear campos personalizados
const ensureCustomFields = async (apiKey) => {
  try {
    // 1. Obtener campos existentes
    const fieldsResponse = await axios.get(
      `https://api.pipedrive.com/v1/dealFields?api_token=${apiKey}`
    );

    const existingFields = fieldsResponse.data.data || [];
    const customFieldIds = {};

    // 2. Crear campos que no existen
    for (const [key, field] of Object.entries(CUSTOM_FIELDS)) {
      const existingField = existingFields.find(f => f.name === field.name);
      
      if (existingField) {
        customFieldIds[key] = existingField.key;
      } else {
        // Crear nuevo campo
        const createResponse = await axios.post(
          `https://api.pipedrive.com/v1/dealFields?api_token=${apiKey}`,
          {
            name: field.name,
            field_type: field.field_type
          }
        );
        
        if (createResponse.data.success) {
          customFieldIds[key] = createResponse.data.data.key;
        }
      }
    }

    return customFieldIds;
  } catch (error) {
    console.error("Error al verificar/crear campos personalizados:", error);
    throw error;
  }
};

export default function PropiedadSeleccion({ seleccion }) {
  const { id } = useParams();
  const [propiedades, setPropiedades] = useState([]);
  const [propiedadSeleccion, setPropiedadSeleccion] = useState();
  const [fotoEscogida, setFotoEscogida] = useState();
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { valor } = useSearchContext();

  const validateForm = () => {
    const errors = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = "El nombre es requerido";
    } else if (!nameRegex.test(formData.name.trim())) {
      errors.name = "Por favor ingresa un nombre válido";
    }

    if (!formData.phone.trim()) {
      errors.phone = "El teléfono es requerido";
    } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      errors.phone = "Por favor ingresa un número de teléfono válido (10 dígitos)";
    }

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es requerido";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Por favor ingresa un correo electrónico válido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const countPage = propiedadSeleccion?.imagenes
    ? propiedadSeleccion.imagenes.split(",").length
    : 0;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/propiedades")
      .then((res) => {
        const dataRows = res.data?.data?.rows || (Array.isArray(res.data) ? res.data : []);
        setPropiedades(dataRows);
      })
      .catch((err) => {
        console.error("❌ Error en frontend:", err);
        setLoading(false);
      });
  }, []);

  const agentesId = useMemo(
    () => [
      { id: "101914741", nombre: "Verónica Olán García" },
      { id: "102162316", nombre: "Andrés Guerra Olan" },
      { id: "101932987", nombre: "Andrés Guerra García" },
      { id: "102296937", nombre: "Beatriz Hernandez Aguilera" },
      { id: "102298360", nombre: "Verónica Itzel Guerra Olán" },
      { id: "102312153", nombre: "Dulce Angelica Flores De Jesus" },
      { id: "102427296", nombre: "Aída Leon Varela" },
      { id: "102437017", nombre: "Yazmin Vazquez Valdez" },
      { id: "102433046", nombre: "Fernanda Lozada" },
    ],
    []
  );

  const filtroagente = propiedadSeleccion?.agentes?.numeroasociado
    ? agentesId.filter((item) =>
        propiedadSeleccion.agentes.numeroasociado.includes(item.id)
      )
    : [];
  useEffect(() => {
    const selectedProperty = propiedades.find(
      (item) => item.propiedad_id === parseInt(id)
    );
    if (selectedProperty) {
      setPropiedadSeleccion(selectedProperty);
    }
  }, [propiedades]);

  useEffect(() => {
    if (propiedadSeleccion && propiedadSeleccion.imagenes) {
      const imagenesArray = propiedadSeleccion.imagenes.split(",");

      // Si hay imágenes, seleccionamos la primera como default o según la página
      if (imagenesArray.length > 0) {
        // Usamos 'pagina' como índice, pero nos aseguramos que esté dentro del rango
        const index =
          pagina && pagina >= 1 && pagina <= imagenesArray.length
            ? pagina - 1
            : 0;
        const resultado = `https://cdn.remax.com.mx/properties/${propiedadSeleccion.propiedad_id}/${imagenesArray[index]}`;
        setFotoEscogida(resultado);
      } else {
        
      }
    } else {

    }

    if (countPage !== undefined) {
      setTotalPaginas(countPage);
    }
  }, [propiedadSeleccion, pagina]);

  const [openGallery, setOpenGallery] = useState(true);
  const handleAbrir = () => {
    setOpenGallery(false);
  };
  const handleCerrar = () => {
    setOpenGallery(true);
  };
  const [animation, setAnimation] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setAnimation(true);
      setTimeout(() => {
        setAnimation(false);
      }, 4000);
    }, 3000);
  }, []);
  const colonia = propiedadSeleccion?.colonias.colonia_nombre;
  const estado = propiedadSeleccion?.estados?.estado_nombre;
  const ciudad = propiedadSeleccion?.ciudades.ciudad_nombre;
  const calle = propiedadSeleccion?.calle;
  const direccion = `${calle}, ${colonia}, ${ciudad}, ${estado}`;
  const imagenesArray = propiedadSeleccion?.imagenes.split(",");
  const [cargada, setCargada] = useState(false);
  const tipos = useMemo(
    () => [
      { nombre: "Casa", tipo_id: 1 },
      { nombre: "Casa en Condominio", tipo_id: 2 },
      { nombre: "Departamento", tipo_id: 3 },
      { nombre: "Terreno", tipo_id: 4 },
      { nombre: "Terreno", tipo_id: 10 },
      { nombre: "Terreno", tipo_id: 5 },
      { nombre: "Desarrollo", tipo_id: 6 },
      { nombre: "Nave Industrial", tipo_id: 7 },
      { nombre: "Bodega", tipo_id: 19 },
      { nombre: "Finca/rancho", tipo_id: 14 },
      { nombre: "Edificio", tipo_id: 13 },
    ],
    []
  );

  const operaciones = useMemo(
    () => [
      { nombre: "Venta", operacion_id: "1" },
      { nombre: "Renta", operacion_id: "2" },
    ],
    []
  );

  const tituloPro = useMemo(
    () => [
      { nombre: "Casa en Venta", tipo_id: 1, operacion_id: "1" },
      { nombre: "Casa en Renta", tipo_id: 1, operacion_id: "2" },
      { nombre: "Casa en Condominio en Venta", tipo_id: 2, operacion_id: "1" },
      { nombre: "Casa en Condominio en Renta", tipo_id: 2, operacion_id: "2" },
      { nombre: "Departamento en Venta", tipo_id: 3, operacion_id: "1" },
      { nombre: "Departamento en Renta", tipo_id: 3, operacion_id: "2" },
      { nombre: "Terreno en Venta", tipo_id: 4, operacion_id: "1" },
      { nombre: "Terreno en Renta", tipo_id: 4, operacion_id: "2" },
      { nombre: "Terreno en Venta", tipo_id: 10, operacion_id: "1" },
      { nombre: "Terreno en Renta", tipo_id: 10, operacion_id: "2" },
      { nombre: "Terreno en Venta", tipo_id: 5, operacion_id: "1" },
      { nombre: "Terreno en Renta", tipo_id: 5, operacion_id: "2" },
      { nombre: "Desarrollo en Venta", tipo_id: 6, operacion_id: "1" },
      { nombre: "Desarrollo en Renta", tipo_id: 6, operacion_id: "2" },
      { nombre: "Nave Industrial en Renta", tipo_id: 7, operacion_id: "1" },
      { nombre: "Bodega en Renta", tipo_id: 19, operacion_id: "2" },
      { nombre: "Finca/rancho en Venta", tipo_id: 14, operacion_id: "1" },
      { nombre: "Finca/rancho en Renta", tipo_id: 14, operacion_id: "2" },
      { nombre: "Edificio en Venta", tipo_id: 13, operacion_id: "1" },
      { nombre: "Edificio en Renta", tipo_id: 13, operacion_id: "2" },
    ],
    []
  );

  const imagenAgente = `https://cdn.remax.com.mx/agentes/${propiedadSeleccion?.agentes?.imagen}`;

  const [shareModalOpen, setShareModalOpen] = useState(true);

  const m2Bodega = propiedadSeleccion?.propiedades_meta?.m2_bodega;

  const share = () => {
    /* usa prev state */
    setShareModalOpen((prevState) => !prevState);
  };
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };      const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Los errores ya están establecidos en formErrors
      return;
    }
    
    setFormLoading(true);
    
    try {
      const apiKey = import.meta.env.VITE_PIPEDRIVE_API_KEY;
      
      // Asegurar que existan los campos personalizados
      const customFieldIds = await ensureCustomFields(apiKey);
      
      // 1. Primero creamos la persona
      const personPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone.startsWith("+52") ? formData.phone : "+52" + formData.phone,
        visible_to: 3
      };
      
      const personResponse = await axios.post(
        `https://api.pipedrive.com/v1/persons?api_token=${apiKey}`,
        personPayload
      );
      
      if (!personResponse.data.success) {
        throw new Error('Error al crear el contacto en PipeDrive');
      }
      
      // 2. Luego creamos el deal con los campos personalizados
      const dealPayload = {
        title: `Lead propiedad ${propiedadSeleccion?.propiedad_id}`,
        person_id: personResponse.data.data.id,
        value: propiedadSeleccion?.mxn_corriente || 0,
        currency: "MXN",
        visible_to: 3,
        stage_id: "1",
        status: "open",
        [customFieldIds.PROPIEDAD_ID]: propiedadSeleccion?.propiedad_id,
        [customFieldIds.DIRECCION]: direccion,
        [customFieldIds.TIPO_PROPIEDAD]: propiedadSeleccion?.tipos?.tipo_nombre || "No especificado",
        [customFieldIds.PRECIO]: propiedadSeleccion?.mxn_corriente || 0
      };

      // Crear deal en PipeDrive
      const dealResponse = await axios.post(
        `https://api.pipedrive.com/v1/deals?api_token=${apiKey}`,
        dealPayload
      );
      if (!dealResponse.data.success) {
        throw new Error('Error al crear el lead en PipeDrive');
      }

      // Si todo fue exitoso

      
      // Limpiar el formulario y cerrar el modal
      setFormData({ name: "", email: "", phone: "" });
      setFormErrors({});
      setShowMobileForm(false);
      setShowSuccessMessage(true);

      // Mostrar mensaje de éxito
      toast.success(
        <>
          <p className="font-bold">¡Gracias por tu interés!</p>
          <p>Un asesor experto se pondrá en contacto contigo en breve para brindarte toda la información sobre esta propiedad.</p>
        </>,
        {
          autoClose: 5000,
          position: "top-center",
        }
      );

      // Opcional: Crear una nota en el deal
      await axios.post(
        `https://api.pipedrive.com/v1/notes?api_token=${apiKey}`,
        {
          deal_id: dealResponse.data.data.id,
          content: `Lead generado desde la web\nPropiedad: ${propiedadSeleccion?.propiedad_id}\nUbicación: ${direccion}\nPrecio: ${Number(propiedadSeleccion?.mxn_corriente).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
        }
      );

    } catch (error) {
      console.error("Error al procesar el lead:", error);

      toast.error("Lo sentimos, hubo un problema al enviar tu solicitud. Por favor, intenta nuevamente o contáctanos directamente por WhatsApp.");
    } finally {
      setFormLoading(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>
          {propiedadSeleccion
            ? `${
                tituloPro.find(
                  (item) =>
                    item.tipo_id === propiedadSeleccion?.tipos?.tipo_id &&
                    item.operacion_id === propiedadSeleccion?.operacion
                )?.nombre || "Propiedad"
              } en ${direccion} | RE/MAX CIN`
            : "Cargando propiedad | RE/MAX CIN"}
        </title>
        <meta
          name="description"
          content={
            propiedadSeleccion?.descripcion_corta
              ? `${propiedadSeleccion.descripcion_corta.substring(
                  0,
                  155
                )}... en ${direccion}. ${
                  propiedadSeleccion.m2_construccion
                }m², ${propiedadSeleccion.recamaras} recámaras. Contáctanos.`
              : "Encuentra tu propiedad ideal con RE/MAX CIN Veracruz. Casas, departamentos y terrenos en venta y renta."
          }
        />
        <meta
          property="og:title"
          content={
            propiedadSeleccion
              ? `${
                  tituloPro.find(
                    (item) =>
                      item.tipo_id === propiedadSeleccion?.tipos?.tipo_id &&
                      item.operacion_id === propiedadSeleccion?.operacion
                  )?.nombre || "Propiedad"
                } en ${direccion}`
              : "Propiedad RE/MAX CIN"
          }
        />
        <meta
          property="og:description"
          content={
            propiedadSeleccion?.descripcion_corta ||
            "Encuentra tu propiedad ideal con RE/MAX CIN"
          } />
        <meta
          property="og:image"
          content={
            propiedadSeleccion?.imagenes
              ? `https://cdn.remax.com.mx/properties/${
                  propiedadSeleccion.propiedad_id
                }/${propiedadSeleccion.imagenes.split(",")[0]}`
              : ""
          }
        />
        <meta
          property="og:url"
          content={`https://remaxcin.com/propiedades/seleccion/${propiedadSeleccion?.propiedad_id}`}
        />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href={`https://remaxcin.com/propiedades/seleccion/${propiedadSeleccion?.propiedad_id}`}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            "@id": `https://remaxcin.com/propiedades/seleccion/${propiedadSeleccion?.propiedad_id}`,
            identifier: propiedadSeleccion?.propiedad_id,
            name:
              propiedadSeleccion?.titulo ||
              (propiedadSeleccion
                ? `${
                    tituloPro.find(
                      (item) =>
                        item.tipo_id === propiedadSeleccion?.tipos?.tipo_id &&
                        item.operacion_id === propiedadSeleccion?.operacion
                    )?.nombre || "Propiedad"
                  } en ${direccion}`
                : "Propiedad"),
            description: propiedadSeleccion?.descripcion_corta,
            url: `https://remaxcin.com/propiedades/seleccion/${propiedadSeleccion?.propiedad_id}`,
            datePosted: new Date().toISOString(),
            image: propiedadSeleccion?.imagenes
              ? propiedadSeleccion.imagenes
                  .split(",")
                  .map(
                    (img) =>
                      `https://cdn.remax.com.mx/properties/${propiedadSeleccion.propiedad_id}/${img}`
                  )
              : [],
            numberOfRooms: propiedadSeleccion?.recamaras,
            numberOfBathroomsTotal: propiedadSeleccion?.banos,
            floorSize: {
              "@type": "QuantitativeValue",
              value:
                propiedadSeleccion?.m2_construccion === "0.00"
                  ? propiedadSeleccion?.propiedades_meta?.m2_bodega
                  : propiedadSeleccion?.m2_construccion,
              unitText: "m2",
            },
            address: {
              "@type": "PostalAddress",
              addressLocality: propiedadSeleccion?.ciudades?.ciudad_nombre,
              addressRegion: propiedadSeleccion?.estados?.estado_nombre,
              addressCountry: "MX",
              streetAddress: direccion,
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: propiedadSeleccion?.lat,
              longitude: propiedadSeleccion?.lng,
            },
            offers: {
              "@type": "Offer",
              price: propiedadSeleccion?.precio,
              priceCurrency: "MXN",
              availability: "https://schema.org/InStock",
              validFrom: new Date().toISOString(),
            },
            broker: {
              "@type": "RealEstateAgent",
              name: filtroagente[0]?.nombre || "RE/MAX CIN",
              image: imagenAgente,
              telephone: "+52 229 269 6629",
              email: "remax.cin.veracruz@gmail.com",
              url: "https://remaxcin.com",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://remaxcin.com/propiedades/seleccion/${propiedadSeleccion?.propiedad_id}`,
            },
          })}
        </script>
      </Helmet>

      <div
        className={`${
          shareModalOpen && "invisible"
        } flex flex-col justify-center items-center fixed z-50 w-full h-full bg-white/70`}
      >
        <div className="min-h-screen  flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <img
                  className="max-w-[200px]"
                  src="/logos/New_RMX_Mark_R4_RGB_dark.png"
                  alt=""
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Comparte esta propiedad
              </h1>
              <p className="text-gray-600">
                Comparte este link para acceder a la propiedad.
              </p>
            </div>

            <div className="flex justify-center">
              <ShareButtons setShareModalOpen={setShareModalOpen} />
            </div>
          </div>
        </div>
      </div>
      <div
        className={` ${
          openGallery && "invisible"
        } flex flex-col bg-black/70 mx-auto -mt-5 justify-center items-center  w-full h-full fixed   p-0 z-50 "`}
      >
        <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl flex flex-col justify-center items-center shadow-[0px_4px_5px_0px] shadow-black/40 relative p-4 md:p-6 lg:p-8">
          {/* Botón de cierre */}
          <div className="w-full flex justify-end absolute top-4 right-4 z-10">
            <X
              onClick={handleCerrar}
              size={32}
              className="cursor-pointer hover:text-blueRemax active:text-blueRemax"
            />
          </div>

          {/* Imagen */}
          <img
            loading="lazy"
            className="w-11/12 max-w-4xl h-auto max-h-[65vh] object-cover rounded-md mt-12"
            src={fotoEscogida}
            alt="Vista seleccionada"
          />

          {/* Paginación */}
          <div className="py-6">
            <Paginacion setPagina={setPagina} totalPaginas={totalPaginas} />
          </div>
        </div>
      </div>
      <HeaderPropiedadSeleccion />
      <Breadcrumbs propiedades={propiedades} />
      <div
        onClick={() => setShowMobileForm(true)}
        className={`transition-all duration-[900ms] lg:invisible ease-in-out bottom-4 right-4 rounded-full fixed z-40 w-[217px] h-[50px] flex items-center justify-center cursor-pointer ${
          valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
        } ${
          animation ? "translate-x-0 opacity-100 " : " opacity-0 translate-x-0 "
        }`}
      >
        <p className="text-white font-lato italic font-bold w-full px-4 text-[16px]">
          Contacta a un agente
        </p>
      </div>
      <div 
        onClick={() => setShowMobileForm(true)} 
        className={`bottom-4 right-4 lg:invisible rounded-full fixed z-50 w-[50px] h-[50px] flex items-center justify-center cursor-pointer ${
          valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
        }`}
      >
        <img
          loading="lazy"
          className="w-8"
          src="/HomePageContent/brand-whatsapp 1.svg"
          alt=""
        />
      </div>
      <div className="flex flex-col  px-2 justify-center items-start">
        <div className="grid grid-cols-2 gap-2 w-full ">
          <div>
            {imagenesArray ? (
              <img
                onClick={handleAbrir}
                id="1"
                className="rounded-2xl w-full object-cover h-[300px] lg:h-[569px] cursor-pointer"
                src={`https://cdn.remax.com.mx/properties/${propiedadSeleccion?.propiedad_id}/${imagenesArray[0]}`}
                alt=""
              />
            ) : (
              <div className="rounded-2xl w-full h-[300px] lg:h-[569px] bg-gray-300 animate-pulse"></div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="">
              {imagenesArray ? (
                <img
                  onClick={handleAbrir}
                  id="2"
                  className="rounded-2xl h-[142px] lg:h-[277px] w-full object-cover cursor-pointer"
                  src={`https://cdn.remax.com.mx/properties/${propiedadSeleccion?.propiedad_id}/${imagenesArray[1]}`}
                  alt=""
                />
              ) : (
                <div className="rounded-2xl h-[142px] lg:h-[277px] w-full bg-gray-300 animate-pulse"></div>
              )}
            </div>
            <div className="">
              {imagenesArray ? (
                <img
                  onClick={handleAbrir}
                  id="3"
                  className="rounded-2xl h-[142px] lg:h-[277px]  w-full object-cover cursor-pointer"
                  src={`https://cdn.remax.com.mx/properties/${propiedadSeleccion?.propiedad_id}/${imagenesArray[2]}`}
                  alt=""
                />
              ) : (
                <div className="rounded-2xl h-[142px] lg:h-[277px] w-full bg-gray-300 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col lg:grid lg:grid-cols-2 text-[#7b7b7b]">
          <div>
            <div className="px-5 pt-5 items-center justify-start">
              <div className="flex  justify-start items-center text-start ">
                {tituloPro && propiedadSeleccion ? (
                  tituloPro.map((item) => (
                    <p key={`${item.tipo_id}-${item.operacion_id}`} className="lg:text-3xl">
                      {item.tipo_id === propiedadSeleccion?.tipos?.tipo_id &&
                      item.operacion_id === propiedadSeleccion?.operacion
                        ? item.nombre
                        : ""}
                    </p>
                  ))
                ) : (
                  <div className="h-[32px] w-[200px] bg-gray-300 rounded-md animate-pulse mb-2"></div>
                )}
                <div className="px-4 pt-1 lg:px-10 lg:pt-2">
                  <Share2
                    className={"cursor-pointer  w-4 lg:w-10  text-4xl"}
                    onClick={share}
                  />
                </div>
              </div>
              {propiedadSeleccion && tipos ? (
                <>
                  {tipos.map(
                    (item) =>
                      item.tipo_id === propiedadSeleccion?.tipos?.tipo_id && (
                        <p key={item.tipo_id} className="lg:text-3xl font-bold">
                          {`${item.nombre} desde: ${Number(
                            propiedadSeleccion.mxn_corriente
                          ).toLocaleString("en-US")} MXN`}
                        </p>
                      )
                  )}
                  <div className="flex lg:gap-2 lg:mt-2 items-center">
                    <img
                      className="lg:w-10"
                      loading="lazy"
                      src="/HomePageContent/iconmeters.svg"
                      alt="Icono de metros cuadrados"
                    />
                    <p className="lg:text-3xl">
                      {propiedadSeleccion.m2_construccion === "0.00"
                        ? m2Bodega
                        : propiedadSeleccion.m2_construccion}
                      m²
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-[32px] w-[280px] bg-gray-300 rounded-md animate-pulse mb-2"></div>
                  <div className="flex lg:gap-2 lg:mt-2 items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="h-[28px] w-[80px] bg-gray-300 rounded-md animate-pulse ml-2"></div>
                  </div>
                </>
              )}
            </div>

            <hr className="w-full my-2 text-[#7B7B7B]" />
            {/* Contacta a un agente móvil */}
            <div className="w-[341px] lg:hidden p-3 text-center flex flex-col justify-between items-center shadow-[0px_4px_5px_0px] shadow-black/40 rounded-[10px] mx-auto my-5 bg-[#F9F9F9]">
              <div>
                <p className="font-bold text-[18px]">Contacta al Agente</p>
              </div>
              <div className="flex gap-15 items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-[16px]">
                    {filtroagente[0]?.nombre}
                  </p>
                  <p className="font-medium text-[16px]">
                    Solicita información:
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <a
                      href={`https://wa.me/5212292696629?text=Hola, estoy interesado en la propiedad ${propiedadSeleccion?.propiedad_id} ubicada en ${direccion}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaWhatsapp
                        style={{
                          width: "25px",
                          height: "40px",
                          color: "#25D366",
                        }}
                        className="hover:scale-110 transition-transform"
                      />
                    </a>
                    <a href="mailto:adm.remaxrna@gmail.com">
                      <img
                        loading="lazy"
                        className="w-auto h-full hover:scale-110 transition-transform"
                        src="/HomePageContent/correo.svg"
                        alt="Correo"
                      />
                    </a>
                    <a href="tel:+5219933000810">
                      <img
                        loading="lazy"
                        className="w-auto h-full hover:scale-110 transition-transform"
                        src="/HomePageContent/phone.svg"
                        alt="Teléfono"
                      />
                    </a>
                  </div>
                </div>
                <div>
                  {imagenAgente && !cargada ? (
                    <div className="w-[99px] h-[104px] lg:w-[152px] lg:h-[152px] rounded-[15px] bg-gray-300 animate-pulse" />
                  ) : null}

                  <img
                    loading="lazy"
                    className={`w-[99px] h-[104px] lg:w-[152px] lg:h-[152px] object-cover rounded-[15px] transition-opacity duration-300 ${
                      cargada ? "opacity-100" : "opacity-0 absolute"
                    }`}
                    src={imagenAgente}
                    alt="Foto del agente"
                    onLoad={() => setCargada(true)}
                  />
                </div>
              </div>
              
              {/* Formulario de contacto móvil */}
              {!showMobileForm ? (
                <button 
                  onClick={() => setShowMobileForm(true)}
                  className={`h-[40px] rounded text-white w-full mt-2 ${
                    valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
                  }`}
                >
                  Contactar ahora
                </button>
              ) : (
                <div className="relative w-full">
                  {showSuccessMessage && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
                      <div className={`bg-white p-6 rounded-lg shadow-lg text-center transform transition-all duration-300 ${
                        showSuccessMessage ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                      }`}>
                        <div className="mb-4 text-green-500">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">¡Gracias por tu interés!</h3>
                        <p className="text-gray-600">
                          Un asesor experto se pondrá en contacto contigo en breve.
                        </p>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className={`w-full transition-opacity duration-300 ${showSuccessMessage ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="flex flex-col w-full text-lg text-start gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          id="name-mobile"
                          name="name"
                          placeholder=" "
                          className={`peer w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors bg-white ${
                            formErrors.name ? 'border-red-500' : 'border-gray-300 focus:border-blueRemax'
                          }`}
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                        <label
                          htmlFor="name-mobile"
                          className={`absolute left-4 top-3 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:bg-white peer-focus:px-2
                          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2
                          ${formErrors.name ? 'text-red-500' : 'text-gray-500'}`}
                        >
                          Nombre completo
                        </label>
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="tel"
                          id="phone-mobile"
                          name="phone"
                          placeholder=" "
                          className={`peer w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors bg-white ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300 focus:border-blueRemax'
                          }`}
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                        <label
                          htmlFor="phone-mobile"
                          className={`absolute left-4 top-3 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:bg-white peer-focus:px-2
                          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2
                          ${formErrors.phone ? 'text-red-500' : 'text-gray-500'}`}
                        >
                          Teléfono
                        </label>
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="email"
                          id="email-mobile"
                          name="email"
                          placeholder=" "
                          className={`peer w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors bg-white ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-blueRemax'
                          }`}
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                        <label
                          htmlFor="email-mobile"
                          className={`absolute left-4 top-3 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:bg-white peer-focus:px-2
                          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2
                          ${formErrors.email ? 'text-red-500' : 'text-gray-500'}`}
                        >
                          Correo electrónico
                        </label>
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mt-2">
                        Uno de nuestros asesores expertos se pondrá en contacto contigo a la brevedad para brindarte toda la información sobre esta propiedad.
                      </p>

                      <div className="flex gap-3 mt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowMobileForm(false)}
                          className="bg-gray-100 hover:bg-gray-200 h-12 rounded-lg text-gray-700 flex-1 transition-colors font-medium"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          className={`h-12 rounded-lg text-white flex-1 transition-all transform active:scale-[0.98] font-medium ${
                            valor === "comercial" ? "bg-redRemax hover:bg-red-600" : "bg-blueRemax hover:bg-blue-600"
                          } ${formLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                          disabled={formLoading}
                        >
                          {formLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                              <span>Enviando...</span>
                            </div>
                          ) : "Enviar"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
            {tipos && operaciones && propiedadSeleccion ? (
              tipos.map((tipo) =>
                operaciones.map((operacion) =>
                  propiedadSeleccion?.tipos?.tipo_id === tipo?.tipo_id &&
                  propiedadSeleccion?.operacion === operacion?.operacion_id ? (
                    <p
                      key={`${tipo.tipo_id}-${operacion.operacion_id}`}
                      className="px-5 text-[18px] lg:text-3xl font-bold my-3"
                    >
                      {tipo?.nombre} en {operacion?.nombre} en {direccion}
                    </p>
                  ) : null
                )
              )
            ) : (
              <div className=" mx-5 my-3 h-[32px] lg:h-[40px] w-[240px] lg:w-[400px] bg-gray-300 rounded-md animate-pulse"></div>
            )}
            <hr />
            {/* Calculadora de hipotecas móvil */}
            {/* <div className="w-full flex justify-center">
              <button className={`mt-3 lg:hidden mx-auto w-[341px] text-[18px] font-bold h-[48px] text-white rounded-[10px] ${
                valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
              }`}>
                Calculadora de hipotecas
              </button>
            </div> */}
            <div className="px-5 mt-5">
              <Dropdown propiedadSeleccion={propiedadSeleccion} />
            </div>
          </div>
          {/* Contacta a un agente desktop */}
          <div className=" overflow-visible hidden lg:block   relative">
            <div className="sticky top-2 pb-1 ">
              <div className="w-[551px] h-[237px] p-3 text-center flex flex-col justify-evenly items-center shadow-[0px_4px_5px_0px] shadow-black/40 rounded-[10px] mx-auto my-5 bg-[#F9F9F9]">
                <div>
                  <p className="font-bold text-[18px] lg:text-3xl">
                    Contacta al Agente
                  </p>
                </div>
                <div className="flex gap-15  items-center justify-between">
                  <div>
                    <p className="font-medium  text-[16px] lg:text-2xl">
                      {filtroagente[0]?.nombre}
                    </p>
                    <p className="font-medium text-[16px] lg:text-xl">
                      Solicita información:
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <a
                        href={`https://wa.me/5212292696629?text=Hola, estoy interesado en la propiedad ${propiedadSeleccion?.propiedad_id} ubicada en ${direccion}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaWhatsapp
                          style={{
                            width: "40px",
                            height: "40px",
                            color: "#25D366",
                          }}
                          className="hover:scale-110 transition-transform"
                        />
                      </a>
                      <a href="mailto:remax.cin.veracruz@gmail.com">
                        <img
                          loading="lazy"
                          className="w-11 h-full hover:scale-110 transition-transform"
                          src="/HomePageContent/correo.svg"
                          alt="Correo"
                        />
                      </a>
                      <a href="tel:+5212292696629">
                        <img
                          loading="lazy"
                          className="w-8 h-full hover:scale-110 transition-transform"
                          src="/HomePageContent/phone.svg"
                          alt="Teléfono"
                        />
                      </a>
                    </div>
                  </div>
                  <div>
                    {imagenAgente && !cargada ? (
                      <div className="w-[99px] h-[104px] lg:w-[152px] lg:h-[152px] rounded-[15px] bg-gray-300 animate-pulse" />
                    ) : null}

                    <img
                      loading="lazy"
                      className={`w-[99px] h-[104px] lg:w-[152px] lg:h-[152px] object-cover rounded-[15px] transition-opacity duration-300 ${
                        cargada ? "opacity-100" : "opacity-0 absolute"
                      }`}
                      src={imagenAgente}
                      alt="Foto del agente"
                      onLoad={() => setCargada(true)}
                    />
                  </div>
                </div>
              </div>
              <div className="w-[551px] gap-10 p-3 text-center flex flex-col justify-evenly items-center shadow-[0px_4px_5px_0px] shadow-black/40 rounded-[10px] mx-auto my-5 bg-[#F9F9F9]">
                <div className="text-start items-start w-full px-6">
                  <p className="font-bold text-[18px] lg:text-3xl pt-4">
                    Contáctanos
                  </p>
                </div>
                <div className="flex relative w-full">
                  {showSuccessMessage && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
                      <div className={`bg-white p-6 rounded-lg shadow-lg text-center transform transition-all duration-300 ${
                        showSuccessMessage ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                      }`}>
                        <div className="mb-4 text-green-500">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">¡Gracias por tu interés!</h3>
                        <p className="text-gray-600">
                          Un asesor experto se pondrá en contacto contigo en breve.
                        </p>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className={`w-full flex flex-col transition-opacity duration-300 ${showSuccessMessage ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="flex flex-col w-full text-lg text-start gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          id="name-desktop"
                          name="name"
                          placeholder=" "
                          className={`peer w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors bg-white ${
                            formErrors.name ? 'border-red-500' : 'border-gray-300 focus:border-blueRemax'
                          }`}
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                        <label
                          htmlFor="name-desktop"
                          className={`absolute left-4 top-3 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:bg-white peer-focus:px-2
                          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2
                          ${formErrors.name ? 'text-red-500' : 'text-gray-500'}`}
                        >
                          Nombre completo
                        </label>
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="tel"
                          id="phone-desktop"
                          name="phone"
                          placeholder=" "
                          className={`peer w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors bg-white ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300 focus:border-blueRemax'
                          }`}
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                        <label
                          htmlFor="phone-desktop"
                          className={`absolute left-4 top-3 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:bg-white peer-focus:px-2
                          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2
                          ${formErrors.phone ? 'text-red-500' : 'text-gray-500'}`}
                        >
                          Teléfono
                        </label>
                        {formErrors.phone && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="email"
                          id="email-desktop"
                          name="email"
                          placeholder=" "
                          className={`peer w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors bg-white ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-blueRemax'
                          }`}
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                        <label
                          htmlFor="email-desktop"
                          className={`absolute left-4 top-3 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:bg-white peer-focus:px-2
                          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2
                          ${formErrors.email ? 'text-red-500' : 'text-gray-500'}`}
                        >
                          Correo electrónico
                        </label>
                        {formErrors.email && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mt-2">
                        Uno de nuestros asesores expertos se pondrá en contacto contigo a la brevedad para brindarte toda la información sobre esta propiedad.
                      </p>

                      <div className="flex flex-col py-4 justify-center gap-5">
                        <button 
                          type="submit" 
                          className={`h-[50px] rounded-lg text-white text-xl transition-all transform active:scale-[0.98] font-medium ${
                            valor === "comercial" ? "bg-redRemax hover:bg-red-600" : "bg-blueRemax hover:bg-blue-600"
                          } ${formLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                          disabled={formLoading}
                        >
                          {formLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                              <span>Enviando...</span>
                            </div>
                          ) : "Enviar consulta"}
                        </button>
                        {/* <button 
                          type="button" 
                          className={`h-[50px] text-white text-2xl rounded ${
                            valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
                          }`}
                        >
                          Calculadora de Hipotecas
                        </button> */}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionFooter />
    </>
  );
}
