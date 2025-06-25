import { useEffect, useState, Suspense, lazy } from "react";
import axios from "axios";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollTop";
import LoadingSpinner from "./components/LoadingSpinner";
import { SearchProvider } from "./context/SearchContext";
import { ValuadorProvider } from "./context/ValuadorContext";
import ValuadorQuiz from "./components/ValuadorQuiz/ValuadorQuiz";
import ResidencialSkeleton from "./components/ResidencialSkeleton";
import Breadcrumbs from "./components/Breadcrumbs";
import DesarrolloTrebolII from "./pages/DesarrolloTrebolII";

// Importaciones lazy para code splitting
const Residencial = lazy(() => import("./pages/Residencial"));
const ResultadosBusqueda = lazy(() =>
  import(
    /* webpackChunkName: "resultados-busqueda" */ "./pages/Buscador/ResultadosBusqueda"
  )
);
const PropiedadSeleccion = lazy(() =>
  import(
    /* webpackChunkName: "propiedad-seleccion" */ "./pages/PropiedadSeleccion/PropiedadSeleccion"
  )
);
const Eleccion = lazy(() =>
  import(/* webpackChunkName: "eleccion" */ "./pages/Eleccion")
);
const NuestroEquipo = lazy(() =>
  import(/* webpackChunkName: "nuestro-equipo" */ "./pages/NuestroEquipo")
);
const Poliza = lazy(() =>
  import(/* webpackChunkName: "poliza" */ "./pages/Poliza")
);
const Valuador = lazy(() =>
  import(/* webpackChunkName: "valuador" */ "./pages/Valuador")
);
const Reclutamiento = lazy(() =>
  import(/* webpackChunkName: "reclutamiento" */ "./pages/Reclutamiento")
);
const TerminosyCondiciones = lazy(() =>
  import(/* webpackChunkName: "terminos" */ "./components/TerminosyCondiciones")
);
const CodigodeEtica = lazy(() =>
  import(/* webpackChunkName: "codigo-etica" */ "./components/CodigodeEtica")
);
const PoliticadePrivacidad = lazy(() =>
  import(
    /* webpackChunkName: "privacidad" */ "./components/PoliticadePrivacidad"
  )
);

const App = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [menuClose, setMenuClose] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [manejoBusqueda, setManejoBusqueda] = useState(false);
  const [propiedadesVisibles, setPropiedadesVisibles] = useState([]);
  const [autoCompleteHome, setAutoCompleteHome] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  // Los estados selectedOptionsTipos, busquedaHome y selectedOptionsOperacion ahora son manejados por el contexto
  const [nuevas, setNuevas] = useState([]);
  const [precioMinimo, setPrecioMinimo] = useState(0);
  const [precioMaximo, setPrecioMaximo] = useState(Infinity);
  const [aplicarFiltros, setAplicarFiltros] = useState(Date.now());
  const [seleccion, setSeleccion] = useState();
  const [valor, setValor] = useState("residencial");

  /*  useEffect(() => {
    fetch("https://us-central1-remax-api.cloudfunctions.net/api/propiedades", {
      method: "GET",
      headers: {
        "Authorization": "Bearer Hvh8n23m53.n7hiu32S09gh6tUj.JJpyfq.HioJ19J3RGgHJSIOop4t4t",
        "Content-Type": "application/json",
      },
    })
      .then(response => response.json())
      .then(data => {
        setPropiedades(data.data.rows); // O ajusta según estructura de tu API
      })
      .catch(error => console.error("Error:", error));
  }, [busquedaHome]); */

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          "https://remaxcin.com/api/propiedades"
        );
        const data = response.data.data.rows;
        setPropiedades(data);
      } catch (error) {
        console.error("Algo salió mal al consumir la API", error);
      }
    };
    getData();
  }, []);

  /*   useEffect(() => {
    const data = propierties.data.rows; // o como venga en tu JSON
    setPropiedades(data);
  }, [busquedaHome]); */

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>REMAX CIN - Bienes Raíces y Propiedades</title>
          <meta
            name="description"
            content="REMAX CIN Veracruz - Expertos en propiedades residenciales, comerciales e industriales. Encuentra tu espacio ideal con amplio catálogo de bienes raíces en venta y renta."
          />
          <title>
            REMAX CIN Veracruz - Propiedades Residenciales, Comerciales e
            Industriales
          </title>
          <link rel="canonical" href="https://www.remax.com.mx" />
        </Helmet>
        <ScrollToTop />
        <SearchProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Eleccion setValor={setValor} />
                </Suspense>
              } />
              <Route
                path="/inicio"
                element={
                  <Suspense fallback={<ResidencialSkeleton />}>
                    <Residencial
                      propiedades={propiedades}
                      valor={valor}
                      setSelectedOptions={setSelectedOptions}
                      selectedOptions={selectedOptions}
                      autoCompleteHome={autoCompleteHome}
                      setAutoCompleteHome={setAutoCompleteHome}
                      setBusqueda={setBusqueda}
                    />
                  </Suspense>
                }
              />
              <Route
                path="/propiedades"
                element={
                  <ResultadosBusqueda
                    valor={valor}
                    aplicarFiltros={aplicarFiltros}
                    setAplicarFiltros={setAplicarFiltros}
                    precioMaximo={precioMaximo}
                    setPrecioMaximo={setPrecioMaximo}
                    precioMinimo={precioMinimo}
                    setPrecioMinimo={setPrecioMinimo}
                    setSelectedOptions={setSelectedOptions}
                    selectedOptions={selectedOptions}
                    menuClose={menuClose}
                    setMenuClose={setMenuClose}
                    propiedades={propiedades}
                    setPropiedades={setPropiedades}
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    manejoBusqueda={manejoBusqueda}
                    setManejoBusqueda={setManejoBusqueda}
                    propiedadesVisibles={propiedadesVisibles}
                    setPropiedadesVisibles={setPropiedadesVisibles}
                    setAutoCompleteHome={setAutoCompleteHome}
                    nuevas={nuevas}
                    setNuevas={setNuevas}
                    seleccion={seleccion}
                    setSeleccion={setSeleccion}
                  />
                }
              />
              <Route
                path="/propiedades/seleccion/:id"
                element={
                  <PropiedadSeleccion
                    seleccion={seleccion}
                    propiedades={propiedades}
                    setPropiedades={setPropiedades}
                  />
                }
              />
              <Route
                path="/NuestroEquipo"
                element={<NuestroEquipo propiedades={propiedades} />}
              />
              <Route path="/Polizas-de-renta" element={<Poliza />} />
              <Route path="/reclutamiento" element={<Reclutamiento />} />
              <Route
                path="/terminos-y-condiciones"
                element={<TerminosyCondiciones />}
              />
              <Route path="/codigo-de-etica" element={<CodigodeEtica />} />
              <Route
                path="/politica-de-privacidad"
                element={<PoliticadePrivacidad />}
              />
              <Route
                path="/valuador"
                element={
                  <ValuadorProvider>
                    <Valuador />
                  </ValuadorProvider>
                }
              />
              <Route
                path="/ValuadorQuiz"
                element={
                  <ValuadorProvider>
                    <ValuadorQuiz />
                  </ValuadorProvider>
                }
              />
              <Route
                path="/desarrollo-trebol-ii"
                element={<DesarrolloTrebolII />}
              />
            </Routes>
          </Suspense>
        </SearchProvider>
      </HelmetProvider>
    </>
  );
};

export default App;