export const getUnitByCategory = (category = '') => {
  const normalized = category.trim().toLowerCase();
  if (normalized === 'equipment' || normalized === 'machinery' || normalized === 'tools') {
    return 'Units';
  }
  return 'Kg';
};