const handleAskQuestion = async () => {
  if (!question.trim()) return;
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(`https://dull-meggie-1omar-d9f030db.koyeb.app/books/${bookId}/ask`, {
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
    const response = await fetch(`https://dull-meggie-1omar-d9f030db.koyeb.app/books/${bookId}/summary`, {
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