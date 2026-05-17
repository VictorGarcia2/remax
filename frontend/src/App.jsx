import { Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollTop";
import LoadingSpinner from "./components/LoadingSpinner";
import { ValuadorProvider } from "./context/ValuadorContext";
import ValuadorQuiz from "./components/ValuadorQuiz/ValuadorQuiz";
import ResidencialSkeleton from "./components/ResidencialSkeleton";

// Importaciones lazy para code splitting
const Residencial = lazy(() => import("./pages/Residencial"));
const ResultadosBusqueda = lazy(() =>
  import("./pages/Buscador/ResultadosBusqueda")
);
const PropiedadSeleccion = lazy(() =>
  import("./pages/PropiedadSeleccion/PropiedadSeleccion")
);
const Eleccion = lazy(() => import("./pages/Eleccion"));
const NuestroEquipo = lazy(() => import("./pages/NuestroEquipo"));
const Poliza = lazy(() => import("./pages/Poliza"));
const Valuador = lazy(() => import("./pages/Valuador"));
const Reclutamiento = lazy(() => import("./pages/Reclutamiento"));
const TerminosyCondiciones = lazy(() =>
  import("./components/TerminosyCondiciones")
);
const CodigodeEtica = lazy(() => import("./components/CodigodeEtica"));
const PoliticadePrivacidad = lazy(() =>
  import("./components/PoliticadePrivacidad")
);
const DesarrolloTrebolII = lazy(() =>
  import("./pages/DesarrolloTrebolII")
);
const DesarrolloPalma = lazy(() =>
  import("./pages/DesarrolloPalma")
);

const App = () => {
  return (
    <>
      <Helmet>
        <title>
          REMAX CIN Veracruz - Propiedades Residenciales, Comerciales e
          Industriales
        </title>
        <meta
          name="description"
          content="REMAX CIN Veracruz - Expertos en propiedades residenciales, comerciales e industriales. Encuentra tu espacio ideal con amplio catálogo de bienes raíces en venta y renta."
        />
        <meta property="og:site_name" content="RE/MAX CIN Veracruz" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_MX" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
      </Helmet>
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Eleccion />
              </Suspense>
            }
          />
          <Route
            path="/inicio"
            element={
              <Suspense fallback={<ResidencialSkeleton />}>
                <Residencial />
              </Suspense>
            }
          />
          <Route
            path="/propiedades"
            element={<ResultadosBusqueda />}
          />
          <Route
            path="/propiedades/seleccion/:id"
            element={<PropiedadSeleccion />}
          />
          <Route
            path="/NuestroEquipo"
            element={<NuestroEquipo />}
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
          <Route
            path="/desarrollo-palma"
            element={<DesarrolloPalma />}
          />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
