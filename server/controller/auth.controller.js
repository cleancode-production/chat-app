import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. User finden
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });

    // 2. Passwort prüfen
    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch)
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });

    // 3. Tokens erzeugen
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // 4. RefreshToken speichern
    user.refreshToken = refreshToken;
    await user.save();

    // 5. Cookies setzen
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "Strict",
        secure: false, // in Produktion: true mit HTTPS
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "Strict",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Login erfolgreich" });
  } catch (err) {
    console.error("Login Fehler:", err);
    res.status(500).json({ message: "Serverfehler beim Login" });
  }
};
