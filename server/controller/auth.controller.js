import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Ungültige Anmeldedaten" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch) {
      res.status(401).json({ message: "Ungültige Anmeldedaten" });
      return;
    }

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

    user.refreshToken = refreshToken;
    await user.save();

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

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Benutzer existiert bereits" });
      return;
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. User erstellen
    const newUser = new User({ email, passwordHash });
    await newUser.save();

    res.status(201).json({ message: "Benutzer erfolgreich registriert" });
  } catch (err) {
    console.error("Registrierungsfehler:", err);
    res.status(500).json({ message: "Serverfehler bei Registrierung" });
  }
};

import jwt from "jsonwebtoken";

export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "Kein Refresh Token" });

    // Token prüfen
    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          res.status(403).json({ message: "Ungültiger Refresh Token" });
          return;
        }

        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== token) {
          res.status(403).json({ message: "Token gehört zu keinem Benutzer" });
          return;
        }

        // Neuen Access Token erstellen
        const newAccessToken = jwt.sign(
          { userId: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );

        // Cookie setzen
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          sameSite: "Strict",
          secure: false,
          maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({ message: "Neuer Access Token gesetzt" });
      }
    );
  } catch (err) {
    console.error("Refresh Fehler:", err);
    res.status(500).json({ message: "Fehler beim Refresh Token" });
  }
};
