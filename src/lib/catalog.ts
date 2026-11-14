export interface CatalogEntry {
  id: string
  name: string
  aliases: string[]
  typicalHours: number
  typicalHoursNote?: string
  period: string
  summary: string
}

export const CATALOG: CatalogEntry[] = [
  {
    id: 'fe',
    name: '基本情報技術者',
    aliases: ['基本情報', 'FE'],
    typicalHours: 200,
    period: '1〜3か月',
    summary: '科目Aと科目Bがあります。ITエンジニアの入門資格として、広く受験されています。',
  },
  {
    id: 'ap',
    name: '応用情報技術者',
    aliases: ['応用情報', 'AP'],
    typicalHours: 500,
    period: '3〜6か月',
    summary: '午前の多肢選択と午後の記述があります。基本情報の次の段階として扱われます。',
  },
  {
    id: 'ippas',
    name: 'ITパスポート',
    aliases: ['iパス', 'ITパス'],
    typicalHours: 100,
    period: '2週間〜1か月',
    summary: '経営・管理・技術の三分野を横断する入門試験です。四肢択一で出題されます。',
  },
  {
    id: 'boki3',
    name: '日商簿記3級',
    aliases: ['簿記3級', '簿記３級'],
    typicalHours: 100,
    period: '1〜2か月',
    summary: '商業簿記の基礎です。仕訳と試算表、決算の一巡が中心になります。',
  },
  {
    id: 'boki2',
    name: '日商簿記2級',
    aliases: ['簿記2級', '簿記２級'],
    typicalHours: 250,
    period: '2〜4か月',
    summary: '商業簿記に工業簿記が加わります。3級より範囲が広く、演習量がものをいいます。',
  },
  {
    id: 'boki1',
    name: '日商簿記1級',
    aliases: ['簿記1級', '簿記１級'],
    typicalHours: 600,
    period: '6か月〜1年',
    summary: '会計学と原価計算まで含む上級試験です。合格率は低めで、長期戦になります。',
  },
  {
    id: 'fp3',
    name: 'FP3級',
    aliases: ['ファイナンシャルプランナー3級', 'FP３級'],
    typicalHours: 80,
    period: '1〜2か月',
    summary: 'ライフプラン、保険、年金、税金などの入門範囲です。学科と実技があります。',
  },
  {
    id: 'fp2',
    name: 'FP2級',
    aliases: ['ファイナンシャルプランナー2級', 'FP２級'],
    typicalHours: 150,
    period: '2〜3か月',
    summary: '3級の範囲を深め、金融資産や不動産、相続の計算問題が増えます。',
  },
  {
    id: 'takken',
    name: '宅地建物取引士',
    aliases: ['宅建', '宅建士'],
    typicalHours: 300,
    period: '3〜6か月',
    summary: '四肢択一50問です。合格点は年によって前後しますが、おおむね7割が目安です。',
  },
  {
    id: 'toeic',
    name: 'TOEIC',
    aliases: ['トーイック', 'TOEIC L&R', 'TOEIC Listening & Reading'],
    typicalHours: 200,
    typicalHoursNote: '600点相当の目安です。800点相当は約500時間といわれます。',
    period: '3〜6か月',
    summary: 'ListeningとReadingのスコア型試験です。目標点によって必要な時間は大きく変わります。',
  },
  {
    id: 'eiken2',
    name: '英検2級',
    aliases: ['実用英語技能検定2級', '英検２級'],
    typicalHours: 200,
    period: '3〜6か月',
    summary: '高校卒業程度です。一次のリーディング・リスニング・ライティングと、二次の面接があります。',
  },
  {
    id: 'eiken-pre1',
    name: '英検準1級',
    aliases: ['実用英語技能検定準1級', '英検準１級'],
    typicalHours: 400,
    period: '6か月〜1年',
    summary: '大学中級程度です。語彙と英作文の負荷が大きく、二次面接もあります。',
  },
  {
    id: 'touroku',
    name: '登録販売者',
    aliases: ['登録販売者試験'],
    typicalHours: 200,
    period: '2〜4か月',
    summary: '一般用医薬品の販売に関する試験です。都道府県によって実施日が異なります。',
  },
  {
    id: 'otsu4',
    name: '危険物取扱者乙種第4類',
    aliases: ['危険物乙4', '乙4', '乙種第4類'],
    typicalHours: 40,
    period: '2週間〜1か月',
    summary: 'ガソリンなどの第4類危険物が対象です。法令・物理化学・性質消火の三科目です。',
  },
  {
    id: 'gyosei',
    name: '行政書士',
    aliases: ['行政書士試験'],
    typicalHours: 600,
    period: '6か月〜1年',
    summary: '法令科目と一般知識で構成されます。記述式があるため、択一だけでは終わりません。',
  },
  {
    id: 'sharoushi',
    name: '社会保険労務士',
    aliases: ['社労士'],
    typicalHours: 1000,
    period: '1年前後',
    summary: '労働・社会保険の横断試験です。選択式と択一式があり、科目ごとの足切りもあります。',
  },
  {
    id: 'chushou',
    name: '中小企業診断士',
    aliases: ['診断士'],
    typicalHours: 1000,
    period: '1年前後',
    summary: '一次の択一と二次の事例問題があります。経営の各分野を横断して学習します。',
  },
]

function normalize(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[\s・･\-ー−]/g, '')
}

export function matchCatalog(name: string): CatalogEntry | null {
  const normalized = normalize(name)
  if (!normalized) return null

  let best: { entry: CatalogEntry; length: number } | null = null
  for (const entry of CATALOG) {
    for (const alias of [entry.name, ...entry.aliases]) {
      const candidate = normalize(alias)
      if (candidate.length < 2) continue
      if (candidate === normalized || normalized.includes(candidate)) {
        if (!best || candidate.length > best.length) {
          best = { entry, length: candidate.length }
        }
      }
    }
  }
  return best?.entry ?? null
}
