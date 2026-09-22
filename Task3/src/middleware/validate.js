export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!parsed.success) return res.status(400).json({ success: false, error: { message: "Validation failed", details: parsed.error.flatten() } });
  req.validated = parsed.data;
  next();
};
