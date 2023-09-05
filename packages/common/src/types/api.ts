export interface JSONResponse {
  data: Resource | Resource[] | null;
  errors: Error[] | null;

}

export interface Resource {
  id?: string;
  type: ResourceType;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
  links?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export type ResourceType = (typeof resourceTypes)[number];
const resourceTypes = ['user'] as const;
