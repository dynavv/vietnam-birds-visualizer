import os, re, json, zipfile
import xml.etree.ElementTree as ET

IOC_PATH = 'scripts/data-pipeline/authority/raw/ioc/master_ioc_list_v14.2.xlsx'
AVIBASE_PATH = 'scripts/data-pipeline/authority/raw/avibase/avibase-vietnam.html'
CANONICAL_OUTPUT_PATH = 'scripts/data-pipeline/authority/vietnam-bird-names-canonical.json'
MASTER_OUTPUT_PATH = 'scripts/data-pipeline/authority/vietnam-bird-names-master.json'
SPECIES_PATH = 'src/data/species.json'

print('=== BẮT ĐẦU XÂY DỰNG CANONICAL & MASTER REGISTRY (IOC v14.2 + AVIBASE + 81 SPECIMENS) ===')

# 1. Parse IOC World Bird List v14.2
print('-> 1. Đang nạp danh lục thế giới IOC v14.2...')
ioc_taxa = {}

with zipfile.ZipFile(IOC_PATH) as z:
    shared_strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        sst = ET.fromstring(z.read('xl/sharedStrings.xml'))
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        for si in sst.findall('.//ns:si', ns):
            text = ''.join([t.text or '' for t in si.findall('.//ns:t', ns)])
            shared_strings.append(text)

    sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    
    cur_order = ''
    cur_family = ''
    cur_family_en = ''
    cur_genus = ''
    
    for row in sheet.findall('.//ns:row', ns):
        cells = {}
        for c in row.findall('ns:c', ns):
            ref = c.attrib.get('r', '')
            col = ''.join([ch for ch in ref if ch.isalpha()])
            v = c.find('ns:v', ns)
            if v is not None and v.text is not None:
                val = v.text
                if c.attrib.get('t') == 's':
                    val = shared_strings[int(val)]
                cells[col] = val
        
        if 'C' in cells and cells['C'].isupper() and cells['C'].endswith('FORMES'):
            cur_order = cells['C'].capitalize()
        if 'D' in cells and cells['D'].endswith('dae'):
            cur_family = cells['D']
            cur_family_en = cells.get('E', '')
        if 'F' in cells and cells['F'] and not cells['F'].startswith('('):
            cur_genus = cells['F']
        
        if 'G' in cells and cells['G'] and cur_genus:
            sp_name = f"{cur_genus} {cells['G']}".strip()
            ioc_taxa[sp_name.lower()] = {
                'scientificName': sp_name,
                'genus': cur_genus,
                'speciesEpithet': cells['G'],
                'order': cur_order,
                'family': cur_family,
                'familyEnglish': cur_family_en,
                'authority': cells.get('I', '').strip(),
                'englishName': cells.get('J', '').strip(),
                'breedingRange': cells.get('L', '').strip()
            }

print(f'   Đã nạp {len(ioc_taxa)} loài từ IOC v14.2.')

# 2. Đọc 81 loài mẫu vật hiện tại
print('-> 2. Đang nạp danh sách 81 loài mẫu vật từ src/data/species.json...')
with open(SPECIES_PATH, 'r', encoding='utf-8') as f:
    current_species = json.load(f)

# Tạo bảng tra cứu linh hoạt cho 81 loài
# Map từ: scientificName.lower(), id, và các danh pháp đồng danh
SPECIMEN_SYNONYMS = {
    'napothera pasquieri': 'rimator-pasquieri',
    'paradoxornis bakeri': 'psittiparus-bakeri',
    'pterorhinus chinensis': 'garrulax-chinensis',
    'taenioptynx brodiei': 'glaucidium-brodiei',
    'porphyrio porphyrio': 'porphyrio-poliocephalus',
    'arborophila tonkinensis': 'tropicoperdix-tonkinensis',
    'gyps indicus': 'gyps-tenuirostris',
    'schoeniclus aureolus': 'emberiza-aureola',
    'trochalopteron formosum': 'trochalopteron-formosum-greenwayi',
    'trochalopteron milnei': 'trochalopteron-milnei-sharpei',
    'anorrhinus austeni': 'anorrhinus-tickelli',
    'psilopogon faber': 'psilopogon-faber'
}

