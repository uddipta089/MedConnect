import { GoogleGenAI } from '@google/genai';
import AIConversation from '../models/AIConversation.js';

let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const getModel = () => {
  if (!ai) throw new Error('Gemini API key is not configured');
  return 'gemini-2.5-flash';
};

const DISCLAIMER = '\n\nDisclaimer: AI-generated information is for educational purposes only and is not a substitute for professional medical advice.';

export const symptomChecker = async (userId, symptoms) => {
  const prompt = `You are a healthcare assistant. You do not diagnose diseases. You do not prescribe medicines. 
Patient symptoms: "${symptoms}".
Return a structured response in this format:
Specialist: [Recommended Specialist]
Urgency: [Low/Medium/High]
Advice: [General self-care tips]
When to Seek Medical Help: [Conditions]
${DISCLAIMER}`;

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: prompt,
  });
  
  const text = response.text;
  
  await saveConversation(userId, 'Symptom Checker', prompt, text);
  return text;
};

export const summarizeReport = async (userId, reportText) => {
  const prompt = `You are a healthcare assistant. Summarize this medical report in simple terms.
Do not diagnose.
Report: "${reportText}"
Return a structured response in this format:
Summary: [Simple summary]
Key Findings: [Important findings]
Important Medical Terms: [Terms explained]
Questions to Ask Doctor: [Suggested questions]
${DISCLAIMER}`;

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: prompt,
  });
  
  const text = response.text;
  await saveConversation(userId, 'Report Summary', prompt, text);
  return text;
};

export const chat = async (userId, message) => {
  let conversation = await AIConversation.findOne({ userId, module: 'Health Assistant' });
  
  if (!conversation) {
    conversation = new AIConversation({ userId, module: 'Health Assistant', messages: [] });
  }

  // Keep last 10 messages
  if (conversation.messages.length > 10) {
    conversation.messages = conversation.messages.slice(conversation.messages.length - 10);
  }

  // Convert conversation to Gemini format (approximated for basic SDK usage)
  const history = conversation.messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
  
  const prompt = `You are a healthcare assistant. You do not diagnose or prescribe medicines.
History:
${history}
User: ${message}
Assistant:`;

  const response = await ai.models.generateContent({
    model: getModel(),
    contents: prompt,
  });
  
  const text = response.text + DISCLAIMER;

  conversation.messages.push({ role: 'user', content: message });
  conversation.messages.push({ role: 'model', content: text });
  
  await conversation.save();
  return text;
};

const saveConversation = async (userId, module, prompt, responseText) => {
  await AIConversation.create({
    userId,
    module,
    messages: [
      { role: 'user', content: prompt },
      { role: 'model', content: responseText }
    ]
  });
};
