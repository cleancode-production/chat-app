import User from "../models/userModel.js";

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
    const { email } = req.body;
    const userId = req.userId;

    const contact = await User.findOne({ email });
    if (!contact) {
      res.status(404).json({ message: "Kontakt nicht gefunden" });
      return;
    }

    if (userId === contact._id.toString()) {
      res
        .status(400)
        .json({ message: "Du kannst dich nicht selbst hinzufügen." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Benutzer nicht gefunden" });
      return;
    }

    if (user.contacts.includes(contact._id)) {
      res.status(400).json({ message: "Kontakt ist bereits vorhanden" });
      return;
    }

    user.contacts.push(contact._id);
    await user.save();

    res.status(200).json({ message: "Kontakt hinzugefügt" });
    return;
  } catch (err) {
    console.error("Fehler beim Hinzufügen des Kontakts:", err);
    res.status(500).json({ message: "Serverfehler" });
    return;
  }
};

export const removeContact = async (req, res) => {
  try {
    const { contactId } = req.body;
    const userId = req.userId;

    if (!contactId) {
      res.status(400).json({ message: "contactId ist erforderlich" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Benutzer nicht gefunden" });
      return;
    }

    const index = user.contacts.indexOf(contactId);
    if (index === -1) {
      res.status(400).json({ message: "Kontakt ist nicht in deiner Liste" });
      return;
    }

    user.contacts.splice(index, 1);
    await user.save();

    res.status(200).json({ message: "Kontakt entfernt" });
    return;
  } catch (err) {
    console.error("Fehler beim Entfernen des Kontakts:", err);
    res.status(500).json({ message: "Serverfehler" });
    return;
  }
};