specimens_by_id = {s['id']: s for s in current_species}
specimens_lookup = {}
for s in current_species:
    specimens_lookup[s['id']] = s
    specimens_lookup[s['scientificName'].lower()] = s
    # Nếu là phân loài 3 chữ, thêm cả tên loài 2 chữ
    parts = s['scientificName'].split()
    if len(parts) >= 3:
        specimens_lookup[f"{parts[0]} {parts[1]}".lower()] = s

# Nạp legalFramework hiện tại từ master nếu có
master_existing = {}
if os.path.exists(MASTER_OUTPUT_PATH):
    try:
        with open(MASTER_OUTPUT_PATH, 'r', encoding='utf-8') as f:
            for item in json.load(f):
                master_existing[item.get('id')] = item
                master_existing[item.get('scientificName', '').lower()] = item
    except Exception:
        pass

# 3. Parse Avibase Vietnam Checklist
print('-> 3. Đang nạp danh lục chim Việt Nam từ Avibase HTML...')
with open(AVIBASE_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

pattern = re.compile(
    r'<tr class=[\'"]highlight1[\'"]>\s*<td>(.*?)</td>\s*<td><a href=[\'"]species\.jsp\?lang=EN&avibaseid=([A-F0-9]+)[\'"]><i>(.*?)</i></a></td>\s*<td>(.*?)</td>\s*<td>(.*?)</td>\s*</tr>',
    re.DOTALL
)

SYNONYM_MAP = {
    'butorides atricapilla': 'butorides striata',
    'thinornis dubius': 'charadrius dubius',
    'thinornis placidus': 'charadrius placidus',
    'pachyglossa chrysorrhea': 'dicaeum chrysorrheum',
    'pachyglossa melanozantha': 'dicaeum melanozanthum',
    'pachyglossa agilis': 'dicaeum agile',
    'schoeniclus elegans': 'emberiza elegans',
    'schoeniclus pallasi': 'emberiza pallasi',
    'schoeniclus schoeniclus': 'emberiza schoeniclus',
    'schoeniclus chrysophrys': 'emberiza chrysophrys',
    'schoeniclus tristrami': 'emberiza tristrami',
    'schoeniclus rutilus': 'emberiza rutila',
    'schoeniclus aureolus': 'emberiza aureola',
    'schoeniclus pusillus': 'emberiza pusilla',
    'schoeniclus rusticus': 'emberiza rustica',
    'schoeniclus spodocephalus': 'emberiza spodocephala',
    'gygis candida': 'gygis alba',
    'larus heuglini': 'larus fuscus',
    'chloropsis lazulina': 'chloropsis hardwickii',
    'napothera pasquieri': 'rimator pasquieri',
    'paradoxornis bakeri': 'psittiparus bakeri',
    'pterorhinus chinensis': 'garrulax chinensis',
    'taenioptynx brodiei': 'glaucidium brodiei',
    'porphyrio porphyrio': 'porphyrio poliocephalus',
    'arborophila tonkinensis': 'tropicoperdix tonkinensis',
    'gyps indicus': 'gyps tenuirostris',
    'anorrhinus austeni': 'anorrhinus tickelli'
}

raw_rows = pattern.findall(html)
canonical_records = []
master_records = []
seen_species = set()
matched_specimens = set()

def make_slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

def clean_vn_name(raw_vn):
    if not raw_vn:
        return '', []
    cleaned = re.sub(r'<.*?>', '', raw_vn).strip()
    aliases = []
    if cleaned.startswith('Chim '):
        base = cleaned[5:].strip()
        aliases.append(cleaned)
        return base, aliases
    return cleaned, aliases

for eng, avb_id, sci, vn, status in raw_rows:
    clean_sci = re.sub(r'<.*?>', '', sci).strip()
    words = clean_sci.split()
    if len(words) != 2 or words[1].startswith('(') or words[1].startswith('[') or words[1] == 'sp.':
        continue
    
    sci_low = clean_sci.lower()
    if sci_low in seen_species:
        continue
    seen_species.add(sci_low)
    
    clean_eng = re.sub(r'<.*?>', '', eng).strip()
    clean_status = re.sub(r'<.*?>', '', status).strip()
    vn_base, vn_aliases = clean_vn_name(vn)
    
    ioc_lookup = sci_low
    if ioc_lookup in SYNONYM_MAP:
        ioc_lookup = SYNONYM_MAP[ioc_lookup]
    
    ioc_rec = ioc_taxa.get(ioc_lookup, {})
    
    # Kiểm tra xem có phải 1 trong 81 loài mẫu vật
    specimen_match = None
    if sci_low in SPECIMEN_SYNONYMS and SPECIMEN_SYNONYMS[sci_low] in specimens_lookup:
        specimen_match = specimens_lookup[SPECIMEN_SYNONYMS[sci_low]]
    elif sci_low in specimens_lookup:
        specimen_match = specimens_lookup[sci_low]
    elif ioc_lookup in specimens_lookup:
        specimen_match = specimens_lookup[ioc_lookup]
    elif make_slug(clean_sci) in specimens_lookup:
        specimen_match = specimens_lookup[make_slug(clean_sci)]
    
    if specimen_match:
        matched_specimens.add(specimen_match['id'])
    
    is_endemic = 'Endemic' in status or 'Near-endemic' in status
    endemic_scope = 'vietnam' if 'Endemic' in status else ('indochina' if 'Near-endemic' in status else 'none')
    
    iucn_status = 'LC'
    if 'Critically endangered' in status:
        iucn_status = 'CR'
    elif 'Endangered' in status:
        iucn_status = 'EN'
    elif 'Vulnerable' in status:
        iucn_status = 'VU'
    elif 'Near-threatened' in status:
        iucn_status = 'NT'
    
    # Quyết định ID và ScientificName
    record_id = specimen_match['id'] if specimen_match else make_slug(clean_sci)
    scientific_name = specimen_match['scientificName'] if specimen_match else (ioc_rec.get('scientificName') or clean_sci)
    
    # Quyết định tên tiếng Việt và aliases
    aliases_set = set(vn_aliases)
    if vn_base:
        aliases_set.add(vn_base)
    
    if specimen_match:
        spec_vn = specimen_match.get('vietnameseName', '').strip()
        if spec_vn:
            aliases_set.add(spec_vn)
        for a in specimen_match.get('aliases', []):
            if a.strip():
                aliases_set.add(a.strip())
        
        # Nếu Avibase không có tên tiếng Việt, dùng luôn tên của mẫu vật
        if not vn_base:
            primary_vn = spec_vn
        else:
            primary_vn = vn_base
    else:
        primary_vn = vn_base
    
    # Danh sách aliases không chứa tên chính
    final_aliases = [a for a in sorted(aliases_set) if a != primary_vn]
    
    # Khôi phục hoặc tạo legalFramework
    existing_entry = master_existing.get(record_id) or master_existing.get(scientific_name.lower())
    if existing_entry and 'legalFramework' in existing_entry:
        legal_framework = existing_entry['legalFramework']
    elif specimen_match and 'conservation' in specimen_match and 'legalFramework' in specimen_match['conservation']:
        legal_framework = specimen_match['conservation']['legalFramework']
    else:
        legal_framework = {
            'decree84Group': 'none',
            'decree160Priority': False,
            'isEaafpMigratory': False,
            'directive04Flagship': False
        }
    
    canonical_record = {
        'id': record_id,
        'scientificName': scientific_name,
        'vietnameseName': primary_vn,
        'englishName': ioc_rec.get('englishName') or clean_eng,
        'aliases': final_aliases,
        'isEndemic': is_endemic,
        'endemicScope': endemic_scope,
        'iucn': iucn_status,
        'order': ioc_rec.get('order', 'Passeriformes'),
        'family': ioc_rec.get('family', ''),
        'familyEnglish': ioc_rec.get('familyEnglish', ''),
        'genus': ioc_rec.get('genus', words[0]),
        'authority': ioc_rec.get('authority', ''),
        'breedingRange': ioc_rec.get('breedingRange', ''),
        'avibaseId': avb_id,
        'source': 'Avibase Checklist v2024 (Denis Lepage) / IOC World Bird List v14.2'
    }
    canonical_records.append(canonical_record)
    
    master_record = {
        'id': record_id,
        'scientificName': scientific_name,
        'vietnameseName': primary_vn,
        'englishName': ioc_rec.get('englishName') or clean_eng,
        'aliases': final_aliases,
        'isEndemic': is_endemic,
        'endemicScope': endemic_scope,
        'order': ioc_rec.get('order', 'Passeriformes'),
        'family': ioc_rec.get('family', ''),
        'authority': 'IOC World Bird List v14.2 / Avibase Vietnam Checklist v2024',
        'avibaseId': avb_id,
        'legalFramework': legal_framework
    }
    master_records.append(master_record)

print(f'-> 4. Đã tổng hợp thành công {len(canonical_records)} loài chim chính thức.')
print(f'   Số loài mẫu vật đã đối soát và tích hợp: {len(matched_specimens)} / {len(current_species)}')

unmatched_specimens = [s['id'] for s in current_species if s['id'] not in matched_specimens]
if unmatched_specimens:
    print(f'   -> Tự động tích hợp {len(unmatched_specimens)} loài mẫu vật còn lại vào Master Registry: {unmatched_specimens}')
    for uid in unmatched_specimens:
        sp = specimens_by_id[uid]
        ioc_rec = ioc_taxa.get(sp['scientificName'].lower(), {})
        aliases_set = set(sp.get('aliases', []))
        aliases_set.add(sp['vietnameseName'])
        primary_vn = sp['vietnameseName']
        final_aliases = [a for a in sorted(aliases_set) if a != primary_vn]
        legal_framework = sp.get('conservation', {}).get('legalFramework', {
            'decree84Group': 'none',
            'decree160Priority': False,
            'isEaafpMigratory': False,
            'directive04Flagship': False
        })
        
        canonical_records.append({
            'id': sp['id'],
            'scientificName': sp['scientificName'],
            'vietnameseName': primary_vn,
            'englishName': sp.get('englishName') or ioc_rec.get('englishName', ''),
            'aliases': final_aliases,
            'isEndemic': sp.get('isEndemic', False),
            'endemicScope': sp.get('endemicScope', 'none'),
            'iucn': sp.get('conservation', {}).get('iucn', 'LC'),
            'order': sp.get('taxonomy', {}).get('order', ioc_rec.get('order', 'Passeriformes')),
            'family': sp.get('taxonomy', {}).get('family', ioc_rec.get('family', '')),
            'familyEnglish': ioc_rec.get('familyEnglish', ''),
            'genus': sp.get('taxonomy', {}).get('genus', sp['scientificName'].split()[0]),
            'authority': ioc_rec.get('authority', ''),
            'breedingRange': ioc_rec.get('breedingRange', ''),
            'avibaseId': sp.get('academic', {}).get('avibaseId', ''),
            'source': 'IOC World Bird List v14.2 / Vietnam Specimen Database'
        })
        
        master_records.append({
            'id': sp['id'],
            'scientificName': sp['scientificName'],
            'vietnameseName': primary_vn,
            'englishName': sp.get('englishName') or ioc_rec.get('englishName', ''),
            'aliases': final_aliases,
            'isEndemic': sp.get('isEndemic', False),
            'endemicScope': sp.get('endemicScope', 'none'),
            'order': sp.get('taxonomy', {}).get('order', ioc_rec.get('order', 'Passeriformes')),
            'family': sp.get('taxonomy', {}).get('family', ioc_rec.get('family', '')),
            'authority': 'IOC World Bird List v14.2 / Avibase Vietnam Checklist v2024',
            'avibaseId': sp.get('academic', {}).get('avibaseId', ''),
            'legalFramework': legal_framework
        })
    print(f'   Tổng số loài sau khi tích hợp đầy đủ mẫu vật: {len(canonical_records)}')

with open(CANONICAL_OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(canonical_records, f, ensure_ascii=False, indent=2)
print(f'-> Đã ghi tệp: {CANONICAL_OUTPUT_PATH}')

with open(MASTER_OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(master_records, f, ensure_ascii=False, indent=2)
print(f'-> Đã ghi tệp: {MASTER_OUTPUT_PATH}')
