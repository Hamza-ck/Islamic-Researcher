import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.core.query import (
    analyze_query,
    decompose_query,
    detect_language,
    detect_intent,
    normalize_arabic_letters,
    strip_arabic_diacritics,
    normalize_for_retrieval,
)


def test_language_detection():
    assert detect_language('ما هو الصبر؟') in {'arabic_or_urdu', 'arabic'}
    assert detect_language('نماز کا طریقہ کیا ہے؟') in {'arabic_or_urdu', 'urdu'}
    assert detect_language('namaz kaise padhe aur wudu ka tareeqa') == 'roman_urdu'
    assert detect_language('What is the concept of sabr in the Quran?') == 'english'


def test_intent_detection():
    assert detect_intent('Abu Hanifa vs Shafi\'i on wudu') == 'comparative_disagreement'
    assert detect_intent('Is this hadith authentic or daif?') == 'hadith_authenticity'
    assert detect_intent('Tafsir of Surah Al-Ikhlas') == 'tafsir_explanation'
    assert detect_intent('Is interest haram in Islam?') == 'fiqh_ruling'


def test_decomposition():
    subqueries = decompose_query('What is patience and prayer in Islam?')
    assert len(subqueries) >= 2
    assert any('patience' in s.lower() for s in subqueries)

    comp_subqueries = decompose_query('Abu Hanifa vs Imam Malik on zakat')
    assert len(comp_subqueries) >= 2


def test_arabic_normalization():
    voweled = 'إِنَّ الصَّبْرَ'
    unvoweled = strip_arabic_diacritics(voweled)
    assert 'َّ' not in unvoweled
    assert 'ْ' not in unvoweled
    norm = normalize_for_retrieval(voweled)
    assert norm.startswith('ا')  # Alef variant normalized
