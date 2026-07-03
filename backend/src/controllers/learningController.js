import { LEARNING_TOPICS } from "../data/learningTopics.js";

export const getAllTopics = (req, res) => {
  res.json(LEARNING_TOPICS);
};

export const getSubjectTopics = (req, res) => {
  const subject = decodeURIComponent(req.params.subject);
  const topics = LEARNING_TOPICS[subject];
  if (!topics) return res.status(404).json({ error: "Subject not found." });
  res.json({ subject, topics });
};
