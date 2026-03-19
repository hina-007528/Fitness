import Contact from "../models/Contact.js";
import { createError } from "../utils/error.js";
import nodemailer from "nodemailer";

export const createContact = async (req, res, next) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    // Send email notification
    await sendEmailNotification(contact);

    return res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllContacts = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'name email');

    const total = await Contact.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Contacts retrieved successfully",
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id)
      .populate('assignedTo', 'name email')
      .populate('notes.addedBy', 'name email');

    if (!contact) {
      return next(createError(404, "Contact not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Contact retrieved successfully",
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!contact) {
      return next(createError(404, "Contact not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return next(createError(404, "Contact not found"));
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      data: { id: contact._id },
    });
  } catch (err) {
    next(err);
  }
};

export const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const contact = await Contact.findById(id);
    if (!contact) {
      return next(createError(404, "Contact not found"));
    }

    contact.notes.push({
      content,
      addedBy: userId,
    });

    await contact.save();
    return res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: contact.notes[contact.notes.length - 1],
    });
  } catch (err) {
    next(err);
  }
};

export const respondToContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const contact = await Contact.findById(id);
    if (!contact) {
      return next(createError(404, "Contact not found"));
    }

    contact.response = {
      content,
      respondedBy: userId,
      respondedAt: new Date(),
    };

    contact.status = 'resolved';
    await contact.save();

    // Send response email
    await sendResponseEmail(contact, content);

    return res.status(200).json({
      success: true,
      message: "Response sent successfully",
      data: contact.response,
    });
  } catch (err) {
    next(err);
  }
};

export const getContactStats = async (req, res, next) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Contact.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Contact stats retrieved successfully",
      data: {
        statusStats: stats,
        priorityStats: priorityStats,
        totalContacts: await Contact.countDocuments(),
        pendingContacts: await Contact.countDocuments({ status: 'pending' }),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Email helper functions
const sendEmailNotification = async (contact) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'info@fitnesstrack.com',
      subject: `New Contact Form Submission: ${contact.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contact.message}</p>
        <p><strong>Priority:</strong> ${contact.priority}</p>
        <p><strong>Submitted at:</strong> ${contact.createdAt}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

const sendResponseEmail = async (contact, responseContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contact.email,
      subject: `Response to your inquiry: ${contact.subject}`,
      html: `
        <h2>Response to Your Inquiry</h2>
        <p>Dear ${contact.name},</p>
        <p>Thank you for contacting us. Here is our response to your inquiry:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${responseContent}
        </div>
        <p>If you have any further questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>FitTrack Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending response email:', error);
  }
};
