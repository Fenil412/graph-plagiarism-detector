"""
app/preprocessing/text_preprocessor.py
─────────────────────────────────────────────────────────────────────────────
Text cleaning, tokenisation, stopword removal and lemmatisation pipeline.

Uses NLTK under the hood.  The required corpora are downloaded on first run.
"""
from __future__ import annotations

import re
import string
from typing import List

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import sent_tokenize, word_tokenize

from app.config.logger import logger

# ── One-time NLTK resource download ──────────────────────────────────────────
_NLTK_RESOURCES = [
    ("tokenizers/punkt", "punkt"),
    ("tokenizers/punkt_tab", "punkt_tab"),
    ("corpora/stopwords", "stopwords"),
    ("corpora/wordnet", "wordnet"),
    ("corpora/omw-1.4", "omw-1.4"),
]

def _ensure_nltk_resources() -> None:
    for path, package in _NLTK_RESOURCES:
        try:
            nltk.data.find(path)
        except LookupError:
            logger.info(f"Downloading NLTK resource: {package}")
            nltk.download(package, quiet=True)

_ensure_nltk_resources()

# ── Module-level singletons ───────────────────────────────────────────────────
_STOP_WORDS: set[str] = set(stopwords.words("english"))
_LEMMATIZER = WordNetLemmatizer()


# ── Public API ────────────────────────────────────────────────────────────────

def clean_text(text: str) -> str:
    """
    Lowercase, remove HTML tags, URLs, punctuation and extra whitespace.
    """
    text = text.lower()
    text = re.sub(r"<[^>]+>", " ", text)          # HTML tags
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)  # URLs
    text = re.sub(r"[{}]".format(re.escape(string.punctuation)), " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize_words(text: str) -> List[str]:
    """Split cleaned text into individual word tokens."""
    return word_tokenize(text)


def tokenize_sentences(text: str) -> List[str]:
    """Split raw text into sentences."""
    return sent_tokenize(text)


def remove_stopwords(tokens: List[str]) -> List[str]:
    """Filter out English stop-words and single-character tokens."""
    return [t for t in tokens if t not in _STOP_WORDS and len(t) > 1]


def lemmatize(tokens: List[str]) -> List[str]:
    """Reduce each token to its base (lemma) form."""
    return [_LEMMATIZER.lemmatize(t) for t in tokens]


def full_preprocess(text: str) -> List[str]:
    """
    End-to-end pipeline:
        raw text → clean → tokenize → remove stopwords → lemmatize
    Returns a list of meaningful tokens.
    """
    cleaned = clean_text(text)
    tokens  = tokenize_words(cleaned)
    tokens  = remove_stopwords(tokens)
    tokens  = lemmatize(tokens)
    return tokens


def preprocess_sentences(text: str) -> List[List[str]]:
    """
    Sentence-level pipeline.
    Returns a list of sentence-token lists (one list per sentence).
    """
    sentences = tokenize_sentences(text)
    return [full_preprocess(s) for s in sentences]
