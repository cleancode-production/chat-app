import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    res.status(401).json({ message: "Kein Token vorhanden" });
    return;
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Token ungültig oder abgelaufen" });
      return;
    }

    req.userId = decoded.userId;
    next();
  });
};
