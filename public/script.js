const textInput = document.querySelector('#textArea');
const languageSelect = document.querySelector('#languageSelect');
const voiceSelect = document.querySelector('#voiceSelect');
const playButton = document.querySelector('#playButton');

// Load available voices
let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = ''; // Clear previous options

  voices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  // Add default option
  if (voices.length === 0) {
    const defaultOption = document.createElement('option');
    defaultOption.value = 'default';
    defaultOption.textContent = 'Default Voice';
    voiceSelect.appendChild(defaultOption);
  }
}

// Load voices on page load and when voices change
speechSynthesis.addEventListener('voiceschanged', loadVoices);
loadVoices();

// Detect language function (optional)
async function detectLanguage(text) {
  const url = 'https://libretranslate.com/detect';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text }),
    });

    const data = await response.json();
    console.log('Language Detection:', data);

    if (data && data.length > 0) {
      return data[0].language;
    } else {
      return 'en'; // Default to English if detection fails
    }
  } catch (error) {
    console.error('Language detection failed:', error);
    return 'en'; // Default to English on error
  }
}

// Translate function
async function translateText(text, targetLang) {
  const sourceLang = await detectLanguage(text); // Automatically detect language
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${sourceLang}|${targetLang}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('API Response:', data);

    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    } else {
      throw new Error('Translation API returned an unexpected response.');
    }
  } catch (error) {
    console.error('Translation failed:', error);
    return null;
  }
}

// Play button event
playButton.addEventListener('click', async () => {
  const text = textInput.value.trim();
  const targetLanguage = languageSelect.value;
  const selectedVoiceName = voiceSelect.value;

  if (!text) {
    alert('Please enter text to translate and play.');
    return;
  }

  try {
    // Translate the text
    const translatedText = await translateText(text, targetLanguage);

    if (!translatedText) {
      alert('Error: Could not retrieve translation.');
      return;
    }

    console.log('Translated Text:', translatedText);

    // Speak the translated text
    const utterance = new SpeechSynthesisUtterance(translatedText);

    // Set voice
    const selectedVoice = voices.find(
      (voice) => voice.name === selectedVoiceName
    );
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Translation failed:', error);
    alert('Error: Could not translate the text.');
  }
});
