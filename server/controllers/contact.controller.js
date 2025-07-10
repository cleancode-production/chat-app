import User from "../models/userModel.js";

// Alle Kontakte holen
export const getAllContacts = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).populate("contacts", "email _id");

    if (!user) {
      const error = new Error("Benutzer nicht gefunden");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(user.contacts);
  } catch (error) {
    return next(error);
  }
};

// Kontakt hinzufügen
export const addContact = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userId = req.userId;

    if (!email) {
      const error = new Error("E-Mail ist erforderlich");
      error.statusCode = 400;
      return next(error);
    }

    const contact = await User.findOne({ email });
    if (!contact) {
      const error = new Error("Kontakt nicht gefunden");
      error.statusCode = 404;
      return next(error);
    }

    if (userId === contact._id.toString()) {
      const error = new Error("Du kannst dich nicht selbst hinzufügen.");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Benutzer nicht gefunden");
      error.statusCode = 404;
      return next(error);
    }

    if (user.contacts.includes(contact._id)) {
      const error = new Error("Kontakt ist bereits vorhanden");
      error.statusCode = 400;
      return next(error);
    }

    user.contacts.push(contact._id);
    await user.save();

    res.status(200).json({ message: "Kontakt hinzugefügt" });
    return;
  } catch (err) {
    return next(err);
  }
};

// Kontakt entfernen
export const removeContact = async (req, res, next) => {
  try {
    const { contactId } = req.body;
    const userId = req.userId;

    if (!contactId) {
      const error = new Error("contactId ist erforderlich");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Benutzer nicht gefunden");
      error.statusCode = 404;
      return next(error);
    }

    const index = user.contacts.indexOf(contactId);
    if (index === -1) {
      const error = new Error("Kontakt ist nicht in deiner Liste");
      error.statusCode = 400;
      return next(error);
    }

    user.contacts.splice(index, 1);
    await user.save();

    res.status(200).json({ message: "Kontakt entfernt" });
    return;
  } catch (err) {
    return next(err);
  }
};
