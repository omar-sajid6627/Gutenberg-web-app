const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dull-meggie-1omar-d9f030db.koyeb.app';

const handleAskQuestion = async () => {
  if (!question.trim()) return;
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

const handleGenerateSummary = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
}; 