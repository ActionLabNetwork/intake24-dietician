import type { IRecallExtended } from "src/types/recall";
import { z } from "zod";

export const RecallDtoSchema = z.object({
    id: z.number(),
    // TODO check this
    recall: z.any().transform(val => val as IRecallExtended)
})

export type RecallDto = z.infer<typeof RecallDtoSchema>