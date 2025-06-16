import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const breadcrumbNameMap = {
  '/inicio': 'Inicio',
  '/propiedades': 'Propiedades',
  '/NuestroEquipo': 'Nuestro Equipo',
  '/Polizas-de-renta': 'Pólizas de Renta',
  '/reclutamiento': 'Reclutamiento',
  '/terminos-y-condiciones': 'Términos y Condiciones',
  '/codigo-de-etica': 'Código de Ética',
  '/politica-de-privacidad': 'Política de Privacidad',
  '/valuador': 'Valuador',
  '/ValuadorQuiz': 'Quiz Valuador',
  '/seleccion': 'Selección'
};

const Breadcrumbs = ({ propiedades }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // No mostrar breadcrumbs en la página de elección inicial
  if (location.pathname === '/' || location.pathname === '/inicio') {
    return null;
  }

  const getBreadcrumbName = (path, fullPath) => {
    if (path === 'seleccion' && pathnames.length > 1) {
      const propiedadId = pathnames[pathnames.indexOf('seleccion') + 1];
      if (propiedades && propiedadId) {
        const propiedad = propiedades.find(p => p.propiedad_id === propiedadId);
        return propiedad ? propiedad.calle : 'Detalle';
      }
    }
    return breadcrumbNameMap[fullPath] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav aria-label="breadcrumb" className="w-full px-4 sm:px-6 lg:px-8 text-sm font-medium pb-5 ">
      <ol className="list-none p-0 inline-flex items-center space-x-2 text-gray-500">
        <li>
          <Link to="/inicio" className="hover:text-gray-700">Inicio</Link>
        </li>        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const name = getBreadcrumbName(value, to);

          return (
            <li key={to} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast || value === 'seleccion' ? (
                <span className="text-gray-800">{name}</span>
              ) : (
                <Link to={to} className="hover:text-gray-700">{name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
