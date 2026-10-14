"""Inspect generated PDFs and assemble a convenient download volume."""
from pathlib import Path
import pymupdf

root = Path(__file__).resolve().parents[1]
directory = root / 'public' / 'practice-studies'
preview = root / 'outputs' / 'walking-preview'
preview.mkdir(parents=True, exist_ok=True)
combined = pymupdf.open()
for file in sorted(directory.glob('*.pdf')):
    if file.name == 'todos-los-estudios.pdf':
        continue
    doc = pymupdf.open(file)
    print(file.name, len(doc), 'pages')
    assert len(doc) >= 2
    for page in doc:
        assert len(page.get_text().strip()) > 60, (file.name, page.number)
    combined.insert_pdf(doc)
    if file.name in ['blues-major-walking.pdf', 'dont-get-around-walking.pdf', 'manha-em-simple.pdf']:
        doc[0].get_pixmap(matrix=pymupdf.Matrix(1.4,1.4)).save(preview / (file.stem+'.png'))
combined.save(directory / 'todos-los-estudios.pdf')
print('Combined:', len(combined), 'pages')
