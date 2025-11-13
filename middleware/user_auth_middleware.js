import jwt from "jsonwebtoken";

export const authUser = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token found" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRETE);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token jainam" });
    }
  } else {
    res.status(404).send("token not found");
  }
};
