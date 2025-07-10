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

export const addContact = async (req, res) => {
  try {
    const { contactId } = req.body;
    const userId = req.userId;

    // 1. Nutzer selbst und Kontakt abrufen
    if (userId === contactId)
      return res
        .status(400)
        .json({ message: "Du kannst dich nicht selbst hinzufügen." });

    const contact = await User.findById(contactId);
    if (!contact)
      return res.status(404).json({ message: "Kontakt nicht gefunden" });

    const user = await User.findById(userId);

    // 2. Prüfen, ob Kontakt schon existiert
    if (user.contacts.includes(contactId)) {
      return res.status(400).json({ message: "Kontakt ist bereits vorhanden" });
    }

    // 3. Hinzufügen
    user.contacts.push(contactId);
    await user.save();

    res.status(200).json({ message: "Kontakt hinzugefügt" });
  } catch (err) {
    console.error("Fehler beim Hinzufügen des Kontakts:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
};
