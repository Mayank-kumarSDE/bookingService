import * as z from "zod";
const pingSchema = z.object({
    
  name: z.string(),
});
export default pingSchema;