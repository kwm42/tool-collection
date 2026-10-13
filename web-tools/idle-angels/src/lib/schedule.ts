import type { ColorRule, ScheduleEntry } from "../types";

export const DEFAULT_DATA = `6.7：射手座，洛基，荷鲁斯，不凋之花伊顿，宙斯
6.12：双鱼座，双子座，阿修罗，律者涅墨西斯，海皇波塞冬
618：周年庆
7.3：灰烬龙女，弗丽嘉，夜行者莉莉丝，金牛座，贞德，天帝伏羲
7.10：索尔，嫦娥，美杜莎，梅林，沈青儿，雷龙
7.17：雅典娜，卡俄斯，缘结神，丘比特，死神，拉斐尔
7.24：赫拉，拉，阿波罗，芙蕾雅，潘多拉，狮子座
7.31：维纳斯，阿尔忒修斯，水瓶座，路西法，摩羯座，阿瑞斯
8.7：不凋之花伊顿，伊卡璐斯，海拉，白羊座，双子座，海姆达尔
8.14：海皇波塞冬，冰霜龙母，卑弥呼，乌列尔，荷鲁斯，射手座
8.21：处女座，贞德，双鱼座，洛基，律者涅墨西斯
8.28：弗丽嘉，天帝伏羲，灰烬龙女，宙斯，珀尔修斯，巨蟹座
9.4：金牛座，赫拉，阿修罗，夜行者莉莉丝，梅林，索尔`;

export function parseText(text: string): ScheduleEntry[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const entries: ScheduleEntry[] = [];

  for (const line of lines) {
    const colonIdx = line.indexOf("：");
    if (colonIdx === -1) continue;

    const date = line.slice(0, colonIdx).trim();
    const charsRaw = line.slice(colonIdx + 1).trim();
    if (!date || !charsRaw) continue;

    const characters = charsRaw
      .split(/[，,、]/)
      .map((c) => c.trim())
      .filter(Boolean);

    if (characters.length > 0) {
      entries.push({ date, characters });
    }
  }

  return entries;
}

export function findDuplicates(entries: ScheduleEntry[]): Set<string> {
  const charDates: Record<string, string[]> = {};

  for (const entry of entries) {
    for (const char of entry.characters) {
      if (!charDates[char]) {
        charDates[char] = [];
      }
      charDates[char].push(entry.date);
    }
  }

  const highlight = new Set<string>();

  for (const [char, dates] of Object.entries(charDates)) {
    if (dates.length > 1) {
      for (let i = 1; i < dates.length; i++) {
        highlight.add(`${dates[i]}|${char}`);
      }
    }
  }

  return highlight;
}

export function buildColorMap(colorRules: ColorRule[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const rule of colorRules) {
    if (rule.name && rule.color) {
      map[rule.name] = rule.color;
    }
  }
  return map;
}
