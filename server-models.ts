import mongoose, { Schema } from "mongoose";
import { User, FAQ, Query, Notification, SystemPromptConfig, AuditLog, Answer } from "./src/types";

// User Schema
export const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ["intern", "mentor", "admin"], required: true },
  avatar: { type: String },
  badges: [{ type: String }],
  points: { type: Number, default: 0 },
  spurthiPoints: { type: Number, default: 0 },
  department: { type: String },
  joinedAt: { type: String, default: () => new Date().toISOString() }
});

export const MongoUserModel = mongoose.models.User || mongoose.model("User", UserSchema);

// FAQ Schema
export const FAQSchema = new Schema({
  id: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  helpfulCount: { type: Number, default: 0 },
  unhelpfulCount: { type: Number, default: 0 },
  sourceQueryId: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

export const MongoFAQModel = mongoose.models.FAQ || mongoose.model("FAQ", FAQSchema);

// Answer Schema (Embedded within Query)
export const AnswerSchema = new Schema({
  id: { type: String, required: true },
  queryId: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.Mixed, required: true }, // copy of schema or simplified User representation
  isMentorVerified: { type: Boolean, default: false },
  isAiGenerated: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
  upvotes: [{ type: String }] // User IDs
});

// Query Schema
export const QuerySchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["open", "assigned", "resolved", "closed"], default: "open" },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
  tags: [{ type: String }],
  author: { type: Schema.Types.Mixed, required: true },
  assignedMentor: { type: Schema.Types.Mixed },
  createdAt: { type: String, default: () => new Date().toISOString() },
  resolvedAt: { type: String },
  answers: [AnswerSchema],
  upvotes: [{ type: String }],
  views: { type: Number, default: 1 },
  aiSummary: { type: String },
  duplicateOfId: { type: String }
});

export const MongoQueryModel = mongoose.models.Query || mongoose.model("Query", QuerySchema);

// Notification Schema
export const NotificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ["query_solved", "new_answer", "assigned", "system"], required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
  linkUrl: { type: String }
});

export const MongoNotificationModel = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

// SystemPromptConfig Schema
export const SystemPromptConfigSchema = new Schema({
  id: { type: String, required: true, unique: true },
  systemInstruction: { type: String, required: true },
  temperature: { type: Number, default: 0.2 },
  model: { type: String, default: "gemini-3.5-flash" },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

export const MongoSystemPromptConfigModel = mongoose.models.SystemPromptConfig || mongoose.model("SystemPromptConfig", SystemPromptConfigSchema);

// AuditLog Schema
export const AuditLogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  action: { type: String, required: true },
  user: { type: String, required: true },
  details: { type: String, required: true }
});

export const MongoAuditLogModel = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
