import asyncHandler from '../middleware/asyncHandler.js';
import { sendResponse } from '../utils/responseHandler.js';
import * as aiService from '../services/aiService.js';

// @desc    AI Symptom Checker
// @route   POST /api/v1/ai/symptom-checker
// @access  Private
export const symptomChecker = asyncHandler(async (req, res) => {
  const result = await aiService.symptomChecker(req.user.id, req.body.symptoms);
  sendResponse(res, 200, 'Symptom analysis completed', { analysis: result });
});

// @desc    AI Report Summarizer
// @route   POST /api/v1/ai/report-summary
// @access  Private
export const summarizeReport = asyncHandler(async (req, res) => {
  const result = await aiService.summarizeReport(req.user.id, req.body.reportText);
  sendResponse(res, 200, 'Report summary generated', { summary: result });
});

// @desc    AI Chatbot
// @route   POST /api/v1/ai/chat
// @access  Private
export const chat = asyncHandler(async (req, res) => {
  const result = await aiService.chat(req.user.id, req.body.message);
  sendResponse(res, 200, 'Chat response generated', { response: result });
});
