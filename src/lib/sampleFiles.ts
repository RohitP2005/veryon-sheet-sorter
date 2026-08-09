/** Maps each built-in template id to its downloadable sample customer workbook in /public/samples. */
export const SAMPLE_FILES: Record<string, string> = {
  customer_import: "/samples/customer_import_sample.xlsx",
  inventory: "/samples/inventory_sample.xlsx",
  employee: "/samples/employee_sample.xlsx",
  supplier: "/samples/supplier_sample.xlsx",
  aircraft_parts: "/samples/aircraft_parts_sample.xlsx",
};

export function getSampleFileUrl(templateId: string): string | undefined {
  return SAMPLE_FILES[templateId];
}
