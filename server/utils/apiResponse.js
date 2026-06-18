export const successResponse = (res, data = {}, message = "OK", status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

export const errorResponse = (res, message = "Something went wrong", status = 500, details) => {
  return res.status(status).json({ success: false, message, details });
};

