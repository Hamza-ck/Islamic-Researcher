"""Text normalization for Islamic retrieval and query processing."""
import re

ARABIC_DIACRITICS = re.compile(r'[\u064b-\u065f\u0670]')
ALEF_VARIANTS = re.compile(r'[إأآٱ]')
YEH_VARIANTS = re.compile(r'[ىي]')
TEH_MARBUTA = re.compile(r'ة')


def normalize_whitespace(text: str) -> str:
    """Collapses whitespace into single spaces."""
    return re.sub(r'\s+', ' ', text or '').strip()


def normalize_arabic_letters(text: str) -> str:
    """Normalizes common Arabic character variations for robust matching."""
    t = ALEF_VARIANTS.sub('ا', text or '')
    t = TEH_MARBUTA.sub('ه', t)
    return t


def strip_arabic_diacritics(text: str) -> str:
    """Strips vowels/tashkeel without altering base consonants."""
    return ARABIC_DIACRITICS.sub('', text or '')


def normalize_for_retrieval(text: str) -> str:
    """Standard normalized form used for lexical/semantic query matching."""
    clean = normalize_whitespace(text)
    clean = strip_arabic_diacritics(clean)
    clean = normalize_arabic_letters(clean)
    return clean.lower()
