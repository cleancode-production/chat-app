import User from "../models/userModel";

export const getAllContacts = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).populate("contacts", "email _id");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user.contacts);
  } catch (err) {
    console.error("Fehler beim Laden der Kontakte:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
};
