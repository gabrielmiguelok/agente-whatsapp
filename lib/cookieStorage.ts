// lib/cookieStorage.ts
// Utilidad para manejar persistencia de datos en cookies

export function setCookie(name: string, value: string, days: number = 365) {
  if (typeof window === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }

  return null;
}

export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Funciones específicas para manejar datos de tabla
export function saveTableData(datasetName: string, data: any[]) {
  try {
    const jsonData = JSON.stringify(data);
    setCookie(`table_${datasetName}`, jsonData, 365);
  } catch (error) {
    console.error('Error al guardar datos en cookie:', error);
  }
}

export function loadTableData<T = any>(datasetName: string, defaultData: T[]): T[] {
  try {
    const saved = getCookie(`table_${datasetName}`);
    if (saved) {
      return JSON.parse(saved) as T[];
    }
  } catch (error) {
    console.error('Error al cargar datos desde cookie:', error);
  }
  return defaultData;
}

export function clearTableData(datasetName: string) {
  deleteCookie(`table_${datasetName}`);
}
