const OpenAI = require('openai');
const { GoogleGenAI, ThinkingLevel } = require('@google/genai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-3-flash-preview";



const callOpenAI = async (prompt, systemInstruction, isJson = false) => {
    const messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
    ];

    if (isJson) {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
            functions: [{
                name: "generateSummaries",
                parameters: {
                    type: "object",
                    properties: { summaries: { type: "array", items: { type: "string" } } },
                    required: ["summaries"]
                }
            }],
            function_call: { name: "generateSummaries" }
        });
        return JSON.parse(completion.choices[0].message.function_call.arguments);
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 500
    });
    return completion.choices[0].message.content;
};

const callGemini = async (prompt, isJson = false) => {
    
    const finalPrompt = isJson 
        ? `${prompt}. Retourne uniquement du JSON: { "summaries": ["string", "string", "string"] }`
        : prompt;

    console.log('full prompt :', finalPrompt)
    const model = await genAI.models.generateContent({ 
        model: GEMINI_MODEL,
        contents: finalPrompt,
        config: {
            thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
            },
        }
    });

    //const result = await model.generateContent(finalPrompt);
    const text = model.text;
    return isJson ? JSON.parse(text) : text;
};

exports.generateText = async (prompt, provider) => {
    const system = "Vous êtes un expert en rédaction de CV. Générez un texte clair et professionnel.";
    return provider === 'openai' ? await callOpenAI(prompt, system) : await callGemini(prompt);
};

exports.generateThreeSummaries = async (prompt, provider) => {
    const system = "Générez trois résumés de profil différents.";
    return provider === 'openai' ? await callOpenAI(prompt, system, true) : await callGemini(prompt, true);
};

exports.generateExperienceList = async (prompt, provider) => {
    const system = "Génère une liste d'expériences professionnelles percutantes sous forme de puces.";
    return provider === 'openai' ? await callOpenAI(prompt, system) : await callGemini(prompt);
};