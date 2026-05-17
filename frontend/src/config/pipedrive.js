// Configuración centralizada de Pipedrive
// NOTA: Idealmente estas llamadas deberían hacerse desde el backend.
// Esta es una mejora intermedia para centralizar las keys.

export const PIPEDRIVE_API_KEY = import.meta.env.VITE_PIPEDRIVE_API_KEY;
export const PIPEDRIVE_API_URL = import.meta.env.VITE_PIPEDRIVE_API_URL || "https://api.pipedrive.com/v1";

// Lista de posibles propietarios para asignación de leads
export const OWNER_MATCHES = [
  { type: 'name', value: 'veronica' },
  { type: 'name', value: 'verónica' },
  { type: 'email', value: 'adm.remaxrna@gmail.com' },
  { type: 'email', value: 'remaxcincoleccion@gmail.com' }
];

/**
 * Busca el propietario adecuado para asignar un lead en Pipedrive
 */
export const findOwnerInPipedrive = async (apiKey = PIPEDRIVE_API_KEY) => {
  try {
    const usersResponse = await fetch(
      `${PIPEDRIVE_API_URL}/users?api_token=${apiKey}`
    );
    if (!usersResponse.ok) {
      throw new Error('Error al obtener usuarios de Pipedrive');
    }
    const usersData = await usersResponse.json();
    
    let owner = null;
    for (const match of OWNER_MATCHES) {
      owner = usersData.data.find(user => {
        if (match.type === 'email') {
          return user.email?.toLowerCase() === match.value.toLowerCase();
        } else {
          return user.name?.toLowerCase().includes(match.value.toLowerCase());
        }
      });
      if (owner) break;
    }
    
    if (!owner) {
      owner = usersData.data.find(user =>
        user.active_flag && (user.role_id === 1 || user.is_admin)
      );
    }
    if (!owner) {
      owner = usersData.data.find(user => user.active_flag);
    }
    if (!owner && usersData.data.length > 0) {
      owner = usersData.data[0];
    }
    
    return owner;
  } catch (error) {
    console.error('Error al buscar propietario:', error);
    throw new Error('Error al buscar propietario en Pipedrive: ' + error.message);
  }
};

/**
 * Asegura que existan los campos personalizados en Pipedrive
 */
export const ensureCustomFields = async (customFieldsConfig) => {
  try {
    const fieldsResponse = await fetch(
      `${PIPEDRIVE_API_URL}/dealFields?api_token=${PIPEDRIVE_API_KEY}`
    );
    if (!fieldsResponse.ok) {
      throw new Error('Error al obtener campos de Pipedrive');
    }
    const existingFields = await fieldsResponse.json();
    const customFieldIds = {};
    
    for (const [key, field] of Object.entries(customFieldsConfig)) {
      const existingField = existingFields.data?.find(f => f.name === field.name);
      if (existingField) {
        customFieldIds[key] = existingField.key;
      } else {
        const payload = {
          name: field.name,
          field_type: field.field_type
        };
        if (field.field_type === "enum" && field.options) {
          payload.options = field.options.map(opt => ({ label: opt }));
        }
        const createResponse = await fetch(
          `${PIPEDRIVE_API_URL}/dealFields?api_token=${PIPEDRIVE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );
        if (!createResponse.ok) {
          throw new Error(`Error al crear campo ${field.name}`);
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
    console.error("Error al verificar/crear campos personalizados:", error);
    throw error;
  }
};

/**
 * Crea una persona en Pipedrive
 */
export const createPerson = async (personData) => {
  const response = await fetch(
    `${PIPEDRIVE_API_URL}/persons?api_token=${PIPEDRIVE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personData)
    }
  );
  if (!response.ok) {
    throw new Error('Error al crear el contacto en Pipedrive');
  }
  return response.json();
};

/**
 * Crea un deal en Pipedrive
 */
export const createDeal = async (dealData) => {
  const response = await fetch(
    `${PIPEDRIVE_API_URL}/deals?api_token=${PIPEDRIVE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData)
    }
  );
  if (!response.ok) {
    throw new Error('Error al crear la oportunidad en Pipedrive');
  }
  return response.json();
};

/**
 * Crea una nota asociada a un deal en Pipedrive
 */
export const createNote = async (noteData) => {
  const response = await fetch(
    `${PIPEDRIVE_API_URL}/notes?api_token=${PIPEDRIVE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData)
    }
  );
  if (!response.ok) {
    console.warn("No se pudo crear la nota, pero el lead fue registrado exitosamente");
  }
  return response.json();
};
