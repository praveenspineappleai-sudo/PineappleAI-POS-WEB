import { normalizeCategoryAttributeDefinitions } from './categoryAttributeUtils';

describe('normalizeCategoryAttributeDefinitions', () => {
  it('maps backend category attributes into UI-friendly custom attribute entries', () => {
    const attributes = [
      { id: 7, attribute_name: 'Fabric', attribute_type: 'text' },
      { id: 8, attribute_name: 'Material Type', attribute_type: 'select' },
    ];

    expect(normalizeCategoryAttributeDefinitions(attributes)).toEqual([
      { id: 7, labelName: 'Fabric', fieldName: 'fabric', type: 'text', isCustom: true },
      { id: 8, labelName: 'Material Type', fieldName: 'material_type', type: 'select', isCustom: true },
    ]);
  });
});
