export const detectEmotion = async (blob: Blob) => {
  const formData = new FormData();
  formData.append('file', blob, 'frame.jpg');

  try {
    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to detect emotion');
    }

    const result = await response.json();
    // The FastAPI server now returns an object with the following fields:
    // { emotion, emotion_confidence, eye_state, looking_direction, engagement }
    return result; 
  } catch (error) {
    console.error('Error detecting emotion:', error);
    return null;
  }
};
