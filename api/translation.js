export async function translateText(text, targetLang) {
  try {
    const response = await fetch('http://localhost:5000/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLang }),
    });

    const data = await response.json();
    console.log('API Response:', data);

    if (data.translation) {
      return data.translation;
    } else {
      throw new Error('Translation API returned an unexpected response.');
    }
  } catch (error) {
    console.error('Translation failed:', error);
    return null;
  }
}
