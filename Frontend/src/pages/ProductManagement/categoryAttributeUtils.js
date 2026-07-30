export const normalizeCategoryAttributeDefinitions = (attributes = []) => {
  if (!Array.isArray(attributes)) return [];

  return attributes
    .filter((attr) => attr && (attr.attribute_name || attr.labelName))
    .map((attr) => {
      const labelName = attr.labelName || attr.attribute_name || '';
      const fieldName = (labelName || '')
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      return {
        id: attr.id,
        labelName,
        fieldName,
        type: attr.type || attr.attribute_type || 'text',
        isCustom: true,
      };
    });
};
