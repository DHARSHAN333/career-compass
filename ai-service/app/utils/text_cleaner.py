import re

def clean_text(text: str) -> str:
    """
    Clean and normalize text
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters (keep basic punctuation)
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    
    # Normalize line breaks
    text = text.replace('\n', ' ')
    
    return text.strip()

def remove_stopwords(text: str) -> str:
    """
    Remove common stopwords (simplified version)
    """
    stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'}
    words = text.split()
    filtered = [w for w in words if w.lower() not in stopwords]
    return ' '.join(filtered)

def normalize_whitespace(text: str) -> str:
    """
    Normalize whitespace in text
    """
    return ' '.join(text.split())
