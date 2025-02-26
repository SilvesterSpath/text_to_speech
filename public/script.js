import { translateText } from './api/translation.js'; // Import translation function

const textInput = document.querySelector('#textArea');
const languageSelect = document.querySelector('#languageSelect');
const voiceSelect = document.querySelector('#voiceSelect');
const translatedTextArea = document.querySelector('#translatedText');
const playButton = document.querySelector('#playButton');
const downloadButton = document.querySelector('#downloadButton');
const copyButton = document.querySelector('#copyButton');

// Load available voices
let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();

  if (voices.length === 0) {
    console.log('Voices not ready, retrying...');
    setTimeout(loadVoices, 200); // Retry if voices aren't loaded yet
    return;
  }

  voiceSelect.innerHTML = ''; // Clear previous options

  voices.forEach((voice) => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  console.log('Voices loaded:', voices);
}

// Ensure voices are loaded before using them
speechSynthesis.addEventListener('voiceschanged', loadVoices);
setTimeout(loadVoices, 500); // Ensure voices load on page start

// Function to find the best matching voice for a given language
function findBestVoice(targetLang) {
  let bestVoice = voices.find((voice) => voice.lang.startsWith(targetLang));

  if (!bestVoice) {
    console.log(`No exact voice match for ${targetLang}, trying fallback.`);
    bestVoice =
      voices.find((voice) => voice.lang.includes(targetLang)) ||
      voices.find((voice) => voice.lang.startsWith('en')); // Fallback to English if no match
  }

  console.log(
    `Best voice for ${targetLang}:`,
    bestVoice ? bestVoice.name : 'None found'
  );
  return bestVoice;
}

// Play button event
playButton.addEventListener('click', async () => {
  const text = textInput.value.trim();
  const targetLanguage = languageSelect.value;

  if (!text) {
    alert('Please enter text to translate and play.');
    return;
  }

  try {
    // Translate the text using the imported function
    const translatedText = await translateText(text, targetLanguage);

    if (!translatedText) {
      alert('Error: Could not retrieve translation.');
      return;
    }

    console.log('Translated Text:', translatedText);

    // Display translated text in the textarea
    translatedTextArea.value = translatedText;

    // Ensure speech queue is cleared before speaking (Fix for Chrome bug)
    speechSynthesis.cancel(); // 💡 This resets speech to prevent it from getting stuck

    // Speak the translated text
    const utterance = new SpeechSynthesisUtterance(translatedText);

    // Find the best matching voice
    let selectedVoice = findBestVoice(targetLanguage);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang; // Set the language
    } else {
      utterance.lang = targetLanguage; // Set only the language if no matching voice is found
    }

    console.log(
      'Speaking with voice:',
      utterance.voice ? utterance.voice.name : 'Default'
    );
    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Translation failed:', error);
    alert('Error: Could not translate the text.');
  }
});

// Download button event
downloadButton.addEventListener('click', () => {
  const translatedText = translatedTextArea.value.trim();

  if (!translatedText) {
    alert('No translated text to download.');
    return;
  }

  const blob = new Blob([translatedText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'translated_text.txt';
  link.click();
});

// Copy button event
copyButton.addEventListener('click', () => {
  translatedTextArea.select();
  document.execCommand('copy');
  alert('Translated text copied to clipboard!');
});
