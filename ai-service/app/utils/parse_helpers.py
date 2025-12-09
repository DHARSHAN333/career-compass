import re

def extract_email(text: str) -> str:
    """
    Extract email from text
    """
    pattern = r'[\w.-]+@[\w.-]+\.\w+'
    match = re.search(pattern, text)
    return match.group(0) if match else None

def extract_phone(text: str) -> str:
    """
    Extract phone number from text
    """
    pattern = r'(\+\d{1,3}[- ]?)?\d{10}'
    match = re.search(pattern, text)
    return match.group(0) if match else None

def extract_years_of_experience(text: str) -> int:
    """
    Extract years of experience from text
    """
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'(\d+)\+?\s*years?\s*experience',
        r'experience.*?(\d+)\+?\s*years?'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return int(match.group(1))
    
    return 0

def parse_section(text: str, section_name: str) -> str:
    """
    Extract a specific section from resume text
    """
    pattern = rf'{section_name}[\s:]*(.+?)(?=\n[A-Z][a-z]+:|\Z)'
    match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
    return match.group(1).strip() if match else ""
