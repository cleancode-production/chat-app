import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });

    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch)
      return res.status(401).json({ message: "Ungültige Anmeldedaten" });

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
      return res.status(400).json({ message: "Benutzer existiert bereits" });
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
