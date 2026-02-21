import * as z from "zod";

const validateRequestBody = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.body);
      console.log("✓ Request body is valid");
      next();
    } 
    catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          status: "fail",
          message: "Validation failed",
          errors: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  };
};

export { validateRequestBody };