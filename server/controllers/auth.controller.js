import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Ungültige Anmeldedaten");
      error.statusCode = 401;
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch) {
      const error = new Error("Ungültige Anmeldedaten");
      error.statusCode = 401;
      return next(error);
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
    user.isOnline = true;
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

  } catch (error) {
    return next(error);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      const error = new Error("Email bereits verwendet");
      error.statusCode = 400;
      return next(error);
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      const error = new Error("Benutzername bereits verwendet");
      error.statusCode = 400;
      return next(error);
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. User erstellen
    const newUser = new User({ email, hashedPassword, username });
    await newUser.save();

    return res.status(201).json({ 
      message: "Benutzer erfolgreich registriert" 
    });

  } catch (error) {
    return next(error)
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      const error = new Error("Kein Refresh Token");
      error.statusCode = 401;
      return next(error);
    };

    // Token prüfen
    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      async (error, decoded, next) => {
        if (error) {
          const error = new Error("Ungültiger Refresh Token");
          error.statusCode = 403;
          return next(error);
        };

        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== token) {
          const error = new Error("Token gehört zu keinem Benutzer");
          error.statusCode = 403;
          return next(error);
        };

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

        return res.status(200).json({ 
          message: "Neuer Access Token gesetzt" 
        });
      }
    );

  } catch (error) {
    return next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.sendStatus(204);
    }

    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res
      .clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "Strict",
        secure: false, // in Produktion: true
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "Strict",
        secure: false,
      })
      .status(200)
      .json({ message: "Logout erfolgreich" });

    user.isOnline = false;

  } catch (error) {
    return next(error)
  }
};

export const getMe = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("email");

    if (!user) {
      const error = new Error("User nicht gefunden");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({ user });

  } catch (error) {
    return next(error)
  }
};
