import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export async function translateText(text, targetLang) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const prompt = `Translate the following text into ${targetLang} and return ONLY the translated text:\n\n"${text}"`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a subtitle translator. Only return the translated text.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error('Translation API returned an unexpected response.');
    }
  } catch (error) {
    console.error('Translation failed:', error);
    return 'Translation error';
  }
}
